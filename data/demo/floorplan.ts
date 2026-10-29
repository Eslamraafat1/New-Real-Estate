import type { FloorPlan, FloorPlanFloor, Room } from "@/lib/api/types";
import type { L } from "@/lib/i18n/config";

type Spec = { key: string; name: L; w: number };

const N = {
  living: { en: "Living room", ar: "غرفة المعيشة" },
  kitchen: { en: "Kitchen", ar: "المطبخ" },
  dining: { en: "Dining", ar: "الطعام" },
  entry: { en: "Entry", ar: "المدخل" },
  terrace: { en: "Terrace", ar: "التراس" },
  landing: { en: "Landing", ar: "البسطة" },
  study: { en: "Study", ar: "المكتب" },
  garage: { en: "Garage", ar: "المرآب" },
};
const bed = (i: number): L => ({ en: i === 1 ? "Primary bedroom" : `Bedroom ${i}`, ar: i === 1 ? "غرفة النوم الرئيسية" : `غرفة النوم ${i}` });
const bath = (i: number): L => ({ en: `Bathroom ${i}`, ar: `الحمام ${i}` });

/** Plan frame: the outer wall sits 2 units inside the viewBox; rooms tile the interior exactly (shared walls). */
const FRAME = { x: 2, y: 2, w: 96 };
const round = (n: number) => Math.round(n * 100) / 100;

/** Split specs into `rows` runs of near-equal total weight, keeping order (public rooms first, then private). */
function splitRows(specs: Spec[], rows: number): Spec[][] {
  const total = specs.reduce((s, r) => s + r.w, 0);
  const out: Spec[][] = Array.from({ length: rows }, () => []);
  let acc = 0;
  specs.forEach((sp) => {
    const mid = acc + sp.w / 2;
    out[Math.min(rows - 1, Math.floor((mid / total) * rows))].push(sp);
    acc += sp.w;
  });
  return out.filter((r) => r.length);
}

/**
 * Lay specs into 1-3 balanced rows. Each width blends an equal share (65%) with the weight share (35%)
 * so narrow rooms (entry, baths) never collapse into slivers. Row height is fixed per row count.
 */
function layout(floorId: string, specs: Spec[]): { rooms: Room[]; viewBox: [number, number] } {
  const rowCount = specs.length <= 4 ? 1 : specs.length <= 8 ? 2 : 3;
  const rows = splitRows(specs, rowCount);
  const rh = rows.length === 1 ? 40 : rows.length === 2 ? 30 : 26;
  const rooms: Room[] = [];
  rows.forEach((row, ri) => {
    const total = row.reduce((s, r) => s + r.w, 0);
    let x = FRAME.x;
    row.forEach((r, i) => {
      const share = 0.65 / row.length + 0.35 * (r.w / total);
      const w = i === row.length - 1 ? FRAME.x + FRAME.w - x : share * FRAME.w;
      rooms.push({ id: `${floorId}-${r.key}`, name: r.name, x: round(x), y: FRAME.y + ri * rh, w: round(w), h: rh });
      x += w;
    });
  });
  return { rooms, viewBox: [100, FRAME.y * 2 + rh * rows.length] };
}

/**
 * Procedurally generates an ILLUSTRATIVE floor plan from bedroom/bath counts.
 * Rooms carry no measurements (areaM2 undefined) and the plan is flagged demo:true.
 */
export function makeFloorPlan(bedrooms: number, bathrooms: number, floors: number, opts?: { terrace?: boolean; garage?: boolean }): FloorPlan {
  const beds = Math.max(bedrooms, 1);
  const out: FloorPlanFloor[] = [];
  const upperBeds = floors > 1 ? Math.ceil(beds * 0.7) : 0;
  const groundBeds = beds - upperBeds;
  let bi = 1;
  let ba = 1;

  const ground: Spec[] = [
    { key: "entry", name: N.entry, w: 1 },
    { key: "living", name: N.living, w: 3 },
    { key: "kitchen", name: N.kitchen, w: 2 },
    { key: "dining", name: N.dining, w: 2 },
  ];
  if (opts?.terrace) ground.push({ key: "terrace", name: N.terrace, w: 2.5 });
  if (opts?.garage) ground.push({ key: "garage", name: N.garage, w: 2 });
  for (let i = 0; i < groundBeds; i++) ground.push({ key: `bed${bi}`, name: bed(bi++), w: 2 });
  const groundBaths = floors > 1 ? Math.max(1, Math.floor(bathrooms / 3)) : bathrooms;
  for (let i = 0; i < groundBaths; i++) ground.push({ key: `bath${ba}`, name: bath(ba++), w: 1 });
  out.push({ id: "f0", label: { en: floors > 1 ? "Ground floor" : "Floor plan", ar: floors > 1 ? "الطابق الأرضي" : "المخطط" }, ...layout("f0", ground) });

  if (floors > 1) {
    const upper: Spec[] = [{ key: "landing", name: N.landing, w: 1 }];
    for (let i = 0; i < upperBeds; i++) upper.push({ key: `bed${bi}`, name: bed(bi++), w: 2.5 });
    upper.push({ key: "study", name: N.study, w: 1.6 });
    for (let i = ba; i <= bathrooms; i++) upper.push({ key: `bath${i}`, name: bath(i), w: 1.2 });
    out.push({ id: "f1", label: { en: "Upper floor", ar: "الطابق العلوي" }, ...layout("f1", upper) });
  }
  return { demo: true, floors: out };
}
