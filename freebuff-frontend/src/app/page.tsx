"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Users,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Shield,
  Bell,
  Activity,
  Wrench,
  FlaskConical,
  Zap,
  Building2,
  Cog,
  HardHat,
  Leaf,
  Code,
  Handshake,
  Truck,
  Package,
  ClipboardList,
  User,
  Home,
} from "lucide-react";
import OcpLogo from "@/components/OcpLogo";
import HeroDashboardShowcase from "@/components/HeroDashboardShowcase";
import MapPreview from "@/components/MapPreview";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n";
import { authCards } from "@/lib/data";
import { AuthCard as AuthCardType, EntityType } from "@/types";
import { profileIconPaths, entityIconPaths } from "@/lib/profileIcons";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  shield: Shield,
  users: Users,
  bell: Bell,
  user: User,
  truck: Truck,
  handshake: Handshake,
  package: Package,
  "graduation-cap": GraduationCap,
  wrench: Wrench,
  flask: FlaskConical,
  zap: Zap,
  building: Building2,
  "building-2": Building2,
  cog: Cog,
  "hard-hat": HardHat,
  leaf: Leaf,
  code: Code,
  "clipboard-list": ClipboardList,
  "user-check": Shield,
};

interface EntityCategory {
  type: EntityType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  image: string;
  count: number;
}

const entityCategories: EntityCategory[] = [
  {
    type: "employee",
    title: "Employee",
    subtitle: "Management & Operations",
    description:
      "Access dashboards, manage visitors, track security, and oversee site operations.",
    icon: Briefcase,
    color: "#00a050",
    image: entityIconPaths.employee,
    count: 5,
  },
  {
    type: "intern",
    title: "Intern",
    subtitle: "Learning & Development",
    description:
      "Track onboarding progress, view schedules, submit requests, and access training.",
    icon: GraduationCap,
    color: "#3b82f6",
    image: entityIconPaths.intern,
    count: 8,
  },
  {
    type: "visitor",
    title: "Visitor",
    subtitle: "Guest Access",
    description:
      "Register visits, get navigation guidance, check-in/out, and manage badges.",
    icon: Users,
    color: "#f59e0b",
    image: entityIconPaths.visitor,
    count: 6,
  },
];

function EmployeePreview() {
  return (
    <div className="glass-dark rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex h-[340px]">
        <div className="w-44 bg-ocp-navy/90 text-white flex flex-col py-4 px-2 border-r border-white/10">
          <div className="px-3 mb-5">
            <div className="w-8 h-8 bg-ocp-green/20 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-ocp-green" />
            </div>
          </div>
          {["Dashboard", "Visitors", "Site Map", "Security", "Reports"].map(
            (item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  i === 0
                    ? "bg-ocp-green/20 text-ocp-green"
                    : "text-gray-400"
                }`}
              >
                <div className="w-4 h-4 bg-current/20 rounded" />
                <span>{item}</span>
              </div>
            )
          )}
        </div>
        <div className="flex-1 p-4 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Employee Dashboard
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <Bell size={12} />
              <span>3 alerts</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Visitors Today", value: "156" },
              { label: "On Site", value: "89" },
              { label: "Pending", value: "23" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-lg p-3"
              >
                <span className="text-[10px] text-gray-300">{stat.label}</span>
                <p className="text-lg font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-semibold text-white mb-2">
              Recent Activity
            </h4>
            {[
              { name: "Claire Dupont", action: "checked in", time: "2m ago" },
              {
                name: "Jean Martin",
                action: "badge approved",
                time: "15m ago",
              },
              { name: "Amina B.", action: "registered", time: "1h ago" },
            ].map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-t border-white/10 first:border-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-ocp-green/20 rounded-full flex items-center justify-center">
                    <Users size={8} className="text-ocp-green" />
                  </div>
                  <span className="text-[10px] text-gray-300">
                    <strong className="text-white">{a.name}</strong> {a.action}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InternPreview() {
  return (
    <div className="glass-dark rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex h-[340px]">
        <div className="w-44 bg-ocp-navy/90 text-white flex flex-col py-4 px-2 border-r border-white/10">
          <div className="px-3 mb-5">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-blue-400" />
            </div>
          </div>
          {["My Tasks", "Schedule", "Training", "Requests", "Help"].map(
            (item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  i === 0
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400"
                }`}
              >
                <div className="w-4 h-4 bg-current/20 rounded" />
                <span>{item}</span>
              </div>
            )
          )}
        </div>
        <div className="flex-1 p-4 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Intern Dashboard
            </h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">
              Day 14 of 90
            </span>
          </div>
          <div className="glass rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">
                Onboarding Progress
              </span>
              <span className="text-[10px] text-blue-300 font-bold">68%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full">
              <div
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: "68%" }}
              />
            </div>
          </div>
          <div className="glass rounded-lg p-3">
            <h4 className="text-xs font-semibold text-white mb-2">
              Today&apos;s Schedule
            </h4>
            {[
              { time: "09:00", task: "Team standup" },
              { time: "10:30", task: "Code review session" },
              { time: "14:00", task: "Safety orientation" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-1.5 border-t border-white/10 first:border-0"
              >
                <span className="text-[10px] text-gray-400 w-8">{s.time}</span>
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] text-white flex-1">{s.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitorPreview() {
  return (
    <div className="glass-dark rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex h-[340px]">
        <div className="w-44 bg-ocp-navy/90 text-white flex flex-col py-4 px-2 border-r border-white/10">
          <div className="px-3 mb-5">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-amber-400" />
            </div>
          </div>
          {["My Visit", "Navigation", "Check-in", "Badge", "Help"].map(
            (item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  i === 0
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400"
                }`}
              >
                <div className="w-4 h-4 bg-current/20 rounded" />
                <span>{item}</span>
              </div>
            )
          )}
        </div>
        <div className="flex-1 p-4 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              Visitor Dashboard
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
              Checked In
            </span>
          </div>
          <div className="glass rounded-lg p-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-white">
                  Building C — Meeting Room 301
                </h4>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Meeting with Karim Alaoui
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                    Badge: VIS-0847
                  </span>
                  <span className="text-[9px] text-gray-400">
                    Expires: 17:00
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="glass rounded-lg p-3 border-amber-500/20">
            <div className="flex items-start gap-2">
              <Shield
                size={12}
                className="text-amber-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <h4 className="text-[10px] font-semibold text-amber-300">
                  Safety Reminder
                </h4>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  Please wear your visitor badge at all times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const previewComponents: Record<EntityType, React.ComponentType> = {
  employee: EmployeePreview,
  intern: InternPreview,
  visitor: VisitorPreview,
};

function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [isKioskMode, setIsKioskMode] = useState(true);
  const [isUserActive, setIsUserActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const entityIndexRef = useRef(0);

  const cycleEntity = useCallback(() => {
    entityIndexRef.current =
      (entityIndexRef.current + 1) % entityCategories.length;
    setSelectedEntity(entityCategories[entityIndexRef.current].type);
  }, []);

  useEffect(() => {
    if (!isKioskMode || isUserActive || selectedEntity !== null) return;
    timerRef.current = setInterval(cycleEntity, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isKioskMode, isUserActive, cycleEntity, selectedEntity]);

  const handleUserInteraction = useCallback(() => {
    setIsUserActive(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const resumeTimer = setTimeout(() => setIsUserActive(false), 30000);
    return () => clearTimeout(resumeTimer);
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "touchstart", "click"];
    const handler = () => handleUserInteraction();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [handleUserInteraction]);

  const categories = entityCategories.map((entity) => ({
    ...entity,
    title: t(`hero.${entity.type}`),
    subtitle: t(`hero.${entity.type}Subtitle`),
    description: t(`hero.${entity.type}Desc`),
  }));

  const entityProfiles = selectedEntity
    ? authCards.filter((c) => c.entityType === selectedEntity)
    : [];

  const selectedCategoryData = selectedEntity
    ? categories.find((e) => e.type === selectedEntity)
    : null;

  const PreviewComponent = selectedEntity
    ? previewComponents[selectedEntity]
    : null;

  const handleProfileClick = (card: AuthCardType) => {
    sessionStorage.setItem("selectedRole", card.role);
    sessionStorage.setItem("selectedEntityType", card.entityType);
    router.push(`/auth/login?role=${card.role}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      onClick={handleUserInteraction}
    >
      {/* Vegetation Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#061210] via-[#0a2818] to-[#0d3a1f]" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 15% 40%, rgba(0, 120, 60, 0.45) 0%, transparent 55%),
              radial-gradient(ellipse at 85% 20%, rgba(20, 160, 80, 0.35) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 85%, rgba(0, 100, 50, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 75% 60%, rgba(30, 140, 70, 0.3) 0%, transparent 40%),
              radial-gradient(ellipse at 30% 15%, rgba(0, 140, 70, 0.25) 0%, transparent 35%),
              radial-gradient(ellipse at 90% 80%, rgba(10, 130, 60, 0.35) 0%, transparent 45%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `
              radial-gradient(circle at 10% 20%, rgba(34, 197, 94, 0.6) 0%, transparent 4%),
              radial-gradient(circle at 90% 10%, rgba(22, 163, 74, 0.5) 0%, transparent 3%),
              radial-gradient(circle at 40% 70%, rgba(34, 197, 94, 0.4) 0%, transparent 5%),
              radial-gradient(circle at 70% 40%, rgba(21, 128, 61, 0.5) 0%, transparent 3%),
              radial-gradient(circle at 20% 90%, rgba(34, 197, 94, 0.3) 0%, transparent 4%),
              radial-gradient(circle at 80% 70%, rgba(0, 160, 80, 0.4) 0%, transparent 3%),
              radial-gradient(circle at 55% 25%, rgba(22, 163, 74, 0.35) 0%, transparent 6%),
              radial-gradient(circle at 35% 50%, rgba(34, 197, 94, 0.3) 0%, transparent 4%),
              radial-gradient(circle at 65% 85%, rgba(21, 128, 61, 0.45) 0%, transparent 3%),
              radial-gradient(circle at 5% 55%, rgba(34, 197, 94, 0.3) 0%, transparent 5%)
            `,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/15" />
      </div>

      <div className="absolute top-16 right-16 w-[500px] h-[500px] rounded-full bg-ocp-green/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-16 left-16 w-[400px] h-[400px] rounded-full bg-ocp-green/[0.06] blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ocp-green/[0.03] blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <Link href="/" aria-label={t("nav.home")} className="inline-flex">
          <OcpLogo size="clamp(220px, 22vw, 300px)" />
        </Link>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link
            href="/about"
            className="text-sm font-medium text-gray-300 hover:text-ocp-green transition-colors"
          >
            {t("nav.about")}
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-gray-300 hover:text-ocp-green transition-colors"
          >
            {t("nav.services")}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-gray-300 hover:text-ocp-green transition-colors"
          >
            {t("nav.contact")}
          </Link>
          <button
            onClick={() => router.push("/dashboard/guest")}
            className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-all"
          >
            {t("nav.continueAsGuest")}
          </button>
          <LanguageSelector />
          <button
            onClick={() => router.push("/auth")}
            className="px-5 py-2.5 bg-ocp-green text-white rounded-lg text-sm font-semibold hover:bg-ocp-green-dark transition-all shadow-lg shadow-ocp-green/30"
          >
            {t("nav.signIn")}
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 md:px-10 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-ocp-green text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-ocp-green rounded-full animate-pulse" />
            {t("hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {t("hero.welcome")}{" "}
            <span className="text-ocp-green drop-shadow-[0_0_20px_rgba(0,160,80,0.4)]">{t("hero.title")}</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-300 max-w-xl mx-auto mt-4 leading-relaxed">
            {selectedEntity
              ? format(t("hero.selectEntityProfile"), {
                  entity: t(`hero.${selectedEntity}`),
                })
              : t("hero.description")}
          </p>
        </div>

        {/* Hero Dashboard Showcase */}
        {selectedEntity === null && (
          <div className="w-full max-w-lg mx-auto mb-10">
            <HeroDashboardShowcase />
          </div>
        )}

        {/* Campus Map Preview */}
        {selectedEntity === null && (
          <div className="w-full max-w-2xl mx-auto mb-10">
            <MapPreview />
          </div>
        )}

        {/* Step 1: Entity Selection */}
        {selectedEntity === null && (
          <>
            <div className="flex flex-col md:flex-row gap-5 mb-10 max-w-5xl w-full">
              {categories.map((entity) => {
                const Icon = entity.icon;
                return (
                  <button
                    key={entity.type}
                    onClick={() => {
                      setSelectedEntity(entity.type);
                      entityIndexRef.current = entityCategories.findIndex(
                        (e) => e.type === entity.type
                      );
                    }}
                    className="flex-1 group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl"
                    style={{ boxShadow: `0 8px 32px ${entity.color}20` }}
                  >
                    <div className="glass-dark p-8 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
                      <div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                        style={{ background: `radial-gradient(circle, ${entity.color}, transparent)` }}
                      />
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${entity.color}20` }}
                      >
                        <Image
                          src={entity.image}
                          alt={`${entity.title} icon`}
                          width={56}
                          height={56}
                          className="object-contain rounded-lg"
                          priority
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{entity.title}</h3>
                      <p className="text-sm font-medium" style={{ color: entity.color }}>
                        {entity.subtitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 text-center line-clamp-2">
                        {entity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-xs font-medium" style={{ color: entity.color }}>
                        <span>
                          {format(t("hero.profilesCount"), {
                            count: entity.count,
                          })}
                        </span>
                        <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${dir === "rtl" ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => router.push("/dashboard/guest")}
              className="mb-8 px-6 py-3 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              {t("hero.orContinueAsGuest")}{dir === "rtl" ? "" : " →"}
            </button>

            <div className="w-full max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {t("landing.previewing")}
                  </span>
                  <span className="text-xs font-bold text-ocp-green">
                    {categories[entityIndexRef.current]?.title ||
                      t("hero.employee")}{" "}
                    {t("landing.dashboard")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Activity
                      size={12}
                      className={
                        isKioskMode && !isUserActive
                          ? "text-ocp-green animate-pulse"
                          : "text-gray-400"
                      }
                    />
                    <span>
                      {isKioskMode && !isUserActive
                        ? t("landing.autoCycling")
                        : t("landing.manual")}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsKioskMode(!isKioskMode)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isKioskMode ? "glass-green text-ocp-green" : "glass text-gray-400"
                    }`}
                  >
                    {isKioskMode ? t("landing.kioskOn") : t("landing.kioskOff")}
                  </button>
                </div>
              </div>
              <div className="transition-opacity duration-500 ease-in-out">
                <EmployeePreview />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Profile Selection */}
        {selectedEntity !== null && selectedCategoryData && (
          <>
            <button
              onClick={() => setSelectedEntity(null)}
              className="self-start flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              {dir === "rtl" ? (
                <ArrowRight size={18} />
              ) : (
                <ArrowLeft size={18} />
              )}
              <span className="text-sm font-medium">
                {t("landing.backToCategories")}
              </span>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center glass"
                style={{ borderColor: selectedCategoryData.color + "40" }}
              >
                <selectedCategoryData.icon
                  size={28}
                  style={{ color: selectedCategoryData.color }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedCategoryData.title} {t("landing.profiles")}
                </h2>
                <p className="text-sm text-gray-400">
                  {format(t("landing.chooseProfileCount"), {
                    count: entityProfiles.length,
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl w-full mb-8">
              {entityProfiles.map((card) => {
                const profileSvg = profileIconPaths[card.id];

                return (
                  <button
                    key={card.id}
                    onClick={() => handleProfileClick(card)}
                    className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer text-left"
                    style={{ boxShadow: `0 4px 24px ${card.color}15` }}
                  >
                    <div className="glass-dark p-5 min-h-[180px] flex flex-col justify-between relative overflow-hidden">
                      <div
                        className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-15 group-hover:opacity-25 transition-opacity"
                        style={{ background: `radial-gradient(circle, ${card.color}, transparent)` }}
                      />

                      <div className="relative z-10 flex flex-col items-center text-center">
                        {profileSvg ? (
                          <Image
                            src={profileSvg}
                            alt={card.title}
                            width={48}
                            height={48}
                            className="mb-3 transition-transform duration-300 group-hover:scale-110 rounded-xl"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${card.color}25` }}
                          >
                            {(iconMap[card.icon] ? (() => { const I = iconMap[card.icon]; return <I size={22} style={{ color: card.color }} />; })() : (
                              <User size={22} style={{ color: card.color }} />
                            ))}
                          </div>
                        )}
                        <h3 className="text-white font-semibold text-base">
                          {card.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {card.subtitle}
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-center gap-1 mt-4 text-sm font-medium group-hover:gap-2 transition-all relative z-10"
                        style={{ color: card.color }}
                      >
                        <span>{t("landing.continue")}</span>
                        {dir === "rtl" ? (
                          <ArrowLeft
                            size={16}
                            className="transition-transform group-hover:-translate-x-1"
                          />
                        ) : (
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-gray-400">
              {t("landing.or")}{" "}
              <button
                onClick={() => router.push("/auth")}
                className="text-ocp-green hover:underline font-medium"
              >
                {t("landing.browseAllProfiles")}
              </button>
            </p>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-10 py-5 border-t border-white/10 glass">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label={t("nav.home")} className="inline-flex">
              <OcpLogo size="120px" />
            </Link>
            <p className="text-sm text-gray-400">{t("footer.copyright")}</p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-gray-400 hover:text-ocp-green transition-colors"
            >
              {t("footer.aboutOcp")}
            </Link>
            <Link
              href="/services"
              className="text-sm text-gray-400 hover:text-ocp-green transition-colors"
            >
              {t("footer.services")}
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-400 hover:text-ocp-green transition-colors"
            >
              {t("footer.contact")}
            </Link>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-ocp-green transition-colors"
            >
              {t("footer.privacy")}
            </a>
            <Link
              href="/dashboard/guest"
              className="text-sm text-gray-400 hover:text-ocp-green transition-colors"
            >
              {t("footer.help")}
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </footer>
    </div>
  );
}
