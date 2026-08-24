"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, getMe, type BackendUser, type BackendProfile } from "@/lib/api";
import { backendProfileToFrontendRole, backendProfileToEntityType } from "@/lib/roleMapping";
import type { UserRole, EntityType } from "@/types";

interface AuthState {
  user: BackendUser | null;
  profile: BackendProfile | null;
  frontendRole: UserRole;
  entityType: EntityType;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, profileSlug: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [frontendRole, setFrontendRole] = useState<UserRole>("employee-management");
  const [entityType, setEntityType] = useState<EntityType>("employee");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((res) => {
        const u = res.data;
        setUser(u);
        const p = u.profile || null;
        setProfile(p);
        if (p) {
          setFrontendRole(backendProfileToFrontendRole(p));
          setEntityType(backendProfileToEntityType(p));
        }
      })
      .catch(() => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, profileSlug: string) => {
    const res = await apiLogin(email, password, profileSlug);
    const u = res.data.user;
    sessionStorage.setItem("accessToken", res.data.accessToken);
    sessionStorage.setItem("refreshToken", res.data.refreshToken);
    setUser(u);
    const p = u.profile || null;
    setProfile(p);
    if (p) {
      setFrontendRole(backendProfileToFrontendRole(p));
      setEntityType(backendProfileToEntityType(p));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    setProfile(null);
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("selectedProfile");
    sessionStorage.removeItem("selectedRole");
    sessionStorage.removeItem("selectedEntityType");
    sessionStorage.removeItem("currentProfile");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        frontendRole,
        entityType,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
