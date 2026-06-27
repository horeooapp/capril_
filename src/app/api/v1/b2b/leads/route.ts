import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purchaseLead } from "@/actions/marketplace.actions";

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            where: { statut: "NOUVEAU" },
            orderBy: { createdAt: "desc" }
        });
        
        return NextResponse.json({ success: true, leads }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { leadId, agencyId, amount } = body;

        if (!leadId || !agencyId || !amount) {
            return NextResponse.json({ success: false, error: "leadId, agencyId et amount sont requis" }, { status: 400 });
        }

        const result = await purchaseLead(agencyId, leadId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
