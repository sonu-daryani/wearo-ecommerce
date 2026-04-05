import { NextResponse } from "next/server";
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from "@/lib/api/types";

export function apiSuccess<T>(data: T, message: string, status = 200): NextResponse<ApiSuccessEnvelope<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function apiError(message: string, status: number): NextResponse<ApiErrorEnvelope> {
  return NextResponse.json({ success: false, message }, { status });
}
