"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCog,
  CalendarDays,
  FileText,
  HardHat,
  Building2,
  LogOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

function buildNav(locale: string): NavItem[] {
  return [
    { href: `/${locale}/admin/dashboard`,   label: "Panel",             icon: LayoutDashboard, roles: ["admin","coordinator"] },
    { href: `/${locale}/admin/clientes`,    label: "Clientes",          icon: Building2,       roles: ["admin","coordinator"] },
    { href: `/${locale}/admin/ordenes`,     label: "Órdenes de Trabajo",icon: ClipboardList,   roles: ["admin","coordinator"] },
    { href: `/${locale}/admin/tecnicos`,    label: "Técnicos",          icon: UserCog,         roles: ["admin","coordinator"] },
    { href: `/${locale}/admin/agenda`,      label: "Agenda",            icon: CalendarDays,    roles: ["admin","coordinator"] },
    { href: `/${locale}/admin/cotizaciones`,label: "Cotizaciones",      icon: FileText,        roles: ["admin","coordinator"] },
    { href: `/${locale}/tecnico/ordenes`,   label: "Mis Órdenes",       icon: ClipboardList,   roles: ["technician"] },
    { href: `/${locale}/tecnico/agenda`,    label: "Mi Agenda",         icon: CalendarDays,    roles: ["technician"] },
    { href: `/${locale}/cliente/portal`,    label: "Mi Portal",         icon: HardHat,         roles: ["client"] },
    { href: `/${locale}/cliente/cotizaciones`, label: "Cotizaciones",   icon: FileText,        roles: ["client"] },
  ];
}

interface SidebarProps {
  locale: string;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ locale, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore();
  const { reset } = useDataStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  const navItems = buildNav(locale).filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Backdrop, mobile only */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-navy-900 text-white flex-shrink-0",
          "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:transition-[width] md:duration-300",
          collapsed ? "md:w-16" : "md:w-60"
        )}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight truncate">SOTER HSEQ</p>
            <p className="text-xs text-white/50 truncate">Gestión HSEQ & SST</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden md:inline-flex ml-auto p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onClose}
          className="md:hidden ml-auto p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 pl-2 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 border-l-4",
                    active
                      ? "bg-white/10 text-white border-accent-500"
                      : "text-white/70 hover:bg-white/10 hover:text-white border-transparent"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {/* User */}
        <div className={cn("flex items-center gap-2 px-2 py-2", collapsed && "justify-center")}>
          <Avatar name={currentUser.name} size="sm" className="flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-white/50 truncate capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>

        {/* Reset demo */}
        <button
          onClick={() => { if (confirm("¿Restablecer datos de demo?")) reset(); }}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors",
            collapsed && "justify-center"
          )}
          title="Restablecer demo"
        >
          <RotateCcw className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Restablecer demo"}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors",
            collapsed && "justify-center"
          )}
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
      </aside>
    </>
  );
}
