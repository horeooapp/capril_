import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Lightweight health check endpoint for deployment pipeline and monitoring.
 */
export async function GET() {
    const start = Date.now();

    try {
        // Verify DB connectivity with a lightweight query
        await prisma.$queryRaw`SELECT 1`;
        const dbLatencyMs = Date.now() - start;

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || "3.0.0",
            dbLatencyMs,
            environment: process.env.NODE_ENV
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: "Database unreachable",
            detail: process.env.NODE_ENV === "development" ? error.message : undefined
        }, { status: 503 });
    }
}
