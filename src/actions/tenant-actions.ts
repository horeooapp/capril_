"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { serializeLease, serializeObject } from "@/lib/serialize"
import { normalizePhone } from "@/lib/phone"

export async function getTenantDashboard() {
    try {
        const session = await auth()
        
        // 1. Authentification & Autorisation fine-grained
        if (!session?.user?.id) {
            return serializeObject({ success: false, error: "Session expirée. Veuillez vous reconnecter." })
        }

        const userRoles = (session.user as any).eligibleRoles || [session.user.role];
        const currentRole = (session.user as any).chosenRole || session.user.role;
        const isTenant = currentRole === Role.TENANT || userRoles.includes(Role.TENANT);

        if (!isTenant) {
            return serializeObject({ success: false, error: "Accès refusé. Réservé aux locataires." })
        }

        const userId = session.user.id

        // 2. Récupérer le Locataire
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, lastName: true, firstName: true, email: true, phone: true }
        })

        if (!user) {
            return serializeObject({ success: false, error: "Profil utilisateur introuvable." })
        }

        // 3. Trouver le bail ou le contrat en entente
        let activeLease = await prisma.lease.findFirst({
            where: {
                tenantId: userId,
                status: { in: ["ACTIVE", "LOYER_IMPAYE", "PENDING_SIGNATURE", "ACTIVE_DECLARATIF", "DRAFT", "PENDING_CONFIRMATION"] }
            },
            include: {
                property: true,
                landlord: { 
                    select: { 
                        lastName: true, 
                        firstName: true, 
                        phone: true,
                        walletConfig: { select: { landlordCode: true } }
                    } 
                },
                receipts: {
                    orderBy: { createdAt: "desc" },
                    take: 5
                },
                arrears: {
                    where: { status: { in: ["unpaid", "UNPAID"] } }
                }
            }
        })

        // ────────────────────────────────────────────────────────
        // LOGIQUE D'AUTORÉPARATION (C-MERGE-AUTO)
        // Si aucun bail n'est trouvé par ID, on tente une fusion par téléphone normalisé.
        // ────────────────────────────────────────────────────────
        if (!activeLease && user.phone) {
            const normalized = normalizePhone(user.phone);
            const ghost = await prisma.user.findFirst({
                where: { phone: normalized, id: { not: userId } }
            });

            if (ghost && !ghost.email) {
                console.log(`[C-MERGE-AUTO] Réparation en cours pour ${userId} via ghost ${ghost.id}`);
                await prisma.$transaction([
                    prisma.lease.updateMany({ where: { tenantId: ghost.id }, data: { tenantId: userId } }),
                    prisma.lease.updateMany({ where: { landlordId: ghost.id }, data: { landlordId: userId } }),
                    prisma.property.updateMany({ where: { ownerUserId: ghost.id }, data: { ownerUserId: userId } }),
                    prisma.property.updateMany({ where: { managedByUserId: ghost.id }, data: { managedByUserId: userId } }),
                    // Supprimer le doublon et normaliser le téléphone du compte principal
                    prisma.user.delete({ where: { id: ghost.id } }),
                    prisma.user.update({ where: { id: userId }, data: { phone: normalized } })
                ]);

                // Re-tentative de lecture du bail
                activeLease = await prisma.lease.findFirst({
                    where: {
                        tenantId: userId,
                        status: { in: ["ACTIVE", "LOYER_IMPAYE", "PENDING_SIGNATURE", "ACTIVE_DECLARATIF", "DRAFT", "PENDING_CONFIRMATION"] }
                    },
                    include: {
                        property: true,
                        landlord: { 
                            select: { 
                                lastName: true, 
                                firstName: true, 
                                phone: true,
                                walletConfig: { select: { landlordCode: true } }
                            } 
                        },
                        receipts: {
                            orderBy: { createdAt: "desc" },
                            take: 5
                        },
                        arrears: {
                            where: { status: { in: ["unpaid", "UNPAID"] } }
                        }
                    }
                });
            }
        }

        if (!activeLease) {
            return serializeObject({ success: true, hasLease: false, user })
        }

        // 4. Calculer les statistiques du loyer
        const totalArrears = activeLease.arrears.reduce((sum, arr) => sum + Number(arr.amount || 0), 0)
        let leaseStatus: any = activeLease.status
        if (totalArrears > 0) {
            leaseStatus = "LOYER_IMPAYE"
        }

        // 5. Utilitaires (Factures OCR CIE/SODECI)
        const utilities = await prisma.factureUtility.findMany({
            where: { leaseId: activeLease.id, statut: { in: ["EN_COURS", "EN_RETARD"] } },
            orderBy: { dateLimitePaiement: "asc" }
        })

        // 6. Score Locatif (Passeport)
        const locataireProfile = await prisma.locataireProfile.findUnique({
            where: { userId }
        })

        return serializeObject({
            success: true,
            hasLease: true,
            user,
            lease: {
                ...serializeLease(activeLease),
                computedStatus: leaseStatus,
                totalArrears
            },
            utilities,
            score: locataireProfile?.scoreActuel || 750
        })

    } catch (error: any) {
        console.error("[TENANT-ACTION] Critical failure:", error)
        return serializeObject({ 
            success: false, 
            error: process.env.NODE_ENV === 'development' ? error.message : "Impossible de charger vos données. Veuillez réessayer plus tard." 
        })
    }
}

export async function splitColocPayment(data: { leaseId: string, targetEmail: string, splitPercentage: number }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return serializeObject({ success: false, error: "Non autorisé" })
        const userId = session.user.id

        // This implies creating a colocataire invitation
        const targetUser = await prisma.user.findUnique({
            where: { email: data.targetEmail }
        })

        if (!targetUser) {
             return serializeObject({ success: false, error: "Utilisateur cible non trouvé (doit être inscrit sur QAPRIL)." })
        }

        const coloc = await prisma.colocataire.create({
            data: {
                leaseId: data.leaseId,
                userId: targetUser.id,
                role: "SECONDAIRE",
                pctLoyer: data.splitPercentage,
                dateEntree: new Date(),
                modePaiement: "INDIVIDUEL"
            }
        })

        return serializeObject({ success: true, coloc })

    } catch (e: any) {
        console.error("Coloc Error:", e)
        return serializeObject({ success: false, error: e.message })
    }
}

