import type { L } from "@/lib/i18n/config";

export type Purpose = "sale" | "rent";
export type PropertyType =
  | "villa"
  | "apartment"
  | "penthouse"
  | "townhouse"
  | "residence"
  | "house"
  | "land";
export type ArchStyle =
  | "contemporary"
  | "modernist"
  | "mediterranean"
  | "minimalist"
  | "traditional";
export type Completion = "ready" | "under-construction" | "off-plan";
export type Availability = "available" | "under-offer" | "coming-soon";
export type Furnished = "furnished" | "semi" | "unfurnished" | "na";
export type Amenity =
  | "pool" | "garden" | "gym" | "parking" | "security" | "balcony" | "terrace"
  | "smart-home" | "sea-view" | "city-view" | "elevator" | "maid-room"
  | "spa" | "concierge" | "rooftop" | "fireplace";

export const PROPERTY_TYPES: PropertyType[] = ["villa", "apartment", "penthouse", "townhouse", "residence", "house", "land"];
export const ARCH_STYLES: ArchStyle[] = ["contemporary", "modernist", "mediterranean", "minimalist", "traditional"];
export const AMENITIES: Amenity[] = ["pool", "garden", "gym", "parking", "security", "balcony", "terrace", "smart-home", "sea-view", "city-view", "elevator", "maid-room", "spa", "concierge", "rooftop", "fireplace"];

/** Position on the illustrative demo map plane (0–1000 on both axes).
 *  A real backend should additionally supply `lat` / `lng`. */
export interface Geo { x: number; y: number; lat?: number; lng?: number }

export interface PropertyImage {
  /** Absolute image URL (remote host must be allowed in next.config.ts). */
  src: string;
  width: number;
  height: number;
  alt: L;
  caption?: L;
}

export interface Room {
  id: string;
  name: L;
  /** Position in the floor's viewBox. */
  x: number; y: number; w: number; h: number;
  /** Only set when a real measurement is supplied. Demo plans leave it undefined. */
  areaM2?: number;
}
export interface FloorPlanFloor {
  id: string;
  label: L;
  viewBox: [number, number];
  rooms: Room[];
}
export interface FloorPlan {
  /** True for generated, illustrative diagrams. Never show dimensions as real when true. */
  demo: boolean;
  floors: FloorPlanFloor[];
  /** Optional supplied plan image per floor id. */
  assets?: Record<string, string>;
}

export interface PropertyStory {
  exterior?: L;
  interior?: L;
  materials?: L;
  light?: L;
  outdoor?: L;
}

export interface Property {
  id: string;
  slug: string;
  /** Short listing identifier shown as an editorial number, e.g. "014". */
  ref: string;
  title: L;
  summary: L;
  description: L;
  purpose: Purpose;
  price: number;
  currency: string;
  /** For rentals. */
  pricePeriod?: "month" | "year";
  type: PropertyType;
  style: ArchStyle;
  bedrooms: number;
  bathrooms: number;
  /** Built-up area, m². */
  area: number;
  plotArea?: number;
  floor?: number;
  furnished: Furnished;
  completion: Completion;
  completionDate?: string;
  availability: Availability;
  availableFrom?: string;
  neighborhood: string;
  location: L;
  geo: Geo;
  amenities: Amenity[];
  images: PropertyImage[];
  floorPlan?: FloorPlan;
  story?: PropertyStory;
  agentId: string;
  developmentId?: string;
  featured?: boolean;
  /** Only render a "verified" badge when this is true (demo data never sets it). */
  verified?: boolean;
  addedAt: string;
  brochureUrl?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  /** Always true in the demo catalog. */
  isDemo: boolean;
}

export interface Neighborhood {
  slug: string;
  name: L;
  tagline: L;
  description: L;
  character: L[];
  geo: Geo & { r: number };
  image: PropertyImage;
  /** Sample (non-verified) indicators on a 0–10 scale. */
  sample: { walkability: number; greenery: number; nightlife: number; quiet: number };
  sampleAvgPricePerM2: number;
  isDemo: boolean;
}

export interface Agent {
  id: string;
  slug: string;
  name: L;
  role: L;
  languages: ("en" | "ar" | "fr" | "es")[];
  /** Fictional reserved numbers (555) and example.com addresses only. */
  phone: string;
  email: string;
  bio: L;
  specialties: L[];
  neighborhoods: string[];
  isDemo: boolean;
}

export interface Development {
  slug: string;
  name: L;
  developer: L;
  tagline: L;
  description: L;
  status: Completion;
  /** Construction progress 0–100 (sample). */
  progress: number;
  completionQuarter: string;
  neighborhood: string;
  geo: Geo;
  priceFrom: number;
  currency: string;
  units: number;
  unitsAvailable: number;
  images: PropertyImage[];
  phases: { label: L; done: boolean; date: string }[];
  amenities: Amenity[];
  isDemo: boolean;
}

export interface Article {
  slug: string;
  title: L;
  excerpt: L;
  category: L;
  body: { en: string[]; ar: string[] };
  date: string;
  readMinutes: number;
  image: PropertyImage;
  author: L;
}

/* ------------------------------ Queries ------------------------------ */
export type SortKey = "relevance" | "price-asc" | "price-desc" | "newest";

export interface PropertyQuery {
  purpose?: Purpose;
  q?: string;
  neighborhood?: string;
  types?: PropertyType[];
  styles?: ArchStyle[];
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: Furnished;
  amenities?: Amenity[];
  completion?: Completion;
  developmentId?: string;
  featured?: boolean;
  ids?: string[];
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isDemo: boolean;
}

/* ------------------------------ Inquiries ----------------------------- */
export type InquiryKind = "contact" | "agent" | "details" | "seller" | "landlord";
export interface InquiryInput {
  kind: InquiryKind;
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  agentId?: string;
  consent: boolean;
}
export interface ViewingRequestInput {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: "morning" | "afternoon" | "evening";
  mode: "in-person" | "video";
  message?: string;
  consent: boolean;
}
export interface ValuationRequestInput {
  name: string;
  email: string;
  phone?: string;
  purpose: Purpose;
  type: PropertyType;
  neighborhood: string;
  bedrooms: number;
  area: number;
  message?: string;
  consent: boolean;
}
export interface SubmissionResult {
  ok: true;
  /** Always true in demo mode: nothing was delivered to a real person. */
  simulated: boolean;
  reference: string;
}
export interface ApiError {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
}
