import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        database: "checking...",
        redis: "checking...",
        schema: {
            user_columns: []
        }
    };

    try {
        // Check DB Connectivity
        const userCount = await prisma.user.count();
        report.database = `Connected (found ${userCount} users)`;

        // Check specific columns via raw query to see what's actually in the DB
        // SQLite specific query to list columns of 'users' table
        const columns: any = await prisma.$queryRawUnsafe("PRAGMA table_info(users)");
        report.schema.user_columns = columns.map((c: any) => c.name);

        const hasProfileType = report.schema.user_columns.includes("profile_type");
        report.schema.health = hasProfileType ? "OK" : "MISSING_COLUMNS (profile_type missing)";

    } catch (e: any) {
        report.database = `Error: ${e.message}`;
    }

    try {
        if (redis) {
            await redis.set("debug_test", "ok", "EX", 10);
            const val = await redis.get("debug_test");
            report.redis = val === "ok" ? "Connected (RW OK)" : "Connected (R Error)";
        } else {
            report.redis = "Not initialized";
        }
    } catch (e: any) {
        report.redis = `Error: ${e.message}`;
    }

    return NextResponse.json(report);
}
