"use server"

import { PrismaClient, PaymentMethod } from "@prisma/client"
import { auth } from "@/auth"

const prisma = new PrismaClient()

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

    return await prisma.receipt.create({
        data: {
            receiptNumber,
            leaseId: data.leaseId,
            periodStart: data.periodStart,
            periodEnd: data.periodEnd,
            amountPaid: data.amountPaid,
            paymentDate: data.paymentDate || new Date(),
            paymentMethod: data.paymentMethod || PaymentMethod.MOBILE_MONEY,
            isSent: false
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
                        select: { name: true, address: true, city: true }
                    },
                    owner: {
                        select: { name: true, email: true, phone: true }
                    }
                }
            }
        },
        orderBy: {
            periodStart: 'desc'
        }
    })
}
