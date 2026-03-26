import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/utils/env";

const providers = [];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  );
}

providers.push(
  Credentials({
    name: "Demo credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (
        credentials?.email === env.DEMO_ADMIN_EMAIL &&
        credentials?.password === env.DEMO_ADMIN_PASSWORD
      ) {
        return {
          id: "demo-admin",
          email: env.DEMO_ADMIN_EMAIL,
          name: "Demo Admin"
        };
      }
      return null;
    }
  })
);

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined
          },
          create: {
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            role: user.email === env.DEMO_ADMIN_EMAIL ? "ADMIN" : "USER"
          }
        }).catch(() => null);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) token.role = account?.provider === "credentials" ? "ADMIN" : "USER";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = typeof token.email === "string" ? token.email : "";
        session.user.name = typeof token.name === "string" ? token.name : "";
      }
      return session;
    }
  }
};
