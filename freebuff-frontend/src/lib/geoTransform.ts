export interface GpsPoint {
  lat: number;
  lng: number;
}

export interface ControlPoint {
  id: string;
  name: string;
  gps: GpsPoint;
  x: number;
  y: number;
}

export interface CalibrationFile {
  capturedAt?: string;
  imageFile?: string;
  imageWidth: number;
  imageHeight: number;
  points: ControlPoint[];
}

interface AffineCoeffs {
  a: number; b: number; c: number;
  d: number; e: number; f: number;
}

// Quadratic GPS→pixel model. Basis: [1, E, N, E², E·N, N²].
export interface QuadraticCoeffs {
  ax: number[];
  ay: number[];
}

export interface CalibrationIssue {
  level: "error" | "warning" | "info";
  message: string;
}

export interface Calibration {
  calibrated: boolean;
  model: "affine" | "quadratic";
  coeffs: AffineCoeffs | null;
  quad: QuadraticCoeffs | null;
  center: GpsPoint;
  metersPerDegLat: number;
  metersPerDegLng: number;
  rmsPx: number;
  rmsMeters: number;
  maxResidualPx: number;
  scaleMetersPerPixel: number;
  rotationDeg: number;
  pointCount: number;
  usedPointCount: number;
  excludedIds: string[];
  residuals: { id: string; dx: number; dy: number; distPx: number }[];
  issues: CalibrationIssue[];
}

const EMPTY: Calibration = {
  calibrated: false,
  model: "affine",
  coeffs: null,
  quad: null,
  center: { lat: 33.11, lng: -8.605 },
  metersPerDegLat: 110906.4,
  metersPerDegLng: 93337.2,
  rmsPx: Infinity,
  rmsMeters: Infinity,
  maxResidualPx: Infinity,
  scaleMetersPerPixel: Infinity,
  rotationDeg: 0,
  pointCount: 0,
  usedPointCount: 0,
  excludedIds: [],
  residuals: [],
  issues: [{ level: "error", message: "No calibration data — map is not georeferenced" }],
};

function metersPerDegree(latDeg: number): { lat: number; lng: number } {
  const phi = (latDeg * Math.PI) / 180;
  const lat = 111132.92 - 559.82 * Math.cos(2 * phi) + 1.175 * Math.cos(4 * phi);
  const lng = 111412.84 * Math.cos(phi) - 93.5 * Math.cos(3 * phi) + 0.118 * Math.cos(5 * phi);
  return { lat, lng };
}

function det3(M: number[][]): number {
  return (
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])
  );
}

function solve3(A: number[][], b: number[]): [number, number, number] {
  // Cramer's rule: x_i = det(A with column i replaced by b) / det(A)
  const det = det3(A);
  if (Math.abs(det) < 1e-10) throw new Error("Singular matrix — control points are collinear");
  const sub = (col: number) => {
    const M: number[][] = [
      [A[0][0], A[0][1], A[0][2]],
      [A[1][0], A[1][1], A[1][2]],
      [A[2][0], A[2][1], A[2][2]],
    ];
    for (let i = 0; i < 3; i++) M[i][col] = b[i];
    return det3(M);
  };
  return [sub(0) / det, sub(1) / det, sub(2) / det];
}

function gaussSolve(Ain: number[][], bin: number[]): number[] {
  const n = Ain.length;
  const M = Ain.map((r, i) => [...r, bin[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c];
    if (Math.abs(d) < 1e-12) throw new Error("Singular system in model fit");
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / d;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

const QUAD_BASIS = (E: number, N: number): number[] => [1, E, N, E * E, E * N, N * N];

interface LocalPt { id: string; name: string; x: number; y: number; E: number; N: number }

interface ModelFit {
  model: "affine" | "quadratic";
  coeffs: AffineCoeffs;
  quad: QuadraticCoeffs | null;
  residuals: { id: string; dx: number; dy: number; distPx: number }[];
  rmsPx: number;
  maxResidualPx: number;
}

function fitAffineOn(local: LocalPt[]): ModelFit {
  let sEE = 0, sEN = 0, sNN = 0, sE = 0, sN = 0, n = local.length;
  let sEx = 0, sNx = 0, sx = 0, sEy = 0, sNy = 0, sy = 0;
  for (const p of local) {
    sEE += p.E * p.E; sEN += p.E * p.N; sNN += p.N * p.N;
    sE += p.E; sN += p.N;
    sEx += p.E * p.x; sNx += p.N * p.x; sx += p.x;
    sEy += p.E * p.y; sNy += p.N * p.y; sy += p.y;
  }
  const A = [[sEE, sEN, sE], [sEN, sNN, sN], [sE, sN, n]];
  const [a, b, c] = solve3(A, [sEx, sNx, sx]);
  const [d, e, f] = solve3(A, [sEy, sNy, sy]);
  const coeffs = { a, b, c, d, e, f };
  return finalizeFit("affine", coeffs, null, local);
}

function fitQuadOn(local: LocalPt[]): ModelFit {
  const t = 6;
  const Nrm: number[][] = Array.from({ length: t }, () => new Array(t).fill(0));
  const vx = new Array(t).fill(0), vy = new Array(t).fill(0);
  for (const p of local) {
    const bs = QUAD_BASIS(p.E, p.N);
    for (let i = 0; i < t; i++) {
      for (let j = 0; j < t; j++) Nrm[i][j] += bs[i] * bs[j];
      vx[i] += bs[i] * p.x;
      vy[i] += bs[i] * p.y;
    }
  }
  const quad: QuadraticCoeffs = { ax: gaussSolve(Nrm.map(r => [...r]), vx), ay: gaussSolve(Nrm, vy) };
  // Nominal affine part (linear terms at the centroid) kept for scale/rotation reporting.
  const coeffs = { a: quad.ax[1], b: quad.ax[2], c: quad.ax[0], d: quad.ay[1], e: quad.ay[2], f: quad.ay[0] };
  return finalizeFit("quadratic", coeffs, quad, local);
}

function finalizeFit(model: "affine" | "quadratic", coeffs: AffineCoeffs, quad: QuadraticCoeffs | null, local: LocalPt[]): ModelFit {
  const residuals = local.map(p => {
    let px: number, py: number;
    if (quad) {
      const bs = QUAD_BASIS(p.E, p.N);
      px = quad.ax.reduce((s, v, i) => s + v * bs[i], 0);
      py = quad.ay.reduce((s, v, i) => s + v * bs[i], 0);
    } else {
      px = coeffs.a * p.E + coeffs.b * p.N + coeffs.c;
      py = coeffs.d * p.E + coeffs.e * p.N + coeffs.f;
    }
    const dx = px - p.x, dy = py - p.y;
    return { id: p.id, dx, dy, distPx: Math.hypot(dx, dy) };
  });
  const rmsPx = Math.sqrt(residuals.reduce((s, r) => s + r.distPx ** 2, 0) / residuals.length);
  return { model, coeffs, quad, residuals, rmsPx, maxResidualPx: Math.max(...residuals.map(r => r.distPx)) };
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

export function computeCalibration(file: CalibrationFile | null): Calibration {
  if (!file || !Array.isArray(file.points)) return EMPTY;
  const pts = file.points.filter(
    p => p && typeof p.gps?.lat === "number" && typeof p.gps?.lng === "number" &&
         typeof p.x === "number" && typeof p.y === "number" && Number.isFinite(p.gps.lat + p.gps.lng + p.x + p.y),
  );
  const issues: CalibrationIssue[] = [];

  for (const p of pts) {
    if (Math.abs(p.gps.lat) > 90 || Math.abs(p.gps.lng) > 180)
      issues.push({ level: "error", message: `Control "${p.id}" has invalid GPS values` });
  }

  if (pts.length < 3) {
    return {
      ...EMPTY,
      pointCount: pts.length,
      issues: [
        { level: "error", message: `Only ${pts.length} control point(s) — need at least 3 (4+ recommended)` },
        ...issues,
      ],
    };
  }

  const cLat = pts.reduce((s, p) => s + p.gps.lat, 0) / pts.length;
  const cLng = pts.reduce((s, p) => s + p.gps.lng, 0) / pts.length;
  const mpd = metersPerDegree(cLat);

  // One shared projection for every fit — exclusion never re-centers the frame.
  const local: LocalPt[] = pts.map(p => ({
    id: p.id, name: p.name ?? p.id, x: p.x, y: p.y,
    E: (p.gps.lng - cLng) * mpd.lng,
    N: (p.gps.lat - cLat) * mpd.lat,
  }));

  let allFit: ModelFit;
  try {
    allFit = fitAffineOn(local);
  } catch (err) {
    return { ...EMPTY, pointCount: pts.length, issues: [{ level: "error", message: (err as Error).message }, ...issues] };
  }

  // Outlier screening (single pass): flag points far outside the consensus.
  let excludedIds: string[] = [];
  if (local.length >= 8) {
    const med = median(allFit.residuals.map(r => r.distPx));
    const thr = Math.max(2.5 * med, 60);
    excludedIds = allFit.residuals
      .filter(r => r.distPx > thr)
      .sort((a, b) => b.distPx - a.distPx)
      .slice(0, 2)
      .map(r => r.id);
  }
  let survivors = local.filter(p => !excludedIds.includes(p.id));
  if (survivors.length < 3) { survivors = local; excludedIds = []; }

  let chosen: ModelFit;
  try {
    chosen = survivors === local ? allFit : fitAffineOn(survivors);
    if (survivors.length >= 8) {
      const qFit = fitQuadOn(survivors);
      if (qFit.rmsPx < chosen.rmsPx * 0.95) chosen = qFit;
    }
  } catch (err) {
    issues.push({ level: "warning", message: `Quadratic fit skipped: ${(err as Error).message}` });
    chosen = survivors === local ? allFit : (() => { try { return fitAffineOn(survivors); } catch { return allFit; } })();
  }

  const coeffs = chosen.coeffs;
  const det = coeffs.a * coeffs.e - coeffs.b * coeffs.d;
  const scalePxPerMeter = Math.sqrt(Math.abs(det));
  const scaleMetersPerPixel = scalePxPerMeter > 1e-9 ? 1 / scalePxPerMeter : Infinity;
  const rotationDeg = (Math.atan2(coeffs.d, coeffs.a) * 180) / Math.PI;
  const rmsMeters = chosen.rmsPx * scaleMetersPerPixel;

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const spreadX = Math.max(...xs) - Math.min(...xs);
  const spreadY = Math.max(...ys) - Math.min(...ys);

  if (pts.length < 4) issues.push({ level: "warning", message: "Fewer than 4 control points — accuracy limited" });
  if (spreadX < 400 || spreadY < 250)
    issues.push({ level: "warning", message: `Control points clustered (spread ${Math.round(spreadX)}x${Math.round(spreadY)}px) — distribute across campus for reliable extrapolation` });

  for (const id of excludedIds) {
    const r = allFit.residuals.find(x => x.id === id);
    if (r) issues.push({
      level: "warning",
      message: `Control "${id}" excluded as outlier — ${(r.distPx * scaleMetersPerPixel).toFixed(0)} m from the consensus fit; verify its click position and GPS meaning`,
    });
  }
  if (chosen.model === "quadratic")
    issues.push({ level: "info", message: `Quadratic model selected — absorbs non-linear image distortion (${(allFit.rmsPx).toFixed(0)}px affine → ${chosen.rmsPx.toFixed(0)}px)` });

  if (rmsMeters > 120)
    issues.push({ level: "error", message: `High residual RMS ${rmsMeters.toFixed(0)} m (${chosen.rmsPx.toFixed(1)}px) — some control clicks are likely mislocated` });
  else if (rmsMeters > 50)
    issues.push({ level: "warning", message: `Moderate residual RMS ${rmsMeters.toFixed(0)} m (${chosen.rmsPx.toFixed(1)}px) — review flagged points below` });
  for (const r of chosen.residuals)
    if (r.distPx > Math.max(15, chosen.rmsPx * 2.5))
      issues.push({ level: "warning", message: `Control "${r.id}" off by ${(r.distPx * scaleMetersPerPixel).toFixed(0)} m (${r.distPx.toFixed(0)}px) from fit — re-click it` });

  return {
    calibrated: true,
    model: chosen.model,
    coeffs,
    quad: chosen.quad,
    center: { lat: cLat, lng: cLng },
    metersPerDegLat: mpd.lat,
    metersPerDegLng: mpd.lng,
    rmsPx: chosen.rmsPx,
    rmsMeters,
    maxResidualPx: chosen.maxResidualPx,
    scaleMetersPerPixel,
    rotationDeg,
    pointCount: pts.length,
    usedPointCount: survivors.length,
    excludedIds,
    residuals: chosen.residuals.map(r => ({ ...r, distPx: Math.round(r.distPx * 10) / 10 })),
    issues,
  };
}

function evalQuad(q: QuadraticCoeffs, E: number, N: number): { x: number; y: number } {
  const bs = QUAD_BASIS(E, N);
  return {
    x: q.ax.reduce((s, v, i) => s + v * bs[i], 0),
    y: q.ay.reduce((s, v, i) => s + v * bs[i], 0),
  };
}

export function gpsToMap(cal: Calibration, lat: number, lng: number): { x: number; y: number } {
  const E = (lng - cal.center.lng) * cal.metersPerDegLng;
  const N = (lat - cal.center.lat) * cal.metersPerDegLat;
  if (cal.model === "quadratic" && cal.quad) return evalQuad(cal.quad, E, N);
  const k = cal.coeffs;
  if (!k) return { x: NaN, y: NaN };
  return { x: k.a * E + k.b * N + k.c, y: k.d * E + k.e * N + k.f };
}

export function mapToGps(cal: Calibration, x: number, y: number): GpsPoint {
  const k = cal.coeffs;
  if (!k) return { lat: NaN, lng: NaN };
  const X = x, Y = y;

  let E: number, N: number;
  if (cal.model === "quadratic" && cal.quad) {
    // Newton–Raphson 2D inversion, initialised from the linear part.
    E = (k.e * X - k.b * Y) / (k.a * k.e - k.b * k.d);
    N = (-k.d * X + k.a * Y) / (k.a * k.e - k.b * k.d);
    for (let it = 0; it < 12; it++) {
      const bs = QUAD_BASIS(E, N);
      const fx = cal.quad.ax.reduce((s, v, i) => s + v * bs[i], 0) - X;
      const fy = cal.quad.ay.reduce((s, v, i) => s + v * bs[i], 0) - Y;
      const dxE = cal.quad.ax[1] + 2 * cal.quad.ax[3] * E + cal.quad.ax[4] * N;
      const dyE = cal.quad.ay[1] + 2 * cal.quad.ay[3] * E + cal.quad.ay[4] * N;
      const dxN = cal.quad.ax[2] + cal.quad.ax[4] * E + 2 * cal.quad.ax[5] * N;
      const dyN = cal.quad.ay[2] + cal.quad.ay[4] * E + 2 * cal.quad.ay[5] * N;
      const jdet = dxE * dyN - dxN * dyE;
      if (Math.abs(jdet) < 1e-12) break;
      const dE = (dyN * fx - dxN * fy) / jdet;
      const dN = (dxE * fy - dyE * fx) / jdet;
      E -= dE; N -= dN;
      if (Math.abs(dE) + Math.abs(dN) < 1e-9) break;
    }
  } else {
    E = (k.e * X - k.b * Y) / (k.a * k.e - k.b * k.d);
    N = (-k.d * X + k.a * Y) / (k.a * k.e - k.b * k.d);
  }

  return {
    lng: cal.center.lng + E / cal.metersPerDegLng,
    lat: cal.center.lat + N / cal.metersPerDegLat,
  };
}

let cache: { file: CalibrationFile | null; cal: Calibration } | null = null;

export async function loadCalibration(): Promise<Calibration> {
  try {
    const res = await fetch("/assets/map/calibration-points.json", { cache: "no-store" });
    if (!res.ok) return EMPTY;
    const file = (await res.json()) as CalibrationFile;
    if (cache && JSON.stringify(cache.file) === JSON.stringify(file)) return cache.cal;
    const cal = computeCalibration(file);
    cache = { file, cal };
    return cal;
  } catch {
    return EMPTY;
  }
}
