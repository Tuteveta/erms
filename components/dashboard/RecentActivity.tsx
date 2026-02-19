"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityLogService, ActivityLogEntry } from "@/services/activityLogService";
import { formatDateTime } from "@/lib/utils";
import { UserPlus, Edit2, Trash2, Upload, Shield, CalendarClock, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

const ACTION_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Employee Created":    { icon: UserPlus,     color: "text-green-600",  bg: "bg-green-50" },
  "Employee Updated":    { icon: Edit2,        color: "text-blue-600",   bg: "bg-blue-50" },
  "Employee Deleted":    { icon: Trash2,       color: "text-red-600",    bg: "bg-red-50" },
  "Document Uploaded":   { icon: Upload,       color: "text-purple-600", bg: "bg-purple-50" },
  "Document Deleted":    { icon: Trash2,       color: "text-red-500",    bg: "bg-red-50" },
  "Leave Recorded":      { icon: CalendarClock,color: "text-amber-600",  bg: "bg-amber-50" },
  "Leave Deleted":       { icon: CalendarClock,color: "text-orange-500", bg: "bg-orange-50" },
  "HR Officer Created":  { icon: Shield,       color: "text-indigo-600", bg: "bg-indigo-50" },
  "HR Officer Removed":  { icon: Trash2,       color: "text-red-600",    bg: "bg-red-50" },
  "Permissions Updated": { icon: Shield,       color: "text-slate-500",  bg: "bg-slate-100" },
};
const DEFAULT_ICON = { icon: Activity, color: "text-gray-500", bg: "bg-gray-100" };

export function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelAvailable, setModelAvailable] = useState(true);

  useEffect(() => {
    activityLogService.getRecent(8)
      .then(setLogs)
      .catch(() => setModelAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 pb-2">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            Loading activity…
          </div>
        ) : !modelAvailable ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm text-center px-4">
            Activity log not yet deployed. Run{" "}
            <code className="mx-1 font-mono bg-muted px-1 rounded">npx ampx sandbox</code> to enable.
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 h-24 text-center">
            <Activity className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const cfg = ACTION_ICON[log.Action] ?? DEFAULT_ICON;
            const Icon = cfg.icon;
            const isLast = index === logs.length - 1;
            return (
              <div key={log.id} className="relative flex items-start gap-3 py-3">
                {!isLast && (
                  <div className="absolute left-[18px] top-[44px] bottom-0 w-px bg-border" />
                )}
                <div className={`relative z-10 rounded-full p-2 ${cfg.bg} shrink-0 mt-0.5`}>
                  <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0 pb-0.5">
                  <p className="text-sm font-semibold leading-snug">{log.Action}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{log.Description}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <p className="text-xs text-muted-foreground/60">{formatDateTime(log.CreatedAt)}</p>
                    <span className="text-muted-foreground/30 text-xs">·</span>
                    <p className="text-xs text-muted-foreground/60 truncate">{log.UserName ?? log.UserEmail}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!loading && modelAvailable && logs.length > 0 && (
          <div className="pt-2 pb-1 border-t mt-1">
            <Link
              href="/employees"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all employees
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
