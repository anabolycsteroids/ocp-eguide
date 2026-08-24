#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAP_DIR = resolve(__dirname, "../public/assets/map");
let IMG_W = 1520;
let IMG_H = 933;

const args = process.argv.slice(2);
const force = args.includes("--force");
const validateOnly = args.includes("--validate-only");
const calibIdx = args.indexOf("--calib");
const CALIB_PATH = calibIdx >= 0 ? resolve(args[calibIdx + 1]) : resolve(__dirname, "../../calibration-points.json");

const readJson = p => JSON.parse(readFileSync(p, "utf8"));

function metersPerDegree(latDeg) {
  const phi = (latDeg * Math.PI) / 180;
  const lat = 111132.92 - 559.82 * Math.cos(2 * phi) + 1.175 * Math.cos(4 * phi);
  const lng = 111412.84 * Math.cos(phi) - 93.5 * Math.cos(3 * phi) + 0.118 * Math.cos(5 * phi);
  return { lat, lng };
}

function solve3(A, b) {
  const det =
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  if (Math.abs(det) < 1e-10) throw new Error("Singular matrix — control points are collinear/clumped");
  const sub = row => {
    const M = A.map((r, i) => i === row ? b : [...r]);
    return (
      M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
      M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
      M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
    );
  };
  return [sub(0) / det, sub(1) / det, sub(2) / det];
}

function fitAffine(points) {
  const cLat = points.reduce((s, p) => s + p.gps.lat, 0) / points.length;
  const cLng = points.reduce((s, p) => s + p.gps.lng, 0) / points.length;
  const mpd = metersPerDegree(cLat);
  const local = points.map(p => ({
    ...p,
    E: (p.gps.lng - cLng) * mpd.lng,
    N: (p.gps.lat - cLat) * mpd.lat,
  }));
  let sEE = 0, sEN = 0, sNN = 0, sE = 0, sN = 0;
  let sEx = 0, sNx = 0, sx = 0, sEy = 0, sNy = 0, sy = 0;
  for (const p of local) {
    sEE += p.E * p.E; sEN += p.E * p.N; sNN += p.N * p.N;
    sE += p.E; sN += p.N;
    sEx += p.E * p.x; sNx += p.N * p.x; sx += p.x;
    sEy += p.E * p.y; sNy += p.N * p.y; sy += p.y;
  }
  const n = local.length;
  const A = [[sEE, sEN, sE], [sEN, sNN, sN], [sE, sN, n]];
  const [a, b, c] = solve3(A, [sEx, sNx, sx]);
  const [d, e, f] = solve3(A, [sEy, sNy, sy]);
  const residuals = local.map(p => {
    const px = a * p.E + b * p.N + c;
    const py = d * p.E + e * p.N + f;
    return { id: p.id ?? p.name, dx: px - p.x, dy: py - p.y, distPx: Math.hypot(px - p.x, py - p.y) };
  });
  const rmsPx = Math.sqrt(residuals.reduce((s, r) => s + r.distPx ** 2, 0) / residuals.length);
  return {
    coeffs: { a, b, c, d, e, f },
    center: { lat: cLat, lng: cLng },
    mpd,
    residuals,
    rmsPx,
    maxResidualPx: Math.max(...residuals.map(r => r.distPx)),
    det: a * e - b * d,
  };
}

function project(fit, lat, lng) {
  const E = (lng - fit.center.lng) * fit.mpd.lng;
  const N = (lat - fit.center.lat) * fit.mpd.lat;
  const k = fit.coeffs;
  return { x: k.a * E + k.b * N + k.c, y: k.d * E + k.e * N + k.f };
}

function astarAllPairsConnectivity(nodes, edges, connections, placeIds) {
  const adj = new Map();
  for (const nd of nodes) adj.set(nd.id, []);
  for (const edg of edges) {
    if (!edg.walkable) continue;
    const a = nodes.find(n => n.id === edg.from), b = nodes.find(n => n.id === edg.to);
    if (!a || !b) continue;
    const cost = Math.hypot(a.x - b.x, a.y - b.y);
    adj.get(edg.from)?.push({ to: edg.to, cost });
    adj.get(edg.to)?.push({ to: edg.from, cost });
  }
  const connByPlace = new Map(connections.map(cn => [cn.placeId, cn.nodeId]));
  const idByNode = new Map(nodes.map(nd => [nd.id, nd]));
  let ok = 0, fail = 0;
  const failures = [];
  const targets = placeIds.filter(pid => connByPlace.has(pid));
  for (let i = 0; i < targets.length; i++) {
    for (let j = 0; j < targets.length; j++) {
      if (i === j) continue;
      const sId = connByPlace.get(targets[i]), eId = connByPlace.get(targets[j]);
      if (!idByNode.has(sId) || !idByNode.has(eId)) { fail++; failures.push(`${targets[i]}->${targets[j]}: missing node`); continue; }
      const key = `${targets[i]}|${targets[j]}`;
      const seen = new Set();
      const dist = new Map([[sId, 0]]);
      const pq = [[0, sId]];
      const en = idByNode.get(eId);
      let found = false;
      while (pq.length) {
        pq.sort((x, y) => x[0] - y[0]);
        const [, cur] = pq.shift();
        if (cur === eId) { found = true; break; }
        if (seen.has(cur)) continue;
        seen.add(cur);
        for (const nb of adj.get(cur) ?? []) {
          const nn = idByNode.get(nb.to);
          if (!nn) continue;
          const h = Math.hypot(nn.x - en.x, nn.y - en.y);
          const g = dist.get(cur) + nb.cost;
          if (g < (dist.get(nb.to) ?? Infinity)) {
            dist.set(nb.to, g);
            pq.push([g + h, nb.to]);
          }
        }
      }
      if (found) ok++; else { fail++; failures.push(key); }
    }
  }
  return { ok, fail, failures, total: targets.length ** 2 - targets.length };
}

const report = [];
const log = s => { console.log(s); report.push(s); };

log("=== OCP MAP REGENERATION ===");
log(`Mode: ${validateOnly ? "VALIDATE-ONLY" : "FULL REGENERATION"}`);
log(`Calibration file: ${CALIB_PATH}`);

let calib = null;
try {
  calib = readJson(CALIB_PATH);
} catch {
  log("NOTE: calibration-points.json not found. Capture control points at /calibrate first,");
  log("then save the downloaded file next to this project folder as 'calibration-points.json'.");
  if (!validateOnly) process.exit(1);
}

// Image dimensions come from the calibration capture (source of truth for the
// geometry being calibrated); fall back to the legacy core image.
if (calib?.imageWidth > 0 && calib?.imageHeight > 0) {
  IMG_W = calib.imageWidth;
  IMG_H = calib.imageHeight;
  log(`Image: ${calib.imageFile ?? "unspecified"} (${IMG_W}x${IMG_H})`);
}

const pts = (calib?.points ?? []).filter(
  p => typeof p?.gps?.lat === "number" && typeof p?.gps?.lng === "number" &&
       typeof p?.x === "number" && typeof p?.y === "number",
);

if (!validateOnly) {
  if (pts.length < 3) {
    log(`ERROR: only ${pts.length} valid control point(s); need >= 3.`);
    process.exit(1);
  }
}

let fit = null;
if (pts.length >= 3) {
  fit = fitAffine(pts);
  const mpp = 1 / Math.sqrt(Math.abs(fit.det));
  const rotDeg = (Math.atan2(fit.coeffs.d, fit.coeffs.a) * 180) / Math.PI;
  log(`\nControl points: ${pts.length}`);
  log(`Affine RMS residual: ${fit.rmsPx.toFixed(2)} px (max ${fit.maxResidualPx.toFixed(1)} px)`);
  log(`Scale: ${mpp.toFixed(4)} m/px (${(1 / mpp).toFixed(3)} px/m) · rotation ${rotDeg.toFixed(2)}°`);
  for (const r of fit.residuals) log(`  · ${r.id}: Δ(${r.dx.toFixed(1)}, ${r.dy.toFixed(1)}) = ${r.distPx.toFixed(1)} px`);
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  if ((Math.max(...xs) - Math.min(...xs) < 400 || Math.max(...ys) - Math.min(...ys) < 250))
    log("WARNING: control points are clustered — add points spread across the campus.");
  if (fit.rmsPx > 12 && !force) {
    log("\nABORT: RMS > 12px suggests mislocated clicks. Fix flagged points or rerun with --force.");
    writeFileSync(resolve(MAP_DIR, "..", "..", "..", "calibration-report.txt"), report.join("\n"));
    process.exit(1);
  }
}

const placesDoc = readJson(resolve(MAP_DIR, "places.json"));
const places = placesDoc.places;

log(`\nPlaces in dataset: ${places.length}`);

const issues = [];
const seenGps = new Map();
for (const pl of places) {
  if (!pl.gps || typeof pl.gps.lat !== "number") { issues.push(`NO GPS: ${pl.id}`); continue; }
  if (Math.abs(pl.gps.lat) > 90 || Math.abs(pl.gps.lng) > 180) issues.push(`INVALID GPS: ${pl.id}`);
  const gk = pl.gps.lat.toFixed(6) + "," + pl.gps.lng.toFixed(6);
  if (seenGps.has(gk)) issues.push(`DUPLICATE GPS: ${pl.id} == ${seenGps.get(gk)} @ ${gk}`);
  seenGps.set(gk, pl.id);
}
log(`GPS integrity: ${issues.length ? "" : "OK"}`);
issues.forEach(s => log("  · " + s));

if (fit) {
  log("\n--- Projected positions ---");
  const projList = [];
  for (const pl of places) {
    if (!pl.gps) continue;
    const pt = project(fit, pl.gps.lat, pl.gps.lng);
    pl.mapX = Math.round(pt.x * 10) / 10;
    pl.mapY = Math.round(pt.y * 10) / 10;
    pl.labelOffsetX = pl.labelOffsetX ?? 0;
    pl.labelOffsetY = pl.labelOffsetY ?? 0;
    pl.coordinateOrigin = "google-earth";
    projList.push(pl);
    if (pt.x < -20 || pt.x > IMG_W + 20 || pt.y < -20 || pt.y > IMG_H + 20)
      log(`  OUT OF BOUNDS: ${pl.id} -> (${pl.mapX}, ${pl.mapY})`);
  }
  let dupCount = 0;
  for (let i = 0; i < projList.length; i++)
    for (let j = i + 1; j < projList.length; j++) {
      const d = Math.hypot(projList[i].mapX - projList[j].mapX, projList[i].mapY - projList[j].mapY);
      if (d < 2) { dupCount++; log(`  COLLISION <2px: ${projList[i].id} <-> ${projList[j].id} (${d.toFixed(1)}px)`); }
    }
  if (!dupCount) log("No marker collisions (<2px).");
  log(`Projected ${projList.length}/${places.length} places from immutable GPS coordinates.`);
}

if (validateOnly) {
  writeFileSync(resolve(__dirname, "../../calibration-report.txt"), report.join("\n"));
  log("\nValidate-only complete. Report saved to calibration-report.txt");
  process.exit(0);
}

if (!fit) {
  log("\nABORT: cannot regenerate without calibration.");
  process.exit(1);
}

for (const pl of places) {
  if (typeof pl.mapX === "number") { pl.x = pl.mapX; pl.y = pl.mapY; }
}

const mpp = 1 / Math.sqrt(Math.abs(fit.det));
const spacingPx = 100 / mpp;
// Mesh covers the ENTIRE image so no location can fall outside grid coverage;
// outlier places that project near/off the image edge still get a reachable node.
const minX = spacingPx, maxX = IMG_W - spacingPx, minY = spacingPx, maxY = IMG_H - spacingPx;

const nodes = [];
const edges = [];
const cols = Math.floor((maxX - minX) / spacingPx) + 1;
const rows = Math.floor((maxY - minY) / spacingPx) + 1;
const gridIndex = new Map();

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const x = Math.round(minX + c * spacingPx);
    const y = Math.round(minY + r * spacingPx);
    if (x < 0 || x > IMG_W || y < 0 || y > IMG_H) continue;
    const id = `g_${r}_${c}`;
    gridIndex.set(`${r}_${c}`, id);
    nodes.push({ id, x, y, type: "intersection", label: "" });
  }
}
const link = (a, b) => edges.push({ from: a, to: b, walkable: true });
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const id = gridIndex.get(`${r}_${c}`);
    if (!id) continue;
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const nb = gridIndex.get(`${r + dr}_${c + dc}`);
      if (nb) link(id, nb);
    }
  }
}

const connections = [];
const forcedAccess = [];
for (const pl of places) {
  const nid = `n_${pl.id}`;
  nodes.push({ id: nid, x: pl.x, y: pl.y, type: "entrance", label: pl.name });
  const candidates = nodes
    .filter(nd => nd.id.startsWith("g_"))
    .map(nd => ({ nd, d: Math.hypot(nd.x - pl.x, nd.y - pl.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4);
  const linked = candidates.filter(cand => cand.d <= 300 / mpp);
  if (linked.length) {
    for (const cand of linked) link(nid, cand.nd.id);
  } else {
    // Guarantee routability: force-link to the single nearest grid node and flag it.
    link(nid, candidates[0].nd.id);
    forcedAccess.push({ placeId: pl.id, distPx: Math.round(candidates[0].d), distM: Math.round(candidates[0].d * mpp) });
  }
  connections.push({ placeId: pl.id, nodeId: nid, accessPoint: "nearest-road", verified: linked.length > 0 });
}

writeFileSync(resolve(MAP_DIR, "nodes.json"), JSON.stringify({
  version: "5.0.0",
  description: "Walking mesh generated from georeferenced positions",
  generatedAt: new Date().toISOString(),
  nodes,
}, null, 2));
writeFileSync(resolve(MAP_DIR, "edges.json"), JSON.stringify({
  version: "5.0.0",
  description: "Walkable mesh edges",
  generatedAt: new Date().toISOString(),
  edges,
}, null, 2));
writeFileSync(resolve(MAP_DIR, "place-node-connections.json"), JSON.stringify({
  version: "5.0.0",
  connections,
}, null, 2));

const cfg = readJson(resolve(MAP_DIR, "map-config.json"));
cfg.navigation.pixelsPerMeter = 1 / mpp;
cfg.navigation.note = `1 pixel ≈ ${mpp.toFixed(3)}m (derived from ${pts.length}-point affine calibration)`;
cfg.image = {
  file: calib.imageFile ?? "campus-map.png",
  width: IMG_W,
  height: IMG_H,
};
cfg.coordinateSystem = {
  ...(cfg.coordinateSystem ?? {}),
  originX: 0,
  originY: 0,
  width: IMG_W,
  height: IMG_H,
  units: "pixels",
  note: `Pixel coordinates on ${cfg.image.file} (${IMG_W}x${IMG_H}); derived from GPS via calibration`,
};
cfg.calibration = {
  description: "Least-squares affine GPS→pixel transform fitted from captured control points",
  method: "affine-least-squares",
  controlPoints: pts.length,
  rmsPx: Math.round(fit.rmsPx * 100) / 100,
  maxResidualPx: Math.round(fit.maxResidualPx * 10) / 10,
  metersPerPixel: Math.round(mpp * 10000) / 10000,
  rotationDeg: Math.round(Math.atan2(fit.coeffs.d, fit.coeffs.a) * 18000 / Math.PI) / 100,
  centerLat: fit.center.lat,
  centerLng: fit.center.lng,
  coeffs: fit.coeffs,
  capturedAt: calib.capturedAt ?? null,
};
writeFileSync(resolve(MAP_DIR, "map-config.json"), JSON.stringify(cfg, null, 2));

placesDoc.version = "5.0.0";
placesDoc.lastUpdated = new Date().toISOString().slice(0, 10);
placesDoc.calibrationMethod = `Affine least-squares from ${pts.length} captured control points (RMS ${fit.rmsPx.toFixed(1)}px)`;
placesDoc.coordinateSystem.metersPerPixel = Math.round(mpp * 10000) / 10000;
writeFileSync(resolve(MAP_DIR, "places.json"), JSON.stringify(placesDoc, null, 2));

log(`\nGraph rebuilt: ${nodes.length} nodes · ${edges.length} edges · ${connections.length} connections`);
if (forcedAccess.length) {
  log(`\nWARNING: ${forcedAccess.length} location(s) had no walking-mesh node within ${Math.round(300)}m — force-linked to nearest node:`);
  for (const fa of forcedAccess.slice(0, 20)) log(`  - ${fa.placeId}: ~${fa.distM} m from mesh`);
  if (forcedAccess.length > 20) log(`  …and ${forcedAccess.length - 20} more`);
}
const oobPlaces = places.filter(pl => pl.x < -20 || pl.x > IMG_W + 20 || pl.y < -20 || pl.y > IMG_H + 20);
if (oobPlaces.length) {
  log(`\nWARNING: ${oobPlaces.length} location(s) project OUTSIDE the master image bounds — they will not be visible on /map until the image coverage includes them or their marker is reviewed:`);
  for (const pl of oobPlaces.slice(0, 25)) log(`  - ${pl.id} (${pl.name}) → (${Math.round(pl.x)}, ${Math.round(pl.y)})`);
  if (oobPlaces.length > 25) log(`  …and ${oobPlaces.length - 25} more`);
}

log("\nRunning all-pairs routing check...");
const t0 = Date.now();
const conn = astarAllPairsConnectivity(nodes, edges, connections, places.map(pl => pl.id));
log(`Routing: ${conn.ok}/${conn.total} place-pairs routable (${((100 * conn.ok) / conn.total).toFixed(1)}%) in ${Date.now() - t0}ms`);
if (conn.failures.length) log("Failures:\n" + conn.failures.slice(0, 20).join("\n"));

writeFileSync(resolve(__dirname, "../../calibration-report.txt"), report.join("\n"));
log("\nDONE. Report saved to calibration-report.txt");
