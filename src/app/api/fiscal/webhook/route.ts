import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHmac } from "crypto"

/**
 * Webhook CinetPay pour le module Fiscal M17
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json()
        const signature = req.headers.get("x-cinetpay-signature")

        console.log("[WEBHOOK] Received CinetPay fiscal payload:", payload)

        // 1. Vérification de la signature (HMAC-SHA256)
        // Note: CINETPAY_SIGNATURE_KEY doit être configurée dans le .env
        const secret = process.env.CINETPAY_SIGNATURE_KEY
        if (secret && signature) {
            const hmac = createHmac("sha256", secret)
                .update(JSON.stringify(payload))
                .digest("hex")
            
            if (hmac !== signature) {
                console.warn("[WEBHOOK] Invalid CinetPay signature")
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
            }
        }

        const { transaction_id, status } = payload

        if (!transaction_id?.startsWith("fiscal_")) {
            return NextResponse.json({ message: "Not a fiscal transaction" })
        }

        const dossierId = transaction_id.split("_")[1]

        if (status === "ACCEPTED") {
            // Mise à jour du dossier fiscal
            await prisma.fiscalDossier.update({
                where: { id: dossierId },
                data: {
                    statut: "PAYE_CONFIRME",
                    paidAt: new Date(),
                }
            })

            // Déclenchement de la génération du certificat (M17)
            const { generateFiscalCert } = await import("@/actions/fiscal-actions")
            await generateFiscalCert(dossierId)

            console.log(`[WEBHOOK] Fiscal dossier ${dossierId} marked as ENREGISTRE.`)
        } else if (status === "REFUSED") {
            await prisma.fiscalDossier.update({
                where: { id: dossierId },
                data: { statut: "ECHEC_PAIEMENT" }
            })
            console.log(`[WEBHOOK] Fiscal dossier ${dossierId} marked as FAILED.`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("[WEBHOOK] CinetPay error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
