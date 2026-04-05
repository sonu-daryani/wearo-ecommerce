import { API_MESSAGES } from "@/lib/api/api-messages";
import { apiError, apiSuccess } from "@/lib/api/http-responses";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email = emailRaw.toLowerCase();
    if (!email || !password || password.length < 8) {
      return apiError(API_MESSAGES.AUTH.REGISTER_INVALID, 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError(API_MESSAGES.AUTH.REGISTER_EXISTS, 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
      },
    });

    return apiSuccess({ registered: true }, API_MESSAGES.AUTH.REGISTER_SUCCESS, 201);
  } catch {
    return apiError(API_MESSAGES.COMMON.INTERNAL_ERROR, 500);
  }
}
