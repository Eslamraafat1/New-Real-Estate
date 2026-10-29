import type { InquiryInput, ValuationRequestInput, ViewingRequestInput } from "./types";
import { PROPERTY_TYPES } from "./types";

/**
 * Shared validators (browser + server). Errors are message KEYS, translated by the UI
 * through `t.forms.errors[key]` so validation messages follow the active language.
 */
export type ErrorKey = "required" | "email" | "phone" | "consent" | "short" | "date" | "past" | "number" | "invalid";
export type FieldErrors<T> = Partial<Record<keyof T, ErrorKey>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]{7,20}$/;

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function common(e: Record<string, ErrorKey>, i: { name?: unknown; email?: unknown; phone?: unknown; consent?: unknown }) {
  if (!text(i.name)) e.name = "required";
  else if (text(i.name).length < 2) e.name = "short";
  if (!text(i.email)) e.email = "required";
  else if (!EMAIL.test(text(i.email))) e.email = "email";
  if (text(i.phone) && !PHONE.test(text(i.phone))) e.phone = "phone";
  if (i.consent !== true) e.consent = "consent";
}

export function validateInquiry(i: Partial<InquiryInput>): FieldErrors<InquiryInput> {
  const e: Record<string, ErrorKey> = {};
  common(e, i);
  if (!text(i.message)) e.message = "required";
  else if (text(i.message).length < 10) e.message = "short";
  if (!["contact", "agent", "details", "seller", "landlord"].includes(String(i.kind))) e.kind = "invalid";
  return e as FieldErrors<InquiryInput>;
}

export function validateViewing(i: Partial<ViewingRequestInput>, today = new Date()): FieldErrors<ViewingRequestInput> {
  const e: Record<string, ErrorKey> = {};
  common(e, i);
  if (!text(i.propertyId)) e.propertyId = "required";
  if (!text(i.date)) e.date = "required";
  else {
    const d = new Date(text(i.date));
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (Number.isNaN(+d)) e.date = "date";
    else if (d < t0) e.date = "past";
  }
  if (!["morning", "afternoon", "evening"].includes(String(i.time))) e.time = "required";
  if (!["in-person", "video"].includes(String(i.mode))) e.mode = "required";
  return e as FieldErrors<ViewingRequestInput>;
}

export function validateValuation(i: Partial<ValuationRequestInput>): FieldErrors<ValuationRequestInput> {
  const e: Record<string, ErrorKey> = {};
  common(e, i);
  if (!PROPERTY_TYPES.includes(i.type as never)) e.type = "required";
  if (!text(i.neighborhood)) e.neighborhood = "required";
  if (i.purpose !== "sale" && i.purpose !== "rent") e.purpose = "required";
  if (!(Number(i.area) > 0)) e.area = "number";
  if (!(Number(i.bedrooms) >= 0) || i.bedrooms === undefined) e.bedrooms = "number";
  return e as FieldErrors<ValuationRequestInput>;
}
