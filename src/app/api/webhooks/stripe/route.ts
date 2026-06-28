import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { handleStripeWebhookMock } from "@/actions/diaspora.stripe.actions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2026-06-24.dahlia" as any
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature");

        if (!signature) {
            return NextResponse.json({ error: "No signature" }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`[STRIPE_WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
            return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
        }

        switch (event.type) {
            case "invoice.payment_succeeded": {
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription;
                const customerId = invoice.customer as string;

                // Find user by customerId
                const profile = await prisma.userDiasporaProfile.findFirst({
                    where: { stripeCustomerId: customerId }
                });

                if (profile) {
                    // Update user profile and create payment history
                    await handleStripeWebhookMock(
                        profile.userId,
                        invoice.id,
                        (invoice.amount_paid / 100)
                    );
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                
                await prisma.userDiasporaProfile.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: {
                        abonnementStatut: "EXPIRED",
                        diasporaTier: "STANDARD"
                    }
                });
                break;
            }
            default:
                console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("[STRIPE_WEBHOOK_ERROR] Internal error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
