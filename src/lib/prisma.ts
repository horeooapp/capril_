import { PrismaClient } from "@prisma/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
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
            adapter = new PrismaLibSQL(libsql)
            console.log("[PRISMA DEBUG] LibSQL Adapter initialized successfully for remote database");
        } else {
            console.log("[PRISMA DEBUG] Using standard Prisma client for local SQLite");
        }
    } catch (e) {
        console.error("[PRISMA DEBUG] Failed to initialize adapter:", e);
    }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Ensure the local SQLite path is resolved as an absolute path based on the project root.
let finalUrl = process.env.DATABASE_URL;
if (finalUrl && finalUrl.startsWith("file:")) {
    // Prevent Next.js from accidentally resolving `../` to the parent folder outside the project.
    // We strictly bind the sqlite file to the project's root `dev.db`.
    const dbPath = require("path").join(process.cwd(), "dev.db");
    finalUrl = "file:" + dbPath;
    console.log("[PRISMA DEBUG] Resolved Absolute DB Path:", finalUrl);
}

export const prisma =
    globalForPrisma.prisma ||
    (adapter ? new PrismaClient({ adapter }) : new PrismaClient({
        datasources: {
            db: { url: finalUrl }
        }
    }))

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
