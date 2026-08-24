"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import OcpLogo from "./OcpLogo";
import {
  Home,
  Users,
  Map,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  UserCheck,
  BarChart3,
  FileText,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Footprints,
  Wrench,
  BookOpen,
  Calendar,
  Navigation,
  Clock,
  Truck,
  Package,
  QrCode,
  MessageSquare,
  ClipboardList,
  UserCog,
  FlaskConical,
  Zap,
  HardHat,
  Leaf,
  Code,
  Cog,
  Handshake,
} from "lucide-react";

type NavItem = { key: string; href: string; icon: typeof Home };

const navByRole: Record<string, NavItem[]> = {
  default: [
    { key: "sidebar.dashboard", href: "/dashboard", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.visitors", href: "/dashboard/visitors", icon: Users },
    { key: "sidebar.analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { key: "sidebar.reports", href: "/dashboard/reports", icon: FileText },
    { key: "sidebar.security", href: "/dashboard/security", icon: Shield },
    { key: "sidebar.buildings", href: "/dashboard/buildings", icon: Building2 },
    { key: "sidebar.approvals", href: "/dashboard/approvals", icon: UserCheck },
  ],
  "employee-reception": [
    { key: "sidebar.dashboard", href: "/dashboard/reception", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.visitors", href: "/dashboard/visitors", icon: Users },
    { key: "sidebar.checkIn", href: "/dashboard/reception", icon: QrCode },
    { key: "sidebar.appointments", href: "/dashboard/approvals", icon: Calendar },
    { key: "sidebar.reports", href: "/dashboard/reports", icon: FileText },
  ],
  "employee-hr": [
    { key: "sidebar.dashboard", href: "/dashboard/hr", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.employees", href: "/dashboard/visitors", icon: Users },
    { key: "sidebar.approvals", href: "/dashboard/approvals", icon: ClipboardList },
    { key: "sidebar.analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { key: "sidebar.reports", href: "/dashboard/reports", icon: FileText },
    { key: "sidebar.settings", href: "/dashboard/settings", icon: Settings },
  ],
  "employee-it": [
    { key: "sidebar.dashboard", href: "/dashboard/it-security", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.securityAlerts", href: "/dashboard/it-security", icon: Shield },
    { key: "sidebar.cctv", href: "/dashboard/it-security", icon: Users },
    { key: "sidebar.reports", href: "/dashboard/reports", icon: FileText },
    { key: "sidebar.settings", href: "/dashboard/settings", icon: Settings },
  ],
  "employee-security": [
    { key: "sidebar.dashboard", href: "/dashboard/security", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.visitors", href: "/dashboard/visitors", icon: Users },
    { key: "sidebar.buildings", href: "/dashboard/buildings", icon: Building2 },
    { key: "sidebar.reports", href: "/dashboard/reports", icon: FileText },
    { key: "sidebar.approvals", href: "/dashboard/approvals", icon: UserCheck },
  ],
  "intern-mechanical": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/mechanical-engineering", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/mechanical-engineering", icon: Wrench },
    { key: "sidebar.training", href: "/dashboard/intern/mechanical-engineering", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/mechanical-engineering", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-chemical": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/chemical-engineering", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/chemical-engineering", icon: FlaskConical },
    { key: "sidebar.training", href: "/dashboard/intern/chemical-engineering", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/chemical-engineering", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-electrical": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/electrical-engineering", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/electrical-engineering", icon: Zap },
    { key: "sidebar.training", href: "/dashboard/intern/electrical-engineering", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/electrical-engineering", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-civil": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/civil-engineering", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/civil-engineering", icon: Building2 },
    { key: "sidebar.training", href: "/dashboard/intern/civil-engineering", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/civil-engineering", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-industrial": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/industrial-engineering", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/industrial-engineering", icon: Cog },
    { key: "sidebar.training", href: "/dashboard/intern/industrial-engineering", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/industrial-engineering", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-hse": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/hse", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/hse", icon: HardHat },
    { key: "sidebar.training", href: "/dashboard/intern/hse", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/hse", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-environmental": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/environmental-science", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/environmental-science", icon: Leaf },
    { key: "sidebar.training", href: "/dashboard/intern/environmental-science", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/environmental-science", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "intern-computer-science": [
    { key: "sidebar.dashboard", href: "/dashboard/intern/computer-science", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.tasks", href: "/dashboard/intern/computer-science", icon: Code },
    { key: "sidebar.training", href: "/dashboard/intern/computer-science", icon: BookOpen },
    { key: "sidebar.schedule", href: "/dashboard/intern/computer-science", icon: Calendar },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-client": [
    { key: "sidebar.myVisit", href: "/dashboard/visitor", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.navigation", href: "/dashboard/visitor", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-delivery": [
    { key: "sidebar.dashboard", href: "/dashboard/visitor/delivery", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.deliveries", href: "/dashboard/visitor/delivery", icon: Package },
    { key: "sidebar.navigation", href: "/dashboard/visitor/delivery", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-partner": [
    { key: "sidebar.myVisit", href: "/dashboard/visitor/partner", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.navigation", href: "/dashboard/visitor/partner", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-supplier": [
    { key: "sidebar.myVisit", href: "/dashboard/visitor/supplier", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.navigation", href: "/dashboard/visitor/supplier", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-collaborator": [
    { key: "sidebar.myVisit", href: "/dashboard/visitor/collaborator", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.navigation", href: "/dashboard/visitor/collaborator", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
  "visitor-contractor": [
    { key: "sidebar.dashboard", href: "/dashboard/visitor/contractor", icon: Home },
    { key: "sidebar.campusMap", href: "/map", icon: Map },
    { key: "sidebar.workOrders", href: "/dashboard/visitor/contractor", icon: ClipboardList },
    { key: "sidebar.navigation", href: "/dashboard/visitor/contractor", icon: Navigation },
    { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
  ],
};

const bottomItems: NavItem[] = [
  { key: "sidebar.settings", href: "/dashboard/settings", icon: Settings },
  { key: "sidebar.help", href: "/dashboard/help", icon: HelpCircle },
];

export default function Sidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { frontendRole, logout } = useAuth();
  const { t, dir } = useI18n();
  const [userRole, setUserRole] = useState<string>("default");

  useEffect(() => {
    if (frontendRole) {
      setUserRole(frontendRole);
    }
  }, [frontendRole]);

  const navItems = navByRole[userRole] || navByRole.default;

  return (
    <aside
      className={`h-screen bg-ocp-navy text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <OcpLogo size="md" glass={false} />
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <OcpLogo size="sm" glass={false} />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          const label = t(item.key);

          return (
            <Link
              key={item.href + item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? dir === "rtl"
                    ? "bg-ocp-green/20 text-ocp-green border-r-2 border-ocp-green"
                    : "bg-ocp-green/20 text-ocp-green border-l-2 border-ocp-green"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="py-4 px-2 space-y-1 border-t border-white/10">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const label = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          title={collapsed ? t("sidebar.logout") : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>{t("sidebar.logout")}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      {onToggle && (
        <button
          onClick={onToggle}
          className={`absolute top-20 w-6 h-6 bg-ocp-navy border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-ocp-green transition-all ${
            dir === "rtl" ? "-left-3" : "-right-3"
          }`}
        >
          {dir === "rtl" ? (
            collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />
          ) : (
            collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />
          )}
        </button>
      )}
    </aside>
  );
}
