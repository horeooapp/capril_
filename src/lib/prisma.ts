import { PrismaClient } from "@prisma/client"
import { withTwentySync } from "./twenty/prisma-extension"

const globalForPrisma = globalThis as unknown as { prisma: any }

export const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  // LOGGING FOR EXORCISM (Temporary diagnostics)
  if (process.env.NODE_ENV === "production") {
    console.log(`[PRISMA INIT] DATABASE_URL Protocol: ${dbUrl ? dbUrl.split(':')[0] : 'NULL'}`);
    console.log(`[PRISMA INIT] App CWD: ${process.cwd()}`);
  }

  if (dbUrl && !dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    const errorMsg = `❌ CRITICAL DATABASE CONFIGURATION ERROR: Invalid protocol detected: "${dbUrl.split(":")[0]}//". The production application requires a PostgreSQL connection string.`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMsg);
    }
    console.error(errorMsg);
    if (dbUrl.startsWith("file:")) {
      console.error("⚠️ SQLITE GHOST DETECTED! 'file:' protocol found in environment.");
    }
  }

  if (process.env.NODE_ENV === "production" && dbUrl && !dbUrl.includes("connection_limit=")) {
    console.warn("⚠️ SCALABILITY WARNING: DATABASE_URL does not specify 'connection_limit'. For 10,000+ concurrent users, please use a connection pooler (like PgBouncer) and set ?connection_limit=20 in the URL.");
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return client.$extends(withTwentySync());
}


export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

