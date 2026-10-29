import { apiConfig } from "./config";

/**
 * Server-side proxy to the real backend (DATA_SOURCE=remote).
 * The API key stays on the server; browsers only ever talk to our own /api routes.
 */
export async function remoteGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiConfig.backendUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", Authorization: `Bearer ${apiConfig.backendKey}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Backend ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export async function remotePost<T>(path: string, body: unknown): Promise<T> {
  return remoteGet<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export const isRemote = () => apiConfig.dataSource === "remote" && !!apiConfig.backendUrl;
