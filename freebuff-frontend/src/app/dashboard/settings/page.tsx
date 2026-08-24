"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { User, Bell, Shield, Palette, Globe, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    sms: false,
  });

  return (
    <DashboardLayout title="Settings" subtitle="Manage your preferences">
      <div className="max-w-3xl space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <User size={20} className="text-ocp-green" />
            <h2 className="text-lg font-semibold text-ocp-navy">Profile</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocp-navy mb-1.5">Full Name</label>
              <input type="text" defaultValue="Admin User" className="w-full px-4 py-2.5 bg-ocp-gray border border-ocp-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocp-navy mb-1.5">Email</label>
              <input type="email" defaultValue="admin@ocp.ma" className="w-full px-4 py-2.5 bg-ocp-gray border border-ocp-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocp-navy mb-1.5">Department</label>
              <input type="text" defaultValue="Management" className="w-full px-4 py-2.5 bg-ocp-gray border border-ocp-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocp-navy mb-1.5">Phone</label>
              <input type="tel" defaultValue="+212 5XX XXX XXX" className="w-full px-4 py-2.5 bg-ocp-gray border border-ocp-border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-ocp-green" />
            <h2 className="text-lg font-semibold text-ocp-navy">Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ocp-navy capitalize">{key} Notifications</p>
                  <p className="text-xs text-ocp-gray-dark">Receive {key} notifications for important updates</p>
                </div>
                <button onClick={() => setNotifications((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }))} className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-ocp-green" : "bg-ocp-gray-dark/30"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-ocp-green text-white rounded-xl font-semibold hover:bg-ocp-green-dark transition-colors shadow-md shadow-ocp-green/20">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </DashboardLayout>
  );
}
