import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { User, UserRole } from "@/types";
import { SEED_DATA } from "@/lib/seed-data";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

/** Demo login — picks the first user matching the given role from seed data. */
function getDemoUser(role: UserRole): User {
  const user = SEED_DATA.users.find((u) => u.role === role);
  if (!user) throw new Error(`No demo user for role: ${role}`);
  return user;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (role: UserRole) => {
        const user = getDemoUser(role);
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    {
      name: "soter_hseq_auth",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Indica si el estado persistido ya se leyó desde localStorage.
 *
 * `persist` rehidrata de forma asíncrona: en el primer render `isAuthenticated`
 * siempre es `false`, aunque haya sesión guardada. Quien mire ese valor sin
 * esperar la hidratación concluirá "no autenticado" y expulsará al login a
 * cualquiera que recargue una ruta interna.
 */
export function useAuthHydrated(): boolean {
  // Arranca en false también en el cliente: el primer render debe coincidir con
  // el HTML pre-generado, donde nunca hay sesión.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // La API de persist solo existe en el navegador; en el prerender no.
    const api = useAuthStore.persist;
    if (!api) {
      setHydrated(true);
      return;
    }
    if (api.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return api.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
