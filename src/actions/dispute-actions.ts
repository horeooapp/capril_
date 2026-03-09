"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export type CreateDisputeInput = {
    leaseId: string;
    title: string;
    description: string;
    amountInDispute?: number;
};

/**
 * Part 16.1: Initialize a Dispute
 */
export async function createDispute(input: CreateDisputeInput) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: input.leaseId },
            select: { id: true, landlordId: true, tenantId: true }
        });

        if (!lease) throw new Error("Bail introuvable.");

        // Check if user is landlord or tenant of this lease
        if (session.user.id !== lease.landlordId && session.user.id !== lease.tenantId && (session.user.role as Role) !== Role.ADMIN) {
            throw new Error("Vous n'êtes pas autorisé à ouvrir un litige sur ce bail.");
        }

        const dispute = await prisma.dispute.create({
            data: {
                leaseId: input.leaseId,
                title: input.title,
                description: input.description,
                amountInDispute: input.amountInDispute,
                status: 'open'
            }
        });

        revalidatePath(`/dashboard/leases/${input.leaseId}`);
        return { success: true, disputeId: dispute.id };

    } catch (error: any) {
        console.error("Erreur création litige:", error);
        return { error: error.message || "Impossible d'ouvrir le litige." };
    }
}

/**
 * Part 16.2: Send Mediation Message
 */
export async function sendMediationMessage(disputeId: string, content: string, attachments: string[] = []) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    try {
        const dispute = await prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { lease: true }
        });

        if (!dispute) throw new Error("Litige introuvable.");

        // Authorization: Landlord, Tenant, or Agent/Admin
        const isParticipant = session.user.id === dispute.lease.landlordId || session.user.id === dispute.lease.tenantId;
        const isAgent = [Role.ADMIN, Role.ANAH_AGENT, Role.CDC_AGENT].includes(session.user.role as Role);

        if (!isParticipant && !isAgent) {
            throw new Error("Accès non autorisé.");
        }

        const message = await prisma.mediationMessage.create({
            data: {
                disputeId,
                senderId: session.user.id,
                content,
                attachments
            }
        });

        // Automatically transition to 'in_mediation' if an agent responds
        if (isAgent && dispute.status === 'open') {
            await prisma.dispute.update({
                where: { id: disputeId },
                data: { status: 'in_mediation' }
            });
        }

        revalidatePath(`/dashboard/disputes/${disputeId}`);
        return { success: true, messageId: message.id };

    } catch (error: any) {
        console.error("Erreur envoi message:", error);
        return { error: "Impossible d'envoyer le message." };
    }
}

/**
 * Part 16.3: Resolve Dispute
 */
export async function resolveDispute(disputeId: string, resolution: string) {
    const session = await auth();
    const authorizedRoles: Role[] = [Role.ADMIN, Role.ANAH_AGENT];

    if (!session || !session.user || !authorizedRoles.includes(session.user.role as Role)) {
        throw new Error("Seuls les agents/admins peuvent clore officiellement un litige.");
    }

    try {
        await prisma.dispute.update({
            where: { id: disputeId },
            data: {
                status: 'resolved',
                resolution,
                updatedAt: new Date()
            }
        });

        revalidatePath(`/dashboard/disputes/${disputeId}`);
        return { success: true };
    } catch (error) {
        return { error: "Échec de la résolution du litige." };
    }
}

/**
 * Part 16.4: Get Dispute Thread
 */
export async function getDisputeDetails(disputeId: string) {
    return await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
            lease: {
                select: { leaseReference: true, leaseType: true }
            },
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}
