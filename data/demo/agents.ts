import type { Agent } from "@/lib/api/types";

/** Fictional demo identities. Phones use reserved 555 numbers; emails use example.com. */
export const agents: Agent[] = [
  {
    id: "ag-1", slug: "lina-haddad", name: { en: "Lina Haddad", ar: "لينا حداد" },
    role: { en: "Senior Property Advisor (demo)", ar: "مستشارة عقارية أولى (تجريبي)" },
    languages: ["en", "ar", "fr"], phone: "+1 555 010 0101", email: "lina.demo@example.com",
    bio: { en: "Demo profile. Specialises in hillside villas and architect-designed houses.", ar: "ملف تجريبي. متخصصة في الفلل على التلال والبيوت المصممة معمارياً." },
    specialties: [{ en: "Villas", ar: "فلل" }, { en: "Architect-designed", ar: "تصميم معماري" }],
    neighborhoods: ["cedar-heights", "garden-terraces"], isDemo: true,
  },
  {
    id: "ag-2", slug: "omar-vasquez", name: { en: "Omar Vasquez", ar: "عمر فاسكيز" },
    role: { en: "Waterfront Specialist (demo)", ar: "متخصص الواجهات البحرية (تجريبي)" },
    languages: ["en", "ar", "es"], phone: "+1 555 010 0102", email: "omar.demo@example.com",
    bio: { en: "Demo profile. Coastal homes, pools and shoreline plots.", ar: "ملف تجريبي. منازل ساحلية ومسابح وقطع على الشاطئ." },
    specialties: [{ en: "Coastal", ar: "ساحلي" }, { en: "Lofts", ar: "لوفتات" }],
    neighborhoods: ["saltwater-point", "harbor-row"], isDemo: true,
  },
  {
    id: "ag-3", slug: "mara-okafor", name: { en: "Mara Okafor", ar: "مارا أوكافور" },
    role: { en: "Penthouse & Skyline Advisor (demo)", ar: "مستشارة البنتهاوس والأفق (تجريبي)" },
    languages: ["en", "fr"], phone: "+1 555 010 0103", email: "mara.demo@example.com",
    bio: { en: "Demo profile. High-floor apartments and penthouses.", ar: "ملف تجريبي. شقق الطوابق العالية والبنتهاوس." },
    specialties: [{ en: "Penthouses", ar: "بنتهاوس" }, { en: "Investment", ar: "استثمار" }],
    neighborhoods: ["skyline-district"], isDemo: true,
  },
  {
    id: "ag-4", slug: "yusuf-tan", name: { en: "Yusuf Tan", ar: "يوسف تان" },
    role: { en: "Family Homes Advisor (demo)", ar: "مستشار المنازل العائلية (تجريبي)" },
    languages: ["en", "ar"], phone: "+1 555 010 0104", email: "yusuf.demo@example.com",
    bio: { en: "Demo profile. Family homes, schools and relocation.", ar: "ملف تجريبي. منازل عائلية ومدارس وخدمات الانتقال." },
    specialties: [{ en: "Family homes", ar: "منازل عائلية" }, { en: "Relocation", ar: "انتقال" }],
    neighborhoods: ["meridian-park", "old-quarter"], isDemo: true,
  },
  {
    id: "ag-5", slug: "sofia-brandt", name: { en: "Sofia Brandt", ar: "صوفيا براندت" },
    role: { en: "New Developments Lead (demo)", ar: "مسؤولة المشاريع الجديدة (تجريبي)" },
    languages: ["en", "ar"], phone: "+1 555 010 0105", email: "sofia.demo@example.com",
    bio: { en: "Demo profile. Off-plan launches and construction updates.", ar: "ملف تجريبي. إطلاقات على الخارطة وتحديثات الإنشاء." },
    specialties: [{ en: "Off-plan", ar: "على الخارطة" }, { en: "Land", ar: "أراضٍ" }],
    neighborhoods: ["quarry-lane", "harbor-row"], isDemo: true,
  },
  {
    id: "ag-6", slug: "karim-nasser", name: { en: "Karim Nasser", ar: "كريم ناصر" },
    role: { en: "Lettings Manager (demo)", ar: "مدير التأجير (تجريبي)" },
    languages: ["en", "ar"], phone: "+1 555 010 0106", email: "karim.demo@example.com",
    bio: { en: "Demo profile. Rentals, landlord services and property management.", ar: "ملف تجريبي. إيجارات وخدمات الملاك وإدارة العقارات." },
    specialties: [{ en: "Rentals", ar: "إيجارات" }, { en: "Landlords", ar: "ملاك" }],
    neighborhoods: ["old-quarter", "harbor-row"], isDemo: true,
  },
];
