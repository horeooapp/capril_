import { NextResponse } from "next/server";
import { calculateTenantScore, getTenantScoringHistory } from "@/actions/scoring.actions";

export async function GET(
    request: Request,
    { params }: { params: { tenantId: string } }
) {
    try {
        const result = await getTenantScoringHistory(params.tenantId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 404 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { tenantId: string } }
) {
    try {
        const result = await calculateTenantScore(params.tenantId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
