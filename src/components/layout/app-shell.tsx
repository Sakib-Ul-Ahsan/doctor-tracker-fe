"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useCurrentAdmin, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/",
  },
  {
    href: "/doctors",
    label: "Doctors",
    icon: Stethoscope,
    match: (pathname: string) => pathname.startsWith("/doctors"),
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
    match: (pathname: string) => pathname.startsWith("/patients"),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Clinical Admin
      </p>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-teal-50 text-teal-700 shadow-2xs ring-1 ring-teal-200/70"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-700"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="border-t border-slate-200/80 p-3">
      <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
          {admin ? getInitials(admin.name) : "AD"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-900">
            {admin?.name || "Administrator"}
          </p>
          <p className="truncate text-[11px] text-slate-500">{admin?.email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="w-full justify-start gap-2.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
      >
        <LogOut className="h-4 w-4" />
        <span>{logout.isPending ? "Signing out..." : "Logout"}</span>
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200/90 lg:bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs shadow-teal-600/20">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-tight text-slate-900">
              Doctor Tracker
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700">
              <ShieldCheck className="h-3 w-3" />
              Admin Portal
            </span>
          </div>
        </div>
        {renderNavLinks()}
        {renderSidebarFooter()}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-900">Doctor Tracker</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavLinks(() => setMobileOpen(false))}
            {renderSidebarFooter()}
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top Mobile Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold text-slate-900">Doctor Tracker</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-slate-600 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Logout</span>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

