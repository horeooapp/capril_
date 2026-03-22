import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"
import { generateReceiptRef } from "@/lib/receipt"
import { generateProofHash } from "@/lib/proof"
import { scoreRentPayment } from "@/lib/scoring"

/**
 * M-SMS-DECLARATION : Webhook de Confirmation (OUI/NON)
 * Traite la réponse du gestionnaire ou du propriétaire.
 */
export async function POST(req: NextRequest) {
    try {
        let from = ""
        let text = ""

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

        const phone = from.replace("+", "")
        const decision = text.trim().toUpperCase()

        if (decision !== "OUI" && decision !== "NON") {
            return NextResponse.json({ status: "ignored_not_confirmation" })
        }

        // 1. Identifier l'expéditeur (Manager ou Owner)
        const sender = await prisma.user.findUnique({ where: { phone } })
        if (!sender) return NextResponse.json({ status: "unknown_sender" })

        // 2. Trouver la déclaration en attente pour ce gestionnaire
        // On cherche une déclaration liée à un bail dont le gestionnaire est l'expéditeur 
        // ou le propriétaire est l'expéditeur.
        const declaration = await (prisma as any).smsDeclaration.findFirst({
            where: {
                statut: "EN_ATTENTE",
                lease: {
                    OR: [
                        { property: { ownerUserId: sender.id } },
                        { property: { accessRoles: { some: { userId: sender.id, statut: "ACTIF" } } } }
                    ]
                }
            },
            include: {
                lease: {
                    include: {
                        tenant: true,
                        property: { include: { owner: true } }
                    }
                },
                tenant: true
            },
            orderBy: { createdAt: "desc" }
        })

        if (!declaration) {
            await sendSMS(from, "QAPRIL : Aucune déclaration en attente n'a été trouvée pour vos biens.")
            return NextResponse.json({ status: "no_pending_declaration" })
        }

        if (decision === "OUI") {
            // CONFIRMATION
            const periodMonth = new Date().toISOString().slice(0, 7) // Mois actuel
            const amount = Number(declaration.montantDeclare)

            // Génération Quittance (Version simplifiée car pas de session pour Wallet)
            const receiptRef = await generateReceiptRef()
            const documentHash = generateProofHash({
                receiptRef,
                leaseId: declaration.leaseId,
                totalAmount: amount,
                period: periodMonth,
                receiptType: "RENT"
            })

            const receipt = await prisma.receipt.create({
                data: {
                    receiptRef,
                    leaseId: declaration.leaseId,
                    periodMonth: periodMonth,
                    rentAmount: amount,
                    chargesAmount: 0,
                    totalAmount: amount,
                    paymentMethod: "CASH",
                    paymentRef: "SMS_DECLARATION",
                    paidAt: new Date(),
                    receiptHash: documentHash,
                    status: "PAID",
                    declarative: true
                }
            })

            await (prisma as any).smsDeclaration.update({
                where: { id: declaration.id },
                data: { 
                    statut: "CONFIRME", 
                    confirmeParId: sender.id, 
                    confirmeAt: new Date(),
                    receiptId: receipt.id
                }
            })

            // Scoring
            try {
                const [year, month] = periodMonth.split('-').map(Number);
                const dueDate = new Date(year, month - 1, 5);
                const diffDays = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                await scoreRentPayment(declaration.tenantId, diffDays, receipt.id);
            } catch (e) {}

            // Notifications
            await sendSMS(from, `QAPRIL : Paiement confirmé. Quittance ${receiptRef} générée.`)
            if (declaration.tenant.phone) {
                await sendSMS(declaration.tenant.phone, `QAPRIL : Votre paiement de ${amount.toLocaleString()} FCFA est confirmé. Votre quittance est prête !`)
            }

        } else {
            // CONTESTATION
            await (prisma as any).smsDeclaration.update({
                where: { id: declaration.id },
                data: { statut: "CONTESTE", confirmeParId: sender.id, confirmeAt: new Date() }
            })

            await sendSMS(from, "QAPRIL : Contestation enregistrée. Le locataire a été prévenu.")
            if (declaration.tenant.phone) {
                await sendSMS(declaration.tenant.phone, `QAPRIL : Votre bailleur conteste votre déclaration de paiement. Veuillez le contacter rapidement.`)
            }
        }

        return NextResponse.json({ status: "success" })

    } catch (error) {
        console.error("[SMS CONFIRMATION ERROR]:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
