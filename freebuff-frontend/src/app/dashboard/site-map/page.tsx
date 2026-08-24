"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MapPin,
  Building2,
  ParkingCircle,
  UtensilsCrossed,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Info,
} from "lucide-react";

const buildings = [
  { id: "A", name: "Building A", type: "building", x: 20, y: 25, width: 15, height: 12, color: "#00a050" },
  { id: "B", name: "Building B", type: "building", x: 42, y: 20, width: 14, height: 10, color: "#008040" },
  { id: "C", name: "Building C", type: "building", x: 65, y: 22, width: 13, height: 11, color: "#009050" },
  { id: "D", name: "Building D", type: "building", x: 22, y: 50, width: 12, height: 10, color: "#006030" },
  { id: "E", name: "Building E", type: "building", x: 45, y: 48, width: 14, height: 11, color: "#007030" },
  { id: "F", name: "Building F", type: "building", x: 68, y: 50, width: 12, height: 10, color: "#10a050" },
  { id: "P1", name: "Parking 1", type: "parking", x: 10, y: 72, width: 18, height: 8, color: "#6b7280" },
  { id: "P2", name: "Parking 2", type: "parking", x: 50, y: 72, width: 18, height: 8, color: "#6b7280" },
  { id: "R", name: "Cafeteria", type: "restaurant", x: 35, y: 38, width: 8, height: 6, color: "#f59e0b" },
  { id: "G", name: "Main Gate", type: "entrance", x: 38, y: 88, width: 10, height: 6, color: "#3b82f6" },
];

export default function SiteMapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const selected = buildings.find((b) => b.id === selectedBuilding);

  return (
    <DashboardLayout title="Site Map" subtitle="Interactive facility map">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Map area */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-ocp-border relative overflow-hidden">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              className="w-8 h-8 bg-white border border-ocp-border rounded-lg flex items-center justify-center hover:bg-ocp-gray transition-colors"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
              className="w-8 h-8 bg-white border border-ocp-border rounded-lg flex items-center justify-center hover:bg-ocp-gray transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <button className="w-8 h-8 bg-white border border-ocp-border rounded-lg flex items-center justify-center hover:bg-ocp-gray transition-colors">
              <Layers size={16} />
            </button>
          </div>

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg border border-ocp-border p-3">
            <p className="text-xs font-semibold text-ocp-navy mb-2">Legend</p>
            <div className="space-y-1.5">
              {[
                { color: "#00a050", label: "Buildings" },
                { color: "#6b7280", label: "Parking" },
                { color: "#f59e0b", label: "Cafeteria" },
                { color: "#3b82f6", label: "Entrances" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-ocp-gray-dark">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map container */}
          <div className="w-full h-full bg-ocp-green-lighter flex items-center justify-center p-8">
            <div
              className="relative w-full h-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {Array.from({ length: 11 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1={i * 10}
                      y1={0}
                      x2={i * 10}
                      y2={100}
                      stroke="#00a05010"
                      strokeWidth="0.2"
                    />
                    <line
                      x1={0}
                      y1={i * 10}
                      x2={100}
                      y2={i * 10}
                      stroke="#00a05010"
                      strokeWidth="0.2"
                    />
                  </g>
                ))}
              </svg>

              {/* Buildings */}
              {buildings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuilding(b.id)}
                  className={`absolute rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedBuilding === b.id
                      ? "ring-2 ring-ocp-green ring-offset-2 shadow-lg scale-105"
                      : "hover:shadow-md hover:scale-[1.02]"
                  }`}
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.width}%`,
                    height: `${b.height}%`,
                    backgroundColor: b.color + "cc",
                  }}
                >
                  <span className="text-white font-bold text-sm">{b.id}</span>
                  <span className="text-white/80 text-[10px]">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-white rounded-xl border border-ocp-border p-6 overflow-y-auto">
          <h3 className="font-semibold text-ocp-navy mb-4">Building Info</h3>

          {selected ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selected.color + "20" }}
              >
                {selected.type === "building" && (
                  <Building2 size={24} style={{ color: selected.color }} />
                )}
                {selected.type === "parking" && (
                  <ParkingCircle size={24} style={{ color: selected.color }} />
                )}
                {selected.type === "restaurant" && (
                  <UtensilsCrossed size={24} style={{ color: selected.color }} />
                )}
                {selected.type === "entrance" && (
                  <Navigation size={24} style={{ color: selected.color }} />
                )}
              </div>

              <div>
                <h4 className="font-semibold text-ocp-navy">{selected.name}</h4>
                <p className="text-sm text-ocp-gray-dark capitalize">
                  {selected.type}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ocp-gray-dark">Status</span>
                  <span className="text-ocp-green font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocp-gray-dark">Capacity</span>
                  <span className="text-ocp-navy font-medium">
                    {selected.type === "building"
                      ? "200"
                      : selected.type === "parking"
                        ? "150"
                        : "50"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocp-gray-dark">Current</span>
                  <span className="text-ocp-navy font-medium">
                    {selected.type === "building"
                      ? "89"
                      : selected.type === "parking"
                        ? "67"
                        : "23"}
                  </span>
                </div>
              </div>

              <button className="w-full py-2.5 bg-ocp-green text-white rounded-lg text-sm font-semibold hover:bg-ocp-green-dark transition-colors">
                Get Directions
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin size={32} className="mx-auto text-ocp-gray-dark mb-3" />
              <p className="text-sm text-ocp-gray-dark">
                Click a building on the map to see details
              </p>
            </div>
          )}

          {/* Quick links */}
          <div className="mt-8 pt-6 border-t border-ocp-border">
            <h4 className="text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <div className="space-y-2">
              {["Main Gate", "Reception", "Cafeteria", "Parking"].map(
                (location) => (
                  <button
                    key={location}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ocp-navy hover:bg-ocp-gray rounded-lg transition-colors"
                  >
                    <MapPin size={14} className="text-ocp-green" />
                    {location}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
