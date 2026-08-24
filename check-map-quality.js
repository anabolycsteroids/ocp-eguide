#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const mapDir = path.join(__dirname, 'freebuff-frontend/public/assets/map');
const places = JSON.parse(fs.readFileSync(path.join(mapDir, 'places.json'), 'utf-8')).places;
const nodes = JSON.parse(fs.readFileSync(path.join(mapDir, 'nodes.json'), 'utf-8')).nodes;
const edges = JSON.parse(fs.readFileSync(path.join(mapDir, 'edges.json'), 'utf-8')).edges;
const connections = JSON.parse(fs.readFileSync(path.join(mapDir, 'place-node-connections.json'), 'utf-8')).connections;

const MAP_W = 1520, MAP_H = 933;

console.log('=== MAP DATA QUALITY CHECKS ===\n');

// 1. Bounds check
console.log('1. BOUNDS CHECK');
let outOfBounds = 0;
places.forEach(p => {
  if (p.x < 0 || p.x > MAP_W || p.y < 0 || p.y > MAP_H) {
    console.log('   OUT OF BOUNDS: ' + p.name + ' (' + p.x + ', ' + p.y + ')');
    outOfBounds++;
  }
});
console.log('   ' + (outOfBounds === 0 ? 'PASS' : 'WARN') + ' - ' + outOfBounds + ' locations out of bounds\n');

// 2. Overlap check
console.log('2. OVERLAP CHECK (within 15px)');
let overlapping = 0;
for (let i = 0; i < places.length; i++) {
  for (let j = i + 1; j < places.length; j++) {
    const dx = places[i].x - places[j].x;
    const dy = places[i].y - places[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 15) {
      console.log('   OVERLAP: "' + places[i].name + '" (' + places[i].x + ',' + places[i].y + ') <-> "' + places[j].name + '" (' + places[j].x + ',' + places[j].y + ') dist=' + dist.toFixed(1) + 'px');
      overlapping++;
    }
  }
}
console.log('   ' + (overlapping === 0 ? 'PASS' : 'WARN') + ' - ' + overlapping + ' overlapping pairs\n');

// 3. Connection integrity
console.log('3. CONNECTION INTEGRITY');
let missingConns = 0;
let missingNodes = 0;
const nodeMap = new Map(nodes.map(n => [n.id, n]));
places.forEach(p => {
  const conn = connections.find(c => c.placeId === p.id);
  if (!conn) {
    console.log('   NO CONNECTION: ' + p.name + ' (' + p.id + ')');
    missingConns++;
  } else {
    if (!nodeMap.has(conn.nodeId)) {
      console.log('   MISSING NODE: ' + p.name + ' -> ' + conn.nodeId);
      missingNodes++;
    }
  }
});
console.log('   ' + (missingConns === 0 ? 'PASS' : 'WARN') + ' - ' + missingConns + ' missing connections');
console.log('   ' + (missingNodes === 0 ? 'PASS' : 'WARN') + ' - ' + missingNodes + ' missing nodes\n');

// 4. Edge connectivity
console.log('4. EDGE CONNECTIVITY');
let badEdges = 0;
edges.forEach(e => {
  if (!nodeMap.has(e.from)) { console.log('   BAD EDGE from: ' + e.from); badEdges++; }
  if (!nodeMap.has(e.to)) { console.log('   BAD EDGE to: ' + e.to); badEdges++; }
});
console.log('   ' + (badEdges === 0 ? 'PASS' : 'WARN') + ' - ' + badEdges + ' edges with invalid node references\n');

// 5. Category distribution
console.log('5. CATEGORY DISTRIBUTION');
const cats = {};
places.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log('   ' + cat + ': ' + count);
});
console.log();

// 6. Coordinate ranges
console.log('6. COORDINATE RANGES');
const xs = places.map(p => p.x);
const ys = places.map(p => p.y);
console.log('   X: ' + Math.min(...xs) + ' - ' + Math.max(...xs) + ' (map: 0-' + MAP_W + ')');
console.log('   Y: ' + Math.min(...ys) + ' - ' + Math.max(...ys) + ' (map: 0-' + MAP_H + ')');
console.log('   Spread X: ' + (Math.max(...xs) - Math.min(...xs)).toFixed(0) + 'px');
console.log('   Spread Y: ' + (Math.max(...ys) - Math.min(...ys)).toFixed(0) + 'px');
console.log();

// 7. Density zones
console.log('7. DENSITY ZONES');
const zones = { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 };
places.forEach(p => {
  const h = p.x < MAP_W / 2 ? 'left' : 'right';
  const v = p.y < MAP_H / 2 ? 'top' : 'bottom';
  zones[v + '-' + h]++;
});
Object.entries(zones).forEach(([zone, count]) => {
  console.log('   ' + zone + ': ' + count + ' locations');
});
console.log();

// 8. Issues near edges
console.log('8. EDGE PROXIMITY (within 20px of boundary)');
let nearEdge = 0;
places.forEach(p => {
  if (p.x < 20 || p.x > MAP_W - 20 || p.y < 20 || p.y > MAP_H - 20) {
    console.log('   ' + p.name + ' (' + p.x + ', ' + p.y + ')');
    nearEdge++;
  }
});
console.log('   ' + nearEdge + ' locations near edges\n');

// 9. Summary
console.log('=== SUMMARY ===');
console.log('Total places: ' + places.length);
console.log('Total nodes: ' + nodes.length);
console.log('Total edges: ' + edges.length);
console.log('Total connections: ' + connections.length);
console.log('Total issues: ' + (outOfBounds + overlapping + missingConns + missingNodes + badEdges));
