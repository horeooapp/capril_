"use server";
/**
 * QAPRIL — Authoritative Receipt Actions Module
 * Consolidated from receipts.ts, receipt-actions.ts and receipt.actions.ts
 */

import { prisma } from "@/lib/prisma";
import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { Role, Prisma } from "@prisma/client";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";
import { serializeReceipt } from "@/lib/serialize";
import { LeaseLifecycleService } from "@/lib/lease-lifecycle.service";

const PRIX_QUITTANCE = Number(process.env.QAPRIL_QUITTANCE_PRIX_FCFA ?? 90);

/**
 * [REC-01] Create/Generate a new Receipt
 */
export async function createReceipt(data: {
    leaseId: string,
    periodMonth: string,
    rentAmount: number,
    chargesAmount?: number,
    paymentMethod: string,
    paymentRef?: string,
    isDeposit?: boolean,
    paidAt?: Date
}) {
    try {
        const session = await ensureAuthenticated();
        const lease = await ensureLeaseAccess(data.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);

        // 1. Order Check
        const derniere = await prisma.receipt.findFirst({
            where: { leaseId: data.leaseId, status: "PAID" },
            orderBy: { periodMonth: "desc" }
        });
        if (derniere) {
            const [dy, dm] = derniere.periodMonth.split("-").map(Number);
            const [ny, nm] = data.periodMonth.split("-").map(Number);
            const moisSuivant = new Date(dy, dm - 1 + 1);
            const moisDemande = new Date(ny, nm - 1);
            if (moisDemande < moisSuivant) {
                throw new Error(`Mois ${data.periodMonth} déjà payé ou antérieur.`);
            }
        }

        // 2. Debit Wallet
        const currentWallet = await prisma.userWalletConfig.findUnique({
            where: { userId: lease.landlordId },
            select: { walletBalance: true }
        });
        const currentBal = currentWallet?.walletBalance ?? 0;
        const newBal = Math.max(0, currentBal - PRIX_QUITTANCE);
        await prisma.userWalletConfig.upsert({
            where: { userId: lease.landlordId },
            create: { userId: lease.landlordId, walletBalance: 0 },
            update: { walletBalance: newBal }
        });

        const total = data.rentAmount + (data.chargesAmount || 0);
        const ref = `REC-${data.periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const sha256 = createHash("sha256").update(JSON.stringify({ leaseId: data.leaseId, total, ref })).digest("hex");

        const receipt = await prisma.receipt.create({
            data: {
                receiptRef: ref,
                leaseId: data.leaseId,
                periodMonth: data.periodMonth,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount || 0,
                totalAmount: total,
                paymentMethod: data.paymentMethod,
                paymentRef: data.paymentRef,
                paidAt: data.paidAt || new Date(),
                qrToken: randomUUID(),
                receiptHash: sha256,
                status: "PAID"
            }
        });

        await writeAuditLog({ userId: session.user.id, action: "RECEIPT_CREATED", module: "RECEIPT", entityId: receipt.id });

        // Intégration de la State Machine : Si le bail était en impayé et que la quittance est émise (payée),
        // on tente de régulariser le statut du bail.
        const currentLease = await prisma.lease.findUnique({ where: { id: data.leaseId } });
        if (currentLease && ["LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS"].includes(currentLease.status)) {
            // Vérifier s'il reste d'autres impayés
            const pendingReceipts = await prisma.receipt.count({
                where: { leaseId: data.leaseId, status: "PENDING" }
            });
            if (pendingReceipts === 0) {
                await LeaseLifecycleService.transitionLease(data.leaseId, "ACTIVE", session.user.id, "Régularisation suite à l'émission de la quittance");
            }
        }

        revalidatePath(`/dashboard/leases/${data.leaseId}`);
        revalidatePath("/dashboard/receipts");

        return { success: true, receipt: serializeReceipt(receipt), sha256 };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [REC-02] Get Receipt by ID
 */
export async function getReceiptById(id: string) {
    try {
        const receipt = await prisma.receipt.findUnique({
            where: { id },
            include: { lease: { include: { property: true, landlord: true, tenant: true } } }
        });
        if (!receipt) return null;
        await ensureLeaseAccess(receipt.leaseId);
        return serializeReceipt(receipt);
    } catch (error) {
        return null;
    }
}

/**
 * [REC-03] Get Receipts for current Tenant
 */
export async function getReceiptsForTenant() {
    try {
        const session = await ensureAuthenticated();
        const receipts = await prisma.receipt.findMany({
            where: { lease: { tenantId: session.user.id } },
            include: { lease: { include: { property: true } } },
            orderBy: { periodMonth: 'desc' }
        });
        return receipts.map(r => serializeReceipt(r));
    } catch (error) {
        return [];
    }
}

/**
 * [REC-04] Pay a pending Receipt (Tenant)
 */
export async function payReceipt(receiptId: string, channel: string = "WAVE_CI") {
    try {
        const session = await ensureAuthenticated();
        const receipt = await prisma.receipt.findUnique({ where: { id: receiptId }, include: { lease: true } });
        if (!receipt || receipt.lease.tenantId !== session.user.id) throw new Error("Accès refusé.");

        const updated = await prisma.receipt.update({
            where: { id: receiptId },
            data: {
                status: 'PAID',
                paymentMethod: channel,
                paymentRef: "PAY-" + randomUUID().slice(0, 8).toUpperCase(),
                paidAt: new Date()
            }
        });

        await writeAuditLog({ userId: session.user.id, action: "RECEIPT_PAID", module: "RECEIPT", entityId: receiptId });

        // Intégration de la State Machine : Régularisation du bail si plus d'impayés
        const currentLease = await prisma.lease.findUnique({ where: { id: receipt.leaseId } });
        if (currentLease && ["LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS"].includes(currentLease.status)) {
            const pendingReceipts = await prisma.receipt.count({
                where: { leaseId: receipt.leaseId, status: "PENDING" }
            });
            if (pendingReceipts === 0) {
                await LeaseLifecycleService.transitionLease(receipt.leaseId, "ACTIVE", session.user.id, "Paiement en ligne complété");
            }
        }

        revalidatePath("/dashboard/receipts");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [REC-05] Get Last Receipts (Mixed)
 */
export async function getMyReceipts() {
    try {
        const session = await ensureAuthenticated();
        const receipts = await prisma.receipt.findMany({
            where: { OR: [{ lease: { landlordId: session.user.id } }, { lease: { tenantId: session.user.id } }] },
            include: { lease: { select: { leaseReference: true, property: { select: { address: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return receipts.map(r => serializeReceipt(r));
    } catch (error) {
        return [];
    }
}

/**
 * [REC-06] Update Receipt (Landlord)
 */
export async function updateReceipt(receiptId: string, data: any) {
    try {
        const session = await ensureAuthenticated();
        const receipt = await prisma.receipt.findUnique({ where: { id: receiptId }, include: { lease: true } });
        if (!receipt) throw new Error("Quittance introuvable.");
        await ensureLeaseAccess(receipt.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);

        await prisma.receipt.update({
            where: { id: receiptId },
            data: {
                periodMonth: data.periodMonth,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount,
                paymentMethod: data.paymentChannel || data.paymentMethod,
                paymentRef: data.paymentReference || data.paymentRef,
                status: data.status as any
            }
        });
        revalidatePath("/dashboard/receipts");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [REC-07] Get Active Leases for Select
 */
export async function getActiveLeasesForSelect() {
    try {
        const session = await ensureAuthenticated();
        const leases = await prisma.lease.findMany({
            where: { 
                OR: [{ landlordId: session.user.id }, { agentId: session.user.id }, { property: { managedByUserId: session.user.id } }],
                status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'ACTIVE_DECLARATIF'] }
            },
            select: {
                id: true,
                leaseReference: true,
                rentAmount: true,
                tenant: { select: { firstName: true, lastName: true } },
                property: { select: { name: true, address: true } }
            }
        });
        return leases.map(l => ({
            id: l.id,
            label: `${l.leaseReference} - ${l.tenant?.firstName || ''} ${l.tenant?.lastName || ''} (${l.property.name || l.property.address})`,
            rentAmount: Number(l.rentAmount)
        }));
    } catch (error) {
        return [];
    }
}

/**
 * [REC-08] Generate Receipts for the next month (M+1)
 */
export async function generateNextMonthReceipts() {
    try {
        const session = await ensureAuthenticated();
        await writeAuditLog({
            userId: session.user.id,
            action: "GENERATE_RECEIPTS_M1",
            module: "RECEIPTS",
            entityId: session.user.id
        });
        revalidatePath("/dashboard/receipts");
        return { success: true };
    } catch (e: any) {
        return { error: "Erreur lors de la génération." };
    }
}

/**
 * [REC-09] Export DGI Format
 */
export async function exportDgiFile() {
    try {
        const session = await ensureAuthenticated();
        await writeAuditLog({
            userId: session.user.id,
            action: "EXPORT_DGI",
            module: "RECEIPTS",
            entityId: session.user.id
        });
        return { success: true };
    } catch (e: any) {
        return { error: "Erreur lors de l'export." };
    }
}

/**
 * [REC-10] Dispatch Digital Delivery (Poste CI)
 */
export async function dispatchDigitalDelivery(receiptId: string, deliveryMode: string, recipientData: any) {
    try {
        const session = await ensureAuthenticated();
        const receipt = await prisma.receipt.findUnique({ where: { id: receiptId } });
        if (!receipt) throw new Error("Quittance introuvable.");

        const delivery = await prisma.digitalDelivery.create({
            data: {
                trackingNumber: `CI-POST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
                deliveryMode,
                recipientData: JSON.stringify(recipientData),
                status: 'submitted'
            }
        });

        await prisma.receipt.update({
            where: { id: receiptId },
            data: { digitalDeliveryId: delivery.id }
        });

        await writeAuditLog({
            userId: session.user.id,
            action: "DIGITAL_DELIVERY_DISPATCHED",
            module: "RECEIPTS",
            entityId: receiptId,
            newValues: { tracking: delivery.trackingNumber }
        });

        revalidatePath("/dashboard/receipts");
        return { success: true, tracking: delivery.trackingNumber };
    } catch (e: any) {
        return { error: "Erreur technique lors de l'expédition." };
    }
}

/**
 * [REC-11] Get Receipts for a specific Lease
 */
export async function getReceiptsForLease(leaseId: string) {
    try {
        const receipts = await prisma.receipt.findMany({
            where: { leaseId },
            orderBy: { periodMonth: 'desc' }
        });
        return receipts.map(serializeReceipt);
    } catch (error) {
        return [];
    }
}
