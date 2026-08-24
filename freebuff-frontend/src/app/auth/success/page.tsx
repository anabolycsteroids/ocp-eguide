"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardRoute } from "@/lib/roleMapping";
import { CheckCircle, ArrowRight, User, Shield } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0) {
      handleContinue();
    }
  }, [countdown]);

  const handleContinue = () => {
    if (profile) {
      const route = getDashboardRoute(profile);
      router.push(route);
    } else {
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ocp-background">
        <div className="text-ocp-gray-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #f5f8f5 0%, #eaf5ea 30%, #e0f0e0 60%, #d5ece0 100%)",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-ocp-green/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-6">
        <div className="bg-white rounded-2xl shadow-xl border border-ocp-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-ocp-green to-ocp-green-dark" />

          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-ocp-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-ocp-green" />
            </div>

            <h1 className="text-2xl font-bold text-ocp-navy mb-2">
              Authentication Successful
            </h1>
            <p className="text-ocp-gray-dark mb-6">
              {user
                ? `Welcome back, ${user.firstName}! You have been authenticated successfully.`
                : "Welcome back! You have been authenticated successfully."}
            </p>

            {user && (
              <div className="bg-ocp-gray rounded-xl p-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-ocp-green/10 rounded-full flex items-center justify-center">
                    <User size={24} className="text-ocp-green" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-ocp-navy">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-ocp-gray-dark">
                      {profile ? `${profile.name}` : user.role}
                      {user.department ? ` · ${user.department}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ocp-border">
                  <Shield size={14} className="text-ocp-green" />
                  <span className="text-xs text-ocp-gray-dark">
                    {user.email}
                  </span>
                  <span className="text-xs text-ocp-gray-dark">·</span>
                  <span className="text-xs font-medium text-green-600">
                    Active
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-ocp-green text-white rounded-xl font-semibold hover:bg-ocp-green-dark transition-all shadow-lg shadow-ocp-green/20"
            >
              Continue to Dashboard
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-ocp-gray-dark mt-3">
              Redirecting in {countdown}s...
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full text-center mt-4 text-sm text-ocp-gray-dark hover:text-ocp-green transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
