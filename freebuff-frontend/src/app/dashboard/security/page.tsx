"use client";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Clock,
  Camera,
  Radio,
} from "lucide-react";

export default function SecurityPage() {
  const alerts = [
    { time: "14:32", location: "Building A", type: "Badge mismatch", severity: "high" },
    { time: "13:15", location: "Main Gate", type: "Tailgating detected", severity: "medium" },
    { time: "11:45", location: "Building C", type: "After-hours access", severity: "low" },
    { time: "09:20", location: "Parking P1", type: "Unauthorized vehicle", severity: "medium" },
  ];

  const zones = [
    { name: "Zone A - Management", status: "secure", cameras: 4 },
    { name: "Zone B - Operations", status: "secure", cameras: 6 },
    { name: "Zone C - Laboratory", status: "alert", cameras: 3 },
    { name: "Zone D - Warehouse", status: "secure", cameras: 5 },
    { name: "Zone E - Visitor Area", status: "monitoring", cameras: 8 },
  ];

  return (
    <DashboardLayout title="Security" subtitle="Security monitoring and access control">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Alerts" value="4" change="2 new" icon={AlertTriangle} color="#f59e0b" />
        <StatCard title="Secured Zones" value="8/9" change="1 alert" icon={Shield} color="#00a050" />
        <StatCard title="Active Cameras" value="32" change="All operational" icon={Camera} color="#3b82f6" />
        <StatCard title="Access Denied" value="7" change="Today" icon={Lock} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Alerts */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ocp-navy">Security Alerts</h2>
            <button className="text-sm text-ocp-green font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-ocp-border hover:bg-ocp-gray transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.severity === "high" ? "bg-red-500" : alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ocp-navy">{alert.type}</p>
                  <p className="text-xs text-ocp-gray-dark">{alert.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-ocp-gray-dark" />
                  <span className="text-xs text-ocp-gray-dark">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Status */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ocp-navy">Zone Status</h2>
            <Radio size={18} className="text-ocp-gray-dark" />
          </div>
          <div className="space-y-3">
            {zones.map((zone, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-ocp-border hover:bg-ocp-gray transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    zone.status === "secure" ? "bg-ocp-green" : zone.status === "alert" ? "bg-red-500" : "bg-yellow-500"
                  }`} />
                  <span className="text-sm font-medium text-ocp-navy">{zone.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ocp-gray-dark flex items-center gap-1">
                    <Camera size={12} /> {zone.cameras}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    zone.status === "secure" ? "bg-green-50 text-green-700" : zone.status === "alert" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {zone.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
