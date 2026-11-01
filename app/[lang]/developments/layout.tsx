import { DictScope } from "@/components/providers/DictScope";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

/** Adds the "property: d.property" copy to the client dictionary for this route only (see DictScope). */
export default async function Layout({ children, params }: LayoutProps<"/[lang]/developments">) {
  const { lang } = await params;
  if (!isLocale(lang)) return <>{children}</>;
  const d = getDictionary(lang);
  return <DictScope ns={{ property: d.property }}>{children}</DictScope>;
}
