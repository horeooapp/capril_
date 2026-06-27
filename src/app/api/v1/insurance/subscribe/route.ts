import { NextResponse } from "next/server";
import { subscribeToInsurance } from "@/actions/insurance-new.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { landlordId, leaseId, productId } = body;

        if (!landlordId || !leaseId || !productId) {
            return NextResponse.json({ success: false, error: "landlordId, leaseId et productId sont requis" }, { status: 400 });
        }

        const result = await subscribeToInsurance(landlordId, leaseId, productId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
