import { routing } from "@/i18n/routing";
import { LocaleRedirect } from "./locale-redirect";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleRoot({ params }: { params: { locale: string } }) {
  return <LocaleRedirect locale={params.locale} />;
}
