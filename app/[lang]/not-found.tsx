import Link from "next/link";
import { Contour } from "@/components/ui/Contour";
import { Arrow } from "@/components/ui/Arrow";
import { getDictionary } from "@/lib/i18n";
import { defaultLocale, href } from "@/lib/i18n/config";

/**
 * Localised 404. not-found boundaries do not receive params, so this renders the default locale
 * copy plus the Arabic line; the layout's own `lang` still governs direction for matched locales.
 */
export default function NotFound() {
  const en = getDictionary(defaultLocale).pages.notFound;
  const ar = getDictionary("ar").pages.notFound;
  const links = [
    { to: "/", en: en.home, ar: ar.home },
    { to: "/properties", en: en.listings, ar: ar.listings },
    { to: "/map", en: en.map, ar: ar.map },
    { to: "/contact", en: en.contact, ar: ar.contact },
  ];
  return (
    <section className="relative overflow-hidden">
      <Contour seed={3} rings={18} className="absolute inset-0 size-full text-forest opacity-50" />
      <div className="wrap relative py-24 md:py-40">
        <p className="numeral text-[clamp(7rem,22vw,18rem)] text-copper" aria-hidden>404</p>
        <p className="annot mt-4 !text-copper">{en.eyebrow}</p>
        <h1 className="display h-lg mt-3 max-w-[16ch] text-balance">{en.title}</h1>
        <p lang="ar" dir="rtl" className="display h-sm mt-3 text-soft">{ar.title}</p>
        <p className="mt-5 max-w-[50ch] text-soft">{en.text}</p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {links.map((l) => (
            <li key={l.to}>
              <Link className="btn" href={href(defaultLocale, l.to)}>{l.en} <span lang="ar" dir="rtl" className="text-mute">/ {l.ar}</span><Arrow /></Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
