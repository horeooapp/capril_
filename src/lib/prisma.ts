import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prismaClientSingleton = () => {
  // Defensive runtime check for production protocol
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    console.error("❌ CRITICAL DATABASE CONFIGURATION ERROR");
    console.error(`Invalid protocol detected: "${dbUrl.split(":")[0]}://".`);
    console.error("The production application requires a PostgreSQL connection string starting with 'postgresql://' or 'postgres://'.");
    if (dbUrl.startsWith("file:")) {
      console.error("⚠️ SQLite detected ('file:'). SQLite is not supported in this environment. Please update your environment variables.");
    }
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
