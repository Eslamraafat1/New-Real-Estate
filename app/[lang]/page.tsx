import { HomeDataProvider } from "@/components/home/HomeDataContext";
import { DictScope } from "@/components/providers/DictScope";
import { CoordinateMarquee, StatsBand } from "@/components/fx/AtlasBands";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { listProperties } from "@/lib/api/properties";
import { listNeighborhoods } from "@/lib/api/locations";
import { listAgents } from "@/lib/api/agents";
import { listDevelopments } from "@/lib/api/developments";
import { listArticles } from "@/lib/api/articles";
import type { HomeData } from "@/components/home/types";
import {
  Hero, FindCoordinates, HomeAtlas, PlacesWithPOV, ArchitectureInMotion, CityFloorPlan, HomesByCharacter, DifferentPerspective,
} from "@/components/home/s1";
import {
  Collection, NewToAtlas, AboveTheCity, SlowerLiving, SpacesTakingShape, FindNeighborhood, FloorPlanRoom, NumbersBehind, MeetPeople, StoriesOfPlace, NextChapter,
} from "@/components/home/s2";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = getDictionary(lang).home.meta;
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: `/${lang}`, languages: { en: "/en", ar: "/ar" } },
    openGraph: { title: m.title, description: m.description, type: "website", locale: lang === "ar" ? "ar_AR" : "en_US" },
    twitter: { card: "summary_large_image", title: m.title, description: m.description },
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [props, neighborhoods, agents, developments, articles] = await Promise.all([
    listProperties({ pageSize: 100 }),
    listNeighborhoods(),
    listAgents(),
    listDevelopments(),
    listArticles(),
  ]);
  const data: HomeData = { properties: props.items, neighborhoods, agents, developments, articles };
  // What the interactive (client) sections receive. Long-form fields they never render are stripped so the
  // homepage HTML stays small; server sections below keep the full `data`.
  const slim: HomeData = {
    ...data,
    properties: data.properties.map((p) => ({
      ...p,
      description: { en: "", ar: "" },
      floorPlan: p.floorPlan ? { ...p.floorPlan, floors: p.floorPlan.floors.slice(0, 1) } : undefined,
    })),
    articles: data.articles.map((a) => ({ ...a, body: { en: [], ar: [] } })),
  };

  const d = getDictionary(lang);
  return (
    <DictScope ns={{ home: d.home, home2: d.home2, home3: d.home3, property: d.property }}>
      <HomeDataProvider data={slim}>
      <Hero data={data} lang={lang} />
      <StatsBand data={data} lang={lang} />
      <FindCoordinates data={data} lang={lang} />
      <HomeAtlas data={data} lang={lang} />
      <CoordinateMarquee data={data} lang={lang} />
      <PlacesWithPOV data={data} lang={lang} />
      <ArchitectureInMotion data={data} lang={lang} />
      <CityFloorPlan data={data} lang={lang} />
      <HomesByCharacter data={data} lang={lang} />
      <DifferentPerspective data={data} lang={lang} />
      <Collection data={data} lang={lang} />
      <NewToAtlas data={data} lang={lang} />
      <AboveTheCity data={data} lang={lang} />
      <SlowerLiving data={data} lang={lang} />
      <SpacesTakingShape data={data} lang={lang} />
      <FindNeighborhood data={data} lang={lang} />
      <FloorPlanRoom data={data} lang={lang} />
      <NumbersBehind data={data} lang={lang} />
      <MeetPeople data={data} lang={lang} />
      <StoriesOfPlace data={data} lang={lang} />
      <NextChapter data={data} lang={lang} />
      </HomeDataProvider>
    </DictScope>
  );
}
