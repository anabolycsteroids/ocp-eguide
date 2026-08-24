"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import LanguageSelector from "./LanguageSelector";

const roleLabelKeys: Record<string, string> = {
  "employee-management": "header.roleManagement",
  "employee-reception": "header.roleReception",
  "employee-hr": "header.roleHr",
  "employee-it": "header.roleIt",
  "employee-security": "header.roleSecurity",
  "intern-mechanical": "header.roleInternMechanical",
  "intern-chemical": "header.roleInternChemical",
  "intern-electrical": "header.roleInternElectrical",
  "intern-civil": "header.roleInternCivil",
  "intern-industrial": "header.roleInternIndustrial",
  "intern-hse": "header.roleInternHse",
  "intern-environmental": "header.roleInternEnvironmental",
  "intern-computer-science": "header.roleInternCs",
  "visitor-client": "header.roleVisitorClient",
  "visitor-delivery": "header.roleVisitorDelivery",
  "visitor-partner": "header.roleVisitorPartner",
  "visitor-supplier": "header.roleVisitorSupplier",
  "visitor-collaborator": "header.roleVisitorCollaborator",
  "visitor-contractor": "header.roleVisitorContractor",
};

export default function Header({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { user, profile, frontendRole, logout } = useAuth();
  const { t } = useI18n();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(`${user.firstName} ${user.lastName}`);
      setUserRole(profile ? profile.name : roleLabelKeys[frontendRole] ? t(roleLabelKeys[frontendRole]) : user.role);
    }
  }, [user, profile, frontendRole, t]);

  const notifications = [
    { textKey: "header.notifCheckin", timeKey: "header.notifCheckinTime" },
    { textKey: "header.notifBadge", timeKey: "header.notifBadgeTime" },
    { textKey: "header.notifSystem", timeKey: "header.notifSystemTime" },
  ];

  return (
    <header className="h-16 bg-white border-b border-ocp-border flex items-center justify-between px-6">
      {/* Left: Title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-ocp-navy">{title}</h1>
        )}
        {subtitle && <p className="text-xs text-ocp-gray-dark">{subtitle}</p>}
      </div>

      {/* Right: Language, Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        <LanguageSelector variant="light" />
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search
            size={16}
            className="absolute left-3 text-ocp-gray-dark"
          />
          <input
            type="text"
            placeholder={t("header.search")}
            className="pl-9 pr-4 py-2 bg-ocp-gray border border-ocp-border rounded-lg text-sm w-64 focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray rounded-lg transition-all"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-ocp-border rounded-xl shadow-lg z-50">
              <div className="p-4 border-b border-ocp-border">
                <h3 className="font-semibold text-ocp-navy">{t("header.notifications")}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-ocp-gray cursor-pointer border-b border-ocp-border last:border-0"
                  >
                    <p className="text-sm text-ocp-navy">{t(notif.textKey)}</p>
                    <p className="text-xs text-ocp-gray-dark mt-1">
                      {t(notif.timeKey)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray rounded-lg transition-all"
          >
            <div className="w-8 h-8 bg-ocp-green/10 rounded-full flex items-center justify-center">
              <User size={16} className="text-ocp-green" />
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-ocp-navy">
                {userName}
              </span>
              <span className="text-xs text-ocp-gray-dark">{userRole}</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-ocp-border rounded-xl shadow-lg z-50">
              <div className="p-2">
                <a
                  href="#"
                  className="block px-3 py-2 text-sm text-ocp-navy hover:bg-ocp-gray rounded-lg"
                >
                  {t("header.profile")}
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 text-sm text-ocp-navy hover:bg-ocp-gray rounded-lg"
                >
                  {t("header.settings")}
                </a>
                <hr className="my-1 border-ocp-border" />
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/");
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  {t("header.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
