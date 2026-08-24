"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import { getUsers, getTasks, getRequests, getNotifications, getPlaces, sendHeartbeat } from "@/lib/api";
import type { BackendUser, BackendTask, BackendRequest, BackendNotification, BackendPlace } from "@/lib/api";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  MapPin,
  Activity,
  Loader2,
} from "lucide-react";
import DashboardMapCard from "@/components/DashboardMapCard";

export default function DashboardPage() {
  const { user, frontendRole } = useAuth();
  const { t } = useI18n();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [tasks, setTasks] = useState<BackendTask[]>([]);
  const [requests, setRequests] = useState<BackendRequest[]>([]);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [places, setPlaces] = useState<BackendPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    sendHeartbeat().catch(() => {});

    Promise.allSettled([
      getUsers(),
      getTasks(),
      getRequests(),
      getNotifications(),
      getPlaces(),
    ]).then(([usersRes, tasksRes, requestsRes, notifsRes, placesRes]) => {
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.users || []);
      if (tasksRes.status === "fulfilled") setTasks(tasksRes.value.tasks || []);
      if (requestsRes.status === "fulfilled") setRequests(requestsRes.value.requests || []);
      if (notifsRes.status === "fulfilled") setNotifications(notifsRes.value.notifications || []);
      if (placesRes.status === "fulfilled") setPlaces(placesRes.value.data || []);
      setLoading(false);
    });
  }, []);

  const onlineCount = users.filter((u) => u.status === "ONLINE").length;
  const activeTasks = tasks.filter((t) => t.status !== "DONE").length;
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const stats = [
    {
      title: t("employee.totalUsers"),
      value: users.length || "—",
      change: `${onlineCount} ${t("common.online")}`,
      icon: Users,
      color: "#00a050",
    },
    {
      title: t("employee.activeTasks"),
      value: activeTasks || "—",
      change: `${tasks.length} total`,
      icon: UserCheck,
      color: "#008040",
    },
    {
      title: t("employee.pendingApprovals"),
      value: pendingRequests || "—",
      change: t("employee.requestsAwaiting"),
      icon: Clock,
      color: "#f59e0b",
    },
    {
      title: t("employee.notificationsCount"),
      value: unreadNotifs || "—",
      change: t("employee.unread"),
      icon: TrendingUp,
      color: "#3b82f6",
    },
  ];

  const greeting = user ? t("employee.welcomeBack", { name: user.firstName }) : t("employee.welcomeBackDefault");

  return (
    <DashboardLayout title={t("sidebar.dashboard")} subtitle={greeting}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-ocp-green" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-ocp-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ocp-navy">
                  {t("employee.recentUsers")}
                </h2>
                <button className="text-sm text-ocp-green hover:text-ocp-green-dark font-medium flex items-center gap-1">
                  {t("common.viewAll")} <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {users.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-ocp-gray transition-colors"
                  >
                    <div className="w-10 h-10 bg-ocp-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity size={16} className="text-ocp-green" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-ocp-navy">
                        <span className="font-semibold">{u.firstName} {u.lastName}</span>{" "}
                        <span className="text-ocp-gray-dark">— {u.role} · {u.department}</span>
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      u.status === "ONLINE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {u.status}
                    </span>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-ocp-gray-dark text-center py-4">{t("employee.noUsers")}</p>
                )}
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-xl border border-ocp-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ocp-navy">
                  {t("employee.recentRequests")}
                </h2>
                <Calendar size={18} className="text-ocp-gray-dark" />
              </div>

              <div className="space-y-4">
                {requests.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-ocp-gray rounded-xl border border-ocp-border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-ocp-navy text-sm">
                          {r.type}
                        </h4>
                        <p className="text-xs text-ocp-gray-dark mt-0.5">
                          {r.description?.slice(0, 60)}{r.description?.length > 60 ? "..." : ""}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        r.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : r.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-sm text-ocp-gray-dark text-center py-4">{t("employee.noRequests")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Campus Map */}
          <DashboardMapCard />

          {/* Campus Places */}
          {places.length > 0 && (
            <div className="bg-white rounded-xl border border-ocp-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ocp-navy">{t("dashboard.campusPlacesTitle")}</h2>
                <MapPin size={18} className="text-ocp-gray-dark" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {places.map((place) => (
                  <div key={place.id} className="p-4 bg-ocp-gray rounded-xl border border-ocp-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-ocp-navy text-sm">{place.name}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        place.status === "AVAILABLE" ? "bg-green-100 text-green-700" :
                        place.status === "BUSY" ? "bg-orange-100 text-orange-700" :
                        place.status === "FULL" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>{place.status}</span>
                    </div>
                    <p className="text-xs text-ocp-gray-dark mb-2">{place.code}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            place.status === "FULL" ? "bg-red-500" :
                            place.status === "BUSY" ? "bg-orange-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${place.occupancyPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ocp-gray-dark">{place.currentOccupancy}/{place.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
