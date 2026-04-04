import { handlers } from "@/auth";

/** Prisma + adapter require Node; avoids Edge/runtime issues on Vercel. */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
