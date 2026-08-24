"use client";

import Image from "next/image";
import {
  Briefcase,
  Shield,
  Users,
  Monitor,
  Bell,
  User,
  Truck,
  Handshake,
  Package,
  GraduationCap,
  ArrowRight,
  Wrench,
  FlaskConical,
  Zap,
  Building2,
  Cog,
  HardHat,
  Leaf,
  Code,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { AuthCard as AuthCardType } from "@/types";
import { profileIconPaths } from "@/lib/profileIcons";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  shield: Shield,
  users: Users,
  monitor: Monitor,
  bell: Bell,
  user: User,
  truck: Truck,
  handshake: Handshake,
  package: Package,
  "graduation-cap": GraduationCap,
  wrench: Wrench,
  flask: FlaskConical,
  zap: Zap,
  building: Building2,
  "building-2": Building2,
  cog: Cog,
  "hard-hat": HardHat,
  leaf: Leaf,
  code: Code,
  "clipboard-list": ClipboardList,
  "user-check": UserCheck,
};

export default function AuthCard({
  card,
  onClick,
}: {
  card: AuthCardType;
  onClick: () => void;
}) {
  const Icon = iconMap[card.icon] || User;
  const profileSvg = profileIconPaths[card.id];

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      style={{ minHeight: "180px" }}
    >
      <div className="glass-card relative w-full h-full min-h-[180px] p-6 group-hover:bg-white/[0.12]">
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
          style={{
            background: `radial-gradient(circle, ${card.color}, transparent)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {profileSvg ? (
            <Image
              src={profileSvg}
              alt={card.title}
              width={48}
              height={48}
              className="mb-4 transition-transform duration-300 group-hover:scale-110"
              style={{ color: card.color }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${card.color}30` }}
            >
              <Icon size={24} style={{ color: card.color }} />
            </div>
          )}

          <h3 className="text-white font-semibold text-lg">{card.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{card.subtitle}</p>

          <div
            className="flex items-center gap-1 mt-4 text-sm font-medium group-hover:gap-2 transition-all"
            style={{ color: card.color }}
          >
            <span>Continue</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </button>
  );
}
