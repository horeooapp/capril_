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
        include: { 
            property: true,
            tenant: true
        }
    })

    if (!lease || (lease.property.ownerId !== userId && lease.property.managerId !== userId)) {
        throw new Error("Unauthorized to generate receipt for this lease")
    }

    const receiptNumber = await generateUniqueReceiptNumber()
    const paymentDate = data.paymentDate || new Date()
    const paymentMethod = data.paymentMethod || PaymentMethod.MOBILE_MONEY

    // Reinforced Proof: Document Content Hash (SHA-256 equivalent via proof.ts)
    const qrCodeHash = `${receiptNumber}-${lease.id}-${Date.now()}`
    const documentHash = generateProofHash({
        receiptNumber,
        leaseId: data.leaseId,
        amountPaid: data.amountPaid,
        period: `${data.periodStart}-${data.periodEnd}`,
        paymentDate: paymentDate.toISOString(),
        paymentMethod: paymentMethod
    })

    const receipt = await prisma.receipt.create({
        data: {
            receiptNumber,
            leaseId: data.leaseId,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            amountPaid: data.amountPaid,
            paymentDate,
            paymentMethod,
            isSent: true,
            qrCodeHash,
            documentHash
        }
    })

    // Update Tenant Reliability Score based on payment date vs period
    // diffDays > 0 means late, <= 0 means on time or anticipated
    const diffTime = paymentDate.getTime() - new Date(data.periodEnd).getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    await scoreRentPayment(lease.tenantId, diffDays, receipt.id)

    // Envoi de l'e-mail de notification au locataire
    const resendKey = process.env.AUTH_RESEND_KEY
    const tenantEmail = lease.tenant?.email

    if (resendKey && tenantEmail) {
        try {
            const { Resend: ResendSDK } = await import("resend")
            const resend = new ResendSDK(resendKey)
            
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

            await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: tenantEmail,
                subject: `QAPRIL - Quittance de loyer N° ${receiptNumber}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #FF8200;">QAPRIL - Registre Locatif</h2>
                        <p>Bonjour,</p>
                        <p>Une nouvelle quittance de loyer est disponible pour le bien : <strong>${lease.property.name}</strong>.</p>
                        <p>Période : <strong>${new Date(data.periodStart).toLocaleDateString('fr-FR')} - ${new Date(data.periodEnd).toLocaleDateString('fr-FR')}</strong></p>
                        <div style="margin: 30px 0;">
                            <a href="${appUrl}/receipts/${receipt.id}" style="background-color: #009E60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                Télécharger ma quittance
                            </a>
                        </div>
                    </div>
                `
            })
            console.log(`[RECEIPT] Email sent via Resend to ${tenantEmail}`)
        } catch (e) {
            console.error("[RECEIPT ERROR] Resend failed:", e)
        }
    } else if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM && tenantEmail) {
        // Fallback to Nodemailer if SMTP is configured but Resend is not or fails
        try {
            const nodemailer = await import("nodemailer")
            const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER)
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
            
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: tenantEmail,
                subject: `QAPRIL - Votre quittance de loyer N° ${receiptNumber}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #FF8200;">QAPRIL</h2>
                        <p>Une nouvelle quittance est disponible.</p>
                        <a href="${appUrl}/receipts/${receipt.id}" style="color: #FF8200; font-weight: bold;">Télécharger la quittance</a>
                    </div>
                `
            })
        } catch (e) {
            console.error("[RECEIPT ERROR] Nodemailer fallback failed:", e)
        }
    }

    return receipt
}

export async function getReceiptById(id: string) {
    return await prisma.receipt.findUnique({
        where: { id },
        include: {
            lease: {
                include: {
                    property: {
                        include: {
                            owner: {
                                select: { name: true, email: true, phone: true }
                            }
                        }
                    },
                    tenant: {
                        select: { name: true, email: true, phone: true }
                    }
                }
            }
        }
    })
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
