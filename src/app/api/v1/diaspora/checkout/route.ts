import { NextResponse } from "next/server";
import { createStripeCheckoutSessionMock } from "@/actions/diaspora.stripe.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, planLevel } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: "userId est requis" }, { status: 400 });
        }

        const result = await createStripeCheckoutSessionMock(userId, planLevel || "PREMIUM");
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
