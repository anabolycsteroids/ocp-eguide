"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { CheckCircle, XCircle, Clock, User, Building2, Calendar, Eye } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([
    { id: 1, name: "Claire Dupont", company: "Phosphate Solutions Ltd", purpose: "Client meeting", building: "Building A", date: "2026-08-20", status: "pending" },
    { id: 2, name: "Jean Martin", company: "TransLogistics", purpose: "Equipment delivery", building: "Building D", date: "2026-08-20", status: "pending" },
    { id: 3, name: "Hassan Ouazzani", company: "SupplyTech", purpose: "Supply inspection", building: "Building F", date: "2026-08-21", status: "pending" },
    { id: 4, name: "Maria Santos", company: "GlobalTech", purpose: "Technical consultation", building: "Building C", date: "2026-08-21", status: "pending" },
    { id: 5, name: "Pierre Laurent", company: "EuroChem Solutions", purpose: "Partnership review", building: "Building A", date: "2026-08-22", status: "pending" },
  ]);

  const handleApprove = (id: number) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };

  const handleReject = (id: number) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: "rejected" } : a));
  };

  return (
    <DashboardLayout title="Approvals" subtitle="Manage visitor access requests">
      <div className="bg-white rounded-xl border border-ocp-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocp-border bg-ocp-gray">
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Visitor</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Purpose</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Building</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((item) => (
              <tr key={item.id} className="border-b border-ocp-border last:border-0 hover:bg-ocp-gray/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-ocp-green/10 rounded-full flex items-center justify-center">
                      <User size={16} className="text-ocp-green" />
                    </div>
                    <div>
                      <p className="font-medium text-ocp-navy text-sm">{item.name}</p>
                      <p className="text-xs text-ocp-gray-dark">{item.company}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-ocp-navy">{item.purpose}</td>
                <td className="px-6 py-4 text-sm text-ocp-gray-dark flex items-center gap-1"><Building2 size={14} /> {item.building}</td>
                <td className="px-6 py-4 text-sm text-ocp-gray-dark flex items-center gap-1"><Calendar size={14} /> {item.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === "approved" ? "status-active" : item.status === "rejected" ? "status-inactive" : "status-pending"
                  }`}>
                    {item.status === "approved" && <CheckCircle size={12} />}
                    {item.status === "pending" && <Clock size={12} />}
                    {item.status === "rejected" && <XCircle size={12} />}
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {item.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(item.id)} className="px-3 py-1.5 bg-ocp-green text-white rounded-lg text-xs font-medium hover:bg-ocp-green-dark transition-colors">Approve</button>
                        <button onClick={() => handleReject(item.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Reject</button>
                      </>
                    )}
                    <button className="p-2 hover:bg-ocp-gray rounded-lg transition-colors"><Eye size={16} className="text-ocp-gray-dark" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
