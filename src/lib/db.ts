import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "";
  // Prisma Postgres proxy URLs encode the real connection string in the api_key
  const match = url.match(/api_key=(.+)/);
  if (match) {
    const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
    return decoded.databaseUrl;
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
