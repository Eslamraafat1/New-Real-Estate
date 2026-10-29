import { apiConfig } from "./config";
import { isRemote, remotePost } from "./remote";
import type { InquiryInput, SubmissionResult, ValuationRequestInput, ViewingRequestInput } from "./types";

const ref = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/**
 * In demo mode nothing is delivered to anyone: the result is flagged `simulated: true`
 * and the UI says so. In remote mode the payload is forwarded to the backend.
 */
async function submit<T extends object>(endpoint: string, prefix: string, input: T): Promise<SubmissionResult> {
  if (isRemote()) return remotePost<SubmissionResult>(endpoint, input);
  if (apiConfig.inquiryWebhook) {
    await fetch(apiConfig.inquiryWebhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    return { ok: true, simulated: false, reference: ref(prefix) };
  }
  return { ok: true, simulated: true, reference: ref(`DEMO-${prefix}`) };
}

export const submitInquiry = (i: InquiryInput) => submit("/inquiries", "INQ", i);
export const submitViewingRequest = (i: ViewingRequestInput) => submit("/viewing-requests", "VIEW", i);
export const submitValuationRequest = (i: ValuationRequestInput) => submit("/valuation-requests", "VAL", i);
