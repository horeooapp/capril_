"use server";

import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/email";
import { auth } from "@/auth";

export async function testSMSGateway(phone: string, message: string, forceProvider?: string) {
    const session = await auth();
    // if (!session?.user?.isAdmin) throw new Error("Accès refusé");

    try {
        const success = await sendSMS(phone, message, forceProvider);
        if (success) {
            return { success: true, message: "SMS envoyé avec succès" };
        } else {
            return { success: false, error: "Toutes les tentatives d'envoi ont échoué" };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
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
