"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const token = sessionStorage.getItem("accessToken");
      if (!token) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ocp-background">
        <div className="text-ocp-gray-dark">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ocp-background">
      <div className="relative flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
