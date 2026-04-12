"use server"

import { auth } from "@/auth"
import { logAction } from "./audit"
import { revalidatePath } from "next/cache"

export async function linkStripeAccount() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await logAction({
            action: "LINK_STRIPE_INIT",
            module: "DIASPORA",
            entityId: session.user.id
        })
        
        await new Promise(resolve => setTimeout(resolve, 1500))
        revalidatePath("/dashboard/diaspora")
        return { success: true }
    } catch (e) {
        return { error: "Impossible de contacter Stripe." }
    }
}

export async function generateTaxCertificate() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await logAction({
            action: "GENERATE_TAX_CERT",
            module: "DIASPORA",
            entityId: session.user.id
        })
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        return { success: true }
    } catch (e) {
        return { error: "Erreur lors de la génération CDI." }
    }
}

export async function simulateSepaVirement(amount: number, desc?: string) {
    return { success: true, message: "OK", error: undefined as undefined | string };
}

export async function subscribeToDiaspora(formData: any) {
    return { success: true, error: undefined };
}

export async function getDiasporaDashboard() {
    return { success: true, data: {} as any };
}

export async function generateDiasporaInvite(email: string) {
    return { success: true, inviteUrl: "https://invite.link", error: undefined };
}

export async function designateMandatLocal(data: any) {
    return { success: true, error: undefined };
}
