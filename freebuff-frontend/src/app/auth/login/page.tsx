"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { authCards, roleLabels } from "@/lib/data";
import type { UserRole, EntityType } from "@/types";
import { profileIconPaths } from "@/lib/profileIcons";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";

const entityIcons: Record<EntityType, React.ElementType> = {
  employee: Briefcase,
  intern: GraduationCap,
  visitor: Users,
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "employee-management") as UserRole;
  const { login } = useAuth();

  const card = authCards.find((c) => c.role === role) || authCards[0];
  const EntityIcon = entityIcons[card.entityType] || Briefcase;
  const profileSvg = profileIconPaths[card.id];

  const [email, setEmail] = useState(`imrane.belkoufa.${card.emailSlug}@ocp.ma`);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password, card.role);

      sessionStorage.setItem("selectedRole", card.role);
      sessionStorage.setItem("selectedEntityType", card.entityType);

      router.push("/auth/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel = roleLabels[role] || role;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #0a1628 0%, #0d2818 50%, #1a3a2a 100%)",
        }}
      />
      <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-ocp-green/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-ocp-green/8 blur-2xl" />

      <div className="relative z-10 w-full max-w-md mx-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-ocp-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-ocp-green to-ocp-green-dark" />

          <div className="relative p-6 pb-4">
            <div className="flex items-center gap-4 mb-4">
              {profileSvg ? (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <Image
                    src={profileSvg}
                    alt={card.title}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <EntityIcon size={28} style={{ color: card.color }} />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-ocp-navy">{card.title}</h2>
                <p className="text-sm text-ocp-gray-dark">{roleLabel}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6">
            <h3 className="text-lg font-semibold text-ocp-navy mb-1">
              Sign In
            </h3>
            <p className="text-sm text-ocp-gray-dark mb-5">
              Enter your credentials to access the dashboard
            </p>

            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ocp-navy mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@ocp.ma"
                    className="w-full pl-10 pr-4 py-3 bg-ocp-gray border border-ocp-border rounded-xl text-sm text-ocp-navy placeholder-ocp-gray-dark focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
                    autoComplete="off"
                    name="email-login"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ocp-navy mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-ocp-gray border border-ocp-border rounded-xl text-sm text-ocp-navy placeholder-ocp-gray-dark focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark hover:text-ocp-navy"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3.5 bg-ocp-green text-white rounded-xl font-semibold hover:bg-ocp-green-dark transition-all shadow-lg shadow-ocp-green/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="text-sm text-ocp-gray-dark hover:text-ocp-green transition-colors"
              >
                Choose a different profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ocp-background">
          <div className="text-ocp-gray-dark">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
