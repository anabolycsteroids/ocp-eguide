"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  Users,
  UserCheck,
  Clock,
  Bell,
  Search,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

export default function ReceptionDashboard() {
  const [activeTab, setActiveTab] = useState<"checkin" | "checkout" | "pending">("checkin");

  const todayVisitors = [
    { name: "Claire Dupont", company: "Phosphate Solutions", building: "Building A", time: "09:15", status: "checked-in", purpose: "Client meeting" },
    { name: "Jean Martin", company: "TransLogistics", building: "Building D", time: "09:30", status: "checked-in", purpose: "Equipment delivery" },
    { name: "Maria Santos", company: "GlobalTech", building: "Building C", time: "10:00", status: "pending", purpose: "Technical consultation" },
    { name: "Pierre Laurent", company: "EuroChem Solutions", building: "Building A", time: "10:30", status: "pending", purpose: "Partnership review" },
    { name: "Ahmed Kabbaj", company: "MorPhos Ltd", building: "Building B", time: "11:00", status: "pending", purpose: "Site inspection" },
    { name: "Hassan Ouazzani", company: "SupplyTech", building: "Building F", time: "14:00", status: "scheduled", purpose: "Supply inspection" },
  ];

  const pendingApprovals = [
    { name: "Youssef Amrani", company: "ChemPartner", purpose: "Lab visit", urgency: "normal" },
    { name: "Sara Benjelloun", company: "TechMorocco", purpose: "Interview", urgency: "high" },
  ];

  const stats = [
    { title: "Expected Today", value: "24", change: "+3 from yesterday", icon: Users, color: "#00a050" },
    { title: "Checked In", value: "12", change: "Currently on site", icon: UserCheck, color: "#3b82f6" },
    { title: "Pending Arrival", value: "8", change: "Next: 10:00 AM", icon: Clock, color: "#f59e0b" },
    { title: "Urgent Items", value: "2", change: "Need attention", icon: Bell, color: "#ef4444" },
  ];

  return (
    <DashboardLayout title="Reception Dashboard" subtitle="Visitor management and check-in/out">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Today's visitors */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-ocp-border rounded-xl p-1 mb-4 w-fit">
            {[
              { key: "checkin" as const, label: "Checked In", count: 12 },
              { key: "pending" as const, label: "Pending", count: 8 },
              { key: "checkout" as const, label: "Checked Out", count: 4 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-ocp-green text-white shadow-sm"
                    : "text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Visitor list */}
          <div className="bg-white rounded-xl border border-ocp-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ocp-border bg-ocp-gray">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Visitor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Purpose</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Building</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-ocp-gray-dark uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayVisitors
                  .filter((v) =>
                    activeTab === "checkin" ? v.status === "checked-in" :
                    activeTab === "pending" ? v.status === "pending" :
                    v.status === "scheduled"
                  )
                  .map((visitor, i) => (
                    <tr key={i} className="border-b border-ocp-border last:border-0 hover:bg-ocp-gray/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-ocp-green/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-ocp-green">
                              {visitor.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ocp-navy">{visitor.name}</p>
                            <p className="text-xs text-ocp-gray-dark">{visitor.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-ocp-navy">{visitor.purpose}</td>
                      <td className="px-5 py-3 text-sm text-ocp-gray-dark flex items-center gap-1">
                        <MapPin size={12} /> {visitor.building}
                      </td>
                      <td className="px-5 py-3 text-sm text-ocp-gray-dark">{visitor.time}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          visitor.status === "checked-in" ? "bg-green-50 text-green-700" :
                          visitor.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {visitor.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {visitor.status === "pending" && (
                          <button className="px-3 py-1.5 bg-ocp-green text-white rounded-lg text-xs font-medium hover:bg-ocp-green-dark">
                            Check In
                          </button>
                        )}
                        {visitor.status === "checked-in" && (
                          <button className="px-3 py-1.5 bg-ocp-gray text-ocp-navy rounded-lg text-xs font-medium hover:bg-ocp-gray-dark/10">
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar - Quick info */}
        <div className="space-y-4">
          {/* Pending approvals */}
          <div className="bg-white rounded-xl border border-ocp-border p-5">
            <h3 className="font-semibold text-ocp-navy mb-3">Pending Approvals</h3>
            <div className="space-y-2">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-ocp-gray rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-ocp-navy">{item.name}</p>
                    <p className="text-xs text-ocp-gray-dark">{item.purpose}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center hover:bg-green-200">
                      <CheckCircle size={14} className="text-green-600" />
                    </button>
                    <button className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center hover:bg-red-200">
                      <XCircle size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's schedule */}
          <div className="bg-white rounded-xl border border-ocp-border p-5">
            <h3 className="font-semibold text-ocp-navy mb-3">Today&apos;s Schedule</h3>
            <div className="space-y-2">
              {[
                { time: "09:00", event: "Morning briefing", type: "meeting" },
                { time: "10:30", event: "VIP client arrival", type: "visitor" },
                { time: "12:00", event: "Shift handover", type: "shift" },
                { time: "14:00", event: "Delivery coordination", type: "delivery" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <span className="text-xs text-ocp-gray-dark font-mono w-10">{item.time}</span>
                  <div className="w-1.5 h-1.5 bg-ocp-green rounded-full" />
                  <span className="text-sm text-ocp-navy">{item.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick contacts */}
          <div className="bg-white rounded-xl border border-ocp-border p-5">
            <h3 className="font-semibold text-ocp-navy mb-3">Quick Contacts</h3>
            <div className="space-y-2">
              {[
                { name: "Security Desk", phone: "Ext. 1001" },
                { name: "IT Support", phone: "Ext. 1002" },
                { name: "HR Office", phone: "Ext. 1003" },
              ].map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-ocp-gray rounded-lg">
                  <span className="text-sm text-ocp-navy">{contact.name}</span>
                  <span className="text-xs text-ocp-gray-dark flex items-center gap-1">
                    <Phone size={10} /> {contact.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
