import type {
  MapData, MapPlace, MapNode, MapEdge,
  PlaceNodeConnection, MapConfig, RoutePath, RouteResult,
  RouteInstruction, SearchResult,
} from "@/types/map";

// World dimensions mirror the current master image; updated at runtime from
// map-config.json (which the regeneration pipeline keeps in sync with the
// calibration capture). ES live bindings make updates visible to importers.
export let MAP_W = 1520;
export let MAP_H = 933;
export let MAP_IMAGE = "/assets/map/campus-map.png";

// Optional high-resolution zone overlays (Google-Earth-style LOD):
// each covers a rectangle of the base map in base-map pixels and is
// rendered above it once the zoom passes its minZoom threshold.
export interface MapOverlay {
  file: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minZoom?: number;
}
export let MAP_OVERLAYS: MapOverlay[] = [];

export async function loadMapData(): Promise<MapData> {
  const [placesRes, nodesRes, edgesRes, connRes, configRes] = await Promise.all([
    fetch("/assets/map/places.json"),
    fetch("/assets/map/nodes.json"),
    fetch("/assets/map/edges.json"),
    fetch("/assets/map/place-node-connections.json"),
    fetch("/assets/map/map-config.json"),
  ]);
  const [placesJson, nodesJson, edgesJson, connJson, configJson] = await Promise.all([
    placesRes.json(), nodesRes.json(), edgesRes.json(), connRes.json(), configRes.json(),
  ]);
  const img = configJson.image;
  if (img?.width > 0 && img?.height > 0) {
    MAP_W = img.width;
    MAP_H = img.height;
    MAP_IMAGE = `/assets/map/${img.file}`;
  } else {
    MAP_W = configJson.coordinateSystem?.width ?? 1520;
    MAP_H = configJson.coordinateSystem?.height ?? 933;
  }
  MAP_OVERLAYS = Array.isArray(configJson.overlays) ? configJson.overlays : [];
  return {
    places: placesJson.places,
    nodes: nodesJson.nodes,
    edges: edgesJson.edges,
    connections: connJson.connections,
    config: configJson,
  };
}

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function searchLocations(places: MapPlace[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  for (const p of places) {
    let score = 0;
    const name = p.name.toLowerCase();
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (p.aliases.some(a => a.toLowerCase().includes(q))) score = 50;
    else if (p.category.toLowerCase().includes(q)) score = 30;
    else if (p.description.toLowerCase().includes(q)) score = 20;
    if (score > 0) results.push({ place: p, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

export function aStar(
  nodes: MapNode[], edges: MapEdge[],
  connections: PlaceNodeConnection[],
  startPlaceId: string, endPlaceId: string,
): RoutePath[] | { error: string; place?: string } {
  const startConn = connections.find(c => c.placeId === startPlaceId);
  if (!startConn) return { error: "Location not mapped", place: startPlaceId };
  const endConn = connections.find(c => c.placeId === endPlaceId);
  if (!endConn) return { error: "Location not mapped", place: endPlaceId };

  const nodeMap = new Map<string, MapNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(startConn.nodeId);
  const endNode = nodeMap.get(endConn.nodeId);
  if (!startNode || !endNode) return { error: "Graph disconnected" };

  const adj = new Map<string, { node: string; cost: number }[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    if (!e.walkable) return;
    const a = nodeMap.get(e.from), b = nodeMap.get(e.to);
    if (!a || !b) return;
    const cost = euclidean(a, b);
    adj.get(e.from)!.push({ node: e.to, cost });
    adj.get(e.to)!.push({ node: e.from, cost });
  });

  const g = new Map<string, number>();
  const f = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const open = new Set<string>();

  nodes.forEach(n => { g.set(n.id, Infinity); f.set(n.id, Infinity); });
  g.set(startNode.id, 0);
  f.set(startNode.id, euclidean(startNode, endNode));
  open.add(startNode.id);

  while (open.size > 0) {
    let curr = "";
    let minF = Infinity;
    open.forEach(id => {
      const val = f.get(id) ?? Infinity;
      if (val < minF) { minF = val; curr = id; }
    });

    if (curr === endNode.id) {
      const path: string[] = [curr];
      let c = curr;
      while (cameFrom.has(c)) {
        c = cameFrom.get(c)!;
        path.unshift(c);
      }
      return path.map(id => {
        const n = nodeMap.get(id)!;
        return { nodeId: id, x: n.x, y: n.y, label: n.label };
      });
    }

    open.delete(curr);
    for (const nb of (adj.get(curr) || [])) {
      const tg = (g.get(curr) ?? Infinity) + nb.cost;
      if (tg < (g.get(nb.node) ?? Infinity)) {
        cameFrom.set(nb.node, curr);
        g.set(nb.node, tg);
        f.set(nb.node, tg + euclidean(nodeMap.get(nb.node)!, endNode));
        open.add(nb.node);
      }
    }
  }

  return { error: "No route found" };
}

export function routeMetrics(path: RoutePath[], pixelsPerMeter: number, walkingSpeed: number = 1.4): {
  distM: number; timeS: number; distStr: string; timeStr: string;
} {
  let px = 0;
  for (let i = 1; i < path.length; i++) {
    px += euclidean(path[i - 1], path[i]);
  }
  const m = px / pixelsPerMeter;
  const t = m / walkingSpeed;
  return {
    distM: Math.round(m),
    timeS: Math.round(t),
    distStr: m >= 1000 ? (m / 1000).toFixed(2) + " km" : Math.round(m) + " m",
    timeStr: (() => {
      const mins = Math.round(t / 60);
      return mins < 1 ? "~1 min" : `~${mins} min`;
    })(),
  };
}

export function genInstructions(path: RoutePath[], pixelsPerMeter: number): RouteInstruction[] {
  if (!path || path.length < 2) return [];
  const instr: RouteInstruction[] = [];
  for (let i = 0; i < path.length; i++) {
    const n = path[i];
    if (n.label) {
      if (i === 0) instr.push({ text: `Start at ${n.label}`, nodeId: n.nodeId });
      else if (i === path.length - 1) instr.push({ text: `Arrive at ${n.label}`, nodeId: n.nodeId });
      else instr.push({ text: `Pass ${n.label}`, nodeId: n.nodeId });
    } else if (i < path.length - 1) {
      const dx = path[i + 1].x - n.x;
      const dy = path[i + 1].y - n.y;
      const d = euclidean(n, path[i + 1]);
      const m = Math.round(d / pixelsPerMeter);
      let dir = "Continue straight";
      if (Math.abs(dx) > Math.abs(dy) * 2) dir = dx > 0 ? "Head east" : "Head west";
      else if (Math.abs(dy) > Math.abs(dx) * 2) dir = dy > 0 ? "Head south" : "Head north";
      instr.push({ text: `${dir} for ${m}m`, nodeId: n.nodeId });
    }
  }
  return instr;
}

export function getRoute(
  data: MapData, startPlaceId: string, endPlaceId: string,
): RouteResult | { error: string; place?: string } {
  const pathResult = aStar(data.nodes, data.edges, data.connections, startPlaceId, endPlaceId);
  if ("error" in pathResult) return pathResult;

  const ppm = data.config.navigation.pixelsPerMeter;
  const ws = data.config.navigation.walkingSpeed;
  const metrics = routeMetrics(pathResult, ppm, ws);
  const instructions = genInstructions(pathResult, ppm);

  return {
    path: pathResult,
    ...metrics,
    instructions,
  };
}

// MAP_W / MAP_H / MAP_IMAGE are exported live bindings (see above)
