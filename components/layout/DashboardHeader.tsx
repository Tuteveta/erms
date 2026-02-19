"use client";

import React, { useState, useEffect } from "react";
import { Search, Sun, Sunset, Moon, Sunrise } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import { getRoleLabel } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
type TimeSlot = "morning" | "afternoon" | "evening" | "night";

interface TimeConfig {
  gradient: string;           // animated background gradient
  orbColor: string;           // decorative orb colour
  orbGlow: string;            // orb drop-shadow colour
  textPrimary: string;        // headline class
  textSecondary: string;      // sub-text class
  inputClass: string;         // search input overrides
  btnClass: string;           // icon-button overrides
  badgeClass: string;         // role badge overrides
  notifDot: string;           // notification dot colour
  isNight: boolean;
}

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

// ── Theme configs per time-of-day ────────────────────────────
const CONFIGS: Record<TimeSlot, TimeConfig> = {
  morning: {
    // Warm sunrise: golden amber → soft sky blue
    gradient:
      "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 25%, #BAE6FD 65%, #E0F2FE 100%)",
    orbColor: "#FCD34D",
    orbGlow: "rgba(252, 211, 77, 0.55)",
    textPrimary: "text-amber-900",
    textSecondary: "text-amber-700/80",
    inputClass:
      "bg-white/55 border-white/50 text-gray-700 placeholder:text-gray-400 focus-visible:ring-amber-400",
    btnClass: "text-amber-800 hover:bg-amber-900/10",
    badgeClass:
      "bg-amber-500/20 text-amber-900 border border-amber-400/40",
    notifDot: "bg-amber-500",
    isNight: false,
  },
  afternoon: {
    // Clear blue sky: sky blue → light cyan
    gradient:
      "linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 30%, #DBEAFE 65%, #E0F7FF 100%)",
    orbColor: "#38BDF8",
    orbGlow: "rgba(56, 189, 248, 0.45)",
    textPrimary: "text-sky-900",
    textSecondary: "text-sky-700/80",
    inputClass:
      "bg-white/55 border-white/50 text-gray-700 placeholder:text-gray-400 focus-visible:ring-sky-400",
    btnClass: "text-sky-800 hover:bg-sky-900/10",
    badgeClass:
      "bg-sky-500/20 text-sky-900 border border-sky-400/40",
    notifDot: "bg-sky-500",
    isNight: false,
  },
  evening: {
    // Warm sunset: peach orange → rose → soft violet
    gradient:
      "linear-gradient(135deg, #FED7AA 0%, #FB923C 20%, #F472B6 50%, #C084FC 80%, #A78BFA 100%)",
    orbColor: "#FB923C",
    orbGlow: "rgba(251, 146, 60, 0.6)",
    textPrimary: "text-rose-950",
    textSecondary: "text-rose-900/70",
    inputClass:
      "bg-white/40 border-white/35 text-gray-800 placeholder:text-gray-500 focus-visible:ring-orange-400",
    btnClass: "text-rose-900 hover:bg-rose-900/10",
    badgeClass:
      "bg-orange-500/20 text-orange-950 border border-orange-400/40",
    notifDot: "bg-orange-500",
    isNight: false,
  },
  night: {
    // Deep night sky: midnight blue → indigo
    gradient:
      "linear-gradient(135deg, #0F2044 0%, #1E3A5F 30%, #312E81 65%, #1E1B4B 100%)",
    orbColor: "#C7D2FE",
    orbGlow: "rgba(199, 210, 254, 0.2)",
    textPrimary: "text-white",
    textSecondary: "text-indigo-200/70",
    inputClass:
      "bg-white/10 border-white/15 text-white placeholder:text-white/40 focus-visible:ring-indigo-400",
    btnClass: "text-indigo-100 hover:bg-white/10",
    badgeClass: "bg-white/10 text-indigo-100 border border-white/20",
    notifDot: "bg-indigo-400",
    isNight: true,
  },
};

// Icon per slot
const SLOT_ICONS: Record<TimeSlot, React.ElementType> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

// Night-sky star positions (right-hand side of header)
const STARS = [
  { top: "14%", right: "11%",  size: 2.5, delay: "0s",    dur: "2.8s" },
  { top: "8%",  right: "5%",   size: 2,   delay: "0.7s",  dur: "3.4s" },
  { top: "38%", right: "7%",   size: 1.5, delay: "1.4s",  dur: "2.5s" },
  { top: "5%",  right: "20%",  size: 3,   delay: "0.3s",  dur: "3.9s" },
  { top: "28%", right: "17%",  size: 2,   delay: "1.0s",  dur: "3.1s" },
  { top: "44%", right: "13%",  size: 1.5, delay: "1.8s",  dur: "2.7s" },
  { top: "18%", right: "28%",  size: 2,   delay: "0.5s",  dur: "3.6s" },
  { top: "9%",  right: "33%",  size: 2.5, delay: "1.2s",  dur: "2.9s" },
  { top: "32%", right: "24%",  size: 1.5, delay: "0.9s",  dur: "3.3s" },
  { top: "50%", right: "20%",  size: 2,   delay: "2.1s",  dur: "2.6s" },
];

interface DashboardHeaderProps {
  pageTitle?: string;
  pageDescription?: string;
}

// ── Component ────────────────────────────────────────────────
export function DashboardHeader({ pageTitle, pageDescription }: DashboardHeaderProps = {}) {
  const { user } = useAuth();
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

  // Neutral placeholder while time is loading (prevents hydration mismatch)
  if (!slot) {
    return <div className="h-[120px] bg-gray-100 border-b shrink-0 animate-pulse" />;
  }

  const cfg = CONFIGS[slot];
  const Icon = SLOT_ICONS[slot];
  const greeting = getGreeting(slot);

  return (
    <header
      className="relative overflow-hidden shrink-0 border-b"
      style={{
        background: cfg.gradient,
        backgroundSize: "300% 300%",
        animation: "gradient-pan 14s ease infinite",
      }}
    >
      {/* ── Decorative glow orb ─────────────────────────────── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          top: "-110px",
          right: "8%",
          background: cfg.orbColor,
          filter: "blur(72px)",
          animation: "orb-pulse 5s ease-in-out infinite",
        }}
      />

      {/* ── Secondary softer orb (depth) ────────────────────── */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 140,
          height: 140,
          bottom: "-60px",
          right: "25%",
          background: cfg.orbColor,
          filter: "blur(50px)",
          opacity: 0.2,
          animation: "orb-pulse 7s 2s ease-in-out infinite",
        }}
      />

      {/* ── Night-sky stars ──────────────────────────────────── */}
      {cfg.isNight &&
        STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              top: s.top,
              right: s.right,
              width: s.size,
              height: s.size,
              animation: `star-flicker ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          />
        ))}

      {/* ── Morning/afternoon floating cloud shapes ──────────── */}
      {!cfg.isNight && slot !== "evening" && (
        <>
          <div
            className="absolute rounded-full pointer-events-none opacity-30"
            style={{
              width: 80,
              height: 30,
              top: "30%",
              right: "20%",
              background: "white",
              filter: "blur(8px)",
              animation: "cloud-drift 9s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none opacity-20"
            style={{
              width: 120,
              height: 40,
              top: "55%",
              right: "32%",
              background: "white",
              filter: "blur(10px)",
              animation: "cloud-drift 12s 3s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-6 py-7 gap-4">

        {/* Left — Greeting */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Time icon badge */}
          <div
            className="shrink-0 rounded-2xl p-2.5 backdrop-blur-sm"
            style={{ background: `${cfg.orbColor}25` }}
          >
            <Icon
              className={cn("h-7 w-7", cfg.textPrimary)}
              strokeWidth={1.6}
            />
          </div>

          {/* Text */}
          <div className="min-w-0">
            <p className={cn("text-sm font-medium leading-none mb-1.5", cfg.textSecondary)}>
              {greeting},
            </p>
            <h1
              className={cn(
                "text-2xl font-extrabold leading-tight tracking-tight truncate",
                cfg.textPrimary
              )}
            >
              {user?.name || user?.email}
            </h1>
            <p className={cn("text-xs mt-1.5 leading-none", cfg.textSecondary)}>
              {getRoleLabel(user?.role || "HROfficer")}
              <span className="mx-1.5 opacity-50">·</span>
              {day}
            </p>
          </div>
        </div>

        {/* Right — Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                cfg.textSecondary
              )}
            />
            <Input
              placeholder="Quick search..."
              className={cn(
                "w-52 pl-9 h-9 text-sm rounded-lg border backdrop-blur-sm",
                cfg.inputClass
              )}
            />
          </div>

          {/* Notifications */}
          <NotificationsPanel btnClass={cfg.btnClass} notifDotClass={cfg.notifDot} />

          {/* Role badge */}
          {user && (
            <span
              className={cn(
                "hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                cfg.badgeClass
              )}
            >
              {getRoleLabel(user.role)}
            </span>
          )}
        </div>
      </div>

      {/* ── Page context strip ───────────────────────────────── */}
      {pageTitle && (
        <div
          className="relative z-10 flex items-center gap-2 px-6 pb-4"
          style={{ marginTop: "-8px" }}
        >
          <span className={cn("text-sm font-bold tracking-tight", cfg.textPrimary)}>
            {pageTitle}
          </span>
          {pageDescription && (
            <>
              <span className={cn("text-xs opacity-40", cfg.textPrimary)}>·</span>
              <span className={cn("text-xs", cfg.textSecondary)}>{pageDescription}</span>
            </>
          )}
        </div>
      )}
    </header>
  );
}
