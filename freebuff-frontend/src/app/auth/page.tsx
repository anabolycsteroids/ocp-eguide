"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OcpLogo from "@/components/OcpLogo";
import AuthCardComponent from "@/components/AuthCard";
import { authCards } from "@/lib/data";
import { AuthCard as AuthCardType, EntityType } from "@/types";
import { ArrowLeft, Search } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n";

export default function AuthPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedEntity, setSelectedEntity] = useState<EntityType | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = authCards.filter((card) => {
    const matchesEntity =
      selectedEntity === "all" || card.entityType === selectedEntity;
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEntity && matchesSearch;
  });

  const handleCardClick = (card: AuthCardType) => {
    sessionStorage.setItem("selectedRole", card.role);
    sessionStorage.setItem("selectedEntityType", card.entityType);
    router.push(`/auth/login?role=${card.role}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, #f5f8f5 0%, #eaf5ea 30%, #e0f0e0 60%, #d5ece0 100%)",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-ocp-green/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-ocp-green/8 blur-2xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-ocp-gray-dark hover:text-ocp-navy transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t("auth.backToHome")}</span>
          </button>
          <LanguageSelector variant="light" />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <OcpLogo size="120px" />
          </div>
          <h1 className="text-3xl font-bold text-ocp-navy">
            {t("auth.selectRole")}
          </h1>
          <p className="text-ocp-gray-dark mt-2 max-w-md mx-auto">
            {t("auth.selectRoleDesc")}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ocp-gray-dark"
            />
            <input
              type="text"
              placeholder={t("auth.searchRoles")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-ocp-border rounded-xl text-sm focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green"
            />
          </div>

          {/* Entity type filter */}
          <div className="flex bg-white border border-ocp-border rounded-xl p-1">
            {(
              [
                { value: "all", label: t("auth.all") },
                { value: "employee", label: t("auth.employees") },
                { value: "intern", label: t("auth.interns") },
                { value: "visitor", label: t("auth.visitors") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedEntity(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedEntity === tab.value
                    ? "bg-ocp-green text-white shadow-sm"
                    : "text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity section labels */}
        {selectedEntity === "all" && (
          <>
            {/* Employee cards */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-ocp-gray-dark uppercase tracking-wider mb-4">
                {t("auth.employeeAccess")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredCards
                  .filter((c) => c.entityType === "employee")
                  .map((card) => (
                    <AuthCardComponent
                      key={card.id}
                      card={card}
                      onClick={() => handleCardClick(card)}
                    />
                  ))}
              </div>
            </div>

            {/* Visitor cards */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-ocp-gray-dark uppercase tracking-wider mb-4">
                {t("auth.visitorAccess")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCards
                  .filter((c) => c.entityType === "visitor")
                  .map((card) => (
                    <AuthCardComponent
                      key={card.id}
                      card={card}
                      onClick={() => handleCardClick(card)}
                    />
                  ))}
              </div>
            </div>
          </>
        )}

        {selectedEntity !== "all" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map((card) => (
              <AuthCardComponent
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ocp-gray-dark text-lg">{t("auth.noMatchingRoles")}</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedEntity("all");
              }}
              className="mt-4 px-4 py-2 text-ocp-green hover:text-ocp-green-dark font-medium text-sm"
            >
              {t("auth.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
