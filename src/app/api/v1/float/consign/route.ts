import { NextResponse } from "next/server";
import { consignDeposit } from "@/actions/float.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { depositId, depositType, poolId } = body;

        if (!depositId || !depositType || !poolId) {
            return NextResponse.json({ success: false, error: "depositId, depositType et poolId sont requis" }, { status: 400 });
        }

        if (depositType !== "CDC_DEPOSIT" && depositType !== "VAULT_CAUTION") {
            return NextResponse.json({ success: false, error: "depositType invalide. Doit être CDC_DEPOSIT ou VAULT_CAUTION" }, { status: 400 });
        }

        const result = await consignDeposit(depositId, depositType, poolId);
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
