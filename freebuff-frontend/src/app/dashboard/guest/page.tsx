"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import OcpLogo from "@/components/OcpLogo";
import DashboardMapCard from "@/components/DashboardMapCard";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n";
import {
  publicSearchHosts,
  publicCreateVisit,
  publicGetVisit,
  publicGenerateQr,
  publicGetHostPresence,
  publicGetPlaces,
} from "@/lib/guestApi";
import type { HostSearchResult } from "@/lib/guestApi";
import type { GuestVisit, HostPresence, VisitStatus } from "@/types/guest";
import {
  ClipboardList,
  User,
  MapPin,
  QrCode,
  Clock,
  HelpCircle,
  Phone,
  LogIn,
  Loader2,
  CalendarDays,
  Building2,
  Mail,
  Check,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  RefreshCw,
} from "lucide-react";

const VISIT_TOKEN_KEY = "ocp_guest_visit_token";

const presenceConfig: Record<string, { dot: string; text: string }> = {
  ACTIVE: { dot: "bg-green-500 animate-pulse", text: "text-green-600" },
  BUSY: { dot: "bg-amber-500", text: "text-amber-600" },
  OFFLINE: { dot: "bg-gray-400", text: "text-gray-500" },
};

const placeDotConfig: Record<string, string> = {
  AVAILABLE: "bg-green-500",
  BUSY: "bg-amber-500",
  FULL: "bg-red-500",
  CLOSED: "bg-gray-400",
};

function formatTime(iso: string | null | undefined, locale = "en-US"): string {
  if (!iso) return "—";
  if (/^\d{2}:\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string | null | undefined, locale = "en-US"): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function GuestDashboardPage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const visitStatusConfig: Record<
    VisitStatus,
    { labelKey: string; dot: string; text: string; bg: string }
  > = {
    PENDING: { labelKey: "guestPage.pendingApproval", dot: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50" },
    APPROVED: { labelKey: "guestPage.approved", dot: "bg-green-500", text: "text-green-600", bg: "bg-green-50" },
    ARRIVED: { labelKey: "guestPage.arrived", dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50" },
    IN_PROGRESS: { labelKey: "guestPage.inProgress", dot: "bg-green-500 animate-pulse", text: "text-green-600", bg: "bg-green-50" },
    COMPLETED: { labelKey: "guestPage.completed", dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-100" },
    CANCELLED: { labelKey: "guestPage.cancelled", dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50" },
  };

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<GuestVisit | null>(null);
  const [presence, setPresence] = useState<HostPresence | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    purpose: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    hostId: "",
    hostName: "",
    placeId: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hostQuery, setHostQuery] = useState("");
  const [hostResults, setHostResults] = useState<HostSearchResult[]>([]);
  const [hostSearching, setHostSearching] = useState(false);
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const hostSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadVisitData = useCallback(async (v: GuestVisit) => {
    try {
      const [hostRes, qrRes] = await Promise.allSettled([
        publicGetHostPresence(v.host.id),
        v.id ? publicGenerateQr(v.id) : Promise.reject("no visit id"),
      ]);

      if (hostRes.status === "fulfilled") {
        setPresence(hostRes.value.data || null);
      }
      if (qrRes.status === "fulfilled") {
        const qrData = qrRes.value.data;
        setQrToken(qrData.token);
        setQrImage(qrData.qrCodeImage);
      }
    } catch {
      // Silent
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const [placesRes] = await Promise.allSettled([publicGetPlaces()]);

        const savedToken = localStorage.getItem(VISIT_TOKEN_KEY);
        if (savedToken) {
          try {
            const visitRes = await publicGetVisit(savedToken);
            if (!active) return;
            if (visitRes.success && visitRes.data) {
              setVisit(visitRes.data);
              await loadVisitData(visitRes.data);
            }
          } catch {
            localStorage.removeItem(VISIT_TOKEN_KEY);
          }
        }

        if (placesRes.status === "fulfilled") {
          setPlaces(placesRes.value.data || []);
        }
      } catch {
        // Silent
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => { active = false; };
  }, [loadVisitData]);

  function handleHostSearch(value: string) {
    setHostQuery(value);
    setForm((f) => ({ ...f, hostId: "", hostName: "" }));
    if (hostSearchTimerRef.current) clearTimeout(hostSearchTimerRef.current);
    if (value.length < 2) {
      setHostResults([]);
      setShowHostDropdown(false);
      return;
    }
    setHostSearching(true);
    hostSearchTimerRef.current = setTimeout(async () => {
      try {
        const res = await publicSearchHosts(value);
        setHostResults(res.data || []);
        setShowHostDropdown(true);
      } catch {
        setHostResults([]);
      } finally {
        setHostSearching(false);
      }
    }, 300);
  }

  function selectHost(host: HostSearchResult) {
    setForm((f) => ({ ...f, hostId: host.id, hostName: host.name }));
    setHostQuery(host.email);
    setShowHostDropdown(false);
    setHostResults([]);
  }

  async function handleCreateVisit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hostId) {
      setError(t("guestPage.selectHostPrompt"));
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await publicCreateVisit({
        purpose: form.purpose,
        hostId: form.hostId,
        placeId: form.placeId || undefined,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime || undefined,
        notes: form.notes || undefined,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone || undefined,
      });
      const created = res.data;
      localStorage.setItem(VISIT_TOKEN_KEY, created.guestToken || "");
      setVisit(created);
      setSuccessMsg(t("guestPage.visitRequestedSuccess"));
      await loadVisitData(created);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("guestPage.errorCouldNotRequest"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefreshPresence() {
    if (!visit) return;
    try {
      const res = await publicGetHostPresence(visit.host.id);
      setPresence(res.data || null);
    } catch { /* silent */ }
  }

  async function handleRefreshQr() {
    if (!visit) return;
    setQrLoading(true);
    try {
      const res = await publicGenerateQr(visit.id);
      setQrToken(res.data.token);
      setQrImage(res.data.qrCodeImage);
    } catch { /* silent */ }
    finally { setQrLoading(false); }
  }

  function handleNewVisit() {
    localStorage.removeItem(VISIT_TOKEN_KEY);
    setVisit(null);
    setPresence(null);
    setQrImage(null);
    setQrToken(null);
    setSuccessMsg(null);
    setForm({
      purpose: "", guestName: "", guestEmail: "", guestPhone: "",
      hostId: "", hostName: "", placeId: "", scheduledDate: "", scheduledTime: "", notes: "",
    });
    setHostQuery("");
  }

  const statusCfg = visit ? visitStatusConfig[visit.status] : null;
  const presenceCfg = presence ? presenceConfig[presence.status] || presenceConfig.OFFLINE : null;

  const qrSrc =
    qrImage ||
    (qrToken
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}`
      : null);

  const timeline = visit
    ? [
        { label: t("guestPage.requestedOn"), detail: formatDate(visit.scheduledDate, lang), state: "done" },
        {
          label: t("guestPage.approvedByHost"),
          detail: visit.status === "PENDING" ? t("guestPage.awaitingConfirmation") : t("guestPage.confirmed"),
          state: visit.status === "PENDING" ? "current" : visit.status === "CANCELLED" ? "cancelled" : "done",
        },
        {
          label: t("guestPage.arrivalCheckin"),
          detail: visit.checkedInAt
            ? t("guestPage.checkedInAt").replace("{time}", formatTime(visit.checkedInAt, lang))
            : t("guestPage.scanQr"),
          state: visit.checkedInAt ? "done" : visit.status === "APPROVED" ? "current" : "upcoming",
        },
        {
          label: t("guestPage.meetingWithHost"),
          detail: visit.status === "IN_PROGRESS" ? t("guestPage.inProgressNow") : t("guestPage.withYourHost"),
          state: visit.status === "IN_PROGRESS" ? "current" : ["COMPLETED"].includes(visit.status) || visit.checkedOutAt ? "done" : "upcoming",
        },
        {
          label: t("guestPage.checkout"),
          detail: visit.checkedOutAt
            ? t("guestPage.checkedOutAt").replace("{time}", formatTime(visit.checkedOutAt, lang))
            : t("guestPage.endOfVisit"),
          state: visit.checkedOutAt ? "done" : "upcoming",
        },
      ]
    : [];

  const timelineColors: Record<string, { line: string; dot: string; text: string }> = {
    done: { line: "bg-ocp-green", dot: "bg-ocp-green", text: "text-ocp-green" },
    current: { line: "bg-amber-400", dot: "bg-amber-400 animate-pulse", text: "text-amber-600" },
    upcoming: { line: "bg-gray-200", dot: "bg-gray-300", text: "text-gray-400" },
    cancelled: { line: "bg-red-200", dot: "bg-red-400", text: "text-red-400" },
  };

  return (
    <div className="min-h-screen">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 border-b border-ocp-border backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => router.push("/")} className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <OcpLogo size="md" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-ocp-navy truncate">
                {t("guestPage.guestPortal")}
              </h1>
              <p className="text-xs md:text-sm text-ocp-gray-dark">{t("guestPage.ocpEguide")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSelector variant="light" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-ocp-green-light text-ocp-green-dark border border-ocp-green/20 whitespace-nowrap">
              <ShieldCheck size={14} />
              {t("guestPage.guestAccess")}
            </span>
            <button
              onClick={() => router.push("/auth")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ocp-green text-white text-sm font-semibold hover:bg-ocp-green-dark transition-colors shadow-sm shadow-ocp-green/30"
            >
              <LogIn size={14} />
              {t("guestPage.signIn")}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Campus Map - always visible */}
        <DashboardMapCard />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <Check size={16} />
            {successMsg}
            <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-ocp-green" />
          </div>
        ) : !visit ? (
          /* ─── VISIT REQUEST FORM ─── */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-xl border border-ocp-border bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-ocp-green-lighter flex items-center justify-center">
                  <ClipboardList size={22} className="text-ocp-green" />
                </div>
                <div>
                  <h2 className="font-semibold text-ocp-navy text-lg">{t("guestPage.requestVisit")}</h2>
                  <p className="text-sm text-ocp-gray-dark">{t("guestPage.requestVisitDesc")}</p>
                </div>
              </div>

              <form onSubmit={handleCreateVisit} className="space-y-5">
                {/* Guest Info */}
                <div className="border-b border-ocp-border pb-5">
                  <h3 className="text-sm font-semibold text-ocp-navy mb-3 uppercase tracking-wide">{t("guestPage.yourInformation")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.fullName")}</label>
                      <input
                        type="text"
                        required
                        value={form.guestName}
                        onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.email")}</label>
                      <input
                        type="email"
                        required
                        value={form.guestEmail}
                        onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.phoneOptional")}</label>
                    <input
                      type="tel"
                      value={form.guestPhone}
                      onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                      placeholder="+212 6XX XXX XXX"
                      className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                    />
                  </div>
                </div>

                {/* Visit Details */}
                <div>
                  <h3 className="text-sm font-semibold text-ocp-navy mb-3 uppercase tracking-wide">{t("guestPage.visitDetails")}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.purposeOfVisit")}</label>
                      <input
                        type="text"
                        required
                        value={form.purpose}
                        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                        placeholder="Business meeting, delivery, tour..."
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.hostLabel")}</label>
                      <input
                        type="text"
                        required
                        value={hostQuery}
                        onChange={(e) => handleHostSearch(e.target.value)}
                        onFocus={() => hostResults.length > 0 && setShowHostDropdown(true)}
                        onBlur={() => setTimeout(() => setShowHostDropdown(false), 200)}
                        placeholder="Type to search... (e.g. fouad, imane, amine)"
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      />
                      {form.hostId && (
                        <p className="mt-1 text-xs text-ocp-green font-medium">{t("guestPage.selectedHost").replace("{name}", form.hostName)}</p>
                      )}
                      {showHostDropdown && hostResults.length > 0 && (
                        <div className="absolute z-30 mt-1 w-full bg-white border border-ocp-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          {hostResults.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onMouseDown={() => selectHost(h)}
                              className="w-full text-left px-3 py-2.5 hover:bg-ocp-green-lighter transition-colors border-b border-ocp-border last:border-0"
                            >
                              <p className="text-sm font-medium text-ocp-navy">{h.name}</p>
                              <p className="text-xs text-ocp-gray-dark">{h.email}</p>
                              <p className="text-xs text-ocp-gray-dark">{h.profile} · {h.department}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {hostSearching && <p className="mt-1 text-xs text-ocp-gray-dark">{t("guestPage.searching")}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.date")}</label>
                        <input
                          type="date"
                          required
                          value={form.scheduledDate}
                          onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                          className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.timeOptional")}</label>
                        <input
                          type="time"
                          value={form.scheduledTime}
                          onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                          className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.destinationOptional")}</label>
                      <select
                        value={form.placeId}
                        onChange={(e) => setForm({ ...form, placeId: e.target.value })}
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      >
                        <option value="">{t("guestPage.selectPlace")}</option>
                        {places.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ocp-navy mb-1">{t("guestPage.notesOptional")}</label>
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Anything your host should know..."
                        className="w-full rounded-lg border border-ocp-border bg-white px-3 py-2 text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 resize-none focus:ring-2 focus:ring-ocp-green/30 focus:border-ocp-green"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.hostId}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-ocp-green px-4 py-3 text-sm font-semibold text-white hover:bg-ocp-green-dark transition-colors disabled:opacity-60 shadow-sm shadow-ocp-green/30"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CalendarDays size={16} />
                  )}
                  {t("guestPage.requestVisitButton")}
                </button>
              </form>
            </div>

            {/* ─── Places Preview ─── */}
            {places.length > 0 && (
              <div className="rounded-xl border border-ocp-border bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-ocp-green" />
                  <h3 className="font-semibold text-ocp-navy">{t("guestPage.campusPlacesTitle")}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {places.slice(0, 6).map((p: any) => (
                    <div key={p.id} className="rounded-lg border border-ocp-border p-3">
                      <p className="text-sm font-medium text-ocp-navy truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${placeDotConfig[p.status] || "bg-gray-400"}`} />
                        <span className="text-xs text-ocp-gray-dark">{p.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ─── VISIT DASHBOARD ─── */
          <>
            {/* ─── Visit Status Card ─── */}
            <section className="rounded-xl border border-ocp-border bg-white p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocp-gray-dark mb-2">{t("guestPage.yourVisit")}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusCfg?.dot}`} />
                    <span className={`text-lg font-bold ${statusCfg?.text}`}>{statusCfg ? t(statusCfg.labelKey) : null}</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-ocp-navy">
                      <span className="text-ocp-gray-dark">{t("guestPage.guest")}:</span>{" "}
                      <span className="font-medium">{visit.guestName || "—"}</span>
                    </p>
                    <p className="text-ocp-navy">
                      <span className="text-ocp-gray-dark">Purpose:</span>{" "}
                      <span className="font-medium">{visit.purpose}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-ocp-navy">
                      <User size={14} className="text-ocp-gray-dark" />
                      <span className="text-ocp-gray-dark">{t("guestPage.host")}:</span>{" "}
                      <span className="font-medium">{visit.host.firstName} {visit.host.lastName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-ocp-navy">
                      <MapPin size={14} className="text-ocp-gray-dark" />
                      <span className="text-ocp-gray-dark">{t("guestPage.location")}:</span>{" "}
                      <span className="font-medium">
                        {visit.place ? `${visit.place.name} (${visit.place.code})` : "To be assigned"}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-ocp-navy">
                      <Clock size={14} className="text-ocp-gray-dark" />
                      <span className="font-medium">
                        {formatDate(visit.scheduledDate, lang)}
                        {visit.scheduledTime ? ` · ${formatTime(visit.scheduledTime, lang)}` : ""}
                      </span>
                    </p>
                  </div>
                  {visit.notes && (
                    <p className="mt-3 text-xs text-ocp-gray-dark bg-ocp-gray rounded-lg px-3 py-2">{visit.notes}</p>
                  )}
                </div>
                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                  <button onClick={handleNewVisit} className="flex items-center justify-center gap-2 rounded-lg border border-ocp-border bg-white px-4 py-2.5 text-sm font-semibold text-ocp-navy hover:bg-ocp-gray transition-colors">
                    {t("guestPage.newVisit")}
                  </button>
                </div>
              </div>
            </section>

            {/* ─── QR Code + Host ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <section className="rounded-xl border border-ocp-border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocp-gray-dark">{t("guestPage.qrAccessCode")}</p>
                  <button onClick={handleRefreshQr} disabled={qrLoading} className="text-ocp-gray-dark hover:text-ocp-green transition-colors">
                    {qrLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
                </div>
                {qrSrc ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white rounded-xl p-3 border border-ocp-border shadow-sm mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrSrc} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-ocp-gray-dark text-center mb-3">
                      {t("guestPage.scanQrAtReception")}
                    </p>
                    {visit.place && (
                      <button
                        onClick={() => router.push(`/map?to=${visit.place!.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocp-green-lighter text-ocp-green text-xs font-semibold hover:bg-ocp-green/10 transition-colors"
                      >
                        <Navigation size={12} />
                        {t("guestPage.navigateTo").replace("{name}", visit.place!.name)}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-ocp-gray-dark">
                    <QrCode size={48} className="mb-3 opacity-30" />
                    <p className="text-sm">{t("guestPage.generatingQr")}</p>
                  </div>
                )}
              </section>

              {/* Host Card */}
              <section className="rounded-xl border border-ocp-border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocp-gray-dark">{t("guestPage.yourHost")}</p>
                  <button onClick={handleRefreshPresence} className="text-ocp-gray-dark hover:text-ocp-green transition-colors">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-ocp-green/10 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-ocp-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ocp-navy">{visit.host.firstName} {visit.host.lastName}</p>
                    <p className="text-xs text-ocp-gray-dark">{visit.host.department} · {visit.host.position || "Employee"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {presenceCfg && <span className={`w-2.5 h-2.5 rounded-full ${presenceCfg.dot}`} />}
                  <span className={`text-sm font-medium ${presenceCfg?.text || "text-gray-500"}`}>
                    {presence?.statusLabel || "Unknown"}
                  </span>
                  {presence?.statusNote && (
                    <span className="text-xs text-ocp-gray-dark">· {presence.statusNote}</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-ocp-navy">
                  <p className="flex items-center gap-2"><Mail size={14} className="text-ocp-gray-dark" /> {visit.host.id ? t("guestPage.contactViaHost") : "—"}</p>
                </div>
              </section>
            </div>

            {/* ─── Timeline ─── */}
            {timeline.length > 0 && (
              <section className="rounded-xl border border-ocp-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocp-gray-dark mb-4">{t("guestPage.visitTimeline")}</p>
                <div className="space-y-0">
                  {timeline.map((step, i) => {
                    const colors = timelineColors[step.state] || timelineColors.upcoming;
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${colors.dot} mt-1 flex-shrink-0`} />
                          {i < timeline.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[2rem] ${colors.line}`} />
                          )}
                        </div>
                        <div className="pb-6 min-w-0">
                          <p className={`text-sm font-semibold ${colors.text}`}>{step.label}</p>
                          <p className="text-xs text-ocp-gray-dark">{step.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── Destination ─── */}
            {visit.place && (
              <section className="rounded-xl border border-ocp-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocp-gray-dark mb-3">{t("guestPage.destinationLabel")}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ocp-green-lighter flex items-center justify-center flex-shrink-0">
                    <Navigation size={18} className="text-ocp-green" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ocp-navy">{visit.place.name}</p>
                    <p className="text-xs text-ocp-gray-dark">
                      {visit.place.code} · {visit.place.currentOccupancy}/{visit.place.capacity} {t("guestPage.occupied")}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/map?to=${visit.place!.id}`)}
                    className="px-3 py-2 rounded-lg bg-ocp-green text-white text-xs font-semibold hover:bg-ocp-green-dark transition-colors flex items-center gap-1.5"
                  >
                    <Navigation size={12} />
                    {t("guestPage.navigate")}
                  </button>
                </div>
              </section>
            )}

            {/* ─── Campus Places ─── */}
            {places.length > 0 && (
              <section className="rounded-xl border border-ocp-border bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={18} className="text-ocp-green" />
                  <h3 className="font-semibold text-ocp-navy">{t("guestPage.campusPlacesTitle")}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {places.map((p: any) => (
                    <div key={p.id} className={`rounded-lg border p-3 transition-colors ${visit.place?.id === p.id ? "border-ocp-green bg-ocp-green-lighter" : "border-ocp-border"}`}>
                      <p className="text-sm font-medium text-ocp-navy truncate">{p.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2 h-2 rounded-full ${placeDotConfig[p.status] || "bg-gray-400"}`} />
                        <span className="text-xs text-ocp-gray-dark">{p.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Help ─── */}
            <section className="rounded-xl border border-ocp-border bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={18} className="text-ocp-green" />
                <h3 className="font-semibold text-ocp-navy">{t("guestPage.needHelp")}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-ocp-border p-3">
                  <div className="w-9 h-9 rounded-lg bg-ocp-green-lighter flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-ocp-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ocp-navy">{t("guestPage.contactReception")}</p>
                    <p className="text-xs text-ocp-gray-dark">+212 5 22 00 00 00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-ocp-border p-3">
                  <div className="w-9 h-9 rounded-lg bg-ocp-green-lighter flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-ocp-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ocp-navy">{t("guestPage.campusAssistance")}</p>
                    <p className="text-xs text-ocp-gray-dark">assistance@ocpgroup.ma</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="pt-2 pb-6 text-center text-xs text-ocp-gray-dark">
          {t("guestPage.poweredBy")}
        </footer>
      </div>
    </div>
  );
}
