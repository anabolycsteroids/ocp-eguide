"use client";

import Image from "next/image";

interface StatusBadgeProps {
  status: "ACTIVE" | "BUSY" | "OFFLINE";
  label?: string;
  note?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const statusConfig = {
  ACTIVE: { color: "bg-green-500", ringColor: "ring-green-500/30", text: "Active", textColor: "text-green-500" },
  BUSY: { color: "bg-orange-500", ringColor: "ring-orange-500/30", text: "Busy", textColor: "text-orange-500" },
  OFFLINE: { color: "bg-gray-500", ringColor: "ring-gray-500/30", text: "Offline", textColor: "text-gray-500" },
};

export function StatusDot({ status, size = "md" }: { status: "ACTIVE" | "BUSY" | "OFFLINE"; size?: "sm" | "md" | "lg" }) {
  const cfg = statusConfig[status];
  const dotSize = size === "sm" ? "w-2 h-2" : size === "md" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <span className={`inline-block ${dotSize} rounded-full ${cfg.color} ${status === "ACTIVE" ? "animate-pulse" : ""}`} />
  );
}

export function StatusBadge({ status, label, note, size = "md", showLabel = true }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.textColor}`}>
        <StatusDot status={status} size="sm" />
        {showLabel && <span>{label || cfg.text}</span>}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ${cfg.ringColor} ${
        status === "ACTIVE" ? "bg-green-500/10 text-green-500" :
        status === "BUSY" ? "bg-orange-500/10 text-orange-500" :
        "bg-gray-500/10 text-gray-500"
      }`}>
        <StatusDot status={status} />
        {showLabel && <span>{label || cfg.text}</span>}
      </span>
      {note && <span className="text-xs text-gray-400">{note}</span>}
    </div>
  );
}

interface PresenceCardProps {
  firstName: string;
  lastName: string;
  role?: string;
  department?: string;
  status: "ACTIVE" | "BUSY" | "OFFLINE";
  statusNote?: string | null;
  lastSeen?: string;
  avatarPath?: string;
}

export function PresenceCard({ firstName, lastName, role, department, status, statusNote, lastSeen }: PresenceCardProps) {
  const cfg = statusConfig[status];
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-colors">
      <div className="relative flex-shrink-0">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold ${cfg.textColor} bg-current/10`}
          style={{ backgroundColor: status === "ACTIVE" ? "#22c55e15" : status === "BUSY" ? "#f9731615" : "#6b728015" }}>
          <span style={{ color: status === "ACTIVE" ? "#22c55e" : status === "BUSY" ? "#f97316" : "#6b7280" }}>{initials}</span>
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a1628] ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{firstName} {lastName}</p>
        {role && <p className="text-gray-400 text-xs truncate">{role}{department ? ` · ${department}` : ""}</p>}
        <div className="flex items-center gap-1.5 mt-1">
          <StatusDot status={status} size="sm" />
          <span className={`text-xs ${cfg.textColor}`}>{statusNote || cfg.text}</span>
          {status === "OFFLINE" && lastSeen && (
            <span className="text-xs text-gray-500">· {timeSince(lastSeen)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface PlaceCardProps {
  name: string;
  code: string;
  status: "AVAILABLE" | "BUSY" | "FULL" | "CLOSED";
  currentOccupancy: number;
  capacity: number;
  description?: string | null;
}

const placeStatusConfig = {
  AVAILABLE: { color: "text-green-500", bgColor: "bg-green-500/10", ringColor: "ring-green-500/30", label: "Available" },
  BUSY: { color: "text-orange-500", bgColor: "bg-orange-500/10", ringColor: "ring-orange-500/30", label: "Busy" },
  FULL: { color: "text-red-500", bgColor: "bg-red-500/10", ringColor: "ring-red-500/30", label: "Full" },
  CLOSED: { color: "text-gray-500", bgColor: "bg-gray-500/10", ringColor: "ring-gray-500/30", label: "Closed" },
};

export function PlaceCard({ name, code, status, currentOccupancy, capacity, description }: PlaceCardProps) {
  const cfg = placeStatusConfig[status];
  const pct = capacity > 0 ? Math.round((currentOccupancy / capacity) * 100) : 0;

  return (
    <div className="glass-card rounded-xl p-4 hover:bg-white/[0.08] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold text-sm">{name}</h4>
          <p className="text-gray-400 text-xs">{code}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${cfg.ringColor} ${cfg.bgColor} ${cfg.color}`}>
          <StatusDot status={status === "AVAILABLE" ? "ACTIVE" : status === "BUSY" ? "BUSY" : "OFFLINE"} size="sm" />
          {cfg.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              status === "FULL" ? "bg-red-500" : status === "BUSY" ? "bg-orange-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{currentOccupancy}/{capacity}</span>
      </div>
      {description && <p className="text-gray-500 text-xs mt-2">{description}</p>}
    </div>
  );
}
