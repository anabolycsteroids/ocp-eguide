"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { getUsers, getRequests } from "@/lib/api";
import type { BackendUser, BackendRequest } from "@/lib/api";
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  Loader2,
} from "lucide-react";

export default function HRDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<BackendUser[]>([]);
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.allSettled([getUsers(), getRequests()]).then(([usersRes, reqRes]) => {
      if (usersRes.status === "fulfilled") {
        const all = usersRes.value.users || [];
        setEmployees(all.filter((u) => ["ADMIN", "EMPLOYEE"].includes(u.role)));
      }
      if (reqRes.status === "fulfilled") {
        setRequests(reqRes.value.requests || []);
      }
      setLoading(false);
    });
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  const onlineCount = employees.filter((u) => u.status === "ONLINE").length;
  const activeRequests = requests.filter((r) => r.status === "PENDING").length;

  const stats = [
    { title: "Total Employees", value: employees.length || "—", change: `${onlineCount} online`, icon: Users, color: "#00a050" },
    { title: "Pending Requests", value: activeRequests || "—", change: "awaiting review", icon: FileText, color: "#f59e0b" },
    { title: "New Hires", value: employees.length || "—", change: "total staff", icon: UserPlus, color: "#3b82f6" },
    { title: "Departments", value: new Set(employees.map((e) => e.department)).size || "—", change: "active", icon: Briefcase, color: "#8b5cf6" },
  ];

  return (
    <DashboardLayout title="HR Dashboard" subtitle="Human resources management">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-ocp-green" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-ocp-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-ocp-navy">Employee Directory</h2>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 bg-ocp-gray border border-ocp-border rounded-lg text-sm w-48 focus:ring-2 focus:ring-ocp-green/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredEmployees.slice(0, 10).map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 hover:bg-ocp-gray rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ocp-green/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-ocp-green">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ocp-navy">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-ocp-gray-dark">{emp.position} · {emp.department}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        emp.status === "ONLINE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-ocp-border p-5">
                <h3 className="font-semibold text-ocp-navy mb-3">Pending Requests</h3>
                <div className="space-y-2">
                  {pendingRequests.slice(0, 4).map((req) => (
                    <div key={req.id} className="p-3 bg-ocp-gray rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ocp-navy">{req.type}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">pending</span>
                      </div>
                      <p className="text-xs text-ocp-gray-dark">{req.description?.slice(0, 60)}{req.description?.length > 60 ? "..." : ""}</p>
                      <div className="flex gap-2 mt-2">
                        <button className="flex-1 py-1.5 bg-ocp-green text-white rounded-lg text-xs font-medium hover:bg-ocp-green-dark">Approve</button>
                        <button className="flex-1 py-1.5 bg-white border border-ocp-border text-ocp-navy rounded-lg text-xs font-medium hover:bg-ocp-gray">Reject</button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-sm text-ocp-gray-dark text-center py-4">No pending requests</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-ocp-border p-5">
                <h3 className="font-semibold text-ocp-navy mb-3">Upcoming Events</h3>
                <div className="space-y-2">
                  {[
                    { date: "Aug 22", event: "Team building", type: "event" },
                    { date: "Aug 25", event: "Performance reviews", type: "review" },
                    { date: "Aug 28", event: "New hire orientation", type: "orientation" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Calendar size={14} className="text-ocp-green" />
                      <div>
                        <p className="text-sm text-ocp-navy">{item.event}</p>
                        <p className="text-xs text-ocp-gray-dark">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
