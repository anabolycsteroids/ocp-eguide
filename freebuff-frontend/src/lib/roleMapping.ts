import type { BackendProfile } from "./api";
import type { UserRole, EntityType } from "@/types";

const VALID_ROLES = new Set<string>([
  "employee-management", "employee-reception", "employee-hr", "employee-it", "employee-security",
  "intern-mechanical", "intern-chemical", "intern-electrical", "intern-civil", "intern-industrial",
  "intern-hse", "intern-environmental", "intern-computer-science",
  "visitor-client", "visitor-delivery", "visitor-partner", "visitor-supplier",
  "visitor-collaborator", "visitor-contractor",
]);

export function backendProfileToFrontendRole(profile: BackendProfile): UserRole {
  if (VALID_ROLES.has(profile.slug)) return profile.slug as UserRole;
  return "employee-management";
}

export function backendProfileToEntityType(profile: BackendProfile): EntityType {
  if (profile.category === "employee") return "employee";
  if (profile.category === "intern") return "intern";
  return "visitor";
}

export function getDashboardRoute(profile: BackendProfile): string {
  return profile.dashboardRoute || "/dashboard";
}
