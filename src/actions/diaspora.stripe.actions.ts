"use server";

import { prisma } from "@/lib/prisma";
// import Stripe from "stripe";

// Mocking Stripe for the purpose of the action since we don't have the real key configured
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

/**
 * Creates a mock checkout session for the Diaspora Premium tier
 */
export async function createCheckoutSession(userId: string, planId: string = "PREMIUM") {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { diasporaProfile: true }
        });

        if (!user) throw new Error("Utilisateur introuvable");

        // Logic for Stripe session creation would go here
        // const session = await stripe.checkout.sessions.create({
        //     customer: user.diasporaProfile?.stripeCustomerId,
        //     payment_method_types: ['card'],
        //     line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        //     mode: 'subscription',
        //     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/diaspora/success?session_id={CHECKOUT_SESSION_ID}`,
        //     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/diaspora/cancel`,
        // });

        // Mock response
        const mockUrl = `https://checkout.stripe.com/pay/cs_test_mock_${Date.now()}`;
        
        return { success: true, url: mockUrl };
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

            // Conversion rate Mock EUR to FCFA
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
