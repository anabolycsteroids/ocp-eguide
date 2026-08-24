"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { Crosshair, Download, Copy, RotateCcw, Undo2, Check, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import { computeCalibration, gpsToMap, type CalibrationFile } from "@/lib/geoTransform";

// Control-point targets chosen for maximum geographic spread across the complex
// (N gates -> far east entrance -> southern plants). GPS values come from the
// authoritative corrected dataset (locations_coordinates_corrected.txt).
const TARGETS = [
  { id: "strocjph", name: "STROC JPH", gps: { lat: 33.119172, lng: -8.607197 } },
  { id: "porte_principale", name: "Porte Principale (main gate)", gps: { lat: 33.117564, lng: -8.595797 } },
  { id: "idea_factory", name: "Idea Factory", gps: { lat: 33.115047, lng: -8.602092 } },
  { id: "entre_est_ocp", name: "Entree EST ocp (eastern entrance)", gps: { lat: 33.111353, lng: -8.576244 } },
  { id: "imacid", name: "IMACID", gps: { lat: 33.105128, lng: -8.596222 } },
  { id: "jfc_1", name: "JFC 1", gps: { lat: 33.100875, lng: -8.598725 } },
  { id: "gngr_new_tech_morroco", name: "GNGR NEW TECH MORROCO (far SE plant)", gps: { lat: 33.077950, lng: -8.601228 } },
  { id: "fluoralpha", name: "FLUORALPHA (southern plant)", gps: { lat: 33.089011, lng: -8.615164 } },
  { id: "mosquee_jorf_lasfar", name: "Mosquee jorf Lasfar", gps: { lat: 33.111792, lng: -8.597261 } },
  { id: "ocp_control_tower", name: "OCP CONTROL TOWER", gps: { lat: 33.108814, lng: -8.591850 } },
  { id: "centrelec", name: "Centrelec", gps: { lat: 33.109200, lng: -8.606175 } },
  { id: "station_desalement", name: "Desalement ocp (desalination)", gps: { lat: 33.115869, lng: -8.600764 } },
  // Refinement round 2 — misplaced-location corrections
  { id: "pj_2", name: "PJ-2", gps: { lat: 33.12106388888889, lng: -8.618372222222222 } },
  { id: "entreee_ouest_ocp", name: "Entree OUEST ocp (western entrance)", gps: { lat: 33.13011388888889, lng: -8.608938888888888 } },
  { id: "centre_sensibilisation_ocp", name: "Centre de sensibilisation OCP", gps: { lat: 33.114044444444446, lng: -8.587580555555556 } },
  { id: "parkx", name: "PARKX", gps: { lat: 33.081988888888894, lng: -8.609427777777777 } },
];

const IMAGE_HD = "/assets/map/campus-map-hd.jpg";
const IMAGE_WIDER = "/assets/map/campus-map-wider.png";
const IMAGE_WIDE = "/assets/map/campus-map-wide.png";
const IMAGE_CORE = "/assets/map/campus-map.png";

type Click = { id: string; x: number; y: number };
interface PlaceLite { id: string; name: string; x: number; y: number; mapX?: number; mapY?: number; gps?: { lat: number; lng: number } }

export default function CalibratePage() {
  const [tab, setTab] = useState<"capture" | "validate">("capture");
  return (
    <div className="h-screen flex flex-col bg-[#0a1a12] text-white select-none">
      <header className="flex items-center gap-3 px-4 py-3 bg-[#092033] border-b border-white/10 flex-shrink-0">
        <Link href="/" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <Crosshair size={20} className="text-[#00e070]" />
        <div className="flex-1">
          <h1 className="text-sm font-bold">Georeferencing Toolkit</h1>
          <p className="text-xs text-gray-400">Control-point capture &amp; validation · wide whole-complex map</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(["capture", "validate"] as const).map(tb => (
            <button key={tb} onClick={() => setTab(tb)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${tab === tb ? "bg-[#00a050]" : "hover:bg-white/10 text-gray-300"}`}>
              {tb}
            </button>
          ))}
        </div>
      </header>
      {tab === "capture" ? <CaptureTab /> : <ValidateTab />}
    </div>
  );
}

function CaptureTab() {
  const [clicks, setClicks] = useState<Click[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [nat, setNat] = useState({ w: 8192, h: 5282 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("calib-clicks-hd");
    if (saved) { try { setClicks(JSON.parse(saved)); } catch {} }
  }, []);
  useEffect(() => {
    localStorage.setItem("calib-clicks-hd", JSON.stringify(clicks));
  }, [clicks]);

  const layout = useCallback(() => {
    const el = wrapRef.current;
    if (!el || !nat.w) return;
    const scale = Math.min(el.clientWidth / nat.w, el.clientHeight / nat.h);
    setStage({ w: nat.w * scale, h: nat.h * scale });
  }, [nat]);

  useEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [layout]);

  const toNative = useCallback((clientX: number, clientY: number) => {
    const el = wrapRef.current?.querySelector("[data-stage]") as HTMLElement | null;
    if (!el || !stage.w || !nat.w) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return {
      x: Math.round(((clientX - r.left) / r.width) * nat.w),
      y: Math.round(((clientY - r.top) / r.height) * nat.h),
    };
  }, [stage.w, nat]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    setZoom(z => {
      const nz = Math.min(16, Math.max(1, z * (e.deltaY < 0 ? 1.25 : 0.8)));
      setPan(p => ({ x: mx - ((mx - p.x) * nz) / z, y: my - ((my - p.y) * nz) / z }));
      return nz;
    });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y, moved: false };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const n = toNative(e.clientX, e.clientY);
    if (n && n.x >= 0 && n.x < nat.w && n.y >= 0 && n.y < nat.h) setCursor(n); else setCursor(null);
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    if (d.moved) setPan({ x: d.ox + dx, y: d.oy + dy });
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const wasDrag = dragRef.current?.moved;
    dragRef.current = null;
    if (wasDrag) return;
    const n = toNative(e.clientX, e.clientY);
    if (!n || n.x < 0 || n.x >= nat.w || n.y < 0 || n.y >= nat.h) return;
    // Priority: correcting an existing marker (click within 150px of it) —
    // works at any time, independent of placement order.
    let best: { id: string; d: number } | null = null;
    for (const c of clicks) {
      const d = Math.hypot(c.x - n.x, c.y - n.y);
      if (!best || d < best.d) best = { id: c.id, d };
    }
    if (best && best.d <= 150) {
      const targetId = best.id;
      setClicks(c => c.map(p => (p.id === targetId ? { id: targetId, x: n.x, y: n.y } : p)));
      return;
    }
    // Otherwise assign the next not-yet-placed target in order.
    const placedIds = new Set(clicks.map(c => c.id));
    const next = TARGETS.find(t => !placedIds.has(t.id));
    if (!next) return;
    setClicks(c => [...c, { id: next.id, x: n.x, y: n.y }]);
  };

  const undo = () => setClicks(c => c.slice(0, -1));
  const reset = () => { setClicks([]); setZoom(1); setPan({ x: 0, y: 0 }); };

  const buildJson = (): CalibrationFile => ({
    capturedAt: new Date().toISOString(),
    imageFile: "campus-map-hd.jpg",
    imageWidth: nat.w,
    imageHeight: nat.h,
    points: clicks.map(c => {
      const t = TARGETS.find(x => x.id === c.id)!;
      return { id: t.id, name: t.name, gps: t.gps, x: c.x, y: c.y };
    }),
  });

  const download = () => {
    const blob = new Blob([JSON.stringify(buildJson(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "calibration-points.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(buildJson(), null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const placedIdsSet = new Set(clicks.map(c => c.id));
  const nextTarget = TARGETS.find(t => !placedIdsSet.has(t.id));
  const allDone = clicks.length >= TARGETS.length;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#0d2436] border-b border-white/10 text-xs text-gray-300 flex-wrap">
        <span className="font-semibold text-white">Workflow:</span>
        <span>1 · Zoom &amp; click each listed building on the HD map</span>
        <span className="text-gray-500">→</span>
        <span>2 · Download JSON</span>
        <span className="text-gray-500">→</span>
        <span>3 · Drop it in the project folder</span>
        <span className="ml-auto font-mono text-[11px] text-gray-400">{nat.w}×{nat.h}px source</span>
      </div>
      <div className="flex flex-1 min-h-0">
        <aside className="w-72 flex-shrink-0 overflow-y-auto bg-[#092033] border-r border-white/10 p-3 space-y-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            {TARGETS.length} control points across the whole complex. Your previous captures are restored automatically — only the new/refined ones need clicking.
            Click the CENTER of each structure. Zoom in (wheel) — pixels sharpen past ×1.6.
            To FIX any point at any time: just click again within ~150px of its marker. Markers stay one fixed size at any zoom; labels appear when zoomed.
          </p>
          {TARGETS.map((t, i) => {
            const hit = clicks.find(c => c.id === t.id);
            const isNext = nextTarget?.id === t.id;
            return (
              <div key={t.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${hit ? "bg-[#00a050]/20" : isNext ? "bg-white/10 ring-1 ring-[#00e070]" : "bg-white/5 opacity-60"}`}>
                <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center ${hit ? "bg-[#00a050]" : isNext ? "bg-[#00e070]" : "bg-white/20"}`}>
                  {hit ? <Check size={10} className="text-black" /> : isNext ? <MapPin size={10} className="text-black" /> : <span className="text-[9px]">{i + 1}</span>}
                </span>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="font-mono text-[10px] text-gray-400">
                    {hit ? `→ captured (${hit.x}, ${hit.y})` : `${t.gps.lat.toFixed(6)}, ${t.gps.lng.toFixed(6)}`}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0d2436] border-b border-white/10 flex-wrap z-20">
            <span className="text-xs px-2 py-1 rounded bg-white/10 font-mono">
              cursor: {cursor ? `${cursor.x}, ${cursor.y}` : "-"} · zoom ×{zoom.toFixed(1)}
            </span>
            <button onClick={undo} disabled={!clicks.length} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30">
              <Undo2 size={14} /> Undo
            </button>
            <button onClick={reset} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20">
              <RotateCcw size={14} /> Reset
            </button>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">{allDone ? `All ${TARGETS.length} captured ✓` : nextTarget ? `Next: ${nextTarget.name} (${clicks.length}/${TARGETS.length})` : ""}</span>
            <button onClick={download} disabled={clicks.length < 4} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-[#00a050] hover:bg-[#00b860] disabled:opacity-30 font-semibold">
              <Download size={14} /> Download JSON
            </button>
            <button onClick={copyJson} disabled={clicks.length < 4} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div ref={wrapRef} className="flex-1 relative overflow-hidden cursor-crosshair bg-black"
            onWheel={handleWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
            onDoubleClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            <div data-stage className="absolute origin-top-left"
              style={{
                left: `calc(50% + ${pan.x}px - ${stage.w / 2}px)`,
                top: `calc(50% + ${pan.y}px - ${stage.h / 2}px)`,
                width: stage.w, height: stage.h,
                transform: `scale(${zoom})`,
              }}>
              <img src={IMAGE_HD} alt="campus satellite HD" draggable={false} className="w-full h-full"
                style={{ imageRendering: zoom >= 1.6 ? "pixelated" : "auto" }}
                onLoad={e => {
                  const im = e.currentTarget;
                  if (im.naturalWidth && (im.naturalWidth !== nat.w || im.naturalHeight !== nat.h)) {
                    setNat({ w: im.naturalWidth, h: im.naturalHeight });
                  }
                }} />
              {clicks.map(c => (
                <div key={c.id} className="absolute pointer-events-none" style={{ left: `${(c.x / nat.w) * 100}%`, top: `${(c.y / nat.h) * 100}%` }}>
                  <div style={{ position: "relative", transform: `scale(${1 / zoom})`, transformOrigin: "0 0", width: 0, height: 0 }}>
                    {/* crosshair through the exact clicked pixel */}
                    <div style={{ position: "absolute", left: -9, top: -0.75, width: 18, height: 1.5, background: "#00e070", opacity: 0.85 }} />
                    <div style={{ position: "absolute", left: -0.75, top: -9, width: 1.5, height: 18, background: "#00e070", opacity: 0.85 }} />
                    <div style={{ position: "absolute", width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5, borderRadius: "50%", border: "1.5px solid #00e070", background: "rgba(0,0,0,0.45)", boxShadow: "0 0 6px rgba(0,224,112,0.9)" }} />
                    {zoom >= 1.8 && (
                      <div style={{ position: "absolute", left: 8, top: -22, fontSize: 9, fontFamily: "monospace", background: "rgba(0,0,0,0.8)", color: "#00e070", padding: "1px 4px", borderRadius: 4, whiteSpace: "nowrap" }}>
                        {TARGETS.find(t => t.id === c.id)?.name} ({Math.round(c.x)},{Math.round(c.y)})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidateTab() {
  const [places, setPlaces] = useState<PlaceLite[]>([]);
  const [cfg, setCfg] = useState<{ w: number; h: number; img: string }>({ w: 1520, h: 933, img: IMAGE_CORE });
  const [calibFile, setCalibFile] = useState<CalibrationFile | null>(null);
  const [calibMissing, setCalibMissing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/assets/map/places.json").then(r => r.json()).then(d => setPlaces(d.places ?? []));
    fetch("/assets/map/map-config.json").then(r => r.json()).then(d => {
      const im = d.image ?? {};
      setCfg({
        w: im.width ?? d.coordinateSystem?.width ?? 1520,
        h: im.height ?? d.coordinateSystem?.height ?? 933,
        img: im.file ? `/assets/map/${im.file}` : IMAGE_CORE,
      });
    });
    fetch("/assets/map/calibration-points.json")
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => setCalibFile(d))
      .catch(() => setCalibMissing(true));
  }, []);

  const cal = useMemo(() => computeCalibration(calibFile), [calibFile]);

  const layout = useCallback(() => {
    const el = wrapRef.current;
    if (!el || !cfg.w) return;
    const scale = Math.min(el.clientWidth / cfg.w, el.clientHeight / cfg.h);
    setStage({ w: cfg.w * scale, h: cfg.h * scale });
  }, [cfg]);

  useEffect(() => { layout(); window.addEventListener("resize", layout); return () => window.removeEventListener("resize", layout); }, [layout]);

  const anchors = useMemo(() => {
    if (!places.length || !cal.calibrated) return [];
    return places
      .filter(pl => pl.gps && typeof pl.gps.lat === "number")
      .map(pl => {
        const pt = gpsToMap(cal, pl.gps!.lat, pl.gps!.lng);
        return { ...pl, ax: pt.x, ay: pt.y };
      });
  }, [places, cal]);

  const issues = useMemo(() => {
    const list: { level: "error" | "warning"; msg: string }[] = [];
    if (!places.length) return list;
    if (calibMissing || !calibFile) list.push({ level: "error", msg: "No calibration-points.json found in public/assets/map/ — capture control points first." });
    for (const iss of cal.issues) list.push({ level: iss.level as "error" | "warning", msg: iss.message });

    const seenGps = new Map<string, string>();
    for (const pl of places) {
      if (!pl.gps || typeof pl.gps.lat !== "number") { list.push({ level: "error", msg: `${pl.name}: missing GPS coordinates` }); continue; }
      if (Math.abs(pl.gps.lat) > 90 || Math.abs(pl.gps.lng) > 180) list.push({ level: "error", msg: `${pl.name}: invalid lat/lng range` });
      const k = pl.gps.lat.toFixed(6) + "," + pl.gps.lng.toFixed(6);
      const prev = seenGps.get(k);
      if (prev) list.push({ level: "error", msg: `Duplicate coordinates: "${prev}" and "${pl.name}" share ${k}` });
      else seenGps.set(k, pl.name);
    }
    let collisions = 0;
    for (let i = 0; i < anchors.length; i++)
      for (let j = i + 1; j < anchors.length; j++) {
        const d = Math.hypot(anchors[i].ax - anchors[j].ax, anchors[i].ay - anchors[j].ay);
        if (d < 2) { collisions++; if (collisions <= 12) list.push({ level: "error", msg: `Pixel collision: ${anchors[i].name} ↔ ${anchors[j].name} (${d.toFixed(2)}px apart)` }); }
      }
    if (collisions > 12) list.push({ level: "warning", msg: `…and ${collisions - 12} more pixel collisions` });
    let oob = 0;
    for (const a of anchors) {
      if (a.ax < -20 || a.ax > cfg.w + 20 || a.ay < -20 || a.ay > cfg.h + 20) {
        oob++;
        if (oob <= 15) list.push({ level: "warning", msg: `Out of bounds: ${a.name} → (${Math.round(a.ax)}, ${Math.round(a.ay)})` });
      }
    }
    if (oob > 15) list.push({ level: "warning", msg: `…and ${oob - 15} more out-of-bounds locations` });
    return list;
  }, [places, anchors, cal, calibFile, calibMissing, cfg]);

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[#092033] border-r border-white/10 p-3 space-y-1.5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className={issues.some(i => i.level === "error") ? "text-red-400" : "text-[#00e070]"} />
          <span className="text-sm font-semibold">
            {cal.calibrated ? `Georeferenced · RMS ${cal.rmsPx.toFixed(1)}px · ${cal.pointCount} controls` : "NOT georeferenced"}
          </span>
        </div>
        {cal.calibrated && (
          <div className="text-[11px] font-mono text-gray-400 mb-2 space-y-0.5">
            <div>scale: {cal.scaleMetersPerPixel.toFixed(3)} m/px · rotation {cal.rotationDeg.toFixed(1)}°</div>
            <div>max residual: {cal.maxResidualPx.toFixed(1)}px</div>
          </div>
        )}
        {!issues.length && <div className="p-2 rounded-lg bg-[#00a050]/20 text-xs text-green-300">All checks passed.</div>}
        {issues.map((iss, i) => (
          <div key={i} className={`p-2 rounded-lg text-xs leading-snug ${iss.level === "error" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>
            <span className="font-bold uppercase mr-1">{iss.level}:</span>{iss.msg}
          </div>
        ))}
        <div className="pt-2 text-[11px] text-gray-500 leading-relaxed">
          Validate projects every location&apos;s Google Earth coordinate onto the current master map ({cfg.w}×{cfg.h}).
          Markers must sit exactly on their real buildings.
        </div>
      </aside>

      <div ref={wrapRef} className="flex-1 relative overflow-hidden bg-black cursor-move"
        onWheel={e => {
          e.preventDefault();
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mx = e.clientX - rect.left, my = e.clientY - rect.top;
          setZoom(z => {
            const nz = Math.min(12, Math.max(0.3, z * (e.deltaY < 0 ? 1.25 : 0.8)));
            setPan(p => ({ x: mx - ((mx - p.x) * nz) / z, y: my - ((my - p.y) * nz) / z }));
            return nz;
          });
        }}
        onDoubleClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        onMouseDown={e => { (wrapRef.current as any)._d = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }; }}
        onMouseMove={e => {
          const d = (wrapRef.current as any)._d;
          if (!d) return;
          if (e.buttons === 1) setPan({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) });
        }}
        onMouseUp={() => { if (wrapRef.current) (wrapRef.current as any)._d = null; }}
      >
        <div className="absolute origin-top-left"
          style={{
            left: `calc(50% + ${pan.x}px - ${stage.w / 2}px)`,
            top: `calc(50% + ${pan.y}px - ${stage.h / 2}px)`,
            width: stage.w, height: stage.h,
            transform: `scale(${zoom})`,
          }}>
          <img src={cfg.img} alt="campus satellite" draggable={false} className="w-full h-full" style={{ imageRendering: zoom >= 3 ? "pixelated" : "auto" }} />
          {anchors.map(a => (
            <div key={a.id} className="absolute pointer-events-none" style={{ left: `${(a.ax / cfg.w) * 100}%`, top: `${(a.ay / cfg.h) * 100}%` }}>
              <div className={`w-2 h-2 -ml-1 -mt-1 rounded-full ${(a.ax < -20 || a.ax > cfg.w + 20 || a.ay < -20 || a.ay > cfg.h + 20) ? "bg-red-400" : "bg-[#ffdd00]"} ring-1 ring-black/60`} />
              <div className="absolute left-1.5 -top-3 text-[8px] font-mono text-yellow-200 bg-black/70 px-0.5 rounded whitespace-nowrap">{a.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
