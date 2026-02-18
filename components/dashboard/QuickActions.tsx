"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, FileText, Users, Settings } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

export function QuickActions() {
  const { can, isAtLeast } = usePermissions();

  const actions = [
    {
      label: "Add Employee",
      href: "/employees/new",
      icon: UserPlus,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      show: can("CREATE_EMPLOYEE"),
    },
    {
      label: "View Employees",
      href: "/employees",
      icon: Users,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      show: can("VIEW_EMPLOYEE"),
    },
    {
      label: "Generate Report",
      href: "/reports",
      icon: FileText,
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      show: can("GENERATE_REPORTS"),
    },
    {
      label: "Administration",
      href: "/admin",
      icon: Settings,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      show: isAtLeast("HRManager"),
    },
  ].filter((a) => a.show);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 rounded-lg p-4 text-center transition-colors ${action.color}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
