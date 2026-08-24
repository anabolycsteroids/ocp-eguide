"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MapPreview() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/map")}
      className="group relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
      style={{ boxShadow: "0 8px 32px rgba(0,160,80,0.15)" }}
    >
      <div className="relative h-56 sm:h-64 overflow-hidden">
        <Image
          src="/assets/map/campus-map-wide.png"
          alt="OCP Campus Map"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-[#00a050]/5 group-hover:bg-[#00a050]/10 transition-colors" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">OCP Campus Navigation</h3>
            <p className="text-sm text-gray-300">Interactive satellite map with real-time routing across the Jorf Lasfar campus</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00a050] flex items-center justify-center flex-shrink-0 ml-4 transition-transform group-hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-white text-xs font-semibold">
        <span className="w-1.5 h-1.5 bg-[#00a050] rounded-full animate-pulse" />
        13 verified locations
      </div>
    </div>
  );
}
