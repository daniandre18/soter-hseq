"use client";

import { Bell, Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { ROLE_CONFIG } from "@/lib/utils";

interface HeaderProps {
  title: string;
  locale: string;
}

export function Header({ title, locale }: HeaderProps) {
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
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-3">
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
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

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
