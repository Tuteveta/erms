"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types";
import { authService } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const authUser = await authService.signIn(email, password);
      if (typeof window !== "undefined") {
        localStorage.setItem("erms_user", JSON.stringify(authUser));
      }
      setUser(authUser);
      router.push("/dashboard");
      return authUser;
    },
    [router]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("erms_user");
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, signIn, signOut };
}
