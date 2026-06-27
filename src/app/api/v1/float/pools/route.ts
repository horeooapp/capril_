import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertFloatPool } from "@/actions/float.actions";

export async function GET() {
    try {
        const pools = await prisma.floatPool.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, pools }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { compteRef, partenaireBanque, tauxRendement } = body;

        if (!compteRef || !partenaireBanque) {
            return NextResponse.json({ success: false, error: "compteRef et partenaireBanque sont requis" }, { status: 400 });
        }

        const result = await upsertFloatPool({ compteRef, partenaireBanque, tauxRendement });
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
