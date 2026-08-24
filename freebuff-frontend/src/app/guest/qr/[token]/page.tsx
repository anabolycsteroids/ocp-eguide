"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OcpLogo from "@/components/OcpLogo";
import LanguageSelector from "@/components/LanguageSelector";
import { publicGetVisit } from "@/lib/guestApi";
import type { GuestVisit } from "@/types/guest";
import { MapPin, Navigation, Clock, User, Loader2, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export default function QrNavigatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { t } = useI18n();
  const [visit, setVisit] = useState<GuestVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await publicGetVisit(token);
        if (active && res.success && res.data) {
          setVisit(res.data);
        }
      } catch {
        if (active) setError("Invalid or expired QR code");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocp-gray">
        <Loader2 size={32} className="animate-spin text-ocp-green" />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocp-gray px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <OcpLogo size="lg" />
          <div className="bg-white rounded-xl border border-ocp-border p-6">
            <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
            <h1 className="text-lg font-bold text-ocp-navy mb-1">QR Code Not Valid</h1>
            <p className="text-sm text-ocp-gray-dark">{error || "This QR code could not be recognized."}</p>
            <button onClick={() => router.push("/dashboard/guest")} className="mt-4 px-4 py-2 rounded-lg bg-ocp-green text-white text-sm font-semibold hover:bg-ocp-green-dark transition-colors">
              Go to Guest Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const place = visit.place;

  return (
    <div className="min-h-screen bg-ocp-gray">
      <header className="sticky top-0 z-20 border-b border-ocp-border backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/")} className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <OcpLogo size="md" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-ocp-navy">{t("guest.qrNavigation")}</h1>
            <p className="text-xs text-ocp-gray-dark">{t("guest.scannedVisitCode")}</p>
          </div>
          <LanguageSelector variant="light" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl border border-ocp-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ocp-green-lighter flex items-center justify-center">
              <User size={18} className="text-ocp-green" />
            </div>
            <div>
              <p className="font-semibold text-ocp-navy">{visit.guestName || "Guest"}</p>
              <p className="text-xs text-ocp-gray-dark">{visit.purpose}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-ocp-gray-dark">
            <Clock size={14} />
            <span>{visit.scheduledDate} {visit.scheduledTime ? `· ${visit.scheduledTime}` : ""}</span>
          </div>

          {place && (
            <div className="bg-ocp-green-lighter rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-ocp-green" />
                <span className="font-semibold text-ocp-navy">{place.name}</span>
                <span className="text-xs text-ocp-gray-dark">({place.code})</span>
              </div>
              <p className="text-xs text-ocp-gray-dark mb-3">
                {visit.host.firstName} {visit.host.lastName} · {visit.host.department}
              </p>
              <button
                onClick={() => router.push(`/map?to=${place.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ocp-green text-white text-sm font-semibold hover:bg-ocp-green-dark transition-colors"
              >
                <Navigation size={16} />
                Open Campus Map with Directions
              </button>
            </div>
          )}

          {!place && (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-ocp-gray-dark">
              <MapPin size={20} className="mx-auto mb-2 opacity-40" />
              No destination assigned yet. Please wait for your host to confirm.
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard/guest")}
          className="w-full py-3 rounded-xl border border-ocp-border bg-white text-sm font-semibold text-ocp-navy hover:bg-ocp-gray transition-colors"
        >
          Go to Guest Portal
        </button>
      </div>
    </div>
  );
}
