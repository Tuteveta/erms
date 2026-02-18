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
      setUser(authUser);
      router.push("/dashboard");
      return authUser;
    },
    [router]
  );

  const completeNewPassword = useCallback(
    async (newPassword: string) => {
      const authUser = await authService.completeNewPassword(newPassword);
      setUser(authUser);
      router.push("/dashboard");
      return authUser;
    },
    [router]
  );

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email);
  }, []);

  const confirmForgotPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await authService.confirmForgotPassword(email, code, newPassword);
    },
    []
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, signIn, completeNewPassword, forgotPassword, confirmForgotPassword, signOut };
}
