"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * En exportación estática no existe un redirect de servidor: /es y /en se
 * generan como páginas reales que reenvían al login desde el cliente.
 */
export function LocaleRedirect({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/login`);
  }, [router, locale]);

  return null;
}
