"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { evaluateTransactionRisk } from "@/lib/m-guard"

/**
 * M-SIG-ELEC : Initiation de la signature électronique.
 * Génère un code OTP et simule l'envoi par SMS au locataire.
 */
export async function initiateLeaseSignature(leaseId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé." }

    try {
        // --- M-GUARD Check ---
        const risk = await evaluateTransactionRisk({
            userId: session.user.id,
            action: "SIGNATURE"
        });

        if (!risk.isSafe) {
            return { success: false, error: `Action bloquée : risque de sécurité détecté (${risk.reason}).` }
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { tenant: true }
        })

        if (!lease || !lease.tenant) return { success: false, error: "Bail ou locataire introuvable." }

        // Génération d'un OTP à 6 chiffres
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        await prisma.lease.update({
            where: { id: leaseId },
            data: { signingOtp: otp }
        })

        // TODO: Appel service SMS (Orange/MTN/Moov) via Gateway SMS
        console.log(`[SMS OTP] Envoi du code ${otp} au locataire ${lease.tenant.email}`)

        return { success: true, message: "Code de signature envoyé par SMS." }
    } catch (error) {
        return { success: false, error: "Échec de l'initiation de la signature." }
    }
}

/**
 * M-SIG-ELEC : Vérification et scellage du bail.
 */
export async function verifyLeaseSignature(leaseId: string, otp: string, ip: string, userAgent: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Non autorisé." }

    try {
        // --- ADD-05.1 : M-GUARD Check ---
        const risk = await evaluateTransactionRisk({
            userId: session.user.id,
            action: "SIGNATURE",
            ip: ip,
            userAgent: userAgent
        });

        if (!risk.isSafe) {
            return { success: false, error: `Sécurité : Action bloquée (${risk.reason}). Veuillez contacter l'administration.` };
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId }
        })

        if (!lease || (lease as any).signingOtp !== otp) {
            return { success: false, error: "Code OTP invalide ou expiré." }
        }

        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                isSignedElectronically: true,
                signedAt: new Date(),
                signingOtp: null, // Clear OTP after use
                signatureContext: {
                    ip,
                    userAgent,
                    timestamp: new Date().toISOString()
                }
            } as any
        })

        revalidatePath(`/dashboard/leases/${leaseId}`)
        return { success: true, message: "Bail signé avec succès et scellé numériquement." }
    } catch (error) {
        console.error("Signature error:", error);
        return { success: false, error: "Erreur lors de la validation de la signature." }
    }
}
