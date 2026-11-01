import { DictScope } from "@/components/providers/DictScope";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

/** Adds the "admin: d.admin" copy to the client dictionary for this route only (see DictScope). */
export default async function Layout({ children, params }: LayoutProps<"/[lang]/login">) {
  const { lang } = await params;
  if (!isLocale(lang)) return <>{children}</>;
  const d = getDictionary(lang);
  return <DictScope ns={{ admin: d.admin }}>{children}</DictScope>;
}
