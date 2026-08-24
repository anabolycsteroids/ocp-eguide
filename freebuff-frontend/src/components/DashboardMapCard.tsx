"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface DashboardMapCardProps {
  from?: string;
  to?: string;
  focus?: string;
  compact?: boolean;
  className?: string;
}

export default function DashboardMapCard({
  from,
  to,
  focus,
  compact = false,
  className = "",
}: DashboardMapCardProps) {
  const router = useRouter();

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (focus) params.set("focus", focus);
  const href = `/map${params.toString() ? `?${params}` : ""}`;

  if (compact) {
    return (
      <button
        onClick={() => router.push(href)}
        className={`group relative w-full rounded-xl border border-ocp-border bg-white overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-ocp-green/30 text-left ${className}`}
      >
        <div className="relative h-28 overflow-hidden">
          <Image
            src="/assets/map/campus-map-wide.png"
            alt="Campus Map"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#00a050]/80 transition-colors">
            <ExternalLink size={14} className="text-white" />
          </div>
        </div>
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-ocp-green flex-shrink-0" />
            <span className="text-sm font-semibold text-ocp-navy">Campus Map</span>
          </div>
          <p className="text-xs text-ocp-gray-dark mt-0.5">Interactive navigation & routing</p>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={() => router.push(href)}
      className={`group relative w-full rounded-xl border border-ocp-border bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-ocp-green/30 ${className}`}
    >
      <div className="relative h-40 overflow-hidden">
        <Image
          src="/assets/map/campus-map-wide.png"
          alt="OCP Campus Map"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="600px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Campus Navigation</h4>
            <p className="text-xs text-gray-300">Satellite-verified interactive map</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#00a050] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <Navigation size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
