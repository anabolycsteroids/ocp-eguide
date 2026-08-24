export type UserRole =
  // Employee profiles (5)
  | "employee-management"
  | "employee-reception"
  | "employee-hr"
  | "employee-it"
  | "employee-security"
  // Intern profiles (8)
  | "intern-mechanical"
  | "intern-chemical"
  | "intern-electrical"
  | "intern-civil"
  | "intern-industrial"
  | "intern-hse"
  | "intern-environmental"
  | "intern-computer-science"
  // Visitor profiles (6)
  | "visitor-client"
  | "visitor-delivery"
  | "visitor-partner"
  | "visitor-supplier"
  | "visitor-collaborator"
  | "visitor-contractor";

export type EntityType = "employee" | "intern" | "visitor";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  entityType: EntityType;
  department?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  badge?: string;
  status?: "active" | "inactive" | "pending";
}

export interface AuthCard {
  id: string;
  title: string;
  subtitle: string;
  role: UserRole;
  entityType: EntityType;
  icon: string;
  color: string;
  emailSlug: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color?: string;
}
