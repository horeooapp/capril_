import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

console.log("[PRISMA DEBUG] Initializing with URL:", process.env.DATABASE_URL || "file:./dev.db");

let adapter;
try {
    adapter = new PrismaLibSql({
        url: process.env.DATABASE_URL || "file:./dev.db",
    })
    console.log("[PRISMA DEBUG] Adapter initialized successfully");
} catch (e) {
    console.error("[PRISMA DEBUG] Failed to initialize adapter:", e);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma || new PrismaClient(adapter ? { adapter } : {})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
