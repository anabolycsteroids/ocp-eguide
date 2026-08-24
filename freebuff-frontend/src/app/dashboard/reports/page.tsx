"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
  Printer,
} from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      name: "Daily Visitor Summary",
      date: "2026-08-19",
      type: "Daily",
      status: "Generated",
    },
    {
      name: "Weekly Access Report",
      date: "2026-08-18",
      type: "Weekly",
      status: "Generated",
    },
    {
      name: "Monthly Security Audit",
      date: "2026-08-01",
      type: "Monthly",
      status: "Generated",
    },
    {
      name: "Badge Activity Log",
      date: "2026-08-19",
      type: "Daily",
      status: "Generated",
    },
    {
      name: "Building Occupancy Report",
      date: "2026-08-17",
      type: "Weekly",
      status: "Generated",
    },
  ];

  return (
    <DashboardLayout title="Reports" subtitle="Access and generate reports">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ocp-border rounded-lg text-sm font-medium text-ocp-navy hover:bg-ocp-gray">
            <Calendar size={16} />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ocp-border rounded-lg text-sm font-medium text-ocp-navy hover:bg-ocp-gray">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-ocp-green text-white rounded-lg text-sm font-semibold hover:bg-ocp-green-dark">
          <FileText size={16} />
          Generate Report
        </button>
      </div>

      <div className="bg-white rounded-xl border border-ocp-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocp-border bg-ocp-gray">
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Report Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-ocp-gray-dark uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, i) => (
              <tr key={i} className="border-b border-ocp-border last:border-0 hover:bg-ocp-gray/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-ocp-green/10 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-ocp-green" />
                    </div>
                    <span className="font-medium text-ocp-navy text-sm">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-ocp-gray-dark">{report.date}</td>
                <td className="px-6 py-4 text-sm text-ocp-navy">{report.type}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{report.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-ocp-gray rounded-lg transition-colors"><Eye size={16} className="text-ocp-gray-dark" /></button>
                    <button className="p-2 hover:bg-ocp-gray rounded-lg transition-colors"><Download size={16} className="text-ocp-gray-dark" /></button>
                    <button className="p-2 hover:bg-ocp-gray rounded-lg transition-colors"><Printer size={16} className="text-ocp-gray-dark" /></button>
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
