"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role, PrepaymentRequestStatus } from "@prisma/client"
import { sendNotification } from "@/lib/notifications"

export type RequestPrepaymentInput = {
    leaseId: string;
    monthsCount: number;
    reason?: string;
};

/**
 * Tenant: Request approval for multi-month prepayment
 */
export async function requestPrepayment(input: RequestPrepaymentInput) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    if (input.monthsCount <= 1) {
        throw new Error("La demande d'approbation n'est requise que pour les paiements de plusieurs mois.");
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: input.leaseId },
            include: { property: true }
        });

        if (!lease) throw new Error("Bail introuvable.");
        if (lease.tenantId !== session.user.id) throw new Error("Non autorisé.");

        const totalAmount = lease.rentAmount * input.monthsCount;

        const request = await prisma.prepaymentRequest.create({
            data: {
                leaseId: lease.id,
                tenantId: session.user.id,
                landlordId: lease.landlordId,
                monthsCount: input.monthsCount,
                totalAmount,
                reason: input.reason,
                status: 'PENDING'
            }
        });

        // Notify Landlord
        await sendNotification({
            userId: lease.landlordId,
            title: "📩 Nouvelle demande de paiement anticipé",
            content: `Le locataire du bien ${lease.property.name || lease.property.propertyCode} souhaite payer ${input.monthsCount} mois d'avance (${totalAmount.toLocaleString()} FCFA).`,
            channels: ['PUSH', 'EMAIL']
        });

        revalidatePath("/dashboard/payments");
        return { success: true, requestId: request.id };

    } catch (error: unknown) {
        console.error("Erreur demande paiement anticipé:", error);
        return { error: "Erreur lors de la soumission de la demande." };
    }
}

/**
 * Landlord: Approve or Reject a prepayment request
 */
export async function handlePrepaymentApproval(requestId: string, approved: boolean, rejectionReason?: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.LANDLORD, Role.AGENCY, Role.LANDLORD_PRO];
    
    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Accès non autorisé.");
    }

    try {
        const request = await prisma.prepaymentRequest.findUnique({
            where: { id: requestId },
            include: { lease: { include: { property: true } } }
        });

        if (!request) throw new Error("Demande introuvable.");
        if (request.landlordId !== session.user.id && session.user.role !== Role.ADMIN) {
            throw new Error("Non autorisé.");
        }

        const updatedRequest = await prisma.prepaymentRequest.update({
            where: { id: requestId },
            data: {
                status: approved ? 'APPROVED' : 'REJECTED',
                rejectionReason: approved ? null : rejectionReason,
                approvedAt: approved ? new Date() : null,
                rejectedAt: approved ? null : new Date()
            }
        });

        // Notify Tenant
        await sendNotification({
            userId: request.tenantId,
            title: approved ? "✅ Paiement anticipé approuvé" : "❌ Paiement anticipé refusé",
            content: approved 
                ? `Votre demande pour payer ${request.monthsCount} mois (${request.totalAmount.toLocaleString()} FCFA) a été acceptée par le propriétaire.`
                : `Votre demande pour payer ${request.monthsCount} mois a été refusée. Motif : ${rejectionReason || 'Non spécifié'}.`,
            channels: ['PUSH', 'SMS']
        });

        revalidatePath("/dashboard/payments");
        return { success: true, status: updatedRequest.status };

    } catch (error: unknown) {
        console.error("Erreur validation paiement anticipé:", error);
        return { error: "Erreur lors de la validation de la demande." };
    }
}

/**
 * Get pending requests for the current user (as landlord or tenant)
 */
export async function getPrepaymentRequests() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return prisma.prepaymentRequest.findMany({
        where: {
            OR: [
                { tenantId: session.user.id },
                { landlordId: session.user.id }
            ]
        },
        include: {
            lease: {
                include: { property: true }
            },
            tenant: { select: { fullName: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}
