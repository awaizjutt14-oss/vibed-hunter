import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createNoopModel() {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        switch (prop) {
          case "findMany":
            return async () => [];
          case "findFirst":
          case "findUnique":
            return async () => null;
          case "count":
            return async () => 0;
          case "create":
          case "update":
          case "upsert":
            return async (args?: { data?: unknown }) => args?.data ?? {};
          case "createMany":
          case "updateMany":
          case "deleteMany":
            return async () => ({ count: 0 });
          case "findUniqueOrThrow":
            return async () => {
              throw new Error("Prisma is unavailable because DATABASE_URL is missing or invalid.");
            };
          default:
            return async () => null;
        }
      }
    }
  );
}

function createNoopPrisma() {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "$connect" || prop === "$disconnect" || prop === "$transaction") {
          return async () => null;
        }
        return createNoopModel();
      }
    }
  ) as PrismaClient;
}

function hasUsableDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  return !!url && /^(postgresql|postgres|file):\/\//.test(url);
}

export const prisma =
  hasUsableDatabaseUrl()
    ? global.__prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"]
      })
    : createNoopPrisma();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
