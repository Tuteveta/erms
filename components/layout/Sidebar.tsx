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
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { getRoleLabel } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useSidebar } from "@/components/layout/SidebarContext";

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
  const { open, close } = useSidebar();

  const visibleItems = navItems.filter((item) =>
    item.roles.some((role) => is(role as any))
  );

  return (
    <aside
      className={cn(
        // Base layout
        "flex flex-col w-64 shrink-0 bg-white border-r border-border/50",
        // Mobile: fixed overlay that slides in/out
        "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out shadow-xl",
        // Desktop: back in normal flow, always visible
        "lg:static lg:z-10 lg:shadow-[2px_0_8px_rgba(0,0,0,0.04)] lg:translate-x-0",
        // Mobile open/closed state
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo + mobile close button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/60">
        <Image
          src="/ict-logo.png"
          alt="ICT Logo"
          width={140}
          height={40}
          className="h-10 object-contain"
          style={{ width: "auto" }}
          priority
        />
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="lg:hidden rounded-lg p-1.5 text-foreground/50 hover:bg-black/5 hover:text-foreground transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-foreground/30 mb-1">
          Menu
        </p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary shadow-sm border-l-2 border-primary ml-[-1px] pl-[11px]"
                  : "text-foreground/50 hover:bg-black/5 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
              <span>{item.label}</span>
              {active && <ChevronRight className="ml-auto h-3 w-3 text-primary/40" />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* User Profile & Sign Out */}
      <div className="px-3 py-4 space-y-1">
        <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-black/10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user ? getInitials(user.name?.split(" ")[0] || user.email[0], user.name?.split(" ")[1] || user.email[1]) : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user ? getRoleLabel(user.role) : ""}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
