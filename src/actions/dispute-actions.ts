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
        if (session.user.id !== lease.landlordId && session.user.id !== lease.tenantId && session.user.role !== 'ADMIN') {
            throw new Error("Vous n'êtes pas autorisé à ouvrir un litige sur ce bail.");
        }

        const dispute = await prisma.dispute.create({
            data: {
                leaseId: input.leaseId,
                title: input.title,
                description: input.description,
                amountInDispute: input.amountInDispute,
                status: 'OPEN'
            }
        });

        revalidatePath(`/dashboard/leases/${input.leaseId}`);
        return { success: true, disputeId: dispute.id };

    } catch (error: unknown) {
        console.error("Erreur création litige:", error);
        const errorMessage = error instanceof Error ? error.message : "Impossible d'ouvrir le litige.";
        return { error: errorMessage };
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
        const isAgent = ['ADMIN', 'ANAH_AGENT', 'CDC_AGENT'].includes(session.user.role || '');

        if (!isParticipant && !isAgent) {
            throw new Error("Accès non autorisé.");
        }

        const message = await prisma.disputeMessage.create({
            data: {
                disputeId,
                senderId: session.user.id,
                content,
                attachments
            }
        });

        // Automatically transition to 'IN_MEDIATION' if an agent responds
        if (isAgent && dispute.status === 'OPEN') {
            await prisma.dispute.update({
                where: { id: disputeId },
                data: { status: 'IN_MEDIATION' }
            });
        }

        revalidatePath(`/dashboard/disputes/${disputeId}`);
        return { success: true, messageId: message.id };

    } catch (error: unknown) {
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
                status: 'RESOLVED',
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
 * Part 16.4: Get Dispute Details
 */
export async function getDisputeDetails(disputeId: string) {
    return await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
            lease: {
                select: { 
                    leaseReference: true, 
                    leaseType: true,
                    landlord: { select: { fullName: true } },
                    tenant: { select: { fullName: true } }
                }
            },
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });
}

/**
 * Part 16.5: Get Complete Mediation Timeline
 * Aggregates messages, logs, and related entity events (EDL, Receipts)
 */
export async function getDisputeTimeline(disputeId: string) {
    const dispute: any = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
            messages: {
                include: { sender: { select: { fullName: true, role: true } } },
                orderBy: { createdAt: 'asc' }
            },
            lease: {
                include: {
                    property: true,
                    receipts: {
                        where: { status: 'PAID' },
                        orderBy: { createdAt: 'desc' },
                        take: 3
                    },
                    etatsDesLieux: {
                        orderBy: { createdAt: 'desc' },
                        take: 2
                    }
                }
            }
        }
    });

    if (!dispute) return null;

    type TimelineEvent = {
        type: 'MESSAGE' | 'SYSTEM' | 'PAYMENT' | 'EDL';
        date: Date;
        title: string;
        content?: string;
        sender?: string;
        meta?: any;
    };

    const timeline: TimelineEvent[] = [];

    // 1. Add Messages
    dispute.messages.forEach(msg => {
        timeline.push({
            type: 'MESSAGE',
            date: msg.createdAt,
            title: `Message de ${msg.sender.fullName}`,
            content: msg.content,
            sender: msg.sender.fullName,
            meta: { role: msg.sender.role, attachments: msg.attachments }
        });
    });

    // 2. Add System Creation Event
    timeline.push({
        type: 'SYSTEM',
        date: dispute.createdAt,
        title: "Ouverture du litige",
        content: dispute.description
    });

    // 3. Add Recent Payments
    dispute.lease.receipts.forEach(r => {
        timeline.push({
            type: 'PAYMENT',
            date: r.paidAt || r.createdAt,
            title: `Loyer payé - ${r.month}/${r.year}`,
            content: `Montant: ${r.amount} FCFA`
        });
    });

    // 4. Add Inventory Reports (EDL)
    dispute.lease.etatsDesLieux.forEach(edl => {
        timeline.push({
            type: 'EDL',
            date: edl.createdAt,
            title: `État des Lieux (${edl.typeEdl})`,
            content: `Réalisé le ${edl.createdAt.toLocaleDateString()}`
        });
    });

    return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Part 16.6: Get All Disputes (Admin)
 */
export async function getDisputes() {
    return await prisma.dispute.findMany({
        include: {
            lease: {
                select: { 
                    leaseReference: true, 
                    property: { select: { commune: true } },
                    landlord: { select: { fullName: true } },
                    tenant: { select: { fullName: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}
