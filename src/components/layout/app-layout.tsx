"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { getRoleHome } from "@/lib/routes";
import type { UserRole } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
  locale: string;
  title: string;
  /** If set, redirect to login if user doesn't have this role (or isn't logged in) */
  requiredRole?: UserRole | UserRole[];
}

export function AppLayout({ children, locale, title, requiredRole }: AppLayoutProps) {
  const { currentUser, isAuthenticated } = useAuthStore();
  const hydrated = useAuthHydrated();
  const { init } = useDataStore();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Bootstrap localStorage data once
  useEffect(() => {
    init();
  }, [init]);

  // Auth guard. No se evalúa antes de la hidratación: hasta entonces
  // `isAuthenticated` es false por defecto, no porque no haya sesión.
  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !currentUser) {
      router.replace(`/${locale}/login`);
      return;
    }
    if (requiredRole) {
      const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowed.includes(currentUser.role)) {
        router.replace(getRoleHome(currentUser.role, locale));
      }
    }
  }, [hydrated, isAuthenticated, currentUser, locale, requiredRole, router]);

  if (!hydrated || !isAuthenticated || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        locale={locale}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} locale={locale} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
