"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateMandateRef, validateCommission, MANDATE_TYPES } from "@/lib/mandates"
import { Role, MandateType, MandateStatus } from "@prisma/client"

export type CreateMandateInput = {
    propertyId: string;
    agentId?: string;
    mandateType: MandateType;
    commissionPct: number;
    commissionFixed?: number;
    startDate: string;
    endDate: string;
    scope?: string[];
    taciteReconduction?: boolean;
    seuilTravauxSansAccord?: number;
};

/**
 * Part 12.4: Create a New Mandate
 */
export async function createMandate(input: CreateMandateInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Session expirée. Veuillez vous reconnecter." };
        }

        const userRole = session.user.role as string;
        const capaciteActive = (session.user as any).capaciteActive as string | undefined;

        const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];
        const ALLOWED_ROLES = [
            'AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE', 'AGENCE_NON_AGREE', 
            'LANDLORD', 'LANDLORD_PRO', 'INTERMEDIAIRE', 'AGENT', 'BROKER',
            'ADMIN', 'SUPER_ADMIN'
        ];

        const isAllowed = ALLOWED_ROLES.includes(userRole) || 
                          ADMIN_ROLES.includes(userRole) || 
                          capaciteActive?.includes('AGENCY') || 
                          capaciteActive?.includes('AGENCE') ||
                          capaciteActive?.includes('PROPRIETAIRE');

        if (!isAllowed) {
            return { error: "Action réservée aux agences, gestionnaires ou propriétaires." };
        }

        if (!input.propertyId) {
            return { error: "Veuillez choisir un bien immobilier à confier en gestion." };
        }

        if (input.commissionPct !== undefined && !validateCommission(input.commissionPct)) {
            return { error: "La commission de gestion ne peut excéder le plafond légal de 15%." };
        }

        const mandateRef = await generateMandateRef(session.user.id);
        
        const mandate = await prisma.mandate.create({
            data: {
                mandateRef,
                propertyId: input.propertyId,
                agentUserId: session.user.id,
                mandateType: input.mandateType,
                commissionPct: input.commissionPct !== undefined ? input.commissionPct : 8,
                commissionFixed: input.commissionFixed ? Number(input.commissionFixed) : null,
                scope: input.scope && input.scope.length > 0 ? input.scope : [
                    "RECHERCHE_LOCATAIRE",
                    "REDACTION_BAIL",
                    "ENCAISSEMENT_LOYERS",
                    "MAINTENANCE_TRAVAUX",
                    "GESTION_IMPAYES"
                ],
                startDate: new Date(input.startDate),
                endDate: input.endDate ? new Date(input.endDate) : null,
                status: MandateStatus.DRAFT
            }
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE_MANDATE",
                module: "MANDATES",
                entityId: mandate.id,
                newValues: { mandateRef, propertyId: input.propertyId, type: input.mandateType, commissionPct: input.commissionPct }
            }
        }).catch(() => {});

        revalidatePath(`/dashboard/mandates`);
        return { success: true, mandateId: mandate.id, mandateRef };

    } catch (error: unknown) {
        console.error("Erreur création mandat:", error);
        return { error: "Impossible de créer le mandat. Vérifiez que le bien est valide." };
    }
}

/**
 * Part 12.5: Sign Mandate (Simulation via SMS/2FA)
 */
export async function signMandate(mandateId: string) {
    try {
        const session = await auth();
        if (!session) return { error: "Non authentifié." };

        const mandate = await prisma.mandate.update({
            where: { id: mandateId },
            data: {
                status: MandateStatus.ACTIVE,
                signedAt: new Date(),
            }
        });

        // Proactively activate property if linked
        await prisma.property.update({
            where: { id: mandate.propertyId },
            data: { status: 'AVAILABLE' }
        });

        revalidatePath(`/dashboard/mandates/${mandateId}`);
        return { success: true };
    } catch (error) {
        return { error: "Échec de la signature du mandat." };
    }
}

/**
 * Part 12.6: Revenue Forecast for Agency
 */
export async function getAgencyRevenueForecast(agentId: string) {
    const mandates = await prisma.mandate.findMany({
        where: { agentUserId: agentId, status: MandateStatus.ACTIVE },
        include: {
            property: {
                include: {
                    leases: {
                        where: { status: 'ACTIVE' }
                    }
                }
            }
        }
    });

    let totalProjected = 0;

    for (const mandate of mandates) {
        if (!mandate.property || !mandate.property.leases) continue;
        for (const lease of mandate.property.leases) {
            // Projected monthly commission
            const monthlyComm = (lease.rentAmount * Number(mandate.commissionPct)) / 100;
            totalProjected += monthlyComm;
        }
    }

    return { totalProjected, mandateCount: mandates.length };
}

/**
 * Part 12.7: Get Mandate Performance Analytics (M11.2)
 * Calculates KPIs for rent collection, occupancy and stability
 */
export async function getMandateAnalytics(mandateId: string) {
    const mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: {
            property: {
                include: {
                    leases: {
                        include: {
                            receipts: true,
                            arrears: true
                        }
                    }
                }
            }
        }
    });

    if (!mandate) return null;

    let totalExpected = 0;
    let totalCollected = 0;
    let occupancyDays = 0;
    const now = new Date();

    (mandate.property?.leases || []).forEach((lease: any) => {
        // Rent Collection
        lease.receipts.forEach((r: any) => {
            totalExpected += r.totalAmount;
            if (r.status === 'paid' || r.status === 'PAID') {
                totalCollected += r.totalAmount;
            }
        });

        // Occupancy (rough estimate)
        const start = new Date(lease.startDate);
        const end = lease.terminatedAt ? new Date(lease.terminatedAt) : (lease.endDate ? new Date(lease.endDate) : now);
        const diff = end.getTime() - start.getTime();
        occupancyDays += Math.max(0, diff / (1000 * 3600 * 24));
    });

    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
    const efficiencyScore = collectionRate; // Basis for performance

    return {
        collectionRate,
        totalCollected,
        totalExpected,
        occupancyDays: Math.round(occupancyDays),
        efficiencyScore,
        leaseCount: mandate.property?.leases?.length || 0,
        status: mandate.status
    };
}

export async function updateMandateStatus(mandateId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        const mandate = await prisma.mandate.findUnique({ where: { id: mandateId }});
        if (!mandate) return { error: "Mandat introuvable" };

        const newStatus = mandate.status === MandateStatus.ACTIVE ? MandateStatus.SUSPENDED : MandateStatus.ACTIVE;

        await prisma.mandate.update({
            where: { id: mandateId },
            data: { status: newStatus }
        });

        const { writeAuditLog } = await import("@/lib/audit");
        await writeAuditLog({
            action: "MANDATE_STATUS_CHANGED",
            module: "MANDATE",
            entityId: mandateId,
            userId: session.user.id,
            newValues: { status: newStatus }
        });

        revalidatePath("/dashboard/mandates");
        return { success: true, newStatus };
    } catch(e) {
        return { error: "Erreur lors de la mise à jour." };
    }
}

export type UpdateMandateInput = {
    mandateId: string;
    mandateType?: MandateType;
    commissionPct?: number;
    commissionFixed?: number | null;
    startDate?: string;
    endDate?: string | null;
    scope?: string[];
    status?: MandateStatus;
};

/**
 * Modifier les clauses et paramètres d'un mandat de gérance
 */
export async function updateMandate(input: UpdateMandateInput) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Session expirée. Veuillez vous reconnecter." };
    }

    try {
        const mandate = await prisma.mandate.findUnique({
            where: { id: input.mandateId },
            include: { property: true }
        });

        if (!mandate) {
            return { error: "Mandat de gérance introuvable." };
        }

        const isOwner = mandate.property.ownerUserId === session.user.id;
        const isAgent = mandate.agentUserId === session.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);

        if (!isOwner && !isAgent && !isAdmin) {
            return { error: "Vous n'avez pas l'autorisation de modifier ce mandat." };
        }

        if (input.commissionPct !== undefined && !validateCommission(input.commissionPct)) {
            return { error: "La commission de gestion ne peut excéder le plafond légal de 15%." };
        }

        const updateData: any = {};
        if (input.mandateType) updateData.mandateType = input.mandateType;
        if (input.commissionPct !== undefined) updateData.commissionPct = Number(input.commissionPct);
        if (input.commissionFixed !== undefined) {
            updateData.commissionFixed = input.commissionFixed !== null ? Number(input.commissionFixed) : null;
        }
        if (input.startDate) updateData.startDate = new Date(input.startDate);
        if (input.endDate !== undefined) {
            updateData.endDate = input.endDate ? new Date(input.endDate) : null;
        }
        if (input.scope && Array.isArray(input.scope)) {
            updateData.scope = input.scope;
        }
        if (input.status) {
            updateData.status = input.status;
        }

        const updated = await prisma.mandate.update({
            where: { id: input.mandateId },
            data: updateData
        });

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "UPDATE_MANDATE",
                module: "MANDATES",
                entityId: mandate.id,
                newValues: updateData
            }
        }).catch(() => {});

        revalidatePath("/dashboard/mandates");
        return { success: true, mandate: updated };
    } catch (error: any) {
        console.error("Erreur modification mandat:", error);
        return { error: "Erreur lors de la modification du mandat : " + (error?.message || "Veuillez réessayer.") };
    }
}

export type RevokeMandateInput = {
    mandateId: string;
    reason: string;
    immediateEffect?: boolean;
    effectiveDate?: string;
};

/**
 * Révoquer ou résilier un mandat de gérance
 */
export async function revokeMandate(input: RevokeMandateInput) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Session expirée. Veuillez vous reconnecter." };
    }

    try {
        const mandate = await prisma.mandate.findUnique({
            where: { id: input.mandateId },
            include: { property: true }
        });

        if (!mandate) {
            return { error: "Mandat de gérance introuvable." };
        }

        const isOwner = mandate.property.ownerUserId === session.user.id;
        const isAgent = mandate.agentUserId === session.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);

        if (!isOwner && !isAgent && !isAdmin) {
            return { error: "Vous n'avez pas l'autorisation de révoquer ce mandat." };
        }

        if (!input.reason?.trim()) {
            return { error: "Veuillez préciser le motif de révocation du mandat." };
        }

        // Met le statut à CANCELLED (qui correspond à révoqué/résilié en base)
        const updated = await prisma.mandate.update({
            where: { id: input.mandateId },
            data: {
                status: MandateStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelledByUserId: session.user.id,
                cancelReason: input.reason.trim()
            }
        });

        // Si l'agent était le gestionnaire assigné du bien, le bien repasse en gestion directe
        if (mandate.property.managedByUserId === mandate.agentUserId) {
            await prisma.property.update({
                where: { id: mandate.propertyId },
                data: {
                    managedByUserId: null,
                    managementMode: 'DIRECT'
                }
            }).catch(e => console.warn("Notice: property manager reset:", e));
        }

        // Clôture de l'historique
        await prisma.mandateHistory.updateMany({
            where: { mandateId: mandate.id, propertyId: mandate.propertyId },
            data: { endDate: new Date() }
        }).catch(() => {});

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "REVOKE_MANDATE",
                module: "MANDATES",
                entityId: mandate.id,
                newValues: {
                    status: MandateStatus.CANCELLED,
                    reason: input.reason,
                    cancelledBy: session.user.id,
                    cancelledAt: new Date()
                }
            }
        }).catch(() => {});

        revalidatePath("/dashboard/mandates");
        return { 
            success: true, 
            message: "Le mandat a été révoqué avec succès. La gestion du bien a été basculée en gestion directe sous la responsabilité du propriétaire." 
        };
    } catch (error: any) {
        console.error("Erreur révocation mandat:", error);
        return { error: "Erreur lors de la révocation du mandat : " + (error?.message || "Veuillez réessayer.") };
    }
}

/**
 * Supprimer un mandat à l'état de brouillon ou annulé
 */
export async function deleteMandate(mandateId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Session expirée. Veuillez vous reconnecter." };
    }

    try {
        const mandate = await prisma.mandate.findUnique({
            where: { id: mandateId },
            include: { property: true }
        });

        if (!mandate) {
            return { error: "Mandat introuvable." };
        }

        const isOwner = mandate.property.ownerUserId === session.user.id;
        const isAgent = mandate.agentUserId === session.user.id;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string);

        if (!isOwner && !isAgent && !isAdmin) {
            return { error: "Action non autorisée." };
        }

        if (mandate.status === MandateStatus.ACTIVE) {
            return { error: "Un mandat actif ne peut pas être supprimé. Vous devez d'abord le révoquer." };
        }

        await prisma.mandate.delete({
            where: { id: mandateId }
        });

        revalidatePath("/dashboard/mandates");
        return { success: true };
    } catch (error: any) {
        return { error: "Impossible de supprimer ce mandat : " + (error?.message || "Veuillez réessayer.") };
    }
}

