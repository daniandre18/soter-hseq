"use client";

import { Bell, Globe, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { ROLE_CONFIG } from "@/lib/utils";

interface HeaderProps {
  title: string;
  locale: string;
  onMenuClick: () => void;
}

export function Header({ title, locale, onMenuClick }: HeaderProps) {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const next = locale === "es" ? "en" : "es";
    // Replace current locale in path
    const newPath = pathname.replace(`/${locale}/`, `/${next}/`);
    router.push(newPath);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between gap-3 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <IconButton
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="md:hidden -ml-1 flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </IconButton>
        <h1 className="text-base font-semibold text-gray-800 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Locale switcher */}
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
          title="Cambiar idioma / Switch language"
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase font-medium">{locale === "es" ? "EN" : "ES"}</span>
        </button>

        {/* Notifications stub */}
        <IconButton
          aria-label="Notificaciones — tienes novedades sin leer"
          tone="muted"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
          />
        </IconButton>

        {/* User pill */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <Avatar name={currentUser.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-gray-800 leading-tight">{currentUser.name}</p>
              <p className="text-xs text-gray-400 leading-tight capitalize">
                {ROLE_CONFIG[currentUser.role].label}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
