#!/usr/bin/env node
/**
 * GPS-to-Pixel Coordinate Converter for OCP Jorf Lasfar Campus
 * 
 * Uses 5 verified reference points (JFC 1,2,4,5 + JESA TSF) to compute
 * an affine transformation from GPS (lat, lng) to pixel (x, y) on the
 * 1520x933 campus-map.png satellite image.
 * 
 * Then converts all ~100 GPS coordinates from locations names.txt
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. PARSE DMS COORDINATES
// ============================================================
function parseDMS(dmsStr) {
  // Format: 33°06'39.85"N or 8°36'23.52"O
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

// ============================================================
// 2. VERIFIED REFERENCE POINTS (GPS → pixel)
// ============================================================
const referencePoints = [
  {
    name: 'JFC 1',
    lat: 33 + 6/60 + 3.15/3600,   // 33°06'03.15"N
    lng: -(8 + 35/60 + 55.41/3600), // 8°35'55.41"O
    px: 1209, py: 374
  },
  {
    name: 'JFC 2',
    lat: 33 + 5/60 + 51.54/3600,
    lng: -(8 + 36/60 + 42.68/3600),
    px: 1163, py: 485
  },
  {
    name: 'JFC 4',
    lat: 33 + 5/60 + 49.41/3600,
    lng: -(8 + 36/60 + 34.56/3600),
    px: 1274, py: 415
  },
  {
    name: 'JFC 5',
    lat: 33 + 6/60 + 9.95/3600,
    lng: -(8 + 36/60 + 22.36/3600),
    px: 1160, py: 410
  },
  {
    name: 'JESA TSF',
    lat: 33 + 6/60 + 47.51/3600,
    lng: -(8 + 36/60 + 31.01/3600),
    px: 842, py: 421
  }
];

// Print reference points for verification
console.log('=== REFERENCE POINTS ===');
referencePoints.forEach(p => {
  console.log(`${p.name}: GPS(${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}) → Pixel(${p.px}, ${p.py})`);
});

// ============================================================
// 3. LEAST-SQUARES AFFINE TRANSFORMATION
// ============================================================
// pixel_x = a1 * lat + b1 * lng + c1
// pixel_y = a2 * lat + b2 * lng + c2
function solveAffine(points) {
  const n = points.length;
  
  // Build normal equations: (A^T A) x = A^T b
  // For x: [sum(lat^2), sum(lat*lng), sum(lat)] [a1]   [sum(lat*px)]
  //        [sum(lat*lng), sum(lng^2), sum(lng)] [b1] = [sum(lng*px)]
  //        [sum(lat), sum(lng), n]              [c1]   [sum(px)]
  
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
  
  // Solve 3x3 system using Cramer's rule
  function solve3x3(A, b) {
    const det = A[0][0]*(A[1][1]*A[2][2] - A[1][2]*A[2][1])
              - A[0][1]*(A[1][0]*A[2][2] - A[1][2]*A[2][0])
              + A[0][2]*(A[1][0]*A[2][1] - A[1][1]*A[2][0]);
    
    function det3(m) {
      return m[0][0]*(m[1][1]*m[2][2] - m[1][2]*m[2][1])
           - m[0][1]*(m[1][0]*m[2][2] - m[1][2]*m[2][0])
           + m[0][2]*(m[1][0]*m[2][1] - m[1][1]*m[2][0]);
    }
    
    const x = det3([[b[0], A[0][1], A[0][2]],
                     [b[1], A[1][1], A[1][2]],
                     [b[2], A[2][1], A[2][2]]]) / det;
    const y = det3([[A[0][0], b[0], A[0][2]],
                     [A[1][0], b[1], A[1][2]],
                     [A[2][0], b[2], A[2][2]]]) / det;
    const z = det3([[A[0][0], A[0][1], b[0]],
                     [A[1][0], A[1][1], b[1]],
                     [A[2][0], A[2][1], b[2]]]) / det;
    return [x, y, z];
  }
  
  const matA = [
    [sLat2, sLatLng, sLat],
    [sLatLng, sLng2, sLng],
    [sLat, sLng, n]
  ];
  
  const [a1, b1, c1] = solve3x3(matA, [sLatPx, sLngPx, sPx]);
  const [a2, b2, c2] = solve3x3(matA, [sLatPy, sLngPy, sPy]);
  
  console.log('\n=== AFFINE TRANSFORMATION ===');
  console.log(`pixel_x = ${a1.toFixed(4)} * lat + ${b1.toFixed(4)} * lng + ${c1.toFixed(4)}`);
  console.log(`pixel_y = ${a2.toFixed(4)} * lat + ${b2.toFixed(4)} * lng + ${c2.toFixed(4)}`);
  
  // Verify against reference points
  console.log('\n=== VERIFICATION ===');
  let maxErrX = 0, maxErrY = 0;
  for (const p of points) {
    const predX = Math.round(a1 * p.lat + b1 * p.lng + c1);
    const predY = Math.round(a2 * p.lat + b2 * p.lng + c2);
    const errX = Math.abs(predX - p.px);
    const errY = Math.abs(predY - p.py);
    maxErrX = Math.max(maxErrX, errX);
    maxErrY = Math.max(maxErrY, errY);
    console.log(`${p.name}: predicted(${predX}, ${predY}) actual(${p.px}, ${p.py}) error(${errX}, ${errY})`);
  }
  console.log(`Max error: X=${maxErrX}px, Y=${maxErrY}px`);
  
  return { a1, b1, c1, a2, b2, c2 };
}

// ============================================================
// 4. PARSE LOCATIONS FILE
// ============================================================
function parseLocationsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const locations = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match: name followed by GPS coordinates
    // Pattern: <name> <lat_dms> <lng_dms> elev <elevation>m
    const match = trimmed.match(/^(.+?)\s+(\d+°\d+'[\d.]+"[NSEW])\s+(\d+°\d+'[\d.]+"[NSEOW])\s+elev\s+[\d.]+\s*m?$/i);
    if (match) {
      const name = match[1].trim();
      const latDMS = match[2];
      const lngDMS = match[3];
      const lat = parseDMS(latDMS);
      const lng = parseDMS(lngDMS);
      
      if (lat !== null && lng !== null) {
        locations.push({ name, lat, lng, latDMS, lngDMS });
      }
    }
  }
  
  return locations;
}

// ============================================================
// 5. DETERMINE CATEGORY FROM NAME
// ============================================================
function determineCategory(name) {
  const lower = name.toLowerCase();
  
  // Entrances/gates
  if (lower.includes('porte') || lower.includes('entree') || lower.includes('entite'))
    return 'Access';
  
  // Offices
  if (lower.includes('office') || lower.includes('bureau') || lower.includes('mission'))
    return 'Office';
  
  // Water/environment
  if (lower.includes('water') || lower.includes('desal') || lower.includes('dessalement') || lower.includes('green water'))
    return 'Water';
  
  // Production
  if (lower.includes('jfc') || lower.includes('tsf') || lower.includes('ligne') || 
      lower.includes('production') || lower.includes('plant') || lower.includes('factory') ||
      lower.includes('dap') || lower.includes('tsp') || lower.includes('molten'))
    return 'Production';
  
  // Security
  if (lower.includes('surete') || lower.includes('sûreté'))
    return 'Security';
  
  // Medical
  if (lower.includes('infirmerie'))
    return 'Medical';
  
  // Training
  if (lower.includes('formation') || lower.includes('hse'))
    return 'Training';
  
  // Research
  if (lower.includes('recherche') || lower.includes('research'))
    return 'Research';
  
  // Safety
  if (lower.includes('rassemblement'))
    return 'Safety';
  
  // Electrical
  if (lower.includes('electrique') || lower.includes('electrical'))
    return 'Facility';
  
  // Religious
  if (lower.includes('mosquee') || lower.includes('mosque'))
    return 'Religious';
  
  // Transport
  if (lower.includes('terminale') || lower.includes('station terminale'))
    return 'Transport';
  
  // Waste
  if (lower.includes('decharge') || lower.includes('dump'))
    return 'Waste';
  
  // Building
  if (lower.startsWith('batiment') || lower.startsWith('bâtiment') || lower.includes('building'))
    return 'Building';
  
  // Default
  return 'Facility';
}

// ============================================================
// 6. DETERMINE PLACE TYPE
// ============================================================
function determineType(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('batiment') || lower.startsWith('bâtiment') || lower.includes('building'))
    return 'BUILDING';
  return 'FACILITY';
}

// ============================================================
// 7. GENERATE ID FROM NAME
// ============================================================
function generateId(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 60);
}

// ============================================================
// 8. GENERATE ALIASES
// ============================================================
function generateAliases(name, id) {
  const aliases = [];
  const upper = name.toUpperCase();
  const lower = name.toLowerCase();
  
  // Add common abbreviations
  if (name.includes(' ')) {
    // Add acronym version (first letters of each word)
    const words = name.split(/\s+/).filter(w => w.length > 2);
    if (words.length >= 2) {
      const acronym = words.map(w => w[0].toUpperCase()).join('');
      if (acronym.length >= 2 && acronym.length <= 6) {
        aliases.push(acronym);
      }
    }
  }
  
  // Add uppercase version if different
  if (upper !== name) aliases.push(upper);
  
  // Add lowercase version if different
  if (lower !== name) aliases.push(lower);
  
  return aliases;
}

// ============================================================
// 9. MAIN CONVERSION
// ============================================================
function main() {
  const locationsFile = path.join(__dirname, 'screenshots of detailed places/locations names.txt');
  const locations = parseLocationsFile(locationsFile);
  
  console.log(`\nParsed ${locations.length} locations from file`);
  
  // Solve affine transformation
  const transform = solveAffine(referencePoints);
  
  // Convert all GPS coordinates to pixels
  console.log('\n=== CONVERTED COORDINATES ===');
  const converted = [];
  
  for (const loc of locations) {
    const px = Math.round(transform.a1 * loc.lat + transform.b1 * loc.lng + transform.c1);
    const py = Math.round(transform.a2 * loc.lat + transform.b2 * loc.lng + transform.c2);
    
    // Clamp to image bounds (0-1520, 0-933)
    const clampedX = Math.max(10, Math.min(1510, px));
    const clampedY = Math.max(10, Math.min(923, py));
    
    converted.push({
      name: loc.name,
      lat: loc.lat,
      lng: loc.lng,
      px: clampedX,
      py: clampedY,
      category: determineCategory(loc.name),
      type: determineType(loc.name),
      id: generateId(loc.name)
    });
    
    console.log(`${loc.name}: (${clampedX}, ${clampedY}) [${px}, ${py} raw] [${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}]`);
  }
  
  // Save converted data for next step
  const outputPath = path.join(__dirname, 'converted-locations.json');
  fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2));
  console.log(`\nSaved ${converted.length} converted locations to ${outputPath}`);
  
  return converted;
}

main();
