"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OcpLogo from "@/components/OcpLogo";
import { getGuestNotifications } from "@/lib/guestApi";
import type { GuestNotification } from "@/types/guest";
import {
  House,
  ClipboardList,
  QrCode,
  Bell,
  HelpCircle,
  LogIn,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/dashboard/guest", icon: House, section: "" },
  { label: "My Visit", href: "/dashboard/guest", icon: ClipboardList, section: "visit" },
  { label: "QR / Access", href: "/dashboard/guest", icon: QrCode, section: "qr" },
  { label: "Notifications", href: "/dashboard/guest", icon: Bell, section: "notifications" },
  { label: "Help", href: "/dashboard/guest", icon: HelpCircle, section: "help" },
];

export default function GuestSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<GuestNotification[]>([]);

  useEffect(() => {
    // Notifications require auth — skip polling entirely for guests without a token.
    if (!sessionStorage.getItem("accessToken")) return;
    let active = true;
    const load = () => {
      getGuestNotifications()
        .then((res) => {
          if (active) setNotifications(res.data || []);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (section: string) => {
    if (section) {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <aside className="h-screen sticky top-0 flex-shrink-0 w-16 md:w-60 bg-ocp-navy text-white flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start p-2 md:p-3 border-b border-white/10">
        <Link href="/" className="block">
          <OcpLogo size="sm" glass={false} className="md:hidden" />
          <OcpLogo size="md" glass={false} className="hidden md:block" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.section === ""
              ? pathname === item.href
              : false;
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleClick(item.section)}
              className={`w-full relative flex items-center justify-center md:justify-start md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-ocp-green/20 text-ocp-green border-l-2 border-ocp-green"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="absolute top-1 right-1 md:relative md:top-auto md:right-auto md:ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sign in / Sign out */}
      <div className="py-4 px-2 border-t border-white/10">
        {isAuthenticated ? (
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full flex items-center justify-center md:justify-start md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            title="Sign Out"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            className="w-full flex items-center justify-center md:justify-start md:gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ocp-green hover:text-white hover:bg-ocp-green/20 transition-all"
            title="Sign In"
          >
            <LogIn size={20} className="flex-shrink-0" />
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
}
