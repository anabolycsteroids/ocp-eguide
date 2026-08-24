"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getUsers } from "@/lib/api";
import type { BackendUser } from "@/lib/api";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

export default function VisitorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visitors, setVisitors] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    getUsers()
      .then((res) => {
        const all = res.users || [];
        const external = all.filter(
          (u) => ["VISITOR", "COLLABORATOR", "PARTNER", "SUPPLIER", "SERVICE_PROVIDER"].includes(u.role)
        );
        setVisitors(external);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = visitors.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.status === "ONLINE") ||
      (statusFilter === "inactive" && u.status === "OFFLINE");
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Visitors" subtitle="Manage visitor access and check-ins">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark" />
            <input
              type="text"
              placeholder="Search visitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-ocp-border rounded-lg text-sm w-64 focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-ocp-border rounded-lg text-sm focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ocp-border rounded-lg text-sm font-medium text-ocp-navy hover:bg-ocp-gray transition-colors">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-ocp-green text-white rounded-lg text-sm font-semibold hover:bg-ocp-green-dark transition-colors shadow-md shadow-ocp-green/20">
            <UserPlus size={16} /> Add Visitor
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-ocp-green" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ocp-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocp-border bg-ocp-gray">
                <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-ocp-border last:border-0 hover:bg-ocp-gray/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ocp-green/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-ocp-green">
                          {u.firstName[0]}{u.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-ocp-navy text-sm">{u.firstName} {u.lastName}</p>
                        <div className="flex items-center gap-2 text-xs text-ocp-gray-dark">
                          <Phone size={10} /> {u.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ocp-navy">{u.role}</td>
                  <td className="px-6 py-4 text-sm text-ocp-gray-dark">{u.department}</td>
                  <td className="px-6 py-4 text-sm text-ocp-gray-dark">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.status === "ONLINE" ? "status-active" : "status-inactive"
                    }`}>
                      {u.status === "ONLINE" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.status === "ONLINE" ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-ocp-gray rounded-lg transition-colors">
                      <MoreHorizontal size={16} className="text-ocp-gray-dark" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-ocp-gray-dark">No visitors found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
