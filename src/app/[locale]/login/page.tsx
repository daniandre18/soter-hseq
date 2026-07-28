"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/store/auth-store";
import { useDataStore } from "@/store/data-store";
import type { UserRole } from "@/types";
import { Shield, HardHat, Users, Building2, ChevronRight } from "lucide-react";

const DEMO_ROLES: {
  role: UserRole;
  label: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}[] = [
  {
    role: "admin",
    label: "Administrador",
    name: "Carlos Méndez",
    description: "Acceso total: clientes, órdenes, técnicos, reportes y configuración.",
    icon: Shield,
    color: "text-brand-700",
    bg: "bg-brand-50 hover:bg-brand-100 border-brand-200 hover:border-brand-400",
  },
  {
    role: "coordinator",
    label: "Coordinador",
    name: "Luisa Fernández",
    description: "Crea y asigna órdenes, gestiona agenda y cotizaciones.",
    icon: Users,
    color: "text-purple-700",
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-400",
  },
  {
    role: "technician",
    label: "Técnico",
    name: "Andrés Morales",
    description: "Ve sus órdenes asignadas, registra avance y sube evidencias.",
    icon: HardHat,
    color: "text-orange-700",
    bg: "bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400",
  },
  {
    role: "client",
    label: "Cliente",
    name: "María Torres",
    description: "Consulta servicios, cotizaciones y estado de sus solicitudes.",
    icon: Building2,
    color: "text-green-700",
    bg: "bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-400",
  },
];

export default function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const { login, isAuthenticated, currentUser } = useAuthStore();
  const hydrated = useAuthHydrated();
  const { init } = useDataStore();
  const router = useRouter();

  // Seed data on mount
  useEffect(() => { init(); }, [init]);

  // If already logged in, redirect
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !currentUser) return;
    const homeMap: Record<UserRole, string> = {
      admin:       `/${locale}/admin/dashboard`,
      coordinator: `/${locale}/admin/dashboard`,
      technician:  `/${locale}/tecnico/ordenes`,
      client:      `/${locale}/cliente/portal`,
    };
    router.replace(homeMap[currentUser.role]);
  }, [hydrated, isAuthenticated, currentUser, locale, router]);

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-brand-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl shadow-lg mb-4">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-3xl font-bold text-white">SOTER HSEQ</h1>
        <p className="text-white/50 text-sm mt-1">Gestión Integral HSEQ & SST</p>
      </div>

      {/* Demo card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Modo Demo</h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un perfil para explorar la plataforma
          </p>
        </div>

        <div className="space-y-3">
          {DEMO_ROLES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.role}
                onClick={() => handleLogin(item.role)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 group ${item.bg}`}
              >
                <div className={`p-2 rounded-lg bg-white shadow-sm flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${item.color}`}>{item.label}</p>
                    <span className="text-xs text-gray-400">— {item.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.description}</p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 text-gray-300 group-hover:${item.color} transition-colors`} />
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-xs text-white/30 text-center">
        SOTER HSEQ · administracion@soterhseq.com · Cobertura Nacional, Colombia
      </p>
    </div>
  );
}
