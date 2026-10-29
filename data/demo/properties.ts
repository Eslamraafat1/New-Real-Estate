import type { Amenity, ArchStyle, Availability, Completion, Furnished, Property, PropertyStory, PropertyType, Purpose } from "@/lib/api/types";
import type { L } from "@/lib/i18n/config";
import { neighborhoods } from "./neighborhoods";
import { makeFloorPlan } from "./floorplan";
import { ph } from "./images";

/**
 * DEMO CATALOG — every listing is fictional sample data for the fictional city of Meridian Bay.
 * Prices, areas, availability and agents are illustrative and must not be read as real offers.
 */
type Seed = {
  n: number;
  slug: string;
  title: L;
  summary: L;
  purpose: Purpose;
  price: number;
  type: PropertyType;
  style: ArchStyle;
  beds: number;
  baths: number;
  area: number;
  hood: string;
  agent: string;
  images: [number, string, string][]; // [photo index, alt en, alt ar]
  amenities: Amenity[];
  plot?: number;
  floor?: number;
  floors?: number;
  furnished?: Furnished;
  completion?: Completion;
  completionDate?: string;
  availability?: Availability;
  availableFrom?: string;
  period?: "month" | "year";
  dev?: string;
  featured?: boolean;
  story?: PropertyStory;
  added: string;
  brochure?: boolean;
  tour?: boolean;
};

const hoodMap = Object.fromEntries(neighborhoods.map((h) => [h.slug, h]));

const T_TYPE: Record<PropertyType, L> = {
  villa: { en: "villa", ar: "فيلا" },
  apartment: { en: "apartment", ar: "شقة" },
  penthouse: { en: "penthouse", ar: "بنتهاوس" },
  townhouse: { en: "townhouse", ar: "تاون هاوس" },
  residence: { en: "residence", ar: "مسكن" },
  house: { en: "house", ar: "منزل" },
  land: { en: "plot of land", ar: "قطعة أرض" },
};

function build(s: Seed): Property {
  const h = hoodMap[s.hood];
  const isLand = s.type === "land";
  const jitter = ((s.n * 37) % 60) - 30;
  const desc: L = isLand
    ? {
        en: `${s.summary.en} A ${s.area.toLocaleString("en")} m² plot in ${h.name.en}. This is a demo listing: zoning, title and utilities are not verified and the details are illustrative.`,
        ar: `${s.summary.ar} قطعة بمساحة ${s.area.toLocaleString("ar-EG")} م² في ${h.name.ar}. هذا إعلان تجريبي: التصنيف والملكية والمرافق غير موثّقة والتفاصيل توضيحية.`,
      }
    : {
        en: `${s.summary.en} A ${s.beds}-bedroom ${T_TYPE[s.type].en} of ${s.area} m² in ${h.name.en}. This is a demo listing; every detail is illustrative and not an offer.`,
        ar: `${s.summary.ar} ${T_TYPE[s.type].ar} من ${s.beds} غرف نوم بمساحة ${s.area.toLocaleString("ar-EG")} م² في ${h.name.ar}. هذا إعلان تجريبي وكل التفاصيل توضيحية وليست عرضاً.`,
      };
  const floors = s.floors ?? (s.type === "villa" || s.type === "house" || s.type === "townhouse" ? 2 : 1);
  return {
    id: `p-${String(s.n).padStart(3, "0")}`,
    slug: s.slug,
    ref: String(s.n).padStart(3, "0"),
    title: s.title,
    summary: s.summary,
    description: desc,
    purpose: s.purpose,
    price: s.price,
    currency: "USD",
    pricePeriod: s.purpose === "rent" ? (s.period ?? "month") : undefined,
    type: s.type,
    style: s.style,
    bedrooms: s.beds,
    bathrooms: s.baths,
    area: s.area,
    plotArea: s.plot,
    floor: s.floor,
    furnished: isLand ? "na" : (s.furnished ?? "unfurnished"),
    completion: s.completion ?? "ready",
    completionDate: s.completionDate,
    availability: s.availability ?? "available",
    availableFrom: s.availableFrom,
    neighborhood: s.hood,
    location: { en: `${h.name.en}, Meridian Bay`, ar: `${h.name.ar}، خليج ميريديان` },
    geo: { x: Math.round(h.geo.x + jitter * 1.1), y: Math.round(h.geo.y + ((s.n * 53) % 70) - 35) },
    amenities: s.amenities,
    images: s.images.map(([i, en, ar]) => ph(i, en, ar)),
    floorPlan: isLand ? undefined : makeFloorPlan(s.beds, s.baths, floors, { terrace: s.amenities.includes("terrace") || s.amenities.includes("balcony"), garage: s.amenities.includes("parking") && s.type !== "apartment" && s.type !== "penthouse" }),
    story: s.story,
    agentId: s.agent,
    developmentId: s.dev,
    featured: s.featured,
    addedAt: s.added,
    brochureUrl: s.brochure ? "/demo/atlas-demo-brochure.pdf" : undefined,
    virtualTourUrl: undefined,
    videoUrl: undefined,
    isDemo: true,
  };
}

const rows: Seed[] = [
  {
    n: 1, slug: "the-limestone-house", title: { en: "The Limestone House", ar: "بيت الحجر الجيري" },
    summary: { en: "A monolithic villa of pale stone and deep overhangs, built to frame the ridge.", ar: "فيلا متراصة من الحجر الفاتح وبروزات عميقة صُممت لتؤطر الحافة." },
    purpose: "sale", price: 3850000, type: "villa", style: "contemporary", beds: 5, baths: 6, area: 520, plot: 1400, hood: "cedar-heights", agent: "ag-1",
    images: [[92, "Limestone villa with pool terrace", "فيلا من الحجر الجيري بتراس مسبح"], [89, "Open-plan living space", "مساحة معيشة مفتوحة"], [74, "Stone-clad bathroom", "حمام مكسو بالحجر"], [76, "Living room opening to the pool", "غرفة المعيشة المفتوحة على المسبح"]],
    amenities: ["pool", "garden", "parking", "security", "smart-home", "terrace", "city-view"], featured: true, added: "2026-10-20", brochure: true, tour: true,
    story: {
      exterior: { en: "Pale limestone planes step back from the road, revealing a single deep terrace.", ar: "تتراجع كتل الحجر الجيري الفاتحة عن الطريق لتكشف تراساً واحداً عميقاً." },
      interior: { en: "A double-height living hall organizes the plan; bedrooms sit quietly along the upper gallery.", ar: "ينظّم المخطط ردهة معيشة بارتفاع مزدوج بينما تصطف غرف النوم بهدوء على الشرفة العلوية." },
      materials: { en: "Honed limestone, oiled oak, blackened steel and lime plaster.", ar: "حجر جيري مصقول وبلوط مزيّت وفولاذ مسوّد وجصّ جيري." },
      light: { en: "North-light clerestories and deep eaves temper the afternoon sun.", ar: "نوافذ علوية شمالية وبروزات عميقة تلطّف شمس العصر." },
      outdoor: { en: "A 14 m pool terrace and olive-planted gardens step down the slope.", ar: "تراس مسبح بطول 14 م وحدائق زيتون تنحدر مع السفح." },
    },
  },
  {
    n: 2, slug: "salt-point-residence", title: { en: "Salt Point Residence", ar: "مسكن رأس الملح" },
    summary: { en: "White cubes and a long pool facing an open horizon.", ar: "مكعبات بيضاء ومسبح طويل يواجه أفقاً مفتوحاً." },
    purpose: "sale", price: 4600000, type: "villa", style: "modernist", beds: 6, baths: 7, area: 610, plot: 1250, hood: "saltwater-point", agent: "ag-2",
    images: [[85, "White villa and pool", "فيلا بيضاء ومسبح"], [87, "Primary suite", "الجناح الرئيسي"], [86, "Kitchen with timber joinery", "مطبخ بنجارة خشبية"], [60, "Bedroom with glazed wall", "غرفة نوم بجدار زجاجي"]],
    amenities: ["pool", "garden", "parking", "security", "smart-home", "terrace", "sea-view", "spa"], featured: true, added: "2026-10-18", brochure: true,
    story: {
      exterior: { en: "Stacked white volumes cantilever over a stepped pool deck.", ar: "كتل بيضاء متراكبة تبرز فوق سطح مسبح مدرّج." },
      light: { en: "East-facing bedrooms catch sunrise; the west deck is shaded by a deep pergola.", ar: "غرف النوم الشرقية تلتقط الشروق بينما يظلّل البرغولا العميق السطح الغربي." },
      outdoor: { en: "Pool, outdoor kitchen and a covered lounge toward the water.", ar: "مسبح ومطبخ خارجي وصالة مغطاة نحو الماء." },
    },
  },
  {
    n: 3, slug: "courtyard-villa", title: { en: "The Courtyard Villa", ar: "فيلا الفناء" },
    summary: { en: "Whitewashed volumes wrapped around a private garden court.", ar: "كتل مطلية بالأبيض تلتف حول فناء حديقة خاص." },
    purpose: "sale", price: 2900000, type: "villa", style: "modernist", beds: 4, baths: 5, area: 420, plot: 900, hood: "garden-terraces", agent: "ag-1",
    images: [[41, "Whitewashed courtyard villa", "فيلا بفناء مطلية بالأبيض"], [72, "Arched windows in the living room", "نوافذ مقوسة في غرفة المعيشة"], [24, "Glazed lounge", "صالة زجاجية"], [21, "Concrete gallery corridor", "ممر معرض خرساني"]],
    amenities: ["garden", "parking", "security", "terrace", "fireplace"], featured: true, added: "2026-10-12",
    story: { exterior: { en: "A white box opens inward around a lemon-tree court.", ar: "صندوق أبيض ينفتح للداخل حول فناء أشجار الليمون." }, light: { en: "Light enters from the courtyard, never directly from the street.", ar: "يدخل الضوء من الفناء لا من الشارع مباشرة." } },
  },
  {
    n: 4, slug: "pavilion-on-the-hill", title: { en: "Pavilion on the Hill", ar: "جناح على التلة" },
    summary: { en: "A glass-and-timber pavilion with a floating stair and a pool beyond the glass.", ar: "جناح من الزجاج والخشب بدرج معلّق ومسبح خلف الزجاج." },
    purpose: "sale", price: 5200000, type: "villa", style: "contemporary", beds: 5, baths: 6, area: 580, plot: 1800, hood: "cedar-heights", agent: "ag-1",
    images: [[77, "Timber-clad pavilion house", "منزل جناحي مكسو بالخشب"], [75, "Living area with stair", "منطقة المعيشة مع الدرج"], [88, "Dining under a void", "طعام تحت فراغ مزدوج"], [79, "Pool seen through glazing", "المسبح عبر الزجاج"]],
    amenities: ["pool", "garden", "parking", "smart-home", "security", "city-view", "gym", "terrace"], featured: true, added: "2026-10-09", brochure: true,
    story: { materials: { en: "Western red cedar, board-marked concrete and low-iron glass.", ar: "أرز أحمر غربي وخرسانة بنقش الألواح وزجاج عالي الشفافية." }, interior: { en: "A floating stair divides living and sleeping zones.", ar: "درج معلّق يفصل بين مناطق المعيشة والنوم." } },
  },
  {
    n: 5, slug: "black-timber-house", title: { en: "Black Timber House", ar: "بيت الخشب الأسود" },
    summary: { en: "A dark, quiet family house that glows at dusk.", ar: "بيت عائلي داكن وهادئ يتوهج عند الغسق." },
    purpose: "sale", price: 3100000, type: "house", style: "contemporary", beds: 4, baths: 4, area: 360, plot: 780, hood: "meridian-park", agent: "ag-4",
    images: [[82, "Black timber house at dusk", "بيت الخشب الأسود عند الغسق"], [81, "Warm timber living room", "غرفة معيشة خشبية دافئة"], [37, "Fireplace lounge", "صالة بمدفأة"], [83, "Garden elevation", "الواجهة الحدائقية"]],
    amenities: ["garden", "parking", "fireplace", "security", "smart-home"], added: "2026-10-05",
  },
  {
    n: 6, slug: "marea-terrace-villa", title: { en: "Marea Terrace Villa", ar: "فيلا تراس مارِيا" },
    summary: { en: "Balconied Mediterranean elevations above a palm-lined pool.", ar: "واجهات متوسطية ذات شرفات فوق مسبح تحفّه النخيل." },
    purpose: "sale", price: 3400000, type: "villa", style: "mediterranean", beds: 5, baths: 5, area: 470, plot: 1100, hood: "saltwater-point", agent: "ag-2",
    images: [[57, "Mediterranean villa with palms", "فيلا متوسطية مع نخيل"], [53, "Sun-filled dining room", "غرفة طعام مشمسة"], [54, "Open living area", "منطقة معيشة مفتوحة"], [55, "Glazed conservatory lounge", "صالة زجاجية"]],
    amenities: ["pool", "garden", "balcony", "terrace", "parking", "sea-view", "maid-room"], added: "2026-09-29",
  },
  {
    n: 7, slug: "palm-court-villa", title: { en: "Palm Court Villa", ar: "فيلا فناء النخيل" },
    summary: { en: "Bright white terraces, deep shade and a courtyard pool.", ar: "تراسات بيضاء مشرقة وظلال عميقة ومسبح في الفناء." },
    purpose: "sale", price: 2750000, type: "villa", style: "mediterranean", beds: 4, baths: 5, area: 390, plot: 820, hood: "saltwater-point", agent: "ag-2",
    images: [[93, "White villa with pool", "فيلا بيضاء بمسبح"], [91, "Bright kitchen", "مطبخ مشرق"], [52, "Island kitchen", "مطبخ بجزيرة"], [51, "Pantry kitchen", "مطبخ بمخزن"]],
    amenities: ["pool", "garden", "terrace", "parking", "sea-view", "security"], added: "2026-09-24",
  },
  {
    n: 8, slug: "slate-and-cedar", title: { en: "Slate & Cedar", ar: "الأردواز والأرز" },
    summary: { en: "A contemporary house with timber cladding and a monolithic garage wall.", ar: "منزل معاصر بكسوة خشبية وجدار مرآب متراص." },
    purpose: "sale", price: 1650000, type: "house", style: "contemporary", beds: 4, baths: 4, area: 310, plot: 600, hood: "cedar-heights", agent: "ag-5",
    images: [[70, "Timber and slate contemporary house", "منزل معاصر بالخشب والأردواز"], [71, "Grey living room", "غرفة معيشة رمادية"], [73, "Gallery wall living room", "غرفة معيشة بجدار معرض"], [14, "White kitchen", "مطبخ أبيض"]],
    amenities: ["garden", "parking", "smart-home", "security"], completion: "under-construction", completionDate: "2027-03", dev: "cedar-terraces", availability: "available", added: "2026-10-22",
  },
  {
    n: 9, slug: "row-house-nine", title: { en: "Row House No. 9", ar: "البيت المتلاصق رقم 9" },
    summary: { en: "Off-plan townhouse around a shared courtyard; render shown is illustrative.", ar: "تاون هاوس على الخارطة حول فناء مشترك؛ التصور المعروض توضيحي." },
    purpose: "sale", price: 1150000, type: "townhouse", style: "traditional", beds: 3, baths: 3, area: 210, plot: 280, hood: "quarry-lane", agent: "ag-5",
    images: [[59, "Row of townhouses", "صف من المنازل المتلاصقة"], [18, "Brick-walled lounge", "صالة بجدار طوبي"], [23, "Plant-filled living room", "غرفة معيشة مليئة بالنباتات"], [34, "Open dining and kitchen", "مطبخ وطعام مفتوحان"]],
    amenities: ["garden", "parking", "terrace"], completion: "off-plan", completionDate: "2028-12", dev: "quarry-lane-residences", availability: "coming-soon", added: "2026-10-25",
  },
  {
    n: 10, slug: "the-red-door-townhouse", title: { en: "The Red Door Townhouse", ar: "منزل الباب الأحمر" },
    summary: { en: "A restored brick townhouse on a quiet Old Quarter street.", ar: "منزل طوبي مرمَّم في شارع هادئ بالحي القديم." },
    purpose: "sale", price: 980000, type: "townhouse", style: "traditional", beds: 3, baths: 2, area: 185, plot: 140, hood: "old-quarter", agent: "ag-4",
    images: [[6, "Brick townhouse with red door", "منزل طوبي بباب أحمر"], [38, "Living room with red armchair", "غرفة معيشة بكرسي أحمر"], [39, "Bedroom with reading light", "غرفة نوم بإضاءة قراءة"], [17, "Bright lounge", "صالة مشرقة"]],
    amenities: ["fireplace", "balcony"], furnished: "semi", added: "2026-09-18",
  },
  {
    n: 11, slug: "skyline-one-penthouse", title: { en: "Skyline One Penthouse", ar: "بنتهاوس سكاي لاين ون" },
    summary: { en: "A full-floor penthouse with a wraparound terrace and a view across the bay.", ar: "بنتهاوس بطابق كامل وتراس محيطي وإطلالة على الخليج." },
    purpose: "sale", price: 6800000, type: "penthouse", style: "contemporary", beds: 4, baths: 5, area: 430, floor: 42, hood: "skyline-district", agent: "ag-3",
    images: [[42, "Skyline from the penthouse terrace", "الأفق من تراس البنتهاوس"], [25, "Penthouse lounge", "صالة البنتهاوس"], [31, "Primary bedroom", "غرفة النوم الرئيسية"], [26, "Guest bedroom", "غرفة الضيوف"]],
    amenities: ["terrace", "city-view", "sea-view", "concierge", "gym", "elevator", "parking", "smart-home", "rooftop"], featured: true, furnished: "furnished", added: "2026-10-23", brochure: true,
    story: { light: { en: "Floor-to-ceiling glazing on three sides: sunrise over the water, sunset across the towers.", ar: "زجاج من الأرض للسقف على ثلاث جهات: شروق فوق الماء وغروب بين الأبراج." }, outdoor: { en: "A continuous terrace with a lap pool at the south corner.", ar: "تراس متصل ومسبح سباحة في الركن الجنوبي." } },
  },
  {
    n: 12, slug: "crown-terrace-penthouse", title: { en: "Crown Terrace Penthouse", ar: "بنتهاوس التراس التاجي" },
    summary: { en: "A two-level crown residence with a private rooftop garden.", ar: "مسكن تاجي من طابقين بحديقة سطح خاصة." },
    purpose: "sale", price: 5400000, type: "penthouse", style: "minimalist", beds: 3, baths: 4, area: 360, floor: 38, hood: "skyline-district", agent: "ag-3",
    images: [[13, "Towers at golden hour", "الأبراج عند الساعة الذهبية"], [49, "Open-plan lounge", "صالة مفتوحة"], [43, "Loft-style library living", "معيشة بنمط اللوفت"]],
    amenities: ["rooftop", "terrace", "concierge", "city-view", "elevator", "parking"], furnished: "semi", floors: 2, added: "2026-10-01",
  },
  {
    n: 13, slug: "glass-crown-sky-home", title: { en: "Glass Crown Sky Home", ar: "مسكن التاج الزجاجي" },
    summary: { en: "A rental sky home in a glazed tower; flexible lease terms.", ar: "مسكن في الأفق للإيجار ببرج زجاجي؛ شروط إيجار مرنة." },
    purpose: "rent", price: 9500, type: "penthouse", style: "contemporary", beds: 3, baths: 3, area: 280, floor: 31, hood: "skyline-district", agent: "ag-6",
    images: [[28, "Glazed tower", "برج زجاجي"], [0, "Reflective glass facade", "واجهة زجاجية عاكسة"]],
    amenities: ["city-view", "concierge", "gym", "pool", "elevator", "parking"], furnished: "furnished", availableFrom: "2026-12-01", added: "2026-10-27",
  },
  {
    n: 14, slug: "slate-corner-apartments", title: { en: "Slate Corner Apartment", ar: "شقة ركن الأردواز" },
    summary: { en: "A corner apartment under a cantilevered slate roofline.", ar: "شقة ركنية تحت خط سقف أردوازي بارز." },
    purpose: "sale", price: 640000, type: "apartment", style: "contemporary", beds: 2, baths: 2, area: 112, floor: 5, hood: "old-quarter", agent: "ag-4",
    images: [[3, "Slate-clad apartment building", "مبنى سكني مكسو بالأردواز"], [17, "Living room with blue sofa", "غرفة معيشة بأريكة زرقاء"], [14, "Compact white kitchen", "مطبخ أبيض مدمج"]],
    amenities: ["balcony", "elevator", "parking", "security"], furnished: "unfurnished", added: "2026-09-30",
  },
  {
    n: 15, slug: "white-cube-flat", title: { en: "White Cube Flat", ar: "شقة المكعب الأبيض" },
    summary: { en: "A sculptural white apartment block at Harbor Light; completion in progress.", ar: "كتلة سكنية بيضاء نحتية في ضوء الميناء؛ الإنشاء جارٍ." },
    purpose: "sale", price: 575000, type: "apartment", style: "minimalist", beds: 2, baths: 2, area: 104, floor: 9, hood: "harbor-row", agent: "ag-5",
    images: [[11, "White cubic apartment building", "مبنى سكني أبيض مكعّب"], [38, "Sample living space", "مساحة معيشة نموذجية"], [39, "Sample bedroom", "غرفة نوم نموذجية"]],
    amenities: ["balcony", "gym", "pool", "elevator", "sea-view"], completion: "under-construction", completionDate: "2027-06", dev: "harbor-light", added: "2026-10-14",
  },
  {
    n: 16, slug: "harbor-loft-no-12", title: { en: "Harbor Loft No. 12", ar: "لوفت الميناء رقم 12" },
    summary: { en: "A high-ceilinged loft above the quay, off-plan in the Harbor Light scheme.", ar: "لوفت بسقف عالٍ فوق الرصيف، على الخارطة ضمن مشروع ضوء الميناء." },
    purpose: "sale", price: 520000, type: "apartment", style: "modernist", beds: 1, baths: 1, area: 78, floor: 12, hood: "harbor-row", agent: "ag-5",
    images: [[33, "Loft building with black and white facade", "مبنى لوفت بواجهة بيضاء وسوداء"], [18, "Brick-wall sample interior", "داخلية نموذجية بجدار طوبي"], [23, "Plant-lined living room", "غرفة معيشة بالنباتات"]],
    amenities: ["balcony", "gym", "concierge", "elevator", "sea-view"], completion: "off-plan", completionDate: "2027-09", dev: "harbor-light", availability: "available", added: "2026-10-19",
  },
  {
    n: 17, slug: "balcony-terrace-apartment", title: { en: "Balcony Terrace Apartment", ar: "شقة التراس والشرفة" },
    summary: { en: "A bright rental with a deep balcony and generous storage.", ar: "شقة للإيجار مشرقة بشرفة عميقة وتخزين واسع." },
    purpose: "rent", price: 2800, type: "apartment", style: "contemporary", beds: 2, baths: 2, area: 98, floor: 6, hood: "harbor-row", agent: "ag-6",
    images: [[7, "Apartment block with balconies", "مبنى شقق بشرفات"], [26, "Bedroom", "غرفة نوم"], [31, "Sunny bedroom", "غرفة نوم مشمسة"]],
    amenities: ["balcony", "elevator", "parking", "security"], furnished: "semi", availableFrom: "2026-11-15", added: "2026-10-26",
  },
  {
    n: 18, slug: "courtyard-studio", title: { en: "Courtyard Studio", ar: "استوديو الفناء" },
    summary: { en: "A compact studio facing a quiet courtyard, available fully furnished.", ar: "استوديو مدمج يطل على فناء هادئ، متاح مفروشاً بالكامل." },
    purpose: "rent", price: 1450, type: "apartment", style: "minimalist", beds: 1, baths: 1, area: 46, floor: 2, hood: "old-quarter", agent: "ag-6",
    images: [[46, "Dark apartment facade", "واجهة مبنى داكنة"], [34, "Open studio living", "معيشة استوديو مفتوحة"], [37, "Studio lounge", "صالة الاستوديو"]],
    amenities: ["elevator", "security"], furnished: "furnished", availableFrom: "2026-11-01", added: "2026-10-21",
  },
  {
    n: 19, slug: "old-quarter-flat", title: { en: "Old Quarter Flat", ar: "شقة الحي القديم" },
    summary: { en: "A tall-windowed flat in a mid-rise block steps from the market square.", ar: "شقة بنوافذ عالية في مبنى متوسط الارتفاع قرب ساحة السوق." },
    purpose: "rent", price: 2100, type: "apartment", style: "contemporary", beds: 2, baths: 1, area: 88, floor: 4, hood: "old-quarter", agent: "ag-6",
    images: [[65, "Mid-rise apartment block", "مبنى سكني متوسط الارتفاع"], [14, "White kitchen", "مطبخ أبيض"], [23, "Living room", "غرفة معيشة"]],
    amenities: ["balcony", "elevator"], furnished: "unfurnished", availability: "under-offer", added: "2026-09-14",
  },
  {
    n: 20, slug: "orchard-family-home", title: { en: "Orchard Family Home", ar: "منزل البستان العائلي" },
    summary: { en: "A porch-fronted family home with a wide lawn and mature trees.", ar: "منزل عائلي بشرفة أمامية ومرج واسع وأشجار معمّرة." },
    purpose: "sale", price: 890000, type: "house", style: "traditional", beds: 4, baths: 3, area: 245, plot: 620, hood: "meridian-park", agent: "ag-4",
    images: [[62, "Family home with porch", "منزل عائلي بشرفة"], [34, "Family kitchen and dining", "مطبخ وطعام عائلي"], [17, "Living room", "غرفة المعيشة"]],
    amenities: ["garden", "parking", "fireplace"], added: "2026-09-08",
  },
  {
    n: 21, slug: "maple-lane-house", title: { en: "Maple Lane House", ar: "بيت زقاق القيقب" },
    summary: { en: "A craftsman-style rental surrounded by maple trees.", ar: "منزل للإيجار بطراز الحرفيين تحيط به أشجار القيقب." },
    purpose: "rent", price: 3600, type: "house", style: "traditional", beds: 3, baths: 2, area: 190, plot: 450, hood: "meridian-park", agent: "ag-6",
    images: [[63, "Craftsman house with porch", "منزل حرفي بشرفة"], [23, "Plant-filled living room", "غرفة معيشة بالنباتات"], [38, "Reading corner", "ركن قراءة"]],
    amenities: ["garden", "parking"], furnished: "unfurnished", availableFrom: "2027-01-01", added: "2026-10-10",
  },
  {
    n: 22, slug: "gable-house", title: { en: "The Gable House", ar: "بيت الجملون" },
    summary: { en: "White gables, a red roof and a lived-in garden.", ar: "جملونات بيضاء وسقف أحمر وحديقة نابضة بالحياة." },
    purpose: "sale", price: 760000, type: "house", style: "traditional", beds: 4, baths: 3, area: 230, plot: 540, hood: "old-quarter", agent: "ag-4",
    images: [[64, "White house with red roof", "منزل أبيض بسقف أحمر"], [14, "Kitchen", "مطبخ"], [37, "Fireside living room", "غرفة معيشة بمدفأة"]],
    amenities: ["garden", "fireplace", "parking"], added: "2026-08-30",
  },
  {
    n: 23, slug: "green-lawn-house", title: { en: "Green Lawn House", ar: "بيت المرج الأخضر" },
    summary: { en: "A large newly built home facing the great lawn of Meridian Park.", ar: "منزل جديد واسع يطل على المرج الكبير لحديقة ميريديان." },
    purpose: "sale", price: 1250000, type: "house", style: "traditional", beds: 5, baths: 4, area: 340, plot: 700, hood: "meridian-park", agent: "ag-4",
    images: [[69, "Large house facing the lawn", "منزل واسع يطل على المرج"], [18, "Brick-wall lounge", "صالة بجدار طوبي"], [39, "Bedroom", "غرفة نوم"]],
    amenities: ["garden", "parking", "security", "gym"], added: "2026-09-02",
  },
  {
    n: 24, slug: "shingle-porch-house", title: { en: "Shingle Porch House", ar: "بيت الشرفة المكسوّة" },
    summary: { en: "A pale shingle-clad house with a deep wraparound porch.", ar: "منزل مكسو بالألواح الفاتحة بشرفة محيطية عميقة." },
    purpose: "rent", price: 4200, type: "house", style: "traditional", beds: 4, baths: 3, area: 260, plot: 500, hood: "meridian-park", agent: "ag-6",
    images: [[94, "Shingle house with porch", "منزل بشرفة محيطية"], [14, "Kitchen", "مطبخ"], [34, "Dining room", "غرفة الطعام"]],
    amenities: ["garden", "parking", "fireplace"], furnished: "semi", availableFrom: "2026-12-15", added: "2026-10-16",
  },
  {
    n: 25, slug: "lantern-house", title: { en: "The Lantern House", ar: "بيت الفانوس" },
    summary: { en: "A gabled house glowing at dusk, completed and ready to move in.", ar: "منزل بجملونات يتوهج عند الغسق، مكتمل وجاهز للسكن." },
    purpose: "sale", price: 710000, type: "house", style: "traditional", beds: 3, baths: 3, area: 205, plot: 380, hood: "meridian-park", agent: "ag-4",
    images: [[61, "Gabled house lit at dusk", "منزل بجملونات مضاء عند الغسق"], [23, "Living room", "غرفة المعيشة"], [38, "Bedroom", "غرفة النوم"]],
    amenities: ["garden", "parking", "security"], dev: "meridian-gardens", added: "2026-08-20",
  },
  {
    n: 26, slug: "ridge-plot", title: { en: "Ridge Plot", ar: "قطعة الحافة" },
    summary: { en: "A panoramic plot on the Cedar Heights ridge, suitable for an architect-designed house.", ar: "قطعة بانورامية على حافة مرتفعات الأرز تصلح لبيت بتصميم معماري." },
    purpose: "sale", price: 1350000, type: "land", style: "contemporary", beds: 0, baths: 0, area: 2200, hood: "cedar-heights", agent: "ag-5",
    images: [[27, "Ridge at sunset", "الحافة عند الغروب"], [8, "Mountain backdrop", "خلفية جبلية"]],
    amenities: ["city-view"], added: "2026-10-02",
  },
  {
    n: 27, slug: "meadow-plot", title: { en: "Meadow Plot", ar: "قطعة المرج" },
    summary: { en: "An open, gently sloping plot facing west across the meadows.", ar: "قطعة مفتوحة منحدرة بلطف تواجه الغرب عبر المروج." },
    purpose: "sale", price: 540000, type: "land", style: "minimalist", beds: 0, baths: 0, area: 1600, hood: "meridian-park", agent: "ag-5",
    images: [[22, "Meadow at sunset", "مرج عند الغروب"]],
    amenities: [], added: "2026-09-12",
  },
  {
    n: 28, slug: "lakeside-plot", title: { en: "Lakeside Plot", ar: "قطعة ضفة البحيرة" },
    summary: { en: "A tree-lined plot by the water for a private retreat.", ar: "قطعة محاطة بالأشجار قرب الماء لمنتجع خاص." },
    purpose: "sale", price: 980000, type: "land", style: "contemporary", beds: 0, baths: 0, area: 1900, hood: "garden-terraces", agent: "ag-5",
    images: [[9, "Lake and mountains", "بحيرة وجبال"], [1, "Forest path", "ممر غابي"]],
    amenities: ["garden"], added: "2026-08-15",
  },
  {
    n: 29, slug: "harbor-view-loft-rent", title: { en: "Harbor View Loft", ar: "لوفت إطلالة الميناء" },
    summary: { en: "A furnished rental loft with floor-to-ceiling windows over the harbor.", ar: "لوفت مفروش للإيجار بنوافذ من الأرض للسقف على الميناء." },
    purpose: "rent", price: 3900, type: "apartment", style: "modernist", beds: 2, baths: 2, area: 120, floor: 8, hood: "harbor-row", agent: "ag-2",
    images: [[48, "Glass-roofed atrium building", "مبنى بسقف زجاجي"], [49, "Furnished lounge", "صالة مفروشة"], [43, "Loft library", "مكتبة اللوفت"]],
    amenities: ["sea-view", "gym", "concierge", "elevator", "balcony"], furnished: "furnished", availableFrom: "2026-11-20", added: "2026-10-28",
  },
];

export const properties: Property[] = rows.map(build);
