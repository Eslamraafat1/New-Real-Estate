import type { Development } from "@/lib/api/types";
import { ph } from "./images";

/** Fictional projects. Progress, dates and unit counts are SAMPLE data. */
export const developments: Development[] = [
  {
    slug: "quarry-lane-residences",
    name: { en: "Quarry Lane Residences", ar: "مساكن زقاق المحجر" },
    developer: { en: "Demo Developer Studio", ar: "استوديو مطوّر تجريبي" },
    tagline: { en: "Stone, timber and quiet courtyards", ar: "حجر وخشب وأفنية هادئة" },
    description: {
      en: "A sample off-plan scheme of townhouses around shared courtyards. All details are illustrative and not an offer.",
      ar: "مشروع تجريبي على الخارطة من المنازل المتلاصقة حول أفنية مشتركة. كل التفاصيل توضيحية وليست عرضاً.",
    },
    status: "off-plan", progress: 8, completionQuarter: "Q4 2028",
    neighborhood: "quarry-lane", geo: { x: 455, y: 850 }, priceFrom: 890000, currency: "USD",
    units: 36, unitsAvailable: 31,
    images: [ph(80, "Quarry Lane Residences rendering", "تصور مساكن زقاق المحجر"), ph(84, "Facade study", "دراسة الواجهة")],
    phases: [
      { label: { en: "Masterplan approved", ar: "اعتماد المخطط العام" }, done: true, date: "2026 Q1" },
      { label: { en: "Groundworks", ar: "الأعمال الترابية" }, done: false, date: "2027 Q1" },
      { label: { en: "Structure", ar: "الهيكل" }, done: false, date: "2027 Q4" },
      { label: { en: "Handover", ar: "التسليم" }, done: false, date: "2028 Q4" },
    ],
    amenities: ["garden", "parking", "security", "terrace"], isDemo: true,
  },
  {
    slug: "harbor-light",
    name: { en: "Harbor Light", ar: "ضوء الميناء" },
    developer: { en: "Demo Developer Studio", ar: "استوديو مطوّر تجريبي" },
    tagline: { en: "Apartments with a long view of the water", ar: "شقق بإطلالة طويلة على الماء" },
    description: {
      en: "A sample under-construction tower of apartments and lofts at Harbor Row. All details are illustrative.",
      ar: "برج تجريبي قيد الإنشاء من الشقق واللوفتات في صف الميناء. كل التفاصيل توضيحية.",
    },
    status: "under-construction", progress: 54, completionQuarter: "Q2 2027",
    neighborhood: "harbor-row", geo: { x: 300, y: 735 }, priceFrom: 520000, currency: "USD",
    units: 120, unitsAvailable: 47,
    images: [ph(28, "Harbor Light tower", "برج ضوء الميناء"), ph(16, "Crystalline roofline", "خط السقف البلوري"), ph(0, "Reflective facade", "واجهة عاكسة")],
    phases: [
      { label: { en: "Masterplan approved", ar: "اعتماد المخطط العام" }, done: true, date: "2024 Q2" },
      { label: { en: "Groundworks", ar: "الأعمال الترابية" }, done: true, date: "2025 Q1" },
      { label: { en: "Structure", ar: "الهيكل" }, done: false, date: "2026 Q4" },
      { label: { en: "Handover", ar: "التسليم" }, done: false, date: "2027 Q2" },
    ],
    amenities: ["gym", "pool", "concierge", "elevator", "parking", "sea-view"], isDemo: true,
  },
  {
    slug: "cedar-terraces",
    name: { en: "Cedar Terraces", ar: "تراسات الأرز" },
    developer: { en: "Demo Developer Studio", ar: "استوديو مطوّر تجريبي" },
    tagline: { en: "Houses stepping down the ridge", ar: "بيوت تتدرج على الحافة" },
    description: {
      en: "A sample under-construction group of contemporary houses on terraced plots. All details are illustrative.",
      ar: "مجموعة تجريبية قيد الإنشاء من البيوت المعاصرة على قطع مدرجة. كل التفاصيل توضيحية.",
    },
    status: "under-construction", progress: 71, completionQuarter: "Q1 2027",
    neighborhood: "cedar-heights", geo: { x: 790, y: 225 }, priceFrom: 1450000, currency: "USD",
    units: 14, unitsAvailable: 5,
    images: [ph(90, "Cedar Terraces house", "بيت من تراسات الأرز"), ph(78, "Evening elevation", "واجهة مسائية")],
    phases: [
      { label: { en: "Masterplan approved", ar: "اعتماد المخطط العام" }, done: true, date: "2024 Q4" },
      { label: { en: "Structure", ar: "الهيكل" }, done: true, date: "2025 Q4" },
      { label: { en: "Finishes", ar: "التشطيبات" }, done: false, date: "2026 Q4" },
      { label: { en: "Handover", ar: "التسليم" }, done: false, date: "2027 Q1" },
    ],
    amenities: ["garden", "pool", "security", "smart-home", "parking"], isDemo: true,
  },
  {
    slug: "meridian-gardens",
    name: { en: "Meridian Gardens", ar: "حدائق ميريديان" },
    developer: { en: "Demo Developer Studio", ar: "استوديو مطوّر تجريبي" },
    tagline: { en: "Completed family homes, ready to move in", ar: "منازل عائلية مكتملة جاهزة للسكن" },
    description: {
      en: "A sample completed development of detached family homes beside the park. All details are illustrative.",
      ar: "مشروع تجريبي مكتمل من المنازل العائلية المستقلة بجوار الحديقة. كل التفاصيل توضيحية.",
    },
    status: "ready", progress: 100, completionQuarter: "Completed",
    neighborhood: "meridian-park", geo: { x: 140, y: 575 }, priceFrom: 640000, currency: "USD",
    units: 22, unitsAvailable: 4,
    images: [ph(68, "Meridian Gardens homes", "منازل حدائق ميريديان"), ph(5, "Street view", "منظر الشارع")],
    phases: [
      { label: { en: "Masterplan approved", ar: "اعتماد المخطط العام" }, done: true, date: "2022" },
      { label: { en: "Construction", ar: "الإنشاء" }, done: true, date: "2024" },
      { label: { en: "Handover", ar: "التسليم" }, done: true, date: "2025" },
    ],
    amenities: ["garden", "parking", "security"], isDemo: true,
  },
];
