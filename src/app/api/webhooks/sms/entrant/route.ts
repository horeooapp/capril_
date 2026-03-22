import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"

/**
 * M-SMS-DECLARATION : Webhook d'entrée pour les SMS Locataires
 * Supporte Africa's Talking, Orange CI, etc.
 */
export async function POST(req: NextRequest) {
    try {
        let from = ""
        let text = ""

        // Détection du format (FormData pour Africa's Talking, JSON pour d'autres)
        const contentType = req.headers.get("content-type") || ""
        if (contentType.includes("form-data") || contentType.includes("url-encoded")) {
            const formData = await req.formData()
            from = formData.get("from")?.toString() || ""
            text = formData.get("text")?.toString() || ""
        } else {
            const body = await req.json()
            from = body.from || body.sender || ""
            text = body.text || body.content || ""
        }

        if (!from || !text) return NextResponse.json({ error: "Missing payload" }, { status: 400 })

        // Normalisation du numéro (enlever le +)
        const phone = from.replace("+", "")

        // Recherche du locataire
        const tenant = await prisma.user.findUnique({
            where: { phone: phone }
        })

        if (!tenant) {
            await sendSMS(from, "QAPRIL : Votre numéro n'est pas reconnu. Veuillez contacter votre bailleur.")
            return NextResponse.json({ status: "ignored_unknown_user" })
        }

        // Recherche du bail actif
        const lease = await prisma.lease.findFirst({
            where: { 
                tenantId: tenant.id,
                status: "ACTIVE"
            },
            include: { 
                property: {
                    include: {
                        owner: true,
                        accessRoles: {
                            where: { role: "MANAGER", statut: "ACTIF" },
                            include: { user: true }
                        }
                    }
                }
            } as any
        })

        if (!lease) {
            await sendSMS(from, "QAPRIL : Aucun bail actif trouvé pour votre compte.")
            return NextResponse.json({ status: "ignored_no_lease" })
        }

        // Parsing du montant : "PAYE 45000"
        const amountMatch = text.match(/PAYE\s+(\d+)/i)
        if (!amountMatch) {
            await sendSMS(from, "QAPRIL : Format invalide. Envoyez 'PAYE [montant]' (ex: PAYE 35000).")
            return NextResponse.json({ status: "invalid_format" })
        }

        const amount = parseInt(amountMatch[1])

        // Création de la déclaration
        const declaration = await (prisma as any).smsDeclaration.create({
            data: {
                leaseId: lease.id,
                tenantId: tenant.id,
                montantDeclare: amount,
                canal: "SMS",
                statut: "EN_ATTENTE",
                smsBrut: text,
                expireAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 heures de validité
            }
        })

        // Déterminer qui notifier (manager prioritaire, sinon owner)
        const managers = (lease as any).property.accessRoles
        const recipients = managers.length > 0 ? managers.map((m: any) => m.user) : [(lease as any).property.owner]

        const tenantName = tenant.fullName || tenant.phone
        const alertMsg = `QAPRIL : ${tenantName} déclare avoir payé ${amount.toLocaleString()} FCFA. Répondez OUI pour confirmer et générer la quittance, ou NON pour contester.`

        for (const recipient of recipients) {
            if (recipient.phone) {
                await sendSMS(recipient.phone, alertMsg)
            }
        }

        return NextResponse.json({ status: "success", declarationId: declaration.id })

    } catch (error) {
        console.error("[SMS WEBHOOK ERROR]:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
