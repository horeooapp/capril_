"use server";

import { prisma } from "@/lib/prisma";
import { ensureAuthenticated, ensureLeaseAccess } from "./auth-helpers";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * [MRL-01] Proposer une révision de loyer (Bailleur / Agence)
 * Vérifie la conformité légale (délai de 3 ans et préavis de 3 mois — Loi CCH Côte d'Ivoire)
 */
export async function proposerRevisionLoyerAction(input: {
    leaseId: string;
    nouveauMontant: number;
    dateEffet: string;
    raison: string;
}) {
    try {
        const session = await ensureAuthenticated();
        const lease = await ensureLeaseAccess(input.leaseId, [
            Role.LANDLORD,
            Role.LANDLORD_PRO,
            Role.AGENCY,
            Role.ADMIN,
            Role.SUPER_ADMIN
        ]);

        if (!input.nouveauMontant || input.nouveauMontant <= 0) {
            return { success: false, error: "Le nouveau montant du loyer doit être supérieur à zéro." };
        }
        if (!input.dateEffet) {
            return { success: false, error: "La date d'effet demandée est obligatoire." };
        }

        const dateEffetObj = new Date(input.dateEffet);
        const now = new Date();

        // Vérification délai de 3 ans depuis le début du bail (ou dernière révision)
        const lastHist = await prisma.leaseRentHistory.findFirst({
            where: { leaseId: input.leaseId },
            orderBy: { effectiveLe: "desc" }
        });
        const refDate = lastHist?.effectiveLe ? new Date(lastHist.effectiveLe) : new Date(lease.startDate);
        const diffYears = (dateEffetObj.getTime() - refDate.getTime()) / (1000 * 3600 * 24 * 365.25);
        const estConformeDelaiAns = diffYears >= 3 || input.nouveauMontant <= lease.rentAmount;

        // Vérification préavis de 3 mois avant la date d'effet
        const diffMonths = (dateEffetObj.getTime() - now.getTime()) / (1000 * 3600 * 24 * 30);
        const estConformePreavis = diffMonths >= 3 || input.nouveauMontant <= lease.rentAmount;

        let motifNullite: string | null = null;
        if (!estConformeDelaiAns) {
            motifNullite = "Révision à la hausse avant l'échéance triennale légale (3 ans — CCH).";
        } else if (!estConformePreavis) {
            motifNullite = "Préavis inférieur à 3 mois avant la date d'effet demandée.";
        }

        const proposition = await prisma.propositionLoyer.create({
            data: {
                leaseId: input.leaseId,
                montantActuel: lease.rentAmount,
                nouveauMontant: Math.round(input.nouveauMontant),
                dateEffet: dateEffetObj,
                dateEffetDemandee: dateEffetObj,
                dateNotification: now,
                raison: input.raison || "Révision contractuelle de loyer (MRL-01)",
                statut: "EN_ATTENTE",
                estConformeDelaiAns,
                estConformePreavis,
                motifNullite
            }
        });

        // Notification au locataire si identifié
        if (lease.tenantId) {
            await prisma.notification.create({
                data: {
                    userId: lease.tenantId,
                    channel: "PUSH",
                    title: "Proposition de révision de loyer (MRL-01)",
                    content: `Votre bailleur propose un loyer de ${Math.round(input.nouveauMontant).toLocaleString("fr-FR")} FCFA à compter du ${dateEffetObj.toLocaleDateString("fr-FR")}.Votre consentement est requis.`,
                    type: "WARNING",
                    link: "/mon-espace-locataire/leases"
                }
            }).catch(() => {});
        }

        revalidatePath(`/dashboard/leases/${input.leaseId}`);
        revalidatePath("/mon-espace-locataire/leases");

        return {
            success: true,
            message: "Proposition de révision de loyer (MRL-01) transmise au locataire pour consentement.",
            proposition: JSON.parse(JSON.stringify(proposition))
        };
    } catch (error: any) {
        console.error("[proposerRevisionLoyerAction Error]:", error);
        return { success: false, error: error.message || "Erreur lors de la création de la proposition MRL-01." };
    }
}

/**
 * [MRL-01] Répondre à une proposition de révision de loyer (Locataire : Accepter / Refuser)
 */
export async function repondrePropositionLoyerAction(input: {
    propositionId: string;
    reponse: boolean;
    commentaire?: string;
}) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const prop = await prisma.propositionLoyer.findUnique({
            where: { id: input.propositionId },
            include: { lease: true, consentement: true }
        });

        if (!prop) {
            return { success: false, error: "Proposition de loyer introuvable." };
        }
        if (prop.consentement) {
            return { success: false, error: "Vous avez déjà répondu à cette proposition." };
        }

        const nextStatut = input.reponse ? "ACCEPTEE" : "REFUSEE";

        await prisma.$transaction(async (tx) => {
            await tx.consentementLoyer.create({
                data: {
                    propositionId: prop.id,
                    reponse: input.reponse,
                    commentaire: input.commentaire || (input.reponse ? "Accepté par le locataire" : "Refusé par le locataire")
                }
            });

            await tx.propositionLoyer.update({
                where: { id: prop.id },
                data: { statut: nextStatut }
            });

            if (input.reponse) {
                await tx.lease.update({
                    where: { id: prop.leaseId },
                    data: { rentAmount: prop.nouveauMontant }
                });

                const hashModification = crypto
                    .createHash("sha256")
                    .update(`${prop.leaseId}:${prop.montantActuel}:${prop.nouveauMontant}:${new Date().toISOString()}`)
                    .digest("hex");

                await tx.leaseRentHistory.create({
                    data: {
                        leaseId: prop.leaseId,
                        ancienLoyer: prop.montantActuel,
                        nouveauLoyer: prop.nouveauMontant,
                        anciennesCharges: prop.lease.chargesAmount || 0,
                        nouvellesCharges: prop.lease.chargesAmount || 0,
                        motif: prop.raison || "Révision MRL-01 acceptée par le locataire",
                        sourceModification: "REVISION_MRL",
                        confirmationLocataire: "CONFIRME",
                        confirmeAt: new Date(),
                        modifieParId: userId,
                        effectiveLe: prop.dateEffet,
                        hashModification
                    }
                });
            }
        });

        revalidatePath("/mon-espace-locataire/leases");
        revalidatePath(`/dashboard/leases/${prop.leaseId}`);

        return {
            success: true,
            message: input.reponse
                ? `Nouveau loyer de ${prop.nouveauMontant.toLocaleString("fr-FR")} FCFA accepté et enregistré.`
                : "Refus de la révision de loyer enregistré. Le loyer actuel reste inchangé."
        };
    } catch (error: any) {
        console.error("[repondrePropositionLoyerAction Error]:", error);
        return { success: false, error: error.message || "Erreur lors de l'enregistrement de votre réponse." };
    }
}

/**
 * [ADD-26] Déclarer un paiement alternatif (« J'ai payé autrement » : Espèces, Virement, Dépôt, Mobile Money direct)
 */
export async function declarerPaiementAlternatifAction(input: {
    bailId: string;
    montant: number;
    mois: string; // YYYY-MM
    moyen: string; // ESPECES | VIREMENT_BANCAIRE | DEPOT_COMPTE | MOBILE_MONEY_DIRECT | CHEQUE
    datePaiement?: string;
    preuveUrl?: string;
}) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        const lease = await prisma.lease.findUnique({
            where: { id: input.bailId },
            include: { property: true }
        });
        if (!lease) {
            return { success: false, error: "Contrat de bail introuvable." };
        }

        if (!input.montant || input.montant <= 0) {
            return { success: false, error: "Le montant déclaré doit être supérieur à zéro." };
        }
        if (!input.mois) {
            return { success: false, error: "Veuillez préciser le mois concerné (ex: 2026-11)." };
        }

        const decl = await prisma.declarationPaiement.create({
            data: {
                bailId: input.bailId,
                locataireId: userId,
                montant: Number(input.montant),
                mois: input.mois,
                moyen: input.moyen || "ESPECES",
                datePaiement: input.datePaiement ? new Date(input.datePaiement) : new Date(),
                statut: "DECLARE",
                preuveUrl: input.preuveUrl || null
            }
        });

        // Notifier le bailleur
        await prisma.notification.create({
            data: {
                userId: lease.landlordId,
                channel: "PUSH",
                title: "Déclaration de paiement reçue (ADD-26)",
                content: `Votre locataire a déclaré un règlement de ${Number(input.montant).toLocaleString("fr-FR")} FCFA (${input.moyen}) pour ${input.mois}. Confirmez pour émettre la quittance.`,
                type: "INFO",
                link: `/dashboard/leases/${lease.id}`
            }
        }).catch(() => {});

        revalidatePath("/mon-espace-locataire/receipts");
        revalidatePath("/mon-espace-locataire");
        revalidatePath(`/dashboard/leases/${input.bailId}`);

        return {
            success: true,
            message: "Déclaration de paiement transmise à votre bailleur. Votre quittance sera générée dès sa confirmation.",
            declaration: JSON.parse(JSON.stringify(decl))
        };
    } catch (error: any) {
        console.error("[declarerPaiementAlternatifAction Error]:", error);
        return { success: false, error: error.message || "Erreur lors de la déclaration du paiement." };
    }
}

/**
 * [ADD-26] Confirmer ou Contester une déclaration de paiement (Bailleur / Agence)
 */
export async function statuerDeclarationPaiementAction(input: {
    declarationId: string;
    decision: "CONFIRMER" | "CONTESTER";
}) {
    try {
        const session = await ensureAuthenticated();

        const decl = await prisma.declarationPaiement.findUnique({
            where: { id: input.declarationId },
            include: { bail: true }
        });
        if (!decl) {
            return { success: false, error: "Déclaration de paiement introuvable." };
        }

        await ensureLeaseAccess(decl.bailId, [
            Role.LANDLORD,
            Role.LANDLORD_PRO,
            Role.AGENCY,
            Role.ADMIN,
            Role.SUPER_ADMIN
        ]);

        if (input.decision === "CONTESTER") {
            await prisma.declarationPaiement.update({
                where: { id: decl.id },
                data: {
                    statut: "CONTESTE",
                    decideLe: new Date(),
                    tentativesNon: { increment: 1 }
                }
            });

            revalidatePath(`/dashboard/leases/${decl.bailId}`);
            revalidatePath("/mon-espace-locataire/receipts");
            return {
                success: true,
                message: "Déclaration marquée comme contestée. Le locataire en est informé."
            };
        }

        // Cas CONFIRMER : création ou validation de la quittance officielle
        const ref = `REC-${decl.mois}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
        const sha256 = crypto
            .createHash("sha256")
            .update(JSON.stringify({ leaseId: decl.bailId, total: decl.montant, ref, declarationId: decl.id }))
            .digest("hex");

        const receipt = await prisma.receipt.upsert({
            where: {
                leaseId_periodMonth: {
                    leaseId: decl.bailId,
                    periodMonth: decl.mois
                }
            },
            update: {
                totalAmount: Math.round(decl.montant),
                paymentMethod: decl.moyen,
                paidAt: decl.datePaiement,
                status: "PAID",
                receiptHash: sha256,
                declarationPaiementId: decl.id
            },
            create: {
                receiptRef: ref,
                leaseId: decl.bailId,
                periodMonth: decl.mois,
                moisConcerne: decl.mois,
                rentAmount: decl.bail.rentAmount,
                chargesAmount: decl.bail.chargesAmount || 0,
                totalAmount: Math.round(decl.montant),
                paymentMethod: decl.moyen,
                paidAt: decl.datePaiement,
                qrToken: crypto.randomUUID(),
                receiptHash: sha256,
                status: "PAID",
                declarationPaiementId: decl.id
            }
        });

        await prisma.declarationPaiement.update({
            where: { id: decl.id },
            data: {
                statut: "CONFIRME",
                quittanceId: receipt.id,
                decideLe: new Date()
            }
        });

        revalidatePath(`/dashboard/leases/${decl.bailId}`);
        revalidatePath("/dashboard/receipts");
        revalidatePath("/mon-espace-locataire/receipts");

        return {
            success: true,
            message: `Paiement confirmé ! La quittance officielle ${receipt.receiptRef} a été émise.`,
            receiptId: receipt.id
        };
    } catch (error: any) {
        console.error("[statuerDeclarationPaiementAction Error]:", error);
        return { success: false, error: error.message || "Erreur lors du traitement de la déclaration." };
    }
}

export async function getDeclarationsPaiementForTenant() {
    try {
        const session = await ensureAuthenticated();
        const list = await prisma.declarationPaiement.findMany({
            where: { locataireId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });
        return JSON.parse(JSON.stringify(list));
    } catch {
        return [];
    }
}

