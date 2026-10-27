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
    paidAt?: Date,
    status?: string,
    notes?: string
}) {
    try {
        const session = await ensureAuthenticated();
        const lease = await ensureLeaseAccess(data.leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);

        // 1. Check if a paid receipt already exists for this exact month
        const dejaPayee = await prisma.receipt.findFirst({
            where: { leaseId: data.leaseId, periodMonth: data.periodMonth, status: "PAID" }
        });
        if (dejaPayee) {
            throw new Error(`Une quittance payée (${dejaPayee.receiptRef}) existe déjà pour le mois ${data.periodMonth}.`);
        }

        // 2. Safe Debit Wallet if configured and sufficient balance
        try {
            const currentWallet = await prisma.userWalletConfig.findUnique({
                where: { userId: lease.landlordId },
                select: { walletBalance: true }
            });
            if (currentWallet && currentWallet.walletBalance >= PRIX_QUITTANCE) {
                await prisma.userWalletConfig.update({
                    where: { userId: lease.landlordId },
                    data: { walletBalance: currentWallet.walletBalance - PRIX_QUITTANCE }
                });
            }
        } catch (wErr) {
            console.warn("Wallet debit notice:", wErr);
        }

        const total = Number(data.rentAmount) + Number(data.chargesAmount || 0);
        const ref = `REC-${data.periodMonth}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const sha256 = createHash("sha256").update(JSON.stringify({ leaseId: data.leaseId, total, ref })).digest("hex");

        const targetStatus = data.status || (data.paidAt ? "PAID" : "PENDING");

        const receipt = await prisma.receipt.create({
            data: {
                receiptRef: ref,
                leaseId: data.leaseId,
                periodMonth: data.periodMonth,
                rentAmount: Number(data.rentAmount),
                chargesAmount: Number(data.chargesAmount || 0),
                totalAmount: total,
                paymentMethod: data.paymentMethod || "WAVE",
                paymentRef: data.paymentRef || undefined,
                paidAt: targetStatus === "PAID" ? (data.paidAt || new Date()) : null,
                qrToken: randomUUID(),
                receiptHash: sha256,
                status: targetStatus,
                commentaireInterne: data.notes || undefined
            }
        });

        await writeAuditLog({ userId: session.user.id, action: "RECEIPT_CREATED", module: "RECEIPT", entityId: receipt.id });

        // Intégration de la State Machine : Si le bail était en impayé et que la quittance est émise (payée),
        // on tente de régulariser le statut du bail.
        if (targetStatus === "PAID") {
            const currentLease = await prisma.lease.findUnique({ where: { id: data.leaseId } });
            if (currentLease && ["LOYER_IMPAYE", "MISE_EN_DEMEURE", "CLEMENCE_EN_COURS"].includes(currentLease.status)) {
                const pendingReceipts = await prisma.receipt.count({
                    where: { leaseId: data.leaseId, status: "PENDING" }
                });
                if (pendingReceipts === 0) {
                    await LeaseLifecycleService.transitionLease(data.leaseId, "ACTIVE", session.user.id, "Régularisation suite à l'émission de la quittance");
                }
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
 * Creates real PENDING receipts (avis d'échéance) in the database for all active leases.
 */
export async function generateNextMonthReceipts(targetMonthInput?: string) {
    try {
        const session = await ensureAuthenticated();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);

        // 1. Determine target month (defaults to M+1)
        let targetMonth = targetMonthInput;
        if (!targetMonth) {
            const now = new Date();
            const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            targetMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;
        }

        // 2. Query all active leases accessible to the current user
        const leases = await prisma.lease.findMany({
            where: {
                ...(isAdmin ? {} : {
                    OR: [
                        { landlordId: session.user.id },
                        { agentId: session.user.id },
                        { property: { ownerUserId: session.user.id } },
                        { property: { managedByUserId: session.user.id } }
                    ]
                }),
                status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'MISE_EN_DEMEURE', 'ACTIVE_DECLARATIF'] }
            },
            include: {
                property: true,
                tenant: true
            }
        });

        if (leases.length === 0) {
            return { error: "Aucun bail actif trouvé dans votre portefeuille à facturer." };
        }

        let createdCount = 0;
        let skippedCount = 0;
        let totalBilled = 0;

        for (const lease of leases) {
            // Check if receipt already exists for this periodMonth
            const existing = await prisma.receipt.findFirst({
                where: {
                    leaseId: lease.id,
                    periodMonth: targetMonth
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            const total = Number(lease.rentAmount) + Number(lease.chargesAmount || 0);
            const ref = `AVIS-${targetMonth}-${lease.leaseReference ? lease.leaseReference.slice(-5) : randomUUID().slice(0, 5).toUpperCase()}`;
            const sha256 = createHash("sha256").update(JSON.stringify({ leaseId: lease.id, total, ref, targetMonth })).digest("hex");

            await prisma.receipt.create({
                data: {
                    receiptRef: ref,
                    leaseId: lease.id,
                    periodMonth: targetMonth,
                    rentAmount: Number(lease.rentAmount),
                    chargesAmount: Number(lease.chargesAmount || 0),
                    totalAmount: total,
                    paymentMethod: lease.paymentMethod || "WAVE",
                    status: "PENDING",
                    qrToken: randomUUID(),
                    receiptHash: sha256,
                    commentaireInterne: `Avis d'échéance généré pour ${targetMonth}`
                }
            });

            createdCount++;
            totalBilled += total;
        }

        await writeAuditLog({
            userId: session.user.id,
            action: "GENERATE_RECEIPTS_M1",
            module: "RECEIPTS",
            entityId: session.user.id,
            newValues: { targetMonth, createdCount, skippedCount, totalBilled }
        });

        revalidatePath("/dashboard/receipts");

        return {
            success: true,
            createdCount,
            skippedCount,
            totalBilled,
            targetMonth,
            message: `${createdCount} avis d'échéance généré(s) pour ${targetMonth} (${totalBilled.toLocaleString()} XOF facturés).`
        };
    } catch (e: any) {
        console.error("Erreur génération avis M+1:", e);
        return { error: "Erreur lors de la génération des avis M+1 : " + (e?.message || "Veuillez réessayer.") };
    }
}

/**
 * [REC-09] Export DGI Format - Données fiscales officielles récapitulatives
 */
export async function exportDgiData(yearInput?: number) {
    try {
        const session = await ensureAuthenticated();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);
        const selectedYear = yearInput || new Date().getFullYear();

        const leases = await prisma.lease.findMany({
            where: {
                ...(isAdmin ? {} : {
                    OR: [
                        { landlordId: session.user.id },
                        { agentId: session.user.id },
                        { property: { ownerUserId: session.user.id } },
                        { property: { managedByUserId: session.user.id } }
                    ]
                })
            },
            include: {
                property: true,
                tenant: true,
                landlord: true,
                receipts: {
                    where: {
                        periodMonth: { startsWith: `${selectedYear}` }
                    }
                }
            }
        });

        let totalLoyerAnnuel = 0;
        let totalEncaisseAnnuel = 0;
        let totalDroitsDgi = 0;

        const rows: (string | number)[][] = [];
        // Header
        rows.push([
            "REFERENCE_BAIL",
            "BIEN_IMMOBILIER",
            "COMMUNE",
            "PROPRIETAIRE_BAILLEUR",
            "LOCATAIRE",
            "CONTACT_LOCATAIRE",
            "LOYER_MENSUEL_XOF",
            "CHARGES_MENSUELLES_XOF",
            "TOTAL_FACTURE_ANNEE_XOF",
            "TOTAL_ENCAISSE_ANNEE_XOF",
            "DROITS_ENREGISTREMENT_DGI_2_5_PCT",
            "STATUT_FISCAL"
        ]);

        for (const l of leases) {
            const loyerMensuel = Number(l.rentAmount) || 0;
            const chargesMensuelles = Number(l.chargesAmount) || 0;
            const loyersFactures = l.receipts.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
            const loyersEncaisses = l.receipts
                .filter(r => r.status === 'PAID' || r.status === 'paid')
                .reduce((acc, r) => acc + (r.totalAmount || 0), 0);

            const baseAnnuelle = loyerMensuel * 12;
            const droitsDgi = Math.round(baseAnnuelle * 0.025);

            totalLoyerAnnuel += baseAnnuelle;
            totalEncaisseAnnuel += loyersEncaisses;
            totalDroitsDgi += droitsDgi;

            const tenantName = l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : "Locataire";
            const landlordName = l.landlord ? `${l.landlord.firstName || ''} ${l.landlord.lastName || ''}`.trim() : "Bailleur";

            rows.push([
                `"${l.leaseReference || l.id.slice(0, 8)}"`,
                `"${(l.property?.name || l.property?.address || 'Non spécifié').replace(/"/g, '""')}"`,
                `"${(l.property?.commune || 'Abidjan').replace(/"/g, '""')}"`,
                `"${landlordName.replace(/"/g, '""')}"`,
                `"${tenantName.replace(/"/g, '""')}"`,
                `"${l.tenant?.phone || 'N/A'}"`,
                loyerMensuel,
                chargesMensuelles,
                loyersFactures || baseAnnuelle,
                loyersEncaisses,
                droitsDgi,
                `"${l.statutDgi || 'DECLARATION_QAPRIL'}"`
            ]);
        }

        const csvContent = "\uFEFF" + rows.map(r => r.join(";")).join("\r\n");

        await writeAuditLog({
            userId: session.user.id,
            action: "EXPORT_DGI",
            module: "RECEIPTS",
            entityId: session.user.id,
            newValues: { year: selectedYear, leasesCount: leases.length, totalLoyerAnnuel, totalDroitsDgi }
        });

        return {
            success: true,
            year: selectedYear,
            leasesCount: leases.length,
            totalLoyerAnnuel,
            totalEncaisseAnnuel,
            totalDroitsDgi,
            csvContent,
            filename: `declaration_dgi_${selectedYear}_qapril.csv`
        };
    } catch (e: any) {
        console.error("Erreur export DGI:", e);
        return { error: "Erreur lors de la génération du fichier DGI : " + (e?.message || "Veuillez réessayer.") };
    }
}

export async function exportDgiFile() {
    return exportDgiData();
}

/**
 * [REC-12] Supprimer une quittance ou avis d'échéance
 */
export async function deleteReceipt(receiptId: string) {
    try {
        const session = await ensureAuthenticated();
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: { lease: { include: { property: true } } }
        });
        if (!receipt) return { error: "Quittance introuvable." };

        const isOwner = receipt.lease?.property?.ownerUserId === session.user.id || receipt.lease?.landlordId === session.user.id;
        const isAgent = receipt.lease?.agentId === session.user.id || receipt.lease?.property?.managedByUserId === session.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);

        if (!isOwner && !isAgent && !isAdmin) {
            return { error: "Action non autorisée sur cette quittance." };
        }

        await prisma.receipt.delete({ where: { id: receiptId } });

        await writeAuditLog({
            userId: session.user.id,
            action: "RECEIPT_DELETED",
            module: "RECEIPTS",
            entityId: receiptId
        });

        revalidatePath("/dashboard/receipts");
        return { success: true };
    } catch (e: any) {
        return { error: "Impossible de supprimer cette quittance." };
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
