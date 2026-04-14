"use server"

import { auth } from "@/auth"
import { logAction } from "./audit"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function linkStripeAccount() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisÃ©" }

    try {
        await prisma.userDiasporaProfile.upsert({
            where: { userId: session.user.id },
            update: { diasporaStripeId: "", diasporaAbonnement: true },
            create: {
                userId: session.user.id,
                diasporaStripeId: "", 
                diasporaAbonnement: true,
                paysResidence: "France",
            }
        })
        
        await logAction({
            action: "LINK_STRIPE_INIT",
            module: "DIASPORA",
            entityId: session.user.id
        })
        
        revalidatePath("/dashboard/diaspora")
        return { success: true }
    } catch (e: any) {
        return { error: e.message || "Impossible de contacter Stripe." }
    }
}

export async function generateTaxCertificate() {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisÃ©" }

    try {
        const lease = await prisma.lease.findFirst({ where: { landlordId: session.user.id } })
        if (!lease) {
            return { error: "Aucun bail rattaché pour générer un bilan fiscal." }
        }

        const fiscal = await prisma.fiscalDossier.create({
            data: {
                leaseId: lease.id,
                loyerMensuel: lease.rentAmount,
                dureeBailMois: 12,
                dureeRetenueMois: 12,
                baseCalcul: lease.rentAmount * 12,
                tauxApplique: 0.12,
                droitsEnregistrement: lease.rentAmount * 0.05,
                fraisQapril: 15000,
                totalDgi: lease.rentAmount * 0.12,
                totalBailleur: lease.rentAmount * 0.88,
                dateLimiteLegale: new Date()
            }
        })

        await prisma.certificatFiscal.create({
            data: {
                fiscalId: fiscal.id,
                numeroCertificat: "CDI-" + Date.now().toString().substring(5),
                qrToken: "QR-CDI-" + Date.now(),
                pdfPath: "/api/docs/cdi.pdf",
                hashSha256: ""
            }
        })

        await logAction({
            action: "GENERATE_TAX_CERT",
            module: "DIASPORA",
            entityId: session.user.id
        })
        
        revalidatePath("/dashboard/diaspora")
        return { success: true }
    } catch (e: any) {
        return { error: e.message || "Erreur de gÃ©nÃ©ration." }
    }
}

export async function simulateSepaVirement(amount: number, desc?: string) {
    return { success: false, error: "Virement SEPA non disponible dans cette version." };
}

export async function subscribeToDiaspora(formData: any) {
    return { success: false, error: "Service de souscription non disponible." };
}

export async function getDiasporaDashboard() {
    return { success: true, data: { transactions: [] } };
}

export async function generateDiasporaInvite(email: string) {
    return { success: false, error: "Service désactivé." };
}

export async function designateMandatLocal(data: any) {
    return { success: false, error: "Non implémenté." };
}
