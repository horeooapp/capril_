import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  // LOGGING FOR EXORCISM (Temporary diagnostics)
  if (process.env.NODE_ENV === "production") {
    console.log(`[PRISMA INIT] DATABASE_URL Protocol: ${dbUrl ? dbUrl.split(':')[0] : 'NULL'}`);
    console.log(`[PRISMA INIT] App CWD: ${process.cwd()}`);
  }

  if (dbUrl && !dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
    console.error("❌ CRITICAL DATABASE CONFIGURATION ERROR");
    console.error(`Invalid protocol detected: "${dbUrl.split(":")[0]}//".`);
    console.error("The production application requires a PostgreSQL connection string.");
    if (dbUrl.startsWith("file:")) {
      console.error("⚠️ SQLITE GHOST DETECTED! 'file:' protocol found in environment.");
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
