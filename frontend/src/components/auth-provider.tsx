"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "@/lib/auth";

export type UserRole = "admin" | "teacher" | "student";

function roleFromEmail(email: string): UserRole | null {
  const prefix = email.split("@")[0];
  if (prefix === "admin") return "admin";
  if (prefix === "teacher") return "teacher";
  if (prefix === "student") return "student";
  return null;
}

type AuthContextType = {
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  dashboardPath: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = getToken();
      const r = typeof window !== "undefined" ? (localStorage.getItem("auth_role") as UserRole | null) : null;
      if (t && r) setRole(r);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const r = roleFromEmail(email.toLowerCase());
    if (!r) throw new Error("Invalid credentials (use admin@, teacher@ or student@)");
    setToken("dummy-token");
    if (typeof window !== "undefined") localStorage.setItem("auth_role", r);
    setRole(r);
    return r;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    if (typeof window !== "undefined") localStorage.removeItem("auth_role");
    setRole(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const dashboardPath = useMemo(() => (role ? `/${role}` : "/"), [role]);

  const value = useMemo<AuthContextType>(() => ({ role, loading, login, logout, dashboardPath }), [role, loading, login, logout, dashboardPath]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof window !== "undefined") {
      // During Fast Refresh or transient client hydration, the provider may not be mounted yet.
      // Return a safe no-op context to avoid crashing the app in dev.
      return {
        role: null,
        loading: false,
        async login() {
          throw new Error("Auth not ready. Please reload and try again.");
        },
        logout() {},
        dashboardPath: "/",
      } satisfies AuthContextType;
    }
    // On server, keep strict to surface real issues
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
