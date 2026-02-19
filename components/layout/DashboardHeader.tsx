"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Sunset, Moon, Sunrise, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/auth";
import { useSidebar } from "@/components/layout/SidebarContext";

// ── Types ────────────────────────────────────────────────────
type TimeSlot = "morning" | "afternoon" | "evening" | "night";

// ── Helpers ──────────────────────────────────────────────────
function getSlot(hour: number): TimeSlot {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

function getGreeting(slot: TimeSlot) {
  if (slot === "morning") return "Good Morning";
  if (slot === "afternoon") return "Good Afternoon";
  if (slot === "evening") return "Good Evening";
  return "Good Night";
}

function formatDay(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SLOT_ICONS: Record<TimeSlot, React.ElementType> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

interface DashboardHeaderProps {
  pageTitle?: string;
  pageDescription?: string;
}

// ── Component ────────────────────────────────────────────────
export function DashboardHeader({ pageTitle, pageDescription }: DashboardHeaderProps = {}) {
  const { user } = useAuth();
  const { toggle } = useSidebar();
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [day, setDay] = useState("");

  useEffect(() => {
    const update = () => {
      setSlot(getSlot(new Date().getHours()));
      setDay(formatDay());
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!slot) {
    return <div className="h-[72px] bg-white border-b shrink-0 animate-pulse" />;
  }

  const Icon = SLOT_ICONS[slot];
  const greeting = getGreeting(slot);

  return (
    <header className="relative shrink-0 border-b bg-white">
      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 gap-4">

        {/* Left — Hamburger (mobile) + Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={toggle}
            className="lg:hidden shrink-0 rounded-lg p-2 text-foreground/60 hover:bg-black/5 hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Time icon badge */}
          <div className="shrink-0 rounded-xl p-2 bg-primary/8 border border-primary/12">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
          </div>

          {/* Text */}
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground leading-none mb-1">
              {greeting},
            </p>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground truncate">
              {user?.name || user?.email}
            </h1>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Date */}
          <span className="hidden lg:block text-xs text-muted-foreground mr-2">{day}</span>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Quick search..."
              className="w-48 pl-9 h-9 text-sm rounded-lg border bg-muted/40 placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
            />
          </div>

          {/* Notifications */}
          <NotificationsPanel btnClass="text-foreground/60 hover:bg-black/5 hover:text-foreground" notifDotClass="bg-primary" />

          {/* Role badge */}
          {user && (
            <span className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {getRoleLabel(user.role)}
            </span>
          )}
        </div>
      </div>

      {/* ── Page context strip ───────────────────────────────── */}
      {pageTitle && (
        <div className="flex items-center gap-2 px-6 pb-3 -mt-1">
          <span className="text-sm font-semibold text-foreground">{pageTitle}</span>
          {pageDescription && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground">{pageDescription}</span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
