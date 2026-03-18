import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("[DB-TEST] Tentative de connexion...");
        const start = Date.now();
        
        // Test simple
        await prisma.$connect();
        const userCount = await prisma.user.count();
        
        const duration = Date.now() - start;
        
        return NextResponse.json({
            status: "success",
            message: "Connexion réussie",
            userCount,
            duration: `${duration}ms`
        });
    } catch (error: any) {
        console.error("[DB-TEST] Échec:", error);
        return NextResponse.json({
            status: "error",
            message: error.message || "Erreur de connexion",
            stack: error.stack
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
