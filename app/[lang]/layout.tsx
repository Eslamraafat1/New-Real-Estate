import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Fraunces, Manrope, Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AppProvider } from "@/components/providers/AppProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareTray } from "@/components/layout/CompareTray";
import { dirOf, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { apiConfig } from "@/lib/api/config";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const naskh = Noto_Naskh_Arabic({ variable: "--font-naskh", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ variable: "--font-plex-ar", subsets: ["arabic"], weight: ["400", "500", "600", "700"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(apiConfig.siteUrl),
    title: { default: `${t.common.brand} — ${t.common.tagline}`, template: `%s — ${t.common.brand}` },
    description: t.footer.blurb,
    alternates: { canonical: `/${lang}`, languages: { en: "/en", ar: "/ar" } },
    openGraph: { siteName: t.common.brand, title: `${t.common.brand} — ${t.common.tagline}`, description: t.footer.blurb, locale: lang === "ar" ? "ar_AR" : "en_US", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#efeae0" }, { media: "(prefers-color-scheme: dark)", color: "#121311" }],
};

// Runs before first paint: resolves the stored / system theme so there is no flash.
const themeScript = `(function(){try{var p=localStorage.getItem('atlas-theme');p=p?JSON.parse(p):'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return (
    <html lang={lang} dir={dirOf(lang)} suppressHydrationWarning className={`${fraunces.variable} ${manrope.variable} ${naskh.variable} ${plex.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProvider lang={lang} dict={dict}>
          <a href="#main" className="skip-link">{dict.common.skipToContent}</a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CompareTray />
        </AppProvider>
      </body>
    </html>
  );
}
