import { NextResponse } from "next/server";
import { releaseDeposit } from "@/actions/float.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { depositId, depositType } = body;

        if (!depositId || !depositType) {
            return NextResponse.json({ success: false, error: "depositId et depositType sont requis" }, { status: 400 });
        }

        if (depositType !== "CDC_DEPOSIT" && depositType !== "VAULT_CAUTION") {
            return NextResponse.json({ success: false, error: "depositType invalide. Doit être CDC_DEPOSIT ou VAULT_CAUTION" }, { status: 400 });
        }

        const result = await releaseDeposit(depositId, depositType);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
