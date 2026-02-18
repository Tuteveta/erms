"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading ERMS...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
