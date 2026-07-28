import { create } from "zustand";
import { persist } from "zustand/middleware";
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
