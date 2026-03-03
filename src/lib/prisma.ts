import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

if (typeof window === "undefined") {
    console.log("[PRISMA DEBUG] Initializing with URL:", process.env.DATABASE_URL || "file:./dev.db");
}

let adapter: any = null;
if (typeof window === "undefined") {
    try {
        const url = process.env.DATABASE_URL || "file:./dev.db";
        if (url.startsWith("libsql://") || url.startsWith("https://")) {
            const libsql = createClient({
                url,
                authToken: process.env.DATABASE_AUTH_TOKEN
            })
            adapter = new PrismaLibSql(libsql)
            console.log("[PRISMA DEBUG] LibSQL Adapter initialized successfully for remote database");
        } else {
            console.log("[PRISMA DEBUG] Using standard Prisma client for local SQLite");
        }
    } catch (e) {
        console.error("[PRISMA DEBUG] Failed to initialize adapter:", e);
    }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
