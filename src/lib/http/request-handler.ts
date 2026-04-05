import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { API_MESSAGES } from "@/lib/api/api-messages";
import type { ApiEnvelope } from "@/lib/api/types";
import { getApiClient } from "@/lib/http/api-client";

export type ApiOk<T> = { ok: true; data: T; message: string; status: number };
export type ApiErr = { ok: false; message: string; status?: number };
export type ApiResult<T> = ApiOk<T> | ApiErr;

export function pickUserMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) return o.message;
    if (typeof o.error === "string" && o.error.trim()) return o.error;
  }
  return fallback;
}

/**
 * Raw Axios call. For JSON that uses `{ success, message, data }`, use `postEnvelope` / `getEnvelope`.
 */
export async function requestHandler<T>(config: AxiosRequestConfig): Promise<ApiResult<T>> {
  try {
    const res = await getApiClient().request<T>(config);
    const status = res.status;
    const body = res.data;
    if (status >= 200 && status < 300) {
      return { ok: true, data: body as T, message: "", status };
    }
    return {
      ok: false,
      message: pickUserMessage(body, `Request failed (${status})`),
      status,
    };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const ax = e as AxiosError<{ message?: string; error?: string }>;
      const status = ax.response?.status;
      const msg = ax.response
        ? pickUserMessage(ax.response.data, ax.message || "Request failed")
        : ax.message || API_MESSAGES.COMMON.NETWORK_UNAVAILABLE;
      return { ok: false, message: msg, status };
    }
    return { ok: false, message: API_MESSAGES.COMMON.INTERNAL_ERROR };
  }
}

function parseEnvelope<T>(body: unknown, status: number): ApiResult<T> {
  if (!body || typeof body !== "object" || !("success" in body)) {
    return { ok: true, data: body as T, message: "", status };
  }
  const env = body as ApiEnvelope<T>;
  if (env.success === false) {
    return { ok: false, message: env.message, status };
  }
  return { ok: true, data: env.data as T, message: env.message, status };
}

export async function postEnvelope<T>(
  url: string,
  body?: unknown,
  config?: Omit<AxiosRequestConfig, "url" | "method" | "data">
): Promise<ApiResult<T>> {
  const r = await requestHandler<unknown>({ ...config, method: "POST", url, data: body ?? {} });
  if (!r.ok) return r;
  return parseEnvelope<T>(r.data, r.status);
}

export async function getEnvelope<T>(
  url: string,
  config?: Omit<AxiosRequestConfig, "url" | "method">
): Promise<ApiResult<T>> {
  const r = await requestHandler<unknown>({ ...config, method: "GET", url });
  if (!r.ok) return r;
  return parseEnvelope<T>(r.data, r.status);
}

/** Non-envelope JSON (e.g. `/api/company-settings`). */
export async function getPlain<T>(url: string, config?: Omit<AxiosRequestConfig, "url" | "method">) {
  return requestHandler<T>({ ...config, method: "GET", url });
}

export async function postPlain<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: Omit<AxiosRequestConfig, "url" | "method" | "data">
) {
  return requestHandler<TResponse>({ ...config, method: "POST", url, data: body ?? {} });
}
