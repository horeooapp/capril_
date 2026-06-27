import { NextResponse } from "next/server";
import { markSyndicFacturePaid } from "@/actions/syndic-b2b.actions";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { paymentRef } = body;

        const result = await markSyndicFacturePaid(id, paymentRef);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
