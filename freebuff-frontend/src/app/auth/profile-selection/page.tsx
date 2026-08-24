"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { mockUsers, roleLabels } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, UserRole } from "@/types";
import {
  ArrowLeft,
  Search,
  User,
  Mail,
  BadgeCheck,
  CheckCircle,
  Loader2,
} from "lucide-react";

function ProfileSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "";
  const { login } = useAuth();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profiles = mockUsers.filter((u) => {
    const matchesRole = u.role === role;
    const matchesSearch =
      searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleSelect = (profile: UserProfile) => {
    setSelectedProfileId(profile.id);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedProfileId || !role) return;
    const profile = profiles.find((p) => p.id === selectedProfileId);
    if (!profile || !profile.email) return;

    setIsLoggingIn(true);
    setError(null);

    try {
      await login(profile.email, "imrane123", role);

      sessionStorage.setItem("selectedRole", role);
      sessionStorage.setItem("selectedEntityType", profile.entityType);

      router.push("/auth/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const roleLabel = roleLabels[role as keyof typeof roleLabels] || role;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #0a1628 0%, #0d2818 50%, #1a3a2a 100%)",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-ocp-green/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-ocp-green/8 blur-2xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Select Your Profile
          </h1>
          <p className="text-gray-400 mt-1">
            {roleLabel} — Choose your profile to continue
          </p>
        </div>

        <div className="relative max-w-md mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile)}
              disabled={isLoggingIn}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all backdrop-blur-sm ${
                selectedProfileId === profile.id
                  ? "border-ocp-green bg-white/15 shadow-lg"
                  : "border-white/10 bg-white/5 hover:border-ocp-green/30 hover:bg-white/10"
              } ${isLoggingIn ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-ocp-green/15 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-ocp-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {profile.name}
                    </h3>
                    {selectedProfileId === profile.id && (
                      <CheckCircle size={18} className="text-ocp-green" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {profile.department}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={12} />
                      {profile.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <BadgeCheck size={12} />
                      {profile.badge}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    profile.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : profile.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {profile.status}
                </div>
              </div>
            </button>
          ))}

          {profiles.length === 0 && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <User size={40} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">
                No profiles found for this role
              </p>
            </div>
          )}
        </div>

        {selectedProfileId && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={isLoggingIn}
              className="px-8 py-3 bg-ocp-green text-white rounded-xl font-semibold hover:bg-ocp-green-dark transition-all shadow-lg shadow-ocp-green/30 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Confirm Selection"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfileSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ocp-background">
          <div className="text-ocp-gray-dark">Loading...</div>
        </div>
      }
    >
      <ProfileSelectionContent />
    </Suspense>
  );
}
