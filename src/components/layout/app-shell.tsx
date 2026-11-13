"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useCurrentAdmin, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
  shortcut: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/",
    shortcut: "⌘1",
  },
  {
    href: "/doctors",
    label: "Physicians",
    icon: Stethoscope,
    match: (pathname: string) => pathname.startsWith("/doctors"),
    shortcut: "⌘2",
  },
  {
    href: "/patients",
    label: "Patients Registry",
    icon: Users,
    match: (pathname: string) => pathname.startsWith("/patients"),
    shortcut: "⌘3",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: admin } = useCurrentAdmin();
  const logout = useLogout();

  // Determine current active page label for top header
  const currentNav = NAV_ITEMS.find((item) => item.match(pathname));
  const pageTitle = pathname.startsWith("/doctors/")
    ? "Doctor Profile"
    : pathname.startsWith("/patients/")
      ? "Patient Record"
      : currentNav?.label ?? "Overview";

  const renderNavLinks = (isMini = false, onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {!isMini ? (
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Clinical Modules
          </span>
          <span className="text-[10px] font-medium text-slate-400">v1.2</span>
        </div>
      ) : null}

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={isMini ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10 font-semibold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              isMini && "justify-center px-0 py-3"
            )}
          >
            {active && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-500" />
            )}
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                active ? "text-blue-400" : "text-slate-400 group-hover:text-slate-700"
              )}
            />
            {!isMini ? (
              <div className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>
                <span
                  className={cn(
                    "text-[10px] font-mono tracking-wider transition-colors",
                    active ? "text-slate-400" : "text-slate-300 group-hover:text-slate-400"
                  )}
                >
                  {item.shortcut}
                </span>
              </div>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = (isMini = false) => (
    <div className={cn("border-t border-slate-200/90 p-3", isMini && "px-2 py-3")}>
      {!isMini ? (
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-blue-900 text-xs font-bold text-white shadow-xs">
            {admin ? getInitials(admin.name) : "AD"}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold text-slate-900">
                {admin?.name || "Administrator"}
              </p>
            </div>
            <p className="truncate text-[11px] text-slate-500">{admin?.email}</p>
          </div>
        </div>
      ) : (
        <div
          className="mb-2 flex justify-center"
          title={`${admin?.name || "Administrator"} (${admin?.email || ""})`}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-blue-900 text-xs font-bold text-white">
            {admin ? getInitials(admin.name) : "AD"}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        title="Sign out of administration console"
        className={cn(
          "w-full gap-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors",
          isMini ? "justify-center px-0" : "justify-start px-2.5"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!isMini ? <span>{logout.isPending ? "Signing out..." : "Sign Out"}</span> : null}
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col lg:border-r lg:border-slate-200/90 lg:bg-white transition-all duration-200 ease-in-out",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-slate-200/90 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-700 text-white shadow-xs">
              <HeartPulse className="h-5 w-5 text-blue-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight text-slate-900">
                  Doctor Tracker
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
                  <ShieldCheck className="h-3 w-3" />
                  Clinical Admin
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {renderNavLinks(collapsed)}
        {renderSidebarFooter(collapsed)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <HeartPulse className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900">Doctor Tracker</span>
                  <span className="block text-[10px] text-blue-600 font-medium">
                    Healthcare OS
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNavLinks(false, () => setMobileOpen(false))}
            {renderSidebarFooter(false)}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-all duration-200 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb & Section title */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/"
                className="font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Doctor Tracker
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-900">{pageTitle}</span>
            </div>
          </div>

          {/* Top Actions: Search Quick Action & Live Status */}
          <div className="flex items-center gap-3">
            {/* Quick Search Shortcut Bar */}
            <div
              onClick={() => router.push("/patients")}
              className="hidden sm:flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white cursor-pointer transition-all"
              title="Jump to search"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search patients or doctors...</span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Operational Health Badge */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Clinical System Online</span>
            </div>

            {/* Profile Avatar Quick Link */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-2xs"
                title={admin?.name}
              >
                {admin ? getInitials(admin.name) : "AD"}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
