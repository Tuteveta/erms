"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OnLeavePanel } from "@/components/dashboard/OnLeavePanel";
import { employeeService } from "@/services/employeeService";
import { documentService } from "@/services/documentService";
import { Users, UserCheck, UserX, FileText, CalendarClock } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, onLeave: 0 });
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    employeeService.getStats().then(setStats);
    documentService.getTotalCount().then(setTotalDocs);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Time-aware greeting header */}
      <DashboardHeader />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard
            title="Total Employees"
            value={stats.total}
            description="All registered staff"
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Active Employees"
            value={stats.active}
            description="Currently serving"
            icon={UserCheck}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatsCard
            title="On Leave"
            value={stats.onLeave}
            description="Currently on leave"
            icon={CalendarClock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatsCard
            title="Inactive Employees"
            value={stats.inactive}
            description="Retired / transferred"
            icon={UserX}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
          <StatsCard
            title="Documents"
            value={totalDocs}
            description="Files in secure storage"
            icon={FileText}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>

        {/* Leave Monitoring + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OnLeavePanel />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
