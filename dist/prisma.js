"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var adapter_libsql_1 = require("@prisma/adapter-libsql");
var client_2 = require("@libsql/client");
if (typeof window === "undefined") {
    console.log("[PRISMA DEBUG] Initializing with URL:", process.env.DATABASE_URL || "file:./dev.db");
}
var adapter = null;
if (typeof window === "undefined") {
    try {
        var url = process.env.DATABASE_URL || "file:./dev.db";
        if (url.startsWith("libsql://") || url.startsWith("https://")) {
            var libsql = (0, client_2.createClient)({
                url: url,
                authToken: process.env.DATABASE_AUTH_TOKEN
            });
            adapter = new adapter_libsql_1.PrismaLibSQL(libsql);
            console.log("[PRISMA DEBUG] LibSQL Adapter initialized successfully for remote database");
        }
        else {
            console.log("[PRISMA DEBUG] Using standard Prisma client for local SQLite");
        }
    }
    catch (e) {
        console.error("[PRISMA DEBUG] Failed to initialize adapter:", e);
    }
}
var globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    (adapter ? new client_1.PrismaClient({ adapter: adapter }) : new client_1.PrismaClient());
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
