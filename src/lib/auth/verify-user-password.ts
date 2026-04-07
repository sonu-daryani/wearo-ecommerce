import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function verifyUserPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  return user;
}
