import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { env } from "@/lib/utils/env";

export const authConfig: NextAuthConfig = {
  providers: [
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
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "ADMIN";
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
