"use server"

import { PaymentMethod } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateProofHash } from "@/lib/proof"
import { scoreRentPayment } from "@/lib/scoring"

// Generates a unique receipt number like Q-YYYYMM-000X
async function generateUniqueReceiptNumber(): Promise<string> {
    const date = new Date()
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`

    // Find the latest receipt for this month
    const lastReceipt = await prisma.receipt.findFirst({
        where: {
            receiptNumber: {
                startsWith: `Q-${yearMonth}-`
            }
        },
        orderBy: {
            receiptNumber: 'desc'
        }
    })

    let sequence = 1
    if (lastReceipt) {
        const lastSequenceStr = lastReceipt.receiptNumber.split('-').pop()
        if (lastSequenceStr) {
            sequence = parseInt(lastSequenceStr, 10) + 1
        }
    }

    return `Q-${yearMonth}-${sequence.toString().padStart(4, '0')}`
}

export async function createReceipt(data: {
    leaseId: string,
    periodStart: Date,
    periodEnd: Date,
    amountPaid: number,
    paymentDate?: Date,
    paymentMethod?: PaymentMethod
}) {
    const session = await auth()

    // @ts-ignore
    const userId = session?.user?.id

    if (!userId) {
        throw new Error("Unauthorized")
    }

    // Verify lease exists and is accessible
    const lease = await prisma.lease.findUnique({
        where: { id: data.leaseId },
        include: { property: true }
    })

    if (!lease || (lease.property.ownerId !== userId && lease.property.managerId !== userId)) {
        throw new Error("Unauthorized to generate receipt for this lease")
    }

    const receiptNumber = await generateUniqueReceiptNumber()
    const qrCodeHash = `${lease.id}-${Date.now()}`

    // Reinforced Proof: Document Content Hash
    const documentHash = generateProofHash({
        receiptNumber,
        leaseId: data.leaseId,
        amountPaid: data.amountPaid,
        period: `${data.periodStart}-${data.periodEnd}`
    })

    const receipt = await prisma.receipt.create({
        data: {
            receiptNumber,
            leaseId: data.leaseId,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            amountPaid: data.amountPaid,
            paymentDate: data.paymentDate || new Date(),
            paymentMethod: data.paymentMethod || PaymentMethod.MOBILE_MONEY,
            isSent: true,
            qrCodeHash,
            documentHash
        }
    })

    // Update Tenant Reliability Score based on payment date vs period
    // If paymentDate is before or on periodEnd, it's considered on time
    const paymentDate = data.paymentDate || new Date()
    const isOnTime = paymentDate <= new Date(data.periodEnd)
    await scoreRentPayment(lease.tenantId, isOnTime)

    // Envoi de l'e-mail de notification au locataire
    const nodemailer = await import("nodemailer")

    if (process.env.EMAIL_SERVER) {
        try {
            const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER)
            // @ts-ignore
            const tenantEmail = lease.tenant?.email

            if (tenantEmail) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'no-reply@qapril.ci',
                    to: tenantEmail,
                    subject: `QAPRIL - Votre quittance de loyer N° ${receiptNumber} est disponible`,
                    html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <h2 style="color: #FF8200;">QAPRIL - Registre Locatif</h2>
               <p>Bonjour,</p>
               <p>Votre propriétaire a généré une nouvelle quittance de loyer pour le bien : <strong>${lease.property.name}</strong>.</p>
               <p>Période couverte : <strong>${new Date(data.periodStart).toLocaleDateString('fr-FR')} - ${new Date(data.periodEnd).toLocaleDateString('fr-FR')}</strong></p>
               <p>Montant : <strong>${data.amountPaid} FCFA</strong></p>
               <div style="margin: 30px 0;">
                 <a href="${appUrl}/receipts/${receipt.id}" style="background-color: #009E60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                   Voir et télécharger ma quittance
                 </a>
               </div>
               <p style="font-size: 12px; color: #666;">Ce document est officiel et comporte un QR code de vérification garanti par la plateforme QAPRIL.</p>
             </div>
           `
                })
            }
        } catch (e) {
            console.error("Erreur lors de l'envoi de l'email :", e)
            // Ne pas échouer la création de quittance si l'e-mail échoue.
        }
    }

    return receipt
}

export async function getReceiptsForTenant() {
    const session = await auth()

    // @ts-ignore
    const tenantId = session?.user?.id

    if (!tenantId) {
        throw new Error("Unauthorized")
    }

    return await prisma.receipt.findMany({
        where: {
            lease: {
                tenantId
            }
        },
        include: {
            lease: {
                include: {
                    property: {
                        select: {
                            name: true,
                            address: true,
                            city: true,
                            owner: {
                                select: { name: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            periodStart: 'desc'
        }
    })
}
