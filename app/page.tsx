"use client";

import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Users,
  FileText,
  BarChart3,
  CloudUpload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Granular permission management across Super Admin, HR Manager, and HR Officer roles — every action is authorised and logged.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Create, update, and manage complete employee profiles with full audit trails, search, and department-level filtering.",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: CloudUpload,
    title: "Secure Document Storage",
    description:
      "Upload, retrieve, and manage official PDF documents in encrypted cloud storage with role-controlled access.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: BarChart3,
    title: "Reports & Audit Logs",
    description:
      "Generate printable employee summaries, apply department and status filters, and export audit-ready records on demand.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
];

const highlights = [
  "Centralised employee records",
  "Printable HR reports",
  "Secure document handling",
  "Least-privilege permission design",
  "Compliance-ready audit logs",
  "Cloud-native scalability",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 leading-none">ERMS</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Employee Record Management System
              </p>
            </div>
          </div>

          {/* Login CTA */}
          <Button asChild size="sm" className="gap-2">
            <Link href="/login">
              Login to Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="flex-1">

        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Secure, Cloud-Based
              <br />
              <span className="text-primary">HR Management</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
              A centralised, audit-ready platform for managing employee records,
              official documents, and access controls — built to meet government
              and enterprise compliance standards.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link href="/login">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Highlights strip */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {highlights.map((h) => (
                <span key={h} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  {h}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Capabilities */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Platform Capabilities</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Everything your HR team needs to operate efficiently, securely, and with full
              accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featureCards.map(({ icon: Icon, title, description, color, bg, border }) => (
              <div
                key={title}
                className={`rounded-xl border ${border} ${bg} p-6 space-y-4 hover:shadow-md transition-shadow`}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{title}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="bg-primary">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to manage your HR records?</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">
                Sign in with your assigned credentials to access the portal.
              </p>
            </div>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="gap-2 shrink-0 font-semibold"
            >
              <Link href="/login">
                Login to Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">ERMS</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2026 Employee Record Management System. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Secure · Compliant · Cloud-Native</p>
        </div>
      </footer>
    </div>
  );
}
