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

export interface CalibrationIssue {
  level: "error" | "warning" | "info";
  message: string;
}

export interface Calibration {
  calibrated: boolean;
  coeffs: AffineCoeffs | null;
  center: GpsPoint;
  metersPerDegLat: number;
  metersPerDegLng: number;
  rmsPx: number;
  maxResidualPx: number;
  scaleMetersPerPixel: number;
  rotationDeg: number;
  pointCount: number;
  residuals: { id: string; dx: number; dy: number; distPx: number }[];
  issues: CalibrationIssue[];
}

const EMPTY: Calibration = {
  calibrated: false,
  coeffs: null,
  center: { lat: 33.11, lng: -8.605 },
  metersPerDegLat: 110906.4,
  metersPerDegLng: 93337.2,
  rmsPx: Infinity,
  maxResidualPx: Infinity,
  scaleMetersPerPixel: Infinity,
  rotationDeg: 0,
  pointCount: 0,
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

  const local = pts.map(p => ({
    id: p.id, name: p.name, x: p.x, y: p.y,
    E: (p.gps.lng - cLng) * mpd.lng,
    N: (p.gps.lat - cLat) * mpd.lat,
  }));

  let sEE = 0, sEN = 0, sNN = 0, sE = 0, sN = 0, n = local.length;
  let sEx = 0, sNx = 0, sx = 0, sEy = 0, sNy = 0, sy = 0;
  for (const p of local) {
    sEE += p.E * p.E; sEN += p.E * p.N; sNN += p.N * p.N;
    sE += p.E; sN += p.N;
    sEx += p.E * p.x; sNx += p.N * p.x; sx += p.x;
    sEy += p.E * p.y; sNy += p.N * p.y; sy += p.y;
  }
  const A = [[sEE, sEN, sE], [sEN, sNN, sN], [sE, sN, n]];
  let coeffs: AffineCoeffs;
  try {
    const [a, b, c] = solve3(A, [sEx, sNx, sx]);
    const [d, e, f] = solve3(A, [sEy, sNy, sy]);
    coeffs = { a, b, c, d, e, f };
  } catch (err) {
    return { ...EMPTY, pointCount: pts.length, issues: [{ level: "error", message: (err as Error).message }, ...issues] };
  }

  const residuals = local.map(p => {
    const px = coeffs.a * p.E + coeffs.b * p.N + coeffs.c;
    const py = coeffs.d * p.E + coeffs.e * p.N + coeffs.f;
    const dx = px - p.x, dy = py - p.y;
    return { id: p.id, dx, dy, distPx: Math.hypot(dx, dy) };
  });
  const rmsPx = Math.sqrt(residuals.reduce((s, r) => s + r.distPx ** 2, 0) / residuals.length);
  const maxResidualPx = Math.max(...residuals.map(r => r.distPx));

  const det = coeffs.a * coeffs.e - coeffs.b * coeffs.d;
  const scalePxPerMeter = Math.sqrt(Math.abs(det));
  const scaleMetersPerPixel = scalePxPerMeter > 1e-9 ? 1 / scalePxPerMeter : Infinity;
  const rotationDeg = (Math.atan2(coeffs.d, coeffs.a) * 180) / Math.PI;

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const spreadX = Math.max(...xs) - Math.min(...xs);
  const spreadY = Math.max(...ys) - Math.min(...ys);

  if (pts.length < 4) issues.push({ level: "warning", message: "Fewer than 4 control points — accuracy limited" });
  if (spreadX < 400 || spreadY < 250)
    issues.push({ level: "warning", message: `Control points clustered (spread ${Math.round(spreadX)}x${Math.round(spreadY)}px) — distribute across campus for reliable extrapolation` });
  if (rmsPx > 12)
    issues.push({ level: "error", message: `High residual RMS ${rmsPx.toFixed(1)}px — some control clicks are likely mislocated` });
  else if (rmsPx > 6)
    issues.push({ level: "warning", message: `Moderate residual RMS ${rmsPx.toFixed(1)}px — review flagged points below` });
  for (const r of residuals)
    if (r.distPx > Math.max(15, rmsPx * 2.5))
      issues.push({ level: "warning", message: `Control "${r.id}" off by ${r.distPx.toFixed(0)}px from fit — re-click it` });

  return {
    calibrated: true,
    coeffs,
    center: { lat: cLat, lng: cLng },
    metersPerDegLat: mpd.lat,
    metersPerDegLng: mpd.lng,
    rmsPx,
    maxResidualPx,
    scaleMetersPerPixel,
    rotationDeg,
    pointCount: pts.length,
    residuals: residuals.map(r => ({ ...r, distPx: Math.round(r.distPx * 10) / 10 })),
    issues,
  };
}

export function gpsToMap(cal: Calibration, lat: number, lng: number): { x: number; y: number } {
  const E = (lng - cal.center.lng) * cal.metersPerDegLng;
  const N = (lat - cal.center.lat) * cal.metersPerDegLat;
  const k = cal.coeffs;
  if (!k) return { x: NaN, y: NaN };
  return { x: k.a * E + k.b * N + k.c, y: k.d * E + k.e * N + k.f };
}

export function mapToGps(cal: Calibration, x: number, y: number): GpsPoint {
  const k = cal.coeffs;
  if (!k) return { lat: NaN, lng: NaN };
  const E = x, N = y;
  const det = k.a * k.e - k.b * k.d;
  const invE = (k.e * E - k.b * N) / det;
  const invN = (-k.d * E + k.a * N) / det;
  return {
    lng: cal.center.lng + invE / cal.metersPerDegLng,
    lat: cal.center.lat + invN / cal.metersPerDegLat,
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
