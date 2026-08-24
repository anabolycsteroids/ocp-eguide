"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function AuthErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #f5f8f5 0%, #fef2f2 30%, #fee2e2 60%, #fecaca 100%)",
        }}
      />

      {/* Error glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-6">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-ocp-border overflow-hidden">
          {/* Red top bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />

          <div className="p-8 text-center">
            {/* Error icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-ocp-navy mb-2">
              Authentication Failed
            </h1>
            <p className="text-ocp-gray-dark mb-6">
              We couldn&apos;t verify your identity. Please check your
              credentials and try again.
            </p>

            {/* Error details */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Possible causes:
              </h3>
              <ul className="text-sm text-red-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                  Invalid badge number or PIN
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                  Account has been deactivated
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                  Too many failed attempts
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth")}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-ocp-green text-white rounded-xl font-semibold hover:bg-ocp-green-dark transition-all shadow-lg shadow-ocp-green/20"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center justify-center gap-2 py-3 text-ocp-gray-dark hover:text-ocp-navy font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center mt-4 text-sm text-ocp-gray-dark">
          Need help? Contact{" "}
          <a href="#" className="text-ocp-green hover:underline">
            support@ocp.ma
          </a>
        </p>
      </div>
    </div>
  );
}
