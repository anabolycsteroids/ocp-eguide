"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Bell,
  Globe,
  LayoutDashboard,
  Map,
  MapPin,
  Navigation,
  QrCode,
  Ticket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import OcpLogo from "@/components/OcpLogo";
import { useI18n } from "@/i18n";

const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
];

interface Service {
  icon: LucideIcon;
  titleKey: string;
  textKey: string;
}

const SERVICES: Service[] = [
  {
    icon: Map,
    titleKey: "services.campusNavigation",
    textKey: "services.campusNavigationDesc",
  },
  {
    icon: MapPin,
    titleKey: "services.locationSearch",
    textKey: "services.locationSearchDesc",
  },
  {
    icon: Navigation,
    titleKey: "services.smartDirections",
    textKey: "services.smartDirectionsDesc",
  },
  {
    icon: LayoutDashboard,
    titleKey: "services.profileWorkspaces",
    textKey: "services.profileWorkspacesDesc",
  },
  {
    icon: Activity,
    titleKey: "services.availability",
    textKey: "services.availabilityDesc",
  },
  {
    icon: Ticket,
    titleKey: "services.visitorAccess",
    textKey: "services.visitorAccessDesc",
  },
  {
    icon: QrCode,
    titleKey: "services.qrIntegration",
    textKey: "services.qrIntegrationDesc",
  },
  {
    icon: Bell,
    titleKey: "services.notificationsService",
    textKey: "services.notificationsDesc",
  },
  {
    icon: Globe,
    titleKey: "services.multilingual",
    textKey: "services.multilingualDesc",
  },
];

export default function ServicesPage() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ocp-background flex flex-col">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-ocp-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-ocp-gray-dark hover:text-ocp-green transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <span className="hidden md:block h-6 w-px bg-ocp-border" />
            <span className="hidden md:block">
              <OcpLogo size="md" glass={false} />
            </span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-ocp-green/10 text-ocp-green"
                      : "text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="md:hidden px-4 pb-3 flex justify-center">
          <OcpLogo size="md" glass={false} />
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocp-green-lighter via-white to-ocp-green-light" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-ocp-navy">
            {t("services.title")}
          </h1>
          <p className="mt-3 text-base md:text-lg text-ocp-gray-dark max-w-2xl mx-auto leading-relaxed">
            {t("services.subtitle")}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(({ icon: Icon, titleKey, textKey }) => (
            <section
              key={titleKey}
              className="bg-white/90 backdrop-blur-sm rounded-xl border border-ocp-border p-6 shadow-sm hover:shadow-md hover:border-ocp-green/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-ocp-green/10 flex items-center justify-center mb-4">
                <Icon size={24} className="text-ocp-green" />
              </div>
              <h2 className="text-lg font-semibold text-ocp-navy mb-2">
                {t(titleKey)}
              </h2>
              <p className="text-sm text-ocp-gray-dark leading-relaxed">
                {t(textKey)}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
