"use server";

import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", { 
    apiVersion: "2026-06-24.dahlia" as any
});

/**
 * Creates a checkout session for the Diaspora Premium tier
 */
export async function createCheckoutSession(userId: string, planId: string = "PREMIUM") {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { diasporaProfile: true }
        });

        if (!user) throw new Error("Utilisateur introuvable");

        let customerId = user.diasporaProfile?.stripeCustomerId;

        // If no stripe customer exists, create one
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                metadata: { userId: user.id }
            });
            customerId = customer.id;
            
            await prisma.userDiasporaProfile.upsert({
                where: { userId },
                create: { userId, stripeCustomerId: customerId },
                update: { stripeCustomerId: customerId }
            });
        }

        const priceId = process.env.STRIPE_PRICE_ID_PREMIUM || "price_1Placeholder";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/diaspora?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/diaspora?canceled=true`,
            metadata: { userId }
        });

        return { success: true, url: session.url };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Simulates a successful webhook from Stripe updating the subscription
 */
export async function handleStripeWebhookMock(userId: string, invoiceId: string, amountEur: number) {
    try {
        return await prisma.$transaction(async (tx) => {
            // Update profile
            const profile = await tx.userDiasporaProfile.upsert({
                where: { userId },
                update: {
                    abonnementStatut: "ACTIF",
                    diasporaTier: "PREMIUM",
                    montantMensuelEur: amountEur,
                    prochainPaiementAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
                },
                create: {
                    userId,
                    abonnementStatut: "ACTIF",
                    diasporaTier: "PREMIUM",
                    montantMensuelEur: amountEur,
                    prochainPaiementAt: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            });

            // Conversion rate Mock EUR to XOF
            const tauxChange = 655.957;
            const montantFcfa = amountEur * tauxChange;

            const payment = await tx.diasporaPaymentHistory.create({
                data: {
                    userId,
                    stripeInvoiceId: invoiceId,
                    montantEur: amountEur,
                    montantFcfa,
                    tauxChange,
                    statut: "PAID",
                    periodDebut: new Date(),
                    periodFin: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            });

            return { success: true, profile, payment };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get diaspora subscription details
 */
export async function getDiasporaSubscription(userId: string) {
    try {
        const profile = await prisma.userDiasporaProfile.findUnique({
            where: { userId }
        });
        return { success: true, profile };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
