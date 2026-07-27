"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { User } from "@/types/pocketbase.types";
import { pb } from "@/lib/pocketbase";

interface Session {
  user: User;
}

interface AuthContextProps {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (usernameOrEmail: string, password: string) => Promise<any>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function PocketBaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const syncState = () => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user) {
        setSession({ user });
        setStatus("authenticated");
      } else {
        setSession(null);
        setStatus("unauthenticated");
      }
    } else {
      setSession(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    syncState();

    // Listen to changes in auth store (login/logout events)
    const unsubscribe = pb.authStore.onChange((token, model) => {
      syncState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    setStatus("loading");
    try {
      const res = await authService.login(usernameOrEmail, password);
      syncState();
      return res;
    } catch (error) {
      syncState();
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setSession(null);
    setStatus("unauthenticated");
  };

  const refreshSession = () => {
    syncState();
  };

  return (
    <AuthContext.Provider value={{ session, status, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a PocketBaseAuthProvider");
  }
  return context;
}

/**
 * Drop-in mock/replacement for NextAuth's useSession hook.
 * Simplifies transitioning existing NextAuth pages.
 */
export function useSession() {
  const { session, status } = useAuth();
  return {
    data: session,
    status,
  };
}

/**
 * Drop-in replacement for NextAuth's signOut
 */
export function signOut() {
  authService.logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
