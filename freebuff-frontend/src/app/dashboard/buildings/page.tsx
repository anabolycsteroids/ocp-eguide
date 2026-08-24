"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Building2, Users, MapPin, Settings, Wifi, Thermometer } from "lucide-react";

export default function BuildingsPage() {
  const buildings = [
    { id: "A", name: "Building A", floor: 4, occupants: 89, capacity: 200, status: "active", temp: "22°C" },
    { id: "B", name: "Building B", floor: 3, occupants: 67, capacity: 180, status: "active", temp: "21°C" },
    { id: "C", name: "Building C", floor: 2, occupants: 45, capacity: 150, status: "active", temp: "23°C" },
    { id: "D", name: "Building D", floor: 3, occupants: 34, capacity: 120, status: "active", temp: "22°C" },
    { id: "E", name: "Building E", floor: 5, occupants: 56, capacity: 220, status: "maintenance", temp: "20°C" },
    { id: "F", name: "Building F", floor: 2, occupants: 28, capacity: 100, status: "active", temp: "22°C" },
  ];

  return (
    <DashboardLayout title="Buildings" subtitle="Facility management overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((building) => (
          <div key={building.id} className="bg-white rounded-xl border border-ocp-border p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-ocp-green/10 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-ocp-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-ocp-navy">{building.name}</h3>
                  <p className="text-xs text-ocp-gray-dark">{building.floor} floors</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                building.status === "active" ? "status-active" : "status-pending"
              }`}>
                {building.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ocp-gray-dark flex items-center gap-1"><Users size={14} /> Occupancy</span>
                  <span className="font-medium text-ocp-navy">{building.occupants}/{building.capacity}</span>
                </div>
                <div className="w-full h-2 bg-ocp-gray rounded-full">
                  <div className="h-full bg-ocp-green rounded-full" style={{ width: `${(building.occupants/building.capacity)*100}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ocp-border">
                <span className="text-xs text-ocp-gray-dark flex items-center gap-1"><Thermometer size={12} /> {building.temp}</span>
                <span className="text-xs text-ocp-gray-dark flex items-center gap-1"><Wifi size={12} /> Online</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
