"use client";

import React, { useEffect, useRef, useState } from "react";
import { activityLogService, ActivityLogEntry } from "@/services/activityLogService";
import { formatDateTime } from "@/lib/utils";
import { Bell, UserPlus, Edit2, Trash2, Upload, Shield, CalendarClock, Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTION_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Employee Created":    { icon: UserPlus,      color: "text-green-600",  bg: "bg-green-100" },
  "Employee Updated":    { icon: Edit2,         color: "text-blue-600",   bg: "bg-blue-100" },
  "Employee Deleted":    { icon: Trash2,        color: "text-red-600",    bg: "bg-red-100" },
  "Document Uploaded":   { icon: Upload,        color: "text-purple-600", bg: "bg-purple-100" },
  "Document Deleted":    { icon: Trash2,        color: "text-red-500",    bg: "bg-red-100" },
  "Leave Recorded":      { icon: CalendarClock, color: "text-amber-600",  bg: "bg-amber-100" },
  "Leave Deleted":       { icon: CalendarClock, color: "text-orange-500", bg: "bg-orange-100" },
  "HR Officer Created":  { icon: Shield,        color: "text-indigo-600", bg: "bg-indigo-100" },
  "HR Officer Removed":  { icon: Trash2,        color: "text-red-600",    bg: "bg-red-100" },
  "Permissions Updated": { icon: Shield,        color: "text-slate-600",  bg: "bg-slate-100" },
};
const DEFAULT_ICON = { icon: Activity, color: "text-gray-500", bg: "bg-gray-100" };

interface NotificationsPanelProps {
  btnClass?: string;
  notifDotClass?: string;
}

export function NotificationsPanel({ btnClass, notifDotClass }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modelAvailable, setModelAvailable] = useState(true);
  const [lastSeen, setLastSeen] = useState<string>(() =>
    typeof window !== "undefined" ? (localStorage.getItem("notif_last_seen") ?? "") : ""
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await activityLogService.getRecent(10);
      setLogs(data);
      setModelAvailable(true);
    } catch {
      setModelAvailable(false);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen((prev) => {
      if (!prev) {
        loadNotifications();
      }
      return !prev;
    });
  }

  function markAllRead() {
    const now = new Date().toISOString();
    setLastSeen(now);
    if (typeof window !== "undefined") localStorage.setItem("notif_last_seen", now);
  }

  const unreadCount = logs.filter((l) => !lastSeen || l.CreatedAt > lastSeen).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative h-9 w-9 rounded-lg", btnClass)}
        onClick={handleOpen}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute top-1 right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-0.5",
              notifDotClass ?? "bg-red-500"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                Loading…
              </div>
            ) : !modelAvailable ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-xs text-center px-4">
                Activity log not deployed yet. Run <code className="mx-1 font-mono bg-muted px-1 rounded">npx ampx sandbox</code>.
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 h-24 text-center">
                <Bell className="h-7 w-7 text-muted-foreground/25" />
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log) => {
                  const cfg = ACTION_ICON[log.Action] ?? DEFAULT_ICON;
                  const Icon = cfg.icon;
                  const isUnread = !lastSeen || log.CreatedAt > lastSeen;
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                        isUnread && "bg-primary/5"
                      )}
                    >
                      <div className={`rounded-full p-1.5 ${cfg.bg} shrink-0 mt-0.5`}>
                        <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold leading-snug">{log.Action}</p>
                          {isUnread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{log.Description}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-1">
                          {formatDateTime(log.CreatedAt)} · {log.UserName ?? log.UserEmail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
