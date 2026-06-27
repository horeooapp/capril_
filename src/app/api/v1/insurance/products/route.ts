import { NextResponse } from "next/server";
import { listInsuranceProducts } from "@/actions/insurance-new.actions";

export async function GET() {
    try {
        const result = await listInsuranceProducts();
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
