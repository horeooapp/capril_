import { NextResponse } from "next/server";
import { handleStripeWebhookMock } from "@/actions/diaspora.stripe.actions";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, sessionId, amount, status } = body;

        // In a real Stripe webhook, we would verify the signature using Stripe SDK
        // and extract data from the event object.

        if (!userId || !sessionId) {
            return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
        }

        const result = await handleStripeWebhookMock(
            userId, 
            sessionId, 
            amount || 25000, 
            status || "PAID"
        );
        
        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
