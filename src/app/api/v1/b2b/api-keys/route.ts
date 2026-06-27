import { NextResponse } from "next/server";
import { generateApiAccess } from "@/actions/agence.api.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { agencyId, planType } = body;

        if (!agencyId) {
            return NextResponse.json({ success: false, error: "agencyId est requis" }, { status: 400 });
        }

        const result = await generateApiAccess(agencyId, planType || "BASIC");
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
