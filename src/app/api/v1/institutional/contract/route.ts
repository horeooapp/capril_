import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDataContract } from "@/actions/scoring.actions";

export async function GET() {
    try {
        const contracts = await prisma.dataLicenseContract.findMany({
            orderBy: { createdAt: "desc" },
            include: { partner: true }
        });
        
        return NextResponse.json({ success: true, contracts }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agencyId, plan, baseCost, validUntil } = body;

        if (!agencyId || !plan || !baseCost || !validUntil) {
            return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 });
        }

        const result = await generateDataContract(
            agencyId, 
            plan, 
            baseCost, 
            new Date(validUntil)
        );
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
