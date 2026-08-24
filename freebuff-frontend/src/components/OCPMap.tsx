"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Search, X, Plus, Minus, Maximize2, Minimize2, ChevronRight, Clock, Ruler, Bug, Crosshair } from "lucide-react";
import { loadMapData, searchLocations, getRoute, MAP_W, MAP_H, MAP_IMAGE, MAP_OVERLAYS, type MapOverlay } from "@/lib/mapEngine";
import { loadCalibration, gpsToMap, type Calibration } from "@/lib/geoTransform";
import { useI18n } from "@/i18n";
import type { MapData, MapPlace, RouteResult } from "@/types/map";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 5.0;

// COORDINATE SYSTEM CONTRACT
// The master PNG is the sole coordinate reference surface ("MapWorld").
// Locations live in PNG-native pixel space (mapX/mapY derived from immutable
// GPS via calibration). PNG -> screen conversion happens EXACTLY ONCE via a
// single CSS transform on the MapWorld element containing BOTH the image and
// every marker:
//
//   MapViewport (relative, overflow-hidden)
//   └── MapWorld (absolute, w=MAP_W h=MAP_H, translate+scale)
//       ├── <img> master PNG
//       ├── <svg> route + leader lines (viewBox = PNG pixel space)
//       └── markers at left:(ax/MAP_W*100)% top:(ay/MAP_H*100)%
//
// Markers are percentages of the PNG itself, so they stay attached to the
// same image pixel under any zoom/pan/DPI/browser-zoom/fullscreen/layout.
// No marker position is ever computed from page or browser coordinates.

interface ProjectedPlace {
  place: MapPlace;
  ax: number;
  ay: number;
}

interface LabelBox { x1: number; y1: number; x2: number; y2: number }
interface Slot { lx: number; ly: number; leader: boolean }

interface OCPMapProps {
  initialFrom?: string;
  initialTo?: string;
  focusPlaceId?: string;
  showSearch?: boolean;
  showControls?: boolean;
  showRoute?: boolean;
  height?: string;
  className?: string;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onPlaceSelect?: (placeId: string) => void;
}

function rectsIntersect(a: LabelBox, b: LabelBox): boolean {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
}

let measureCtx: CanvasRenderingContext2D | null = null;
function textWidth(text: string): number {
  if (typeof document === "undefined") return text.length * 7;
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * 7;
  measureCtx.font = `600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  return measureCtx.measureText(text).width;
}

export default function OCPMap({
  initialFrom, initialTo, focusPlaceId,
  showSearch = true, showControls = true, showRoute = true,
  height = "100%", className = "",
  fullscreen = false, onToggleFullscreen,
  onPlaceSelect,
}: OCPMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0, pinchDist: 0, moved: false });

  const [data, setData] = useState<MapData | null>(null);
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchLocations>>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [fromPlace, setFromPlace] = useState<MapPlace | null>(null);
  const [toPlace, setToPlace] = useState<MapPlace | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [overlays, setOverlays] = useState<MapOverlay[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGeoWarning, setShowGeoWarning] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);

  const debugFromUrl = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debug") === "1";
  }, []);

  // GPS is the immutable source of truth; project it into PNG pixel space
  // through the calibration transform. Falls back to stored mapX/x only when
  // georeferencing is unavailable.
  const projected: ProjectedPlace[] | null = useMemo(() => {
    if (!data) return null;
    if (!calibration?.calibrated || !calibration.coeffs) {
      return data.places.map(place => ({ place, ax: place.mapX ?? place.x, ay: place.mapY ?? place.y }));
    }
    return data.places.map(place => {
      if (!place.gps) return { place, ax: place.mapX ?? place.x, ay: place.mapY ?? place.y };
      const pt = gpsToMap(calibration, place.gps.lat, place.gps.lng);
      if (!Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return { place, ax: place.mapX ?? place.x, ay: place.mapY ?? place.y };
      return { place, ax: pt.x, ay: pt.y };
    });
  }, [data, calibration]);

  // Boundary protection: a location outside the PNG coordinate space is
  // reported, never silently clamped and never rendered off-map.
  const invalidCoords = useMemo(() => {
    if (!projected) return [];
    return projected
      .filter(pp => pp.ax < -20 || pp.ax > MAP_W + 20 || pp.ay < -20 || pp.ay > MAP_H + 20)
      .map(pp => ({ place: pp.place, x: pp.ax, y: pp.ay }));
  }, [projected]);

  useEffect(() => {
    for (const bad of invalidCoords) {
      console.warn(`Invalid map coordinate: ${bad.place.name} -> x: ${bad.x.toFixed(1)}, y: ${bad.y.toFixed(1)}`);
    }
  }, [invalidCoords]);

  const worldOf = useCallback((p: MapPlace): { x: number; y: number } => {
    const hit = projected?.find(q => q.place.id === p.id);
    return hit ? { x: hit.ax, y: hit.ay } : { x: p.mapX ?? p.x, y: p.mapY ?? p.y };
  }, [projected]);

  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const z = Math.min(cw / MAP_W, ch / MAP_H) * 0.92;
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z)));
    setOffset({ x: (cw - MAP_W * z) / 2, y: (ch - MAP_H * z) / 2 });
  }, []);

  useEffect(() => {
    loadMapData().then(d => {
      setData(d);
      setImageSrc(MAP_IMAGE);
      setOverlays([...MAP_OVERLAYS]);
    });
    loadCalibration().then(c => setCalibration(c));
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setImageLoaded(true);
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded) {
      if (focusPlaceId && data) {
        const place = data.places.find(p => p.id === focusPlaceId);
        if (place) {
          const w = worldOf(place);
          const container = containerRef.current;
          if (container) {
            const z = 1.5;
            setZoom(z);
            setOffset({ x: container.clientWidth / 2 - w.x * z, y: container.clientHeight / 2 - w.y * z });
          }
          return;
        }
      }
      fitToScreen();
    }
  }, [imageLoaded, focusPlaceId, data, fitToScreen, worldOf]);

  useEffect(() => {
    if (initialFrom && data) {
      const p = data.places.find(pl => pl.id === initialFrom);
      if (p) setFromPlace(p);
    }
    if (initialTo && data) {
      const p = data.places.find(pl => pl.id === initialTo);
      if (p) setToPlace(p);
    }
  }, [initialFrom, initialTo, data]);

  useEffect(() => {
    if (fromPlace && toPlace && data) {
      const result = getRoute(data, fromPlace.id, toPlace.id);
      if ("error" in result) {
        setRouteError(result.error);
        setRoute(null);
      } else {
        setRoute(result);
        setRouteError("");
      }
    } else {
      setRoute(null);
      setRouteError("");
    }
  }, [fromPlace, toPlace, data]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!data || !q.trim()) { setSearchResults([]); return; }
    setSearchResults(searchLocations(data.places, q));
  }, [data]);

  // Zoom around the cursor: the world point under the cursor stays fixed.
  // screenPos = offset + worldPos * zoom  (transform-origin: 0 0)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setZoom(prev => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
      const scale = newZoom / prev;
      setOffset(off => ({
        x: mx - (mx - off.x) * scale,
        y: my - (my - off.y) * scale,
      }));
      return newZoom;
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY, pinchDist: 0, moved: false };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    setOffset(off => ({ x: off.x + dx, y: off.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current.dragging = false;
    setTimeout(() => { dragRef.current.moved = false; }, 0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragRef.current.pinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && dragRef.current.pinchDist > 0) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / dragRef.current.pinchDist;
      dragRef.current.pinchDist = dist;
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * scale)));
    }
  }, []);

  const selectPlace = useCallback((p: MapPlace, focusZ?: number) => {
    setSelectedPlace(p);
    if (onPlaceSelect) onPlaceSelect(p.id);
    if (focusZ) {
      const w = worldOf(p);
      const container = containerRef.current;
      if (container) {
        setZoom(focusZ);
        setOffset({ x: container.clientWidth / 2 - w.x * focusZ, y: container.clientHeight / 2 - w.y * focusZ });
      }
    }
  }, [onPlaceSelect, worldOf]);

  const recenter = useCallback((z: number) => {
    const container = containerRef.current;
    if (!container) return;
    const target = selectedPlace ?? fromPlace ?? toPlace;
    const w = target ? worldOf(target) : { x: MAP_W / 2, y: MAP_H / 2 };
    setZoom(z);
    setOffset({ x: container.clientWidth / 2 - w.x * z, y: container.clientHeight / 2 - w.y * z });
  }, [selectedPlace, fromPlace, toPlace, worldOf]);

  const zoomAtCenter = useCallback((factor: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    setZoom(prev => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
      const scale = newZoom / prev;
      setOffset(off => ({
        x: cx - (cx - off.x) * scale,
        y: cy - (cy - off.y) * scale,
      }));
      return newZoom;
    });
  }, []);

  // Label collision placement in WORLD units (screen px / zoom), greedy slots
  // with leader lines. Priority: route endpoints > selected > identified.
  const labelLayout = useMemo(() => {
    const map = new Map<string, { lx: number; ly: number; bw: number; bh: number; leader: boolean }>();
    if (!projected || zoom < 0.35) return map;
    const placed: LabelBox[] = [];
    const priority = (pp: ProjectedPlace) => {
      const p = pp.place;
      if (fromPlace?.id === p.id || toPlace?.id === p.id) return 0;
      if (selectedPlace?.id === p.id) return 1;
      if (p.identified) return 2;
      return 3;
    };
    const ordered = [...projected].sort((A, B) => priority(A) - priority(B));
    const iz = 1 / zoom;

    for (const pp of ordered) {
      const p = pp.place;
      const textW = textWidth(p.name);
      const padX = 5 * iz, padY = 2 * iz, fontH = 11 * iz;
      const bw = textW * iz + padX * 2;
      const bh = fontH + padY * 2;
      const radius = 8 * iz;
      const gap = radius + 8 * iz;
      const offX = (p.labelOffsetX ?? 0) * iz;
      const offY = (p.labelOffsetY ?? 0) * iz;

      const slots: Slot[] =
        (p.labelOffsetX ?? 0) !== 0 || (p.labelOffsetY ?? 0) !== 0
          ? [{ lx: pp.ax + offX - bw / 2, ly: pp.ay + offY - bh / 2, leader: Math.hypot(offX, offY) > gap }]
          : [
              { lx: pp.ax - bw / 2, ly: pp.ay - gap - bh, leader: true },
              { lx: pp.ax + gap, ly: pp.ay - bh / 2, leader: true },
              { lx: pp.ax - gap - bw, ly: pp.ay - bh / 2, leader: true },
              { lx: pp.ax - bw / 2, ly: pp.ay + gap, leader: true },
            ];

      let chosen: Slot | null = null;
      let chosenBox: LabelBox | null = null;
      for (const sl of slots) {
        const box: LabelBox = { x1: sl.lx, y1: sl.ly, x2: sl.lx + bw, y2: sl.ly + bh };
        const clipped: LabelBox = {
          x1: Math.max(box.x1, -40 * iz), y1: Math.max(box.y1, -40 * iz),
          x2: Math.min(box.x2, MAP_W + 40 * iz), y2: Math.min(box.y2, MAP_H + 40 * iz),
        };
        if (placed.some(o => rectsIntersect(clipped, o))) continue;
        chosen = sl;
        chosenBox = box;
        placed.push(box);
        break;
      }
      if (!chosen || !chosenBox) {
        chosen = slots[0];
        chosenBox = { x1: chosen.lx, y1: chosen.ly, x2: chosen.lx + bw, y2: chosen.ly + bh };
      }
      // Clamp the chip fully INSIDE the PNG coordinate space.
      const lx = Math.min(Math.max(chosen.lx, 4 * iz), Math.max(4 * iz, MAP_W - bw - 4 * iz));
      const ly = Math.min(Math.max(chosen.ly, 4 * iz), Math.max(4 * iz, MAP_H - bh - 4 * iz));
      map.set(p.id, { lx, ly, bw, bh, leader: chosen.leader });
    }
    return map;
  }, [projected, zoom, selectedPlace, fromPlace, toPlace]);

  const showLabels = zoom >= 0.35;
  const selectedProj = selectedPlace ? projected?.find(q => q.place.id === selectedPlace.id) : null;
  const selectedScreen = selectedProj ? { x: selectedProj.ax * zoom + offset.x, y: selectedProj.ay * zoom + offset.y } : null;
  const routeEnds = route && route.path.length >= 2 ? { a: route.path[0], b: route.path[route.path.length - 1] } : null;
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#0a1a12] touch-none ${className}`}
      style={{ height }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* ============ MAP WORLD — the PNG IS the coordinate surface ============ */}
      <div
        className="absolute top-0 left-0 origin-top-left overflow-hidden"
        style={{
          width: MAP_W,
          height: MAP_H,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          willChange: "transform",
          cursor: dragRef.current.dragging ? "grabbing" : "grab",
        }}
        onClick={() => {
          if (!dragRef.current.moved) setSelectedPlace(null);
        }}
      >
        <img
          src={imageSrc}
          alt="Interactive campus map of OCP Jorf Lasfar"
          draggable={false}
          width={MAP_W}
          height={MAP_H}
          className="block select-none"
          style={{ imageRendering: zoom >= 3 ? "pixelated" : "auto" }}
        />

        {/* High-resolution LOD zone overlays: appear above the base image at deep zoom */}
        {overlays
          .filter(o => zoom >= (o.minZoom ?? 2.5))
          .map(o => (
            <img
              key={o.file}
              src={`/assets/map/${o.file}`}
              alt=""
              draggable={false}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${(o.x / MAP_W) * 100}%`,
                top: `${(o.y / MAP_H) * 100}%`,
                width: `${(o.w / MAP_W) * 100}%`,
                height: `${(o.h / MAP_H) * 100}%`,
              }}
            />
          ))}

        {/* Route polyline + leader lines live in PNG pixel space (SVG viewBox) */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          {route && route.path.length >= 2 && (
            <>
              <polyline
                points={route.path.map(pt => `${pt.x},${pt.y}`).join(" ")}
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={route.path.map(pt => `${pt.x},${pt.y}`).join(" ")}
                fill="none"
                stroke="#00b85c"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="14 7"
                vectorEffect="non-scaling-stroke"
                className="route-dash"
              />
            </>
          )}
          {showLabels && projected?.map(({ place, ax, ay }) => {
            const ll = labelLayout.get(place.id);
            if (!ll || !ll.leader) return null;
            const cx = ll.lx + ll.bw / 2;
            const cy = ll.ly > ay ? ll.ly : ll.ly + ll.bh;
            const sx = Math.min(Math.max(ax, ll.lx), ll.lx + ll.bw);
            const ex = Math.abs(cx - ax) < ll.bw / 2 ? cx : sx;
            return (
              <line
                key={`ld-${place.id}`}
                x1={ax} y1={ay} x2={ex} y2={cy}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Markers — children of the transformed world; % of the PNG itself */}
        {projected?.map(({ place, ax, ay }) => {
          if (ax < -20 || ax > MAP_W + 20 || ay < -20 || ay > MAP_H + 20) return null;
          const isFrom = fromPlace?.id === place.id;
          const isTo = toPlace?.id === place.id;
          const isSelected = selectedPlace?.id === place.id;
          const color = isFrom ? "#3b82f6" : isTo ? "#ef4444" : place.identified ? "#00a050" : "#4E78E8";
          const size = isFrom || isTo ? 20 : isSelected ? 18 : 15;
          const ll = labelLayout.get(place.id);
          return (
            <div key={place.id} className="absolute" style={{ left: pct(ax, MAP_W), top: pct(ay, MAP_H) }}>
              {isSelected && !isFrom && !isTo && (
                <span
                  className="absolute rounded-full animate-ping"
                  style={{
                    left: 0, top: 0,
                    width: size + 10, height: size + 10,
                    marginLeft: -(size + 10) / 2, marginTop: -(size + 10) / 2,
                    backgroundColor: place.identified ? "rgba(0,160,80,0.25)" : "rgba(78,120,232,0.25)",
                  }}
                />
              )}
              <button
                onClick={e => { e.stopPropagation(); selectPlace(place); }}
                title={place.name}
                className="absolute rounded-full ring-2 ring-white/90 shadow-md hover:scale-110 transition-transform"
                style={{
                  width: size, height: size,
                  left: 0, top: 0,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: color,
                }}
              >
                <span
                  className="absolute rounded-full bg-white/95"
                  style={{ width: 3, height: 3, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                />
              </button>
              {showLabels && (
                <div
                  className="absolute whitespace-nowrap font-semibold text-white"
                  style={{
                    left: ll ? `${((ll.lx + ll.bw / 2) / MAP_W) * 100}%` : 0,
                    top: ll ? `${((ll.ly + ll.bh / 2) / MAP_H) * 100}%` : 0,
                    transform: `translate(-50%, -50%) scale(${Math.min(2.5, 1 / zoom)})`,
                    fontSize: 11,
                    lineHeight: "11px",
                    padding: "2px 5px",
                    borderRadius: 4,
                    backgroundColor: place.identified ? "rgba(0,120,60,0.88)" : "rgba(30,30,30,0.75)",
                    border: isSelected || isFrom || isTo ? "2px solid rgba(255,255,255,0.85)" : "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    zIndex: isSelected || isFrom || isTo ? 30 : 20,
                    pointerEvents: "none",
                  }}
                >
                  {place.name}
                </div>
              )}
            </div>
          );
        })}

        {/* Route endpoints A/B */}
        {routeEnds && (["a", "b"] as const).map(k => {
          const node = routeEnds[k];
          return (
            <div
              key={k}
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white shadow-md pointer-events-none"
              style={{
                left: pct(node.x, MAP_W),
                top: pct(node.y, MAP_H),
                transform: "translate(-50%, -50%)",
                backgroundColor: k === "a" ? "#3b82f6" : "#ef4444",
                zIndex: 25,
              }}
            >
              {k.toUpperCase()}
            </div>
          );
        })}
      </div>
      {/* ========================= end MAP WORLD ========================= */}

      {calibration && !calibration.calibrated && showGeoWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-md">
          <div className="bg-amber-500/95 text-black rounded-xl shadow-xl px-4 py-2.5 flex items-start gap-2">
            <Crosshair size={16} className="mt-0.5 flex-shrink-0" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Map not georeferenced.</span>{" "}
              Markers are using stored positions. Open <a href="/calibrate" className="underline font-semibold">/calibrate</a> and capture control points to enable GPS-accurate placement.
            </div>
            <button onClick={() => setShowGeoWarning(false)} className="text-black/60 hover:text-black ml-1"><X size={14} /></button>
          </div>
        </div>
      )}

      {invalidCoords.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-md">
          <div className="bg-red-600/95 text-white rounded-xl shadow-xl px-4 py-2.5 text-xs leading-relaxed">
            <span className="font-bold">Invalid map coordinates:</span>{" "}
            {invalidCoords.slice(0, 3).map(b => `${b.place.name} -> x: ${b.x.toFixed(0)}, y: ${b.y.toFixed(0)}`).join(" · ")}
            {invalidCoords.length > 3 && ` +${invalidCoords.length - 3} more`}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="absolute top-4 left-4 z-30 w-72">
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder={t("map.searchLocations")}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map(r => (
                    <button
                      key={r.place.id}
                      onClick={() => {
                        selectPlace(r.place, 1.2);
                        setSearchQuery(r.place.name);
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.place.identified ? "bg-[#00a050]" : "bg-blue-500"}`} />
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{r.place.name}</div>
                        <div className="text-xs text-gray-500">{r.place.category} · {r.place.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
          <button onClick={() => zoomAtCenter(1.25)} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" title="Zoom in">
            <Plus size={18} className="text-gray-700" />
          </button>
          <button onClick={() => zoomAtCenter(0.8)} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" title="Zoom out">
            <Minus size={18} className="text-gray-700" />
          </button>
          <button onClick={() => recenter(1.2)} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" title="Fit to screen">
            <Maximize2 size={16} className="text-gray-700" />
          </button>
          {onToggleFullscreen && (
            <button onClick={onToggleFullscreen} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors" title="Toggle fullscreen">
              {fullscreen ? <Minimize2 size={16} className="text-gray-700" /> : <Maximize2 size={16} className="text-gray-700" />}
            </button>
          )}
          {debugFromUrl && (
            <button
              onClick={() => setDebugEnabled(v => !v)}
              className={`w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors ${debugEnabled ? "bg-[#f59e0b]" : "bg-white hover:bg-gray-50"}`}
              title="Toggle debug overlay"
            >
              <Bug size={16} className={debugEnabled ? "text-black" : "text-gray-700"} />
            </button>
          )}
        </div>
      )}

      {selectedPlace && selectedProj && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-80">
          <div className="bg-white rounded-2xl shadow-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedPlace.name}</h3>
                <p className="text-sm text-gray-500">{selectedPlace.category} · {selectedPlace.type}</p>
              </div>
              <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selectedPlace.description}</p>
            {selectedPlace.gps && (
              <p className="text-[11px] font-mono text-gray-400 mb-3">
                GPS {selectedPlace.gps.lat.toFixed(6)}, {selectedPlace.gps.lng.toFixed(6)} · source: {selectedPlace.coordinateOrigin ?? selectedPlace.source}
              </p>
            )}
            {showRoute && (
              <div className="flex gap-2">
                <button
                  onClick={() => setFromPlace(selectedPlace)}
                  className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  {t("map.setAsStart")}
                </button>
                <button
                  onClick={() => setToPlace(selectedPlace)}
                  className="flex-1 py-2 px-3 bg-[#00a050] text-white rounded-lg text-sm font-semibold hover:bg-[#008a44] transition-colors"
                >
                  {t("map.navigateHere")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {debugEnabled && selectedPlace && selectedProj && selectedScreen && (
        <div className="absolute bottom-4 left-4 z-40 w-80 font-mono text-[11px] bg-black/90 text-green-300 rounded-xl shadow-2xl p-4 space-y-1 border border-green-500/30">
          <div className="text-white font-bold mb-1">DEBUG · {selectedPlace.name}</div>
          <div>lat: {selectedPlace.gps?.lat.toFixed(7) ?? "—"} (source of truth)</div>
          <div>lng: {selectedPlace.gps?.lng.toFixed(7) ?? "—"}</div>
          <div className="text-yellow-300">PNG px: x {selectedProj.ax.toFixed(1)} · y {selectedProj.ay.toFixed(1)}</div>
          <div className="text-yellow-300">normalized: nx {(selectedProj.ax / MAP_W).toFixed(4)} · ny {(selectedProj.ay / MAP_H).toFixed(4)}</div>
          {calibration?.calibrated ? (
            <div className="text-green-500">georef: ON · rms {calibration.rmsPx.toFixed(1)}px · {calibration.pointCount} pts</div>
          ) : (
            <div className="text-red-400">georef: OFF — using stored file coords</div>
          )}
          <div>screen X: {selectedScreen.x.toFixed(0)} · Y: {selectedScreen.y.toFixed(0)}</div>
          <div>zoom: {zoom.toFixed(3)} · pan: {offset.x.toFixed(0)}, {offset.y.toFixed(0)}</div>
          <div>world: {MAP_W}×{MAP_H} · image: {imageSrc.split("/").pop()}</div>
          <div className="text-gray-400">stored mapX,mapY: {selectedPlace.mapX ?? selectedPlace.x}, {selectedPlace.mapY ?? selectedPlace.y}</div>
        </div>
      )}

      {showRoute && (fromPlace || toPlace) && (
        <div className="absolute bottom-4 right-4 z-30 w-72">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t("map.routePlanner")}</h4>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 text-sm text-gray-800 truncate">{fromPlace?.name || t("map.selectStart")}</div>
                {fromPlace && <button onClick={() => setFromPlace(null)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>}
              </div>
              <div className="ml-1.5 w-px h-3 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <div className="flex-1 text-sm text-gray-800 truncate">{toPlace?.name || t("map.selectDestination")}</div>
                {toPlace && <button onClick={() => setToPlace(null)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>}
              </div>
            </div>

            {route && (
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex justify-around mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#00a050] font-bold text-lg">
                      <Ruler size={14} />
                      {route.distStr}
                    </div>
                    <div className="text-xs text-gray-500">{t("map.distance")}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#00a050] font-bold text-lg">
                      <Clock size={14} />
                      {route.timeStr}
                    </div>
                    <div className="text-xs text-gray-500">{t("map.walkingTime")}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-700"
                >
                  <span>{t("map.directions")} ({route.instructions.length} {t("map.steps", { count: route.instructions.length })})</span>
                  <ChevronRight size={14} className={`transition-transform ${showInstructions ? "rotate-90" : ""}`} />
                </button>
                {showInstructions && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {route.instructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-[#00a050]/10 text-[#00a050] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{inst.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {routeError && (
              <div className="px-4 py-3 border-t border-gray-100 text-sm text-red-600">
                {routeError}
              </div>
            )}

            <div className="px-4 py-2 border-t border-gray-100">
              <button
                onClick={() => { setFromPlace(null); setToPlace(null); setRoute(null); setSelectedPlace(null); setRouteError(""); }}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                {t("map.clearRoute")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a1a12] z-50 pointer-events-none">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00a050] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">{t("map.loadingMap")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
