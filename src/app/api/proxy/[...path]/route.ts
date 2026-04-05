import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 6 * 1024 * 1024;

/** Allowed proxy path segments (alphanumeric, hyphen, underscore) */
const SEGMENT = /^[a-zA-Z0-9_-]+$/;

function proxyTarget(): string | null {
  const raw = process.env.BACKEND_PROXY_TARGET?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function validatePath(segments: string[]): boolean {
  if (segments.length === 0 || segments.length > 12) return false;
  return segments.every((s) => s.length > 0 && s.length <= 64 && SEGMENT.test(s));
}

function forwardHeaders(req: NextRequest): Headers {
  const out = new Headers();
  const skip = new Set([
    "host",
    "connection",
    "content-length",
    "transfer-encoding",
    "keep-alive",
    "upgrade",
  ]);
  req.headers.forEach((value, key) => {
    if (!skip.has(key.toLowerCase())) {
      out.set(key, value);
    }
  });
  const secret = process.env.BACKEND_PROXY_SECRET?.trim();
  if (secret) {
    out.set("x-wearo-proxy-secret", secret);
  }
  return out;
}

function filterResponseHeaders(incoming: Headers): Headers {
  const out = new Headers(incoming);
  out.delete("transfer-encoding");
  out.delete("connection");
  return out;
}

async function handle(req: NextRequest, ctx: { params: { path: string[] } }) {
  const base = proxyTarget();
  if (!base) {
    return NextResponse.json(
      { error: "Proxy not configured. Set BACKEND_PROXY_TARGET on the server." },
      { status: 503 }
    );
  }

  const segments = ctx.params.path ?? [];
  if (!validatePath(segments)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const subpath = segments.join("/");
  const url = new URL(req.url);
  const targetUrl = `${base}/${subpath}${url.search}`;

  const method = req.method.toUpperCase();
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Body too large" }, { status: 413 });
    }
    body = buf;
  }

  const res = await fetch(targetUrl, {
    method,
    headers: forwardHeaders(req),
    body: body && method !== "GET" && method !== "HEAD" ? Buffer.from(body) : undefined,
    redirect: "manual",
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: filterResponseHeaders(res.headers),
  });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return handle(req, ctx);
}
