"use server";

import { sendSMSWithDetails, OrangeSMSService } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function testSMSGateway(phone: string, message: string, forceProvider?: string) {
    const session = await auth();
    // if (!session?.user?.isAdmin) throw new Error("Accès refusé");

    try {
        const result = await sendSMSWithDetails(phone, message, forceProvider);
        if (result.success) {
            return {
                success: true,
                message: `SMS envoyé avec succès via ${result.provider} (ID: ${result.messageId || 'OK'})`,
                provider: result.provider,
                messageId: result.messageId
            };
        } else {
            return {
                success: false,
                error: result.error || "Toutes les tentatives d'envoi ont échoué",
                provider: result.provider
            };
        }
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur inattendue" };
    }
}

export async function getOrangeSMSStatus() {
    try {
        const service = new OrangeSMSService();
        const balance = await service.checkBalance();
        return {
            configured: true,
            provider: process.env.SMS_GATEWAY_PROVIDER || "ORANGE",
            senderNumber: process.env.ORANGE_SMS_SENDER_NUMBER || "tel:+22500000000",
            senderName: process.env.ORANGE_SMS_SENDER_NAME || "QAPRIL",
            ...balance
        };
    } catch (error: any) {
        return {
            configured: false,
            error: error.message || "Impossible de récupérer le statut Orange SMS"
        };
    }
}

export async function testEmailGateway(email: string, subject: string, html: string) {
    const session = await auth();
    // if (!session?.user?.isAdmin) throw new Error("Accès refusé");

    try {
        const result = await sendEmail({ to: email, subject, html });
        if (result.success) {
            return { success: true, provider: result.provider };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
