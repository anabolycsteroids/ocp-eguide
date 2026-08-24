"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserCheck, ClipboardList, GraduationCap, MapPin, QrCode, Clock, Activity } from "lucide-react";

const screens = [
  {
    label: "Employee Dashboard",
    content: (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-ocp-green/10 flex items-center justify-center">
            <Users size={16} className="text-ocp-green" />
          </div>
          <div>
            <p className="text-sm font-bold text-ocp-navy">Welcome, Ahmed</p>
            <p className="text-xs text-ocp-gray-dark">Employee — Management</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "1,247", label: "Total Visitors", color: "text-ocp-green" },
            { val: "89", label: "Active On Site", color: "text-blue-500" },
            { val: "23", label: "Pending", color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-ocp-gray/50 rounded-lg p-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-ocp-gray-dark">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-ocp-gray/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-ocp-navy">Recent Activity</p>
          {["Check-in: Maria Santos", "Badge: Jean Martin", "Approval: Hassan O."].map((a) => (
            <div key={a} className="flex items-center gap-2 text-[11px] text-ocp-gray-dark">
              <div className="w-1.5 h-1.5 rounded-full bg-ocp-green" />
              {a}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Intern Dashboard",
    content: (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <GraduationCap size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-ocp-navy">Welcome, Youssef</p>
            <p className="text-xs text-ocp-gray-dark">Intern — Mechanical Engineering</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "45", label: "Total Interns", color: "text-blue-500" },
            { val: "32", label: "Active", color: "text-ocp-green" },
            { val: "8", label: "Upcoming", color: "text-purple-500" },
          ].map((s) => (
            <div key={s.label} className="bg-ocp-gray/50 rounded-lg p-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-ocp-gray-dark">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-ocp-gray/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-ocp-navy">Task Progress</p>
          <div className="w-full h-2 bg-ocp-gray rounded-full overflow-hidden">
            <div className="h-full bg-ocp-green rounded-full" style={{ width: "80%" }} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-ocp-gray-dark">
            <div className="w-1.5 h-1.5 rounded-full bg-ocp-green" />
            Supervisor: Available
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Visitor Dashboard",
    content: (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <ClipboardList size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-ocp-navy">Welcome, Claire</p>
            <p className="text-xs text-ocp-gray-dark">Visitor — Client</p>
          </div>
        </div>
        <div className="bg-ocp-gray/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-ocp-navy">Your Visit</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-ocp-green" />
            <span className="text-xs font-bold text-ocp-green">APPROVED</span>
          </div>
          <div className="text-[11px] text-ocp-gray-dark space-y-1">
            <p>Host: Ahmed El Amrani</p>
            <p>Location: JFC5</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-ocp-gray/50 rounded-lg p-3 text-center">
            <QrCode size={20} className="mx-auto mb-1 text-ocp-green" />
            <p className="text-[10px] font-semibold text-ocp-navy">QR Access</p>
          </div>
          <div className="bg-ocp-gray/50 rounded-lg p-3 text-center">
            <MapPin size={20} className="mx-auto mb-1 text-blue-500" />
            <p className="text-[10px] font-semibold text-ocp-navy">Navigation</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Supervisor Dashboard",
    content: (
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <UserCheck size={16} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-ocp-navy">Supervisor Panel</p>
            <p className="text-xs text-ocp-gray-dark">Ahmed El Amrani</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "5", label: "Max Interns", color: "text-purple-500" },
            { val: "3", label: "Active", color: "text-ocp-green" },
            { val: "2", label: "Pending", color: "text-amber-500" },
          ].map((s) => (
            <div key={s.label} className="bg-ocp-gray/50 rounded-lg p-2.5 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-ocp-gray-dark">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-ocp-gray/30 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-ocp-navy">Intern Availability</p>
          {[
            { name: "Youssef", status: "Available", dot: "bg-ocp-green" },
            { name: "Amina", status: "Busy", dot: "bg-amber-500" },
            { name: "Omar", status: "Offline", dot: "bg-gray-400" },
          ].map((i) => (
            <div key={i.name} className="flex items-center gap-2 text-[11px]">
              <div className={`w-1.5 h-1.5 rounded-full ${i.dot}`} />
              <span className="text-ocp-navy font-medium">{i.name}</span>
              <span className="text-ocp-gray-dark">{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function HeroDashboardShowcase({ className = "" }: { className?: string }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % screens.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glass panel */}
      <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-black/20 bg-white/10 backdrop-blur-md">
        {/* Fake window bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border-b border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          <span className="ml-2 text-[10px] text-white/50 font-medium">{screens[current].label}</span>
        </div>

        {/* Content with transition */}
        <div className="relative min-h-[280px] sm:min-h-[320px] bg-white rounded-b-2xl overflow-hidden">
          {screens.map((screen, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                opacity: idx === current ? 1 : 0,
                transform: `translateY(${idx === current ? 0 : 12}px)`,
                pointerEvents: idx === current ? "auto" : "none",
              }}
            >
              {screen.content}
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {screens.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === current
                ? "bg-ocp-green w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Show ${screens[idx].label}`}
          />
        ))}
      </div>
    </div>
  );
}
