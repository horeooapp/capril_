"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ColocRole, ColocMode, LoyerStatut } from "@prisma/client"
import { logAction } from "./audit"

export async function addColocataire(data: {
    leaseId: string,
    userId: string,
    role: ColocRole,
    partLoyer?: number,
    pctLoyer?: number,
    modePaiement: ColocMode
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Check if role PRINCIPAL is unique for this lease (Rule MC-01)
    if (data.role === ColocRole.PRINCIPAL) {
        const existingPrincipal = await prisma.colocataire.findFirst({
            where: { leaseId: data.leaseId, role: ColocRole.PRINCIPAL, status: "ACTIF" }
        })
        if (existingPrincipal) {
            throw new Error("Ce bail a déjà un locataire principal actif.")
        }
    }

    const colocataire = await prisma.colocataire.create({
        data: {
            leaseId: data.leaseId,
            userId: data.userId,
            role: data.role,
            partLoyer: data.partLoyer,
            pctLoyer: data.pctLoyer,
            modePaiement: data.modePaiement,
            dateEntree: new Date(),
        }
    })

    await logAction({
        action: "ADD_COLOCATAIRE",
        module: "COLOC",
        entityId: colocataire.id,
        newValues: { leaseId: data.leaseId, userId: data.userId }
    })

    return colocataire
}

export async function recordColocPayment(data: {
    colocataireId: string,
    month: string, // YYYY-MM
    amount: number,
    method: string,
    operatorRef?: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const coloc = await prisma.colocataire.findUnique({
        where: { id: data.colocataireId },
        include: { lease: true }
    })

    if (!coloc) throw new Error("Colocataire non trouvé")

    const payment = await prisma.colocPayment.create({
        data: {
            leaseId: coloc.leaseId,
            colocataireId: data.colocataireId,
            month: data.month,
            amount: data.amount,
            method: data.method,
            operatorRef: data.operatorRef,
        }
    })

    // Update monthly synthesis (Rule MC-03)
    let synthesis = await prisma.monthlyRentSynthesis.findUnique({
        where: { leaseId_month: { leaseId: coloc.leaseId, month: data.month } }
    })

    if (!synthesis) {
        synthesis = await prisma.monthlyRentSynthesis.create({
            data: {
                leaseId: coloc.leaseId,
                month: data.month,
                totalExpected: coloc.lease.rentAmount + coloc.lease.chargesAmount,
                amountCollected: data.amount,
                status: data.amount >= (coloc.lease.rentAmount + coloc.lease.chargesAmount) ? LoyerStatut.COMPLET : LoyerStatut.PARTIEL
            }
        })
    } else {
        const newTotal = synthesis.amountCollected + data.amount
        const isComplete = newTotal >= synthesis.totalExpected
        
        synthesis = await prisma.monthlyRentSynthesis.update({
            where: { id: synthesis.id },
            data: {
                amountCollected: newTotal,
                status: isComplete ? LoyerStatut.COMPLET : LoyerStatut.PARTIEL,
                completedAt: isComplete ? new Date() : undefined
            }
        })
    }

    await logAction({
        action: "RECORD_COLOC_PAYMENT",
        module: "COLOC",
        entityId: payment.id,
        newValues: { amount: data.amount, status: synthesis.status }
    })

    return payment
}

export async function getLeaseColocataires(leaseId: string) {
    return await prisma.colocataire.findMany({
        where: { leaseId, status: "ACTIF" },
        include: { user: { select: { fullName: true, phone: true } } }
    })
}

export async function getMonthlySynthesis(leaseId: string, month: string) {
    return await prisma.monthlyRentSynthesis.findUnique({
        where: { leaseId_month: { leaseId, month } },
        include: { 
            lease: { 
                include: { 
                    colocataires: { 
                        where: { status: "ACTIF" },
                        include: { 
                            user: { select: { fullName: true } },
                            payments: { where: { month } }
                        } 
                    } 
                } 
            } 
        }
    })
}
