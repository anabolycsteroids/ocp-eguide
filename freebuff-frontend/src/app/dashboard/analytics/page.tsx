"use client";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    {
      title: "Monthly Visitors",
      value: "4,231",
      change: "+8.2% from last month",
      icon: Users,
      color: "#00a050",
    },
    {
      title: "Avg. Visit Duration",
      value: "2.4h",
      change: "-0.3h from last month",
      icon: Clock,
      color: "#3b82f6",
    },
    {
      title: "Peak Hour",
      value: "10:00 AM",
      change: "Highest traffic period",
      icon: BarChart3,
      color: "#f59e0b",
    },
    {
      title: "Site Utilization",
      value: "78%",
      change: "+5% from last month",
      icon: TrendingUp,
      color: "#00a050",
    },
  ];

  const weeklyData = [
    { day: "Mon", visits: 145, checkins: 132 },
    { day: "Tue", visits: 168, checkins: 155 },
    { day: "Wed", visits: 156, checkins: 141 },
    { day: "Thu", visits: 189, checkins: 172 },
    { day: "Fri", visits: 134, checkins: 120 },
  ];

  const buildingUsage = [
    { name: "Building A", percentage: 85, color: "#00a050" },
    { name: "Building B", percentage: 72, color: "#008040" },
    { name: "Building C", percentage: 68, color: "#009050" },
    { name: "Building D", percentage: 54, color: "#006030" },
    { name: "Building E", percentage: 45, color: "#007030" },
    { name: "Building F", percentage: 38, color: "#10a050" },
  ];

  return (
    <DashboardLayout title="Analytics" subtitle="Visitor and site usage insights">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Visits Chart */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ocp-navy">
              Weekly Visits
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-ocp-green rounded-full" />
                Visits
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-ocp-green/40 rounded-full" />
                Check-ins
              </span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-4 h-48">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end justify-center h-40">
                  <div
                    className="w-5 bg-ocp-green rounded-t-md transition-all"
                    style={{ height: `${(data.visits / 200) * 100}%` }}
                  />
                  <div
                    className="w-5 bg-ocp-green/40 rounded-t-md transition-all"
                    style={{ height: `${(data.checkins / 200) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ocp-gray-dark font-medium">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Building Usage */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ocp-navy">
              Building Usage
            </h2>
            <PieChart size={18} className="text-ocp-gray-dark" />
          </div>

          <div className="space-y-4">
            {buildingUsage.map((building) => (
              <div key={building.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ocp-navy">{building.name}</span>
                  <span className="text-sm font-medium text-ocp-navy">
                    {building.percentage}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-ocp-gray rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${building.percentage}%`,
                      backgroundColor: building.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Trends */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <h2 className="text-lg font-semibold text-ocp-navy mb-6">
            Top Trends
          </h2>

          <div className="space-y-4">
            {[
              {
                label: "Client visits increased",
                value: "+23%",
                positive: true,
              },
              { label: "Average wait time reduced", value: "-15%", positive: true },
              { label: "Delivery volume up", value: "+8%", positive: true },
              { label: "Badge rejections", value: "+2%", positive: false },
            ].map((trend, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-ocp-gray transition-colors"
              >
                <span className="text-sm text-ocp-navy">{trend.label}</span>
                <span
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    trend.positive ? "text-ocp-green" : "text-red-500"
                  }`}
                >
                  {trend.positive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {trend.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Visitor Types Distribution */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <h2 className="text-lg font-semibold text-ocp-navy mb-6">
            Visitor Types
          </h2>

          <div className="space-y-3">
            {[
              { type: "Clients", count: 1845, percentage: 43, color: "#00a050" },
              { type: "Partners", count: 987, percentage: 23, color: "#008040" },
              { type: "Suppliers", count: 756, percentage: 18, color: "#009050" },
              { type: "Delivery", count: 643, percentage: 16, color: "#006030" },
            ].map((item) => (
              <div
                key={item.type}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-ocp-gray transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ocp-navy">
                      {item.type}
                    </span>
                    <span className="text-sm text-ocp-gray-dark">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-ocp-gray rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
