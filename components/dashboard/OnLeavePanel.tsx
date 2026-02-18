"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { leaveService } from "@/services/leaveService";
import { employeeService } from "@/services/employeeService";
import { Employee, EmployeeLeave } from "@/types";
import { getInitials } from "@/lib/utils";
import { CalendarClock, ArrowRight, CalendarDays } from "lucide-react";

type ActiveLeave = EmployeeLeave & { EmployeeName: string; Department: string };

const LEAVE_TYPE_COLORS: Record<string, string> = {
  Sick: "bg-red-50 text-red-600 border-red-200",
  Annual: "bg-blue-50 text-blue-600 border-blue-200",
  Maternity: "bg-pink-50 text-pink-600 border-pink-200",
  Paternity: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Emergency: "bg-orange-50 text-orange-600 border-orange-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function leaveDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function OnLeavePanel() {
  const [activeLeaves, setActiveLeaves] = useState<ActiveLeave[]>([]);
  const [onLeaveEmployees, setOnLeaveEmployees] = useState<Employee[]>([]);
  const [hasLeaveModel, setHasLeaveModel] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const leaves = await leaveService.getActiveLeaves();
        setActiveLeaves(leaves);
        setHasLeaveModel(true);
      } catch {
        // EmployeeLeave table not yet deployed — fall back to Status=OnLeave employees
        setHasLeaveModel(false);
        try {
          const all = await employeeService.getAll();
          setOnLeaveEmployees(all.filter((e) => e.Status === "OnLeave"));
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isEmpty = hasLeaveModel ? activeLeaves.length === 0 : onLeaveEmployees.length === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            Leave Monitoring
          </CardTitle>
          {!isEmpty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              {hasLeaveModel ? activeLeaves.length : onLeaveEmployees.length} on leave
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
            Loading leave data…
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 h-24 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No employees currently on leave</p>
          </div>
        ) : hasLeaveModel ? (
          /* Full leave records view */
          <div className="space-y-3">
            {activeLeaves.map((leave) => {
              const remaining = daysRemaining(leave.EndDate);
              const duration = leaveDuration(leave.StartDate, leave.EndDate);
              const colorClass = LEAVE_TYPE_COLORS[leave.LeaveType] ?? LEAVE_TYPE_COLORS.Other;
              return (
                <div key={leave.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-amber-50 text-amber-600">
                      {getInitials(
                        leave.EmployeeName.split(" ")[0] ?? "",
                        leave.EmployeeName.split(" ")[1] ?? ""
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/employees/${leave.EmployeeID}`}
                        className="text-sm font-semibold hover:text-primary transition-colors truncate"
                      >
                        {leave.EmployeeName}
                      </Link>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {leave.LeaveType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{leave.Department}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatShortDate(leave.StartDate)} → {formatShortDate(leave.EndDate)}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{duration}d total</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${remaining <= 2 ? "text-red-500" : "text-amber-600"}`}>
                      {remaining}d
                    </p>
                    <p className="text-[10px] text-muted-foreground">remaining</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback view when EmployeeLeave table not yet deployed */
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2 px-1">
              Showing employees with On Leave status. Deploy leave tracking schema for detailed records.
            </p>
            {onLeaveEmployees.map((emp) => (
              <div key={emp.EmployeeID} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs font-semibold bg-amber-50 text-amber-600">
                    {getInitials(emp.FirstName, emp.LastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/employees/${emp.EmployeeID}`}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                  >
                    {emp.FirstName} {emp.LastName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{emp.Department} · {emp.Position}</p>
                </div>
                <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-xs shrink-0">
                  On Leave
                </Badge>
              </div>
            ))}
          </div>
        )}

        {!loading && !isEmpty && (
          <div className="pt-3 mt-1 border-t">
            <Link
              href="/employees?status=OnLeave"
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all on-leave employees
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
