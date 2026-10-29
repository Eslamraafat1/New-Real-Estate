import { serializeQuery } from "@/lib/search";
import type {
  Agent, ApiError, Development, InquiryInput, Neighborhood, Paged, Property, PropertyQuery,
  SubmissionResult, ValuationRequestInput, ViewingRequestInput,
} from "./types";
import type { ErrorKey } from "./validation";

/** Browser-side typed client for our own /api routes (never talks to the backend directly). */
async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

export const fetchProperties = (q: PropertyQuery, signal?: AbortSignal) =>
  getJson<Paged<Property>>(`/api/properties?${serializeQuery(q)}`, signal);
export const fetchNeighborhoods = (signal?: AbortSignal) => getJson<Neighborhood[]>("/api/neighborhoods", signal);
export const fetchAgents = (signal?: AbortSignal) => getJson<Agent[]>("/api/agents", signal);
export const fetchDevelopments = (signal?: AbortSignal) => getJson<Development[]>("/api/developments", signal);

export type SubmitOutcome =
  | { ok: true; result: SubmissionResult }
  | { ok: false; error: string; fieldErrors?: Record<string, ErrorKey> };

async function post(url: string, body: unknown): Promise<SubmitOutcome> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json()) as SubmissionResult | (ApiError & { fieldErrors?: Record<string, ErrorKey> });
    if (res.ok && json.ok) return { ok: true, result: json as SubmissionResult };
    const err = json as ApiError & { fieldErrors?: Record<string, ErrorKey> };
    return { ok: false, error: err.error ?? "error", fieldErrors: err.fieldErrors };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const postInquiry = (i: InquiryInput) => post("/api/inquiries", i);
export const postViewingRequest = (i: ViewingRequestInput) => post("/api/viewing-requests", i);
export const postValuationRequest = (i: ValuationRequestInput) => post("/api/valuation-requests", i);
