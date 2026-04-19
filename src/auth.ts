import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { isEmailOtpEnabled } from "@/lib/auth/email-otp-config";
import { loginOtpIdentifier, verifyOtpAndConsume } from "@/lib/auth/otp-verification-token";
import prisma from "@/lib/prisma";

const googleEnabledFlag = (process.env.AUTH_GOOGLE_ENABLED ?? "")
  .trim()
  .toLowerCase();
const googleEnabled = googleEnabledFlag === "true" || googleEnabledFlag === "1";

const googleConfigured =
  googleEnabled &&
  Boolean(process.env.AUTH_GOOGLE_ID?.trim()) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

/** Required in production; without it every /api/auth/* route returns 500 "server configuration". */
const authSecret =
  (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET)?.trim() || undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
            // Always show Google’s account chooser so the browser cannot silently reuse another profile.
            authorization: { params: { prompt: "select_account" } },
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "One-time code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email
          ? String(credentials.email).trim().toLowerCase()
          : "";
        const password = credentials?.password
          ? String(credentials.password)
          : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        if (isEmailOtpEnabled()) {
          const otp = credentials?.otp ? String(credentials.otp).trim() : "";
          if (!otp) return null;
          const otpOk = await verifyOtpAndConsume(loginOtpIdentifier(email), otp);
          if (!otpOk) return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      const sub = token.sub as string | undefined;
      if (sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: sub },
          select: { email: true, name: true, image: true, role: true },
        });
        if (dbUser) {
          token.email = dbUser.email ?? undefined;
          token.name = dbUser.name ?? undefined;
          token.picture = dbUser.image ?? undefined;
          token.role = dbUser.role ?? "CUSTOMER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = (token.email as string) ?? "";
        session.user.name = (token.name as string) ?? null;
        session.user.image = (token.picture as string) ?? null;
        session.user.role = (token.role as Role) ?? "CUSTOMER";
      }
      return session;
    },
  },
});
