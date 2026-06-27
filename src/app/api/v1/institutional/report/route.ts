import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeDataContract } from "@/actions/scoring.actions";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get("apiKey");
        const commune = searchParams.get("commune");

        if (!apiKey || !commune) {
            return NextResponse.json({ success: false, error: "apiKey et commune sont requis" }, { status: 400 });
        }

        // Authenticate and consume quota
        const authResult = await consumeDataContract(apiKey);
        if (!authResult.success) {
            return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
        }

        // Generate Market Report (Mocking real data aggregation)
        const marketReport = {
            commune,
            dateGeneration: new Date(),
            moyenneLoyerM2: Math.floor(Math.random() * 5000) + 2000,
            indiceTensionLocative: (Math.random() * 10).toFixed(1),
            profilLocataireType: "Jeune Actif / Cadre",
            tauxDefautEstime: (Math.random() * 5).toFixed(2) + "%",
        };
        
        return NextResponse.json({ success: true, report: marketReport }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
