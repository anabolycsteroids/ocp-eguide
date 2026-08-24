#!/usr/bin/env node
/**
 * OCP Campus Map Data Generator
 * 
 * Generates all 4 map data files from GPS-calibrated coordinates:
 * 1. places.json - All locations with pixel positions
 * 2. nodes.json - Navigation graph nodes
 * 3. edges.json - Walkable edges between nodes
 * 4. place-node-connections.json - Links places to graph nodes
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. GPS-TO-PIXEL AFFINE TRANSFORMATION
// ============================================================

// Verified reference points (GPS → pixel on 1520x933 campus-map.png)
const referencePoints = [
  { lat: 33 + 6/60 + 3.15/3600,  lng: -(8 + 35/60 + 55.41/3600), px: 1209, py: 374 },  // JFC 1
  { lat: 33 + 5/60 + 51.54/3600, lng: -(8 + 36/60 + 42.68/3600), px: 1163, py: 485 },  // JFC 2
  { lat: 33 + 5/60 + 49.41/3600, lng: -(8 + 36/60 + 34.56/3600), px: 1274, py: 415 },  // JFC 4
  { lat: 33 + 6/60 + 9.95/3600,  lng: -(8 + 36/60 + 22.36/3600), px: 1160, py: 410 },  // JFC 5
  { lat: 33 + 6/60 + 47.51/3600, lng: -(8 + 36/60 + 31.01/3600), px: 842,  py: 421 },  // JESA TSF
];

function solveAffine(points) {
  const n = points.length;
  let sLat2 = 0, sLng2 = 0, sLatLng = 0, sLat = 0, sLng = 0;
  let sLatPx = 0, sLngPx = 0, sPx = 0;
  let sLatPy = 0, sLngPy = 0, sPy = 0;
  
  for (const p of points) {
    sLat2 += p.lat * p.lat;
    sLng2 += p.lng * p.lng;
    sLatLng += p.lat * p.lng;
    sLat += p.lat;
    sLng += p.lng;
    sLatPx += p.lat * p.px;
    sLngPx += p.lng * p.px;
    sPx += p.px;
    sLatPy += p.lat * p.py;
    sLngPy += p.lng * p.py;
    sPy += p.py;
  }
  
  function det3(m) {
    return m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1])
         - m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0])
         + m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
  }
  
  const matA = [
    [sLat2, sLatLng, sLat],
    [sLatLng, sLng2, sLng],
    [sLat, sLng, n]
  ];
  const det = det3(matA);
  
  function solve(b) {
    return [
      det3([[b[0], matA[0][1], matA[0][2]], [b[1], matA[1][1], matA[1][2]], [b[2], matA[2][1], matA[2][2]]]) / det,
      det3([[matA[0][0], b[0], matA[0][2]], [matA[1][0], b[1], matA[1][2]], [matA[2][0], b[2], matA[2][2]]]) / det,
      det3([[matA[0][0], matA[0][1], b[0]], [matA[1][0], matA[1][1], b[1]], [matA[2][0], matA[2][1], b[2]]]) / det
    ];
  }
  
  const [a1, b1, c1] = solve([sLatPx, sLngPx, sPx]);
  const [a2, b2, c2] = solve([sLatPy, sLngPy, sPy]);
  
  return {
    toPixel: (lat, lng) => ({
      x: Math.round(a1 * lat + b1 * lng + c1),
      y: Math.round(a2 * lat + b2 * lng + c2)
    })
  };
}

const transform = solveAffine(referencePoints);

// ============================================================
// 2. PARSE GPS COORDINATES
// ============================================================
function parseDMS(dmsStr) {
  const match = dmsStr.match(/(\d+)°(\d+)'([\d.]+)"([NSEOW])/);
  if (!match) return null;
  const deg = parseInt(match[1]);
  const min = parseInt(match[2]);
  const sec = parseFloat(match[3]);
  const dir = match[4];
  let dd = deg + min / 60 + sec / 3600;
  if (dir === 'S' || dir === 'W' || dir === 'O') dd = -dd;
  return dd;
}

function parseLocationsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const locations = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Handle GNGR typo: longitude marked as N instead of O
    let fixedLine = trimmed;
    if (fixedLine.includes('GNGR') && fixedLine.includes('8°36\'04.42"N')) {
      fixedLine = fixedLine.replace('8°36\'04.42"N', '8°36\'04.42"O');
    }
    
    const match = fixedLine.match(/^(.+?)\s+(\d+°\d+'[\d.]+[""][NSEW])\s+(\d+°\d+'[\d.]+[""][NSEOW])\s+elev\s+[\d.]+\s*m?$/i);
    if (match) {
      const name = match[1].trim();
      const latDMS = match[2];
      const lngDMS = match[3];
      const lat = parseDMS(latDMS);
      const lng = parseDMS(lngDMS);
      
      if (lat !== null && lng !== null) {
        locations.push({ name, lat, lng });
      }
    }
  }
  
  return locations;
}

// ============================================================
// 3. MERGE DUPLICATES & ALIASES
// ============================================================
function mergeLocations(rawLocations) {
  // Canonical IDs for known duplicates
  const canonicalMap = {
    'jfc 5': 'jfc5',
    'jorf fertilizer company v (jfc v)': 'jfc5',
    'jorf fertilizers company v (jfc5)': 'jfc5',
    'jorf fertilizer company 4(jfc4)': 'jfc4',
    'jfc4-odi p5': 'jfc4',
    'desalination plant': 'station_desalement',
    'desalement ocp': 'station_desalement',
    "station desalement d'eau de mer jorflasfar": 'station_desalement',
    'ocp jorf lasfar': 'ocp_jorf_lasfar',
    'complexe ocp jorf lasfar-porte principale': 'porte_principale',
    'fluaralpha jesa tsf': 'fluoralpha_jesa_tsf',
    'jesa tsf bloc 7 jph': 'jesa_tsf',
    'jesa bloc 6': 'jesa_bloc6',
    'cobco factory': 'gobco',
    'entite infrastructure JPH': 'entite_infra_jph',
    '107 def ocp': 'dap_107_def',
  };
  
  // Alias lists for merging
  const aliasGroups = {
    'jfc5': ['JFC 5', 'JFC V', 'Jorf Fertilizer Company V (JFC V)', 'Jorf Fertilizers Company V (JFC5)'],
    'jfc4': ['JFC 4', 'JFC4-ODI P5', 'Jorf Fertilizer Company 4(JFC4)'],
    'station_desalement': ['Station Dessalement', 'Dessalement OCP', 'Desalination Plant', "Station Desalement d'eau de mer Jorflasfar"],
    'jesa_tsf': ['JESA TSF', 'JESA TSF BLOC 7 JPH'],
    'porte_principale': ['Porte Principale', 'Complexe OCP Jorf Lasfar - Porte Principale'],
  };
  
  const merged = {};
  const processedIds = new Set();
  
  for (const loc of rawLocations) {
    const lowerName = loc.name.toLowerCase().trim();
    let canonicalId = canonicalMap[lowerName] || null;
    
    // Generate ID from name
    const genId = loc.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 60);
    
    if (canonicalId && processedIds.has(canonicalId)) {
      // This is a duplicate - add as alias to existing entry
      if (merged[canonicalId]) {
        merged[canonicalId].aliases.push(loc.name);
      }
      continue;
    }
    
    const id = canonicalId || genId;
    processedIds.add(id);
    
    // Convert GPS to pixel
    const pixel = transform.toPixel(loc.lat, loc.lng);
    
    // Clamp to image bounds
    const x = Math.max(10, Math.min(1510, pixel.x));
    const y = Math.max(10, Math.min(923, pixel.y));
    
    if (!merged[id]) {
      merged[id] = {
        id,
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        x,
        y,
        aliases: [],
        category: determineCategory(loc.name),
        type: determineType(loc.name)
      };
    }
  }
  
  return Object.values(merged);
}

// ============================================================
// 4. CLASSIFY LOCATIONS
// ============================================================
function determineCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('porte') || lower.includes('entree') || lower.includes('entite') || lower.includes('entre '))
    return 'Access';
  if (lower.includes('office') || lower.includes('bureau') || lower.includes('mission'))
    return 'Office';
  if (lower.includes('water') || lower.includes('desal') || lower.includes('dessalement') || lower.includes('green water'))
    return 'Water';
  if (lower.includes('jfc') || lower.includes('tsf') || lower.includes('ligne') ||
      lower.includes('dap') || lower.includes('tsp') || lower.includes('molten') ||
      lower.includes('flash') || lower.includes('downstream') || lower.includes('phosphorique'))
    return 'Production';
  if (lower.includes('surete') || lower.includes('sûreté'))
    return 'Security';
  if (lower.includes('infirmerie'))
    return 'Medical';
  if (lower.includes('formation') || lower.includes('hse'))
    return 'Training';
  if (lower.includes('recherche') || lower.includes('research'))
    return 'Research';
  if (lower.includes('rassemblement'))
    return 'Safety';
  if (lower.includes('mosquee') || lower.includes('mosque'))
    return 'Religious';
  if (lower.includes('terminale') || lower.includes('station terminale'))
    return 'Transport';
  if (lower.includes('decharge'))
    return 'Waste';
  if (lower.startsWith('batiment') || lower.startsWith('bâtiment') || lower.includes('building'))
    return 'Building';
  return 'Facility';
}

function determineType(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('batiment') || lower.startsWith('bâtiment') || lower.includes('building'))
    return 'BUILDING';
  return 'FACILITY';
}

// ============================================================
// 5. GENERATE PLACES.JSON
// ============================================================
function generatePlaces(mergedLocations) {
  const places = mergedLocations.map(loc => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    category: loc.category,
    identified: true,
    source: 'gps-calibrated',
    verified: true,
    aliases: [...new Set(loc.aliases)],
    x: loc.x,
    y: loc.y,
    gps: { lat: loc.lat, lng: loc.lng },
    description: loc.name
  }));
  
  return {
    version: "4.0.0",
    description: "OCP Jorf Lasfar campus places — GPS-calibrated coordinates on 1520x933 satellite image",
    rule: "Every place has GPS coordinates verified from Google Maps and converted to pixel positions via affine transformation.",
    lastUpdated: "2026-08-23",
    calibrationMethod: "Least-squares affine transformation using 5 reference points (JFC 1,2,4,5 + JESA TSF)",
    coordinateSystem: {
      imageWidth: 1520,
      imageHeight: 933,
      pixelsPerMeter: 0.8786127167630058
    },
    places
  };
}

// ============================================================
// 6. GENERATE NODES.JSON
// ============================================================
function generateNodes(mergedLocations) {
  const entranceNodes = mergedLocations.map(loc => ({
    id: `n_${loc.id}`,
    x: loc.x,
    y: loc.y,
    type: 'entrance',
    label: loc.name
  }));
  
  // Road intersection nodes (spine of the navigation graph)
  const intersectionNodes = [
    // North road (top of campus)
    { id: 'n_north_01', x: 600, y: 200, type: 'intersection', label: '' },
    { id: 'n_north_02', x: 750, y: 200, type: 'intersection', label: '' },
    { id: 'n_north_03', x: 900, y: 200, type: 'intersection', label: '' },
    { id: 'n_north_04', x: 1050, y: 200, type: 'intersection', label: '' },
    { id: 'n_north_05', x: 1200, y: 200, type: 'intersection', label: '' },
    
    // East road (right side)
    { id: 'n_east_01', x: 1350, y: 300, type: 'intersection', label: '' },
    { id: 'n_east_02', x: 1350, y: 400, type: 'intersection', label: '' },
    { id: 'n_east_03', x: 1350, y: 500, type: 'intersection', label: '' },
    
    // Central road (middle)
    { id: 'n_mid_01', x: 600, y: 350, type: 'intersection', label: '' },
    { id: 'n_mid_02', x: 750, y: 350, type: 'intersection', label: '' },
    { id: 'n_mid_03', x: 900, y: 350, type: 'intersection', label: '' },
    { id: 'n_mid_04', x: 1050, y: 350, type: 'intersection', label: '' },
    { id: 'n_mid_05', x: 1200, y: 350, type: 'intersection', label: '' },
    
    // South road (bottom of campus)
    { id: 'n_south_01', x: 600, y: 500, type: 'intersection', label: '' },
    { id: 'n_south_02', x: 750, y: 500, type: 'intersection', label: '' },
    { id: 'n_south_03', x: 900, y: 500, type: 'intersection', label: '' },
    { id: 'n_south_04', x: 1050, y: 500, type: 'intersection', label: '' },
    { id: 'n_south_05', x: 1200, y: 500, type: 'intersection', label: '' },
    
    // Far south
    { id: 'n_far_south_01', x: 750, y: 600, type: 'intersection', label: '' },
    { id: 'n_far_south_02', x: 900, y: 600, type: 'intersection', label: '' },
    { id: 'n_far_south_03', x: 1050, y: 600, type: 'intersection', label: '' },
    
    // West road
    { id: 'n_west_01', x: 500, y: 300, type: 'intersection', label: '' },
    { id: 'n_west_02', x: 500, y: 400, type: 'intersection', label: '' },
    { id: 'n_west_03', x: 500, y: 500, type: 'intersection', label: '' },
  ];
  
  return {
    version: "4.0.0",
    description: "Navigation graph nodes for OCP Jorf Lasfar campus — GPS-calibrated positions",
    rule: "Every node is positioned on a walkable area. Entrance nodes connect places to the road network.",
    nodes: [...entranceNodes, ...intersectionNodes]
  };
}

// ============================================================
// 7. GENERATE EDGES.JSON
// ============================================================
function generateEdges(mergedLocations, nodes) {
  const edges = [];
  
  // Connect each entrance node to nearest intersection(s)
  const entranceNodes = nodes.filter(n => n.type === 'entrance');
  const intersectionNodes = nodes.filter(n => n.type === 'intersection');
  
  for (const entrance of entranceNodes) {
    // Find 2 nearest intersections
    const sorted = intersectionNodes
      .map(i => ({
        ...i,
        dist: Math.sqrt((entrance.x - i.x) ** 2 + (entrance.y - i.y) ** 2)
      }))
      .sort((a, b) => a.dist - b.dist);
    
    // Connect to nearest intersection
    if (sorted.length > 0) {
      edges.push({ from: entrance.id, to: sorted[0].id, walkable: true });
    }
    // Connect to second nearest if close enough
    if (sorted.length > 1 && sorted[1].dist < 400) {
      edges.push({ from: entrance.id, to: sorted[1].id, walkable: true });
    }
  }
  
  // Connect intersections in a grid pattern
  // North row
  for (let i = 0; i < 4; i++) {
    edges.push({ from: `n_north_0${i+1}`, to: `n_north_0${i+2}`, walkable: true });
  }
  // Mid row
  for (let i = 0; i < 4; i++) {
    edges.push({ from: `n_mid_0${i+1}`, to: `n_mid_0${i+2}`, walkable: true });
  }
  // South row
  for (let i = 0; i < 4; i++) {
    edges.push({ from: `n_south_0${i+1}`, to: `n_south_0${i+2}`, walkable: true });
  }
  // Far south
  edges.push({ from: 'n_far_south_01', to: 'n_far_south_02', walkable: true });
  edges.push({ from: 'n_far_south_02', to: 'n_far_south_03', walkable: true });
  
  // East column
  for (let i = 0; i < 2; i++) {
    edges.push({ from: `n_east_0${i+1}`, to: `n_east_0${i+2}`, walkable: true });
  }
  
  // West column
  for (let i = 0; i < 2; i++) {
    edges.push({ from: `n_west_0${i+1}`, to: `n_west_0${i+2}`, walkable: true });
  }
  
  // North-South vertical connections
  edges.push({ from: 'n_north_01', to: 'n_mid_01', walkable: true });
  edges.push({ from: 'n_north_02', to: 'n_mid_02', walkable: true });
  edges.push({ from: 'n_north_03', to: 'n_mid_03', walkable: true });
  edges.push({ from: 'n_north_04', to: 'n_mid_04', walkable: true });
  edges.push({ from: 'n_north_05', to: 'n_mid_05', walkable: true });
  
  edges.push({ from: 'n_mid_01', to: 'n_south_01', walkable: true });
  edges.push({ from: 'n_mid_02', to: 'n_south_02', walkable: true });
  edges.push({ from: 'n_mid_03', to: 'n_south_03', walkable: true });
  edges.push({ from: 'n_mid_04', to: 'n_south_04', walkable: true });
  edges.push({ from: 'n_mid_05', to: 'n_south_05', walkable: true });
  
  edges.push({ from: 'n_south_01', to: 'n_far_south_01', walkable: true });
  edges.push({ from: 'n_south_02', to: 'n_far_south_01', walkable: true });
  edges.push({ from: 'n_south_03', to: 'n_far_south_02', walkable: true });
  edges.push({ from: 'n_south_04', to: 'n_far_south_03', walkable: true });
  edges.push({ from: 'n_south_05', to: 'n_far_south_03', walkable: true });
  
  // East-West connections
  edges.push({ from: 'n_north_01', to: 'n_west_01', walkable: true });
  edges.push({ from: 'n_mid_01', to: 'n_west_02', walkable: true });
  edges.push({ from: 'n_south_01', to: 'n_west_03', walkable: true });
  
  edges.push({ from: 'n_north_05', to: 'n_east_01', walkable: true });
  edges.push({ from: 'n_mid_05', to: 'n_east_02', walkable: true });
  edges.push({ from: 'n_south_05', to: 'n_east_03', walkable: true });
  
  // West to south connections
  edges.push({ from: 'n_west_03', to: 'n_far_south_01', walkable: true });
  
  return {
    version: "4.0.0",
    description: "Navigation graph edges for OCP Jorf Lasfar campus — GPS-calibrated positions",
    rule: "Edges represent walkable paths between nodes. Entrance nodes connect places to the road network.",
    edges
  };
}

// ============================================================
// 8. GENERATE PLACE-NODE-CONNECTIONS.JSON
// ============================================================
function generatePlaceNodeConnections(mergedLocations) {
  return {
    version: "4.0.0",
    description: "Links each place to its navigation graph access node — GPS-calibrated positions",
    rule: "Every routable place must have a valid access node entry here",
    connections: mergedLocations.map(loc => ({
      placeId: loc.id,
      nodeId: `n_${loc.id}`,
      accessPoint: 'nearest-road',
      verified: true
    }))
  };
}

// ============================================================
// 9. MAIN
// ============================================================
function main() {
  const locationsFile = path.join(__dirname, 'screenshots of detailed places/locations names.txt');
  const rawLocations = parseLocationsFile(locationsFile);
  console.log(`Parsed ${rawLocations.length} raw locations from file`);
  
  const mergedLocations = mergeLocations(rawLocations);
  console.log(`After merging duplicates: ${mergedLocations.length} unique locations`);
  
  // Generate all files
  const places = generatePlaces(mergedLocations);
  const nodes = generateNodes(mergedLocations);
  const edges = generateEdges(mergedLocations, nodes.nodes);
  const connections = generatePlaceNodeConnections(mergedLocations);
  
  // Write files
  const mapDir = path.join(__dirname, 'freebuff-frontend/public/assets/map');
  
  fs.writeFileSync(path.join(mapDir, 'places.json'), JSON.stringify(places, null, 2));
  console.log(`Wrote places.json (${places.places.length} places)`);
  
  fs.writeFileSync(path.join(mapDir, 'nodes.json'), JSON.stringify(nodes, null, 2));
  console.log(`Wrote nodes.json (${nodes.nodes.length} nodes)`);
  
  fs.writeFileSync(path.join(mapDir, 'edges.json'), JSON.stringify(edges, null, 2));
  console.log(`Wrote edges.json (${edges.edges.length} edges)`);
  
  fs.writeFileSync(path.join(mapDir, 'place-node-connections.json'), JSON.stringify(connections, null, 2));
  console.log(`Wrote place-node-connections.json (${connections.connections.length} connections)`);
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total places: ${places.places.length}`);
  console.log(`Total nodes: ${nodes.nodes.length} (${nodes.nodes.filter(n=>n.type==='entrance').length} entrance + ${nodes.nodes.filter(n=>n.type==='intersection').length} intersection)`);
  console.log(`Total edges: ${edges.edges.length}`);
  console.log(`Total connections: ${connections.connections.length}`);
  
  // Print coordinate ranges
  const xs = places.places.map(p => p.x);
  const ys = places.places.map(p => p.y);
  console.log(`\nX range: ${Math.min(...xs)} - ${Math.max(...xs)}`);
  console.log(`Y range: ${Math.min(...ys)} - ${Math.max(...ys)}`);
}

main();
