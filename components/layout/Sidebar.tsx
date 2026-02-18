"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getRoleLabel } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SuperAdmin", "HRManager", "HROfficer"],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["SuperAdmin", "HRManager", "HROfficer"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["SuperAdmin", "HRManager"],
  },
  {
    label: "Administration",
    href: "/admin",
    icon: Settings,
    roles: ["SuperAdmin", "HRManager"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { is } = usePermissions();

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => is(role as any))
  );

  return (
    <aside className="relative z-10 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-[1px_0_20px_rgba(0,0,0,0.25)]">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-white tracking-wide">ERMS</p>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">HR Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/30 mb-1">
          Menu
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/10 text-white shadow-sm border-l-2 border-primary ml-[-1px] pl-[11px]"
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
              <span>{item.label}</span>
              {active && <ChevronRight className="ml-auto h-3 w-3 text-sidebar-foreground/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border/40" />

      {/* User Profile & Sign Out */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-white/10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user ? getInitials(user.name?.split(" ")[0] || user.email[0], user.name?.split(" ")[1] || user.email[1]) : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-sidebar-foreground/40 truncate mt-0.5">
              {user ? getRoleLabel(user.role) : ""}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
