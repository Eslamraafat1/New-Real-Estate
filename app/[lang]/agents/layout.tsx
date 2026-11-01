import { DictScope } from "@/components/providers/DictScope";
import { getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";

/** Adds the "pages: d.pages" copy to the client dictionary for this route only (see DictScope). */
export default async function Layout({ children, params }: LayoutProps<"/[lang]/agents">) {
  const { lang } = await params;
  if (!isLocale(lang)) return <>{children}</>;
  const d = getDictionary(lang);
  return <DictScope ns={{ pages: d.pages }}>{children}</DictScope>;
}
