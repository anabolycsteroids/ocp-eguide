"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import OCPMap from "@/components/OCPMap";
import LanguageSelector from "@/components/LanguageSelector";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n";

function MapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const [fullscreen, setFullscreen] = useState(false);

  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const focus = searchParams.get("focus") || undefined;

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0a1a12]">
      <header className="flex items-center gap-3 px-4 py-3 bg-[#092033] border-b border-white/10 z-40 flex-shrink-0">
        <Link href="/" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white">{t("map.title")}</h1>
          <p className="text-xs text-gray-400">{t("map.subtitle")}</p>
        </div>
        <LanguageSelector variant="dark" />
      </header>

      <div className="flex-1 relative">
        <OCPMap
          initialFrom={from}
          initialTo={to}
          focusPlaceId={focus}
          showSearch
          showControls
          showRoute
          fullscreen={fullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          height="100%"
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#0a1a12]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#00a050] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading map...</p>
        </div>
      </div>
    }>
      <MapContent />
    </Suspense>
  );
}
