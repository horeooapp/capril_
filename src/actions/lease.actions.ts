"use server";
/**
 * QAPRIL — Authoritative Lease Actions Module
 * Consolidated from leases.ts, leases-edit.ts, lease.actions.ts, bdq.ts and signature.ts
 * Standardized with ensureLeaseAccess and ensureAuthenticated
 */

import { prisma } from "@/lib/prisma";
import { createHash, randomInt } from "crypto"; // [SEC-FIX F-03] randomInt importé pour OTP sécurisé
import { revalidatePath } from "next/cache";
import { Role, TypeBail, LeaseStatus, Prisma, BdqStatut } from "@prisma/client";
import { ensureAuthenticated, ensureLeaseAccess, ensurePropertyAccess } from "./auth-helpers";
import { writeAuditLog } from "@/lib/audit";
import { generateLeaseRef } from "@/lib/lease";
import { normalizePhone } from "@/lib/phone";
import { serializeLease, serializeObject } from "@/lib/serialize";
import { evaluateTransactionRisk } from "@/lib/m-guard";
import { sendSMS } from "@/lib/sms";
import { sendOpenWAMessage } from "@/lib/openwa";
import { sendEmail, wrapInPremiumTemplate } from "@/lib/email";
import { generateProofHash } from "@/lib/proof";
import { LoyerService } from "@/lib/loyer-service";
import { FiscalService } from "@/lib/fiscal-service";
import { NotificationService } from "@/lib/notification-service";

// --- [CORE] Baux Standard ---

/**
 * [LEA-01] Create a new Lease (Residential or Commercial OHADA)
 */
export async function createLease(data: {
    propertyId: string,
    candidatureId?: string,
    tenantName?: string,
    leaseType: 'residential' | 'commercial',
    typeBail?: TypeBail,
    tenantPhone?: string,
    tenantEntityId?: string,
    startDate: Date,
    rentAmount: number,
    chargesAmount?: number,
    depositAmount?: number,
    avanceLoyer?: number,
    preavisRequisMois?: number,
    durationMonths: number,
    commercialData?: any,
    mandatGestionId?: string
}) {
    try {
        const session = await ensureAuthenticated();
        
        // 1. Availability Check: Check if already an ACTIVE lease
        const activeLease = await prisma.lease.findFirst({
            where: {
                propertyId: data.propertyId,
                status: LeaseStatus.ACTIVE
            }
        });
        if (activeLease) throw new Error("Ce bien est déjà engagé dans un contrat de bail actif.");

        // Clean up any stale draft leases for this property
        await prisma.lease.deleteMany({
            where: {
                propertyId: data.propertyId,
                status: LeaseStatus.DRAFT
            }
        });

        // 2. Access Check
        const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
        if (!property) throw new Error("Bien introuvable.");
        await ensurePropertyAccess(data.propertyId);

        const ownerId = property.ownerUserId;
        let agentId: string | null = null;
        let finalMandatId = data.mandatGestionId || null;

        if (session.user.id !== ownerId) {
            agentId = session.user.id;
            if (!finalMandatId) {
                const access = await prisma.propertyAccess.findFirst({
                    where: { propertyId: data.propertyId, userId: agentId, statut: "ACTIF" }
                });
                finalMandatId = access?.mandatId || null;
            }
        }

        // 3. Tenant Identification & Candidate Linking
        let tenantId: string | undefined;
        let tenantEmail: string | undefined;
        let finalTenantName: string = (data.tenantName || "").trim();

        if (data.candidatureId) {
            const cand = await prisma.candidature.findUnique({
                where: { id: data.candidatureId },
                include: { candidat: true }
            });
            if (cand) {
                if (cand.candidatId) tenantId = cand.candidatId;
                if (cand.candidat?.email) tenantEmail = cand.candidat.email;
                if (!finalTenantName) finalTenantName = `${cand.prenom} ${cand.nom}`.trim();
                if (!data.tenantPhone && (cand.telephone || cand.candidat?.phone)) {
                    data.tenantPhone = cand.telephone || cand.candidat?.phone || undefined;
                }
            }
        }

        if (data.tenantPhone) {
            const normalized = normalizePhone(data.tenantPhone);
            let tenant = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone: normalized },
                        ...(tenantId ? [{ id: tenantId }] : [])
                    ]
                }
            });

            if (!tenant) {
                const parts = (finalTenantName || "Locataire").split(" ");
                tenant = await prisma.user.create({
                    data: {
                        phone: normalized,
                        firstName: parts[0] || "Locataire",
                        lastName: parts.slice(1).join(" ") || "",
                        role: Role.TENANT,
                        status: 'PENDING'
                    }
                });
            } else {
                if (finalTenantName && (!tenant.firstName || tenant.firstName === "Locataire")) {
                    const parts = finalTenantName.split(" ");
                    await prisma.user.update({
                        where: { id: tenant.id },
                        data: {
                            firstName: parts[0] || tenant.firstName,
                            lastName: parts.slice(1).join(" ") || tenant.lastName
                        }
                    });
                }
            }
            tenantId = tenant.id;
            if (!tenantEmail && tenant.email) tenantEmail = tenant.email;
        }

        // 4. Legal Validations (Arts. 415, 416, 440, 442 CCH)
        const preavis = data.preavisRequisMois ?? 3;
        if (preavis < 3) throw new Error("Le préavis ne peut être inférieur à 3 mois (Arts. 440 et 442 CCH).");
        const maxLoyerAvanceCaution = data.rentAmount * 2;
        if ((data.avanceLoyer || 0) > maxLoyerAvanceCaution) throw new Error("Avances illégales : maximum 2 mois autorisés (Art. 415 CCH).");
        if ((data.depositAmount || 0) > maxLoyerAvanceCaution) throw new Error("Caution illégale : maximum 2 mois autorisés (Art. 416 CCH).");

        // 5. Certification Fee (2000 FCFA)
        const CERTIFICATION_FEE = 2000;
        const currentWallet = await prisma.userWalletConfig.findUnique({
            where: { userId: ownerId },
            select: { walletBalance: true }
        });
        const currentBal = currentWallet?.walletBalance ?? 0;
        const newBal = Math.max(0, currentBal - CERTIFICATION_FEE);
        await prisma.userWalletConfig.upsert({
            where: { userId: ownerId },
            create: { userId: ownerId, walletBalance: 0 },
            update: { walletBalance: newBal }
        });

        // 6. Security Hash
        const leaseRef = await generateLeaseRef(data.leaseType);
        const sha256 = await generateProofHash({ leaseRef, propertyId: data.propertyId, landlordId: ownerId, rent: data.rentAmount });

        // 7. DB Save: Set status to PENDING_SIGNATURE for direct tenant review & signature
        const lease = await prisma.lease.create({
            data: {
                leaseReference: leaseRef,
                leaseType: data.leaseType,
                typeBail: data.typeBail || TypeBail.ECRIT,
                propertyId: data.propertyId,
                landlordId: ownerId,
                agentId,
                tenantId: tenantId || null,
                tenantEntityId: data.tenantEntityId,
                mandatGestionId: finalMandatId,
                startDate: data.startDate,
                durationMonths: data.durationMonths,
                rentAmount: data.rentAmount,
                chargesAmount: data.chargesAmount || 0,
                depositAmount: data.depositAmount || 0,
                avanceLoyer: data.avanceLoyer || 0,
                preavisRequisMois: preavis,
                commercialData: data.commercialData as Prisma.InputJsonValue,
                sha256Hash: sha256,
                sha256CalculeLe: new Date(),
                status: data.typeBail === TypeBail.DECLARATIF_BDQ ? LeaseStatus.PENDING_CONFIRMATION : LeaseStatus.PENDING_SIGNATURE,
                deadlineEnregistrement: new Date(new Date(data.startDate).getTime() + (30 * 24 * 60 * 60 * 1000))
            }
        });

        // 8. Update Candidature to ACCEPTE
        if (data.candidatureId) {
            await prisma.candidature.update({
                where: { id: data.candidatureId },
                data: { statut: "ACCEPTE" }
            }).catch(() => null);
        } else {
            await prisma.candidature.updateMany({
                where: {
                    logementId: data.propertyId,
                    statut: "SOUMISE",
                    OR: [
                        ...(tenantId ? [{ candidatId: tenantId }] : []),
                        ...(data.tenantPhone ? [{ telephone: normalizePhone(data.tenantPhone) }] : [])
                    ]
                },
                data: { statut: "ACCEPTE" }
            }).catch(() => null);
        }

        // 9. Lock Property on Marketplace & Mark as rented
        await prisma.annonce.updateMany({
            where: { logementId: data.propertyId },
            data: {
                statut: "LOUE",
                archiveeAt: new Date()
            }
        });
        await prisma.property.update({
            where: { id: data.propertyId },
            data: { status: "RENTED" }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
        const bienNom = property.name || property.address || "le logement";
        const tenantDisplayName = finalTenantName || "Locataire";

        // 10. Multi-Channel Notifications to Locataire (Tenant)
        // a) In-App Notification
        if (tenantId) {
            await prisma.notification.create({
                data: {
                    userId: tenantId,
                    title: "🎉 Contrat de bail prêt à signer !",
                    message: `Le propriétaire a validé votre choix pour ${bienNom} et vous a transmis le contrat de bail (${leaseRef}).`,
                    type: "BAIL_CREE",
                    link: `/mon-espace-locataire/leases/${lease.id}`
                }
            }).catch(() => null);
        }

        // b) WhatsApp & SMS Notification to Tenant
        if (data.tenantPhone) {
            const tenantPhoneNorm = normalizePhone(data.tenantPhone);
            const waMsg = `🎉 *QAPRIL — Votre Contrat de Bail est Prêt !*\n\nBonjour ${tenantDisplayName},\n\nLe propriétaire a validé votre dossier et vous a transmis votre contrat de bail officiel pour *${bienNom}* (Loyer : ${data.rentAmount.toLocaleString('fr-FR')} FCFA/mois).\n\nVotre contrat est accessible directement sur votre tableau de bord pour consultation et signature électronique sécurisée :\n👉 ${appUrl}/mon-espace-locataire/leases/${lease.id}\n\n*QAPRIL — Gestion Immobilière Intelligente*`;

            const waRes = await sendOpenWAMessage(tenantPhoneNorm, waMsg).catch(() => ({ success: false }));
            if (!waRes?.success) {
                await sendSMS(
                    tenantPhoneNorm,
                    `QAPRIL : Votre contrat de bail pour ${bienNom} est prêt. Connectez-vous sur ${appUrl}/mon-espace-locataire/leases/${lease.id} pour le signer.`
                ).catch(() => null);
            }
        }

        // c) Email Notification to Tenant
        if (tenantEmail) {
            const emailHtml = `
                <p style="margin: 0 0 16px 0;">Bonjour <strong>${tenantDisplayName}</strong>,</p>
                <p style="margin: 0 0 16px 0;">Excellente nouvelle ! Le propriétaire a validé votre dossier de candidature et vous a transmis votre contrat de bail pour le bien <strong>${bienNom}</strong>.</p>
                
                <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #065F46;"><strong>Référence du Bail :</strong> ${leaseRef}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #065F46;"><strong>Loyer mensuel :</strong> ${data.rentAmount.toLocaleString('fr-FR')} FCFA</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #065F46;"><strong>Dépôt de garantie :</strong> ${(data.depositAmount || 0).toLocaleString('fr-FR')} FCFA</p>
                    <p style="margin: 0; font-size: 14px; color: #065F46;">Ce bail est certifié conforme au Code de la Construction et de l'Habitation (CCH) et sécurisé par empreinte numérique SHA-256.</p>
                </div>

                <p style="margin: 0 0 24px 0;">Veuillez cliquer sur le bouton ci-dessous pour relire attentivement votre contrat et procéder à votre signature électronique sécurisée :</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/mon-espace-locataire/leases/${lease.id}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                        Consulter & Signer mon Bail →
                    </a>
                </div>
            `;

            await sendEmail({
                to: tenantEmail,
                subject: `🎉 Félicitations ! Votre contrat de bail pour ${bienNom} est prêt - QAPRIL`,
                html: wrapInPremiumTemplate(emailHtml, "Validation de Bail & Signature")
            }).catch(err => console.error("[Tenant Acceptance Email Error]", err));
        }

        // 11. Multi-Channel Notifications to Propriétaire (Landlord)
        const ownerUser = await prisma.user.findUnique({
            where: { id: ownerId },
            select: { name: true, firstName: true, lastName: true, email: true, phone: true }
        });

        // a) In-App Notification to Landlord
        await prisma.notification.create({
            data: {
                userId: ownerId,
                title: "✅ Contrat de bail généré et transmis",
                message: `Le contrat de bail (${leaseRef}) pour ${bienNom} a été généré et notifié au locataire (${tenantDisplayName}) par WhatsApp et Email.`,
                type: "BAIL_TRANSMIS",
                link: `/dashboard/leases/${lease.id}`
            }
        }).catch(() => null);

        // b) WhatsApp to Landlord
        if (ownerUser?.phone) {
            const ownerPhoneNorm = normalizePhone(ownerUser.phone);
            const ownerWaMsg = `✅ *QAPRIL — Contrat de Bail Transmis*\n\nBonjour ${ownerUser.firstName || ownerUser.name || 'Propriétaire'},\n\nLe contrat de bail *${leaseRef}* pour *${bienNom}* a été généré avec succès et transmis au locataire *${tenantDisplayName}*.\n\nLe logement est désormais verrouillé et marqué *LOUÉ* sur le marketplace.\n\n👉 Suivre le dossier : ${appUrl}/dashboard/leases/${lease.id}`;
            await sendOpenWAMessage(ownerPhoneNorm, ownerWaMsg).catch(() => null);
        }

        // c) Email to Landlord
        if (ownerUser?.email) {
            const ownerEmailHtml = `
                <p style="margin: 0 0 16px 0;">Bonjour <strong>${ownerUser.firstName || ownerUser.name || 'Propriétaire'}</strong>,</p>
                <p style="margin: 0 0 16px 0;">Votre contrat de bail <strong>${leaseRef}</strong> pour le bien <strong>${bienNom}</strong> a été créé avec succès et transmis au locataire <strong>${tenantDisplayName}</strong>.</p>
                
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Statut :</strong> En attente de signature électronique du locataire</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Loyer convenu :</strong> ${data.rentAmount.toLocaleString('fr-FR')} FCFA / mois</p>
                    <p style="margin: 0; font-size: 14px;">Le logement a été automatiquement verrouillé et marqué comme <strong>LOUÉ</strong> sur le marketplace.</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/dashboard/leases/${lease.id}" style="background-color: #FF8200; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                        Suivre le contrat de bail →
                    </a>
                </div>
            `;
            await sendEmail({
                to: ownerUser.email,
                subject: `✅ Contrat de bail ${leaseRef} généré et transmis au locataire - QAPRIL`,
                html: wrapInPremiumTemplate(ownerEmailHtml, "Bail Généré & Transmis")
            }).catch(err => console.error("[Owner Lease Confirmation Email Error]", err));
        }

        await writeAuditLog({ userId: session.user.id, action: "LEASE_CREATED", module: "LEASE", entityId: lease.id });
        revalidatePath("/dashboard/leases");
        revalidatePath("/dashboard/properties");
        revalidatePath("/mon-espace-locataire/leases");
        revalidatePath("/mon-espace-locataire/marketplace");
        revalidatePath("/dashboard/matching");

        return { success: true, leaseId: lease.id, leaseReference: leaseRef };
    } catch (error: any) {
        console.error("[createLease Error]", error);
        return { error: error.message || "Erreur lors de la création du bail." };
    }
}

/**
 * [LEA-02] Update Lease Draft
 */
export async function updateLeaseDraft(leaseId: string, data: any) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        // 1. Tenter la recherche d'un bail formel
        const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { property: true } });
        if (lease) {
            await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);
            if (![LeaseStatus.DRAFT, LeaseStatus.PENDING_SIGNATURE, LeaseStatus.PENDING_CONFIRMATION, LeaseStatus.ACTIVE_DECLARATIF as any].includes(lease.status as any)) {
                throw new Error("Ce bail ne peut plus être modifié.");
            }
            await prisma.lease.update({
                where: { id: leaseId },
                data: { ...data, commercialData: data.commercialData as Prisma.InputJsonValue }
            });
            revalidatePath(`/dashboard/leases/${leaseId}`);
            revalidatePath(`/dashboard/leases`);
            return { success: true };
        }

        // 2. Tenter la recherche d'un bail déclaratif (BDQ)
        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: leaseId } });
        if (bdq) {
            if (bdq.bailleurId !== userId && (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
                throw new Error("Action non autorisée sur ce bail déclaratif.");
            }
            const { modifierBailDeclaratif } = await import("@/actions/bail-declaratif.actions");
            return await modifierBailDeclaratif({
                bdqId: leaseId,
                nomLocataire: data.tenantName || data.nomLocataireDeclare || bdq.nomLocataireDeclare,
                prenomLocataire: data.prenomLocataire || bdq.prenomLocataireDeclare || "",
                telephoneLocataire: data.tenantPhone || data.telephoneLocataire || bdq.telephoneLocataire,
                loyerDeclareMensuel: data.rentAmount || data.loyerDeclareMensuel || bdq.loyerDeclareMensuel,
                descriptionLogement: data.descriptionLogement || bdq.descriptionLogement,
                dateEntreeEstimee: data.startDate || data.dateEntreeEstimee || bdq.dateEntreeEstimee,
                propertyId: data.propertyId || bdq.propertyId
            });
        }

        throw new Error("Bail introuvable.");
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [LEA-03] Get Lease Details (supports Lease & BailDeclaratif)
 */
export async function getLeaseById(id: string) {
    try {
        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: true,
                landlord: { select: { firstName: true, lastName: true, phone: true, email: true, walletConfig: { select: { landlordCode: true } } } },
                tenant: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                procedurePhases: true,
                repaymentPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
                receipts: { orderBy: { periodMonth: 'desc' } }
            }
        });
        if (lease) return serializeLease(lease);

        // Fallback: BailDéclaratif
        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id },
            include: {
                property: true,
                bailleur: { select: { firstName: true, lastName: true, phone: true, email: true, walletConfig: { select: { landlordCode: true } } } },
                locataire: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                mediation: true,
                historiqueLoyer: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (bdq) {
            return serializeObject({
                id: bdq.id,
                leaseReference: `BDQ-${bdq.id.substring(0, 8)}`,
                typeBail: "DECLARATIF_BDQ",
                isBdq: true,
                status: bdq.statut,
                rentAmount: bdq.loyerDeclareMensuel,
                chargesAmount: 0,
                depositAmount: 0,
                startDate: bdq.dateEntreeEstimee || bdq.createdAt,
                signedAt: bdq.confirmationAt,
                propertyId: bdq.propertyId,
                property: bdq.property || {
                    name: bdq.descriptionLogement,
                    address: bdq.adresseLibre || bdq.descriptionLogement,
                    commune: "Abidjan",
                    propertyType: "Logement Déclaratif"
                },
                landlord: bdq.bailleur,
                tenant: bdq.locataire || {
                    id: bdq.locataireId || bdq.id,
                    firstName: bdq.prenomLocataireDeclare || "",
                    lastName: bdq.nomLocataireDeclare || bdq.telephoneLocataire,
                    fullName: `${bdq.prenomLocataireDeclare ? bdq.prenomLocataireDeclare + " " : ""}${bdq.nomLocataireDeclare || ""}`.trim() || bdq.telephoneLocataire,
                    phone: bdq.telephoneLocataire,
                    email: null,
                    reliabilityScore: 85
                },
                procedurePhases: [],
                repaymentPlans: [],
                receipts: [],
                cdcDeposits: [],
                insurance: null,
                reminders: [],
                mediation: bdq.mediation,
                descriptionLogement: bdq.descriptionLogement,
                telephoneLocataire: bdq.telephoneLocataire,
                nomLocataireDeclare: bdq.nomLocataireDeclare,
                prenomLocataireDeclare: bdq.prenomLocataireDeclare,
                dateEntreeEstimee: bdq.dateEntreeEstimee
            });
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Supprimer / Archiver un bail (Bail Déclaratif ou Bail Formel)
 */
export async function deleteLeaseAction(leaseOrBdqId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;
        const userRole = (session.user as any)?.role;

        // 1. Tenter la suppression en tant que BDQ
        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: leaseOrBdqId } });
        if (bdq) {
            const { supprimerBailDeclaratif } = await import("@/actions/bail-declaratif.actions");
            return await supprimerBailDeclaratif(leaseOrBdqId);
        }

        // 2. Tenter la suppression en tant que Lease
        const lease = await prisma.lease.findUnique({
            where: { id: leaseOrBdqId },
            include: { property: true }
        });
        if (!lease) return { success: false, error: "Bail introuvable." };

        const isAuthorized = lease.landlordId === userId || 
                             lease.agentId === userId || 
                             lease.property.ownerUserId === userId || 
                             lease.property.managedByUserId === userId ||
                             userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (!isAuthorized) {
            return { success: false, error: "Action non autorisée sur ce bail." };
        }

        await prisma.lease.update({
            where: { id: leaseOrBdqId },
            data: { status: "ARCHIVED" }
        });

        if (lease.propertyId) {
            const remainingActive = await prisma.lease.findFirst({
                where: {
                    propertyId: lease.propertyId,
                    status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] },
                    id: { not: leaseOrBdqId }
                }
            });
            if (!remainingActive) {
                await prisma.property.update({
                    where: { id: lease.propertyId },
                    data: { status: "ACTIVE" }
                }).catch(() => null);
            }
        }

        await prisma.auditLog.create({
            data: {
                userId,
                action: "LEASE_DELETE",
                module: "LEASES",
                entityId: leaseOrBdqId,
                newValues: { status: "ARCHIVED" }
            }
        }).catch(() => null);

        revalidatePath("/dashboard/leases");
        return { success: true, message: "Bail supprimé et archivé avec succès." };
    } catch (err: any) {
        console.error("[deleteLeaseAction Error]", err);
        return { success: false, error: err?.message || "Erreur lors de la suppression du bail." };
    }
}

// Explicit async functions for convenient use
export async function modifierBailDeclaratif(data: any) {
  const { modifierBailDeclaratif: fn } = await import("./bail-declaratif.actions");
  return await fn(data);
}

export async function supprimerBailDeclaratif(bdqId: string) {
  const { supprimerBailDeclaratif: fn } = await import("./bail-declaratif.actions");
  return await fn(bdqId);
}

export async function updateBDQAction(data: any) {
  const { updateBDQAction: fn } = await import("./bail-declaratif.actions");
  return await fn(data);
}

export async function deleteBDQAction(bdqId: string) {
  const { deleteBDQAction: fn } = await import("./bail-declaratif.actions");
  return await fn(bdqId);
}


// --- [BDQ] Bail Déclaratif (Situation A/B/C) ---


/**
 * [LEA-05] Confirmer un BDQ (Locataire)
 */
export async function confirmBDQ(bdqId: string, otp: string, reponse: "OUI" | "NON", motif?: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id: bdqId },
            include: { bailleur: true }
        });

        if (!bdq) throw new Error("BDQ introuvable.");
        if (bdq.statut !== BdqStatut.PENDING_LOCATAIRE && otp !== "DASHBOARD_AUTH") {
             throw new Error("Ce BDQ n'est plus en attente de confirmation.");
        }

        if (reponse === "NON") {
            const updatedBdq = await prisma.bailDeclaratif.update({
                where: { id: bdqId },
                data: { statut: BdqStatut.CONTESTE, confirmationLocataire: false, motifRefus: motif, confirmationAt: new Date() }
            });

            // --- [ORCHESTRATION P2.1] Déclenchement de la Médiation ---
            try {
                await prisma.mediation.create({
                    data: {
                        bdqId: bdqId,
                        subject: `Contestation BDQ - ${bdq.nomLocataireDeclare}`,
                        status: "OPEN"
                    }
                });

                // Notification au Bailleur
                await NotificationService.envoyerNotification(bdq.bailleurId, "BDQ_CONTESTE", {
                    payload: {
                        smsText: `QAPRIL : Votre déclaration pour ${bdq.nomLocataireDeclare} a été contestée. Une médiation a été ouverte.`,
                        parameters: [bdq.nomLocataireDeclare, motif || "Non spécifié"]
                    }
                });
            } catch (mediationError) {
                console.error("[MEDIATION_ERROR] Failed to open automated mediation:", mediationError);
            }

            return { success: true, status: "CONTESTE" };
        }

        // Success: CONFIRME
        const finalHash = await generateProofHash({ ...bdq, confirmedAt: new Date().toISOString() });
        const qrToken = `QAPRIL-BDQ-${bdq.id.substring(0, 8).toUpperCase()}`;

        let tenant = await prisma.user.findUnique({ where: { phone: bdq.telephoneLocataire } });
        if (!tenant) {
            tenant = await prisma.user.create({
                data: { phone: bdq.telephoneLocataire, firstName: bdq.nomLocataireDeclare, role: Role.TENANT, status: 'PENDING' }
            });
        }

        let leaseEntryId = null;
        if (bdq.propertyId) {
            const newLease = await prisma.lease.create({
                data: {
                    leaseReference: `BDQ-${bdq.id.substring(0, 8).toUpperCase()}`,
                    propertyId: bdq.propertyId,
                    landlordId: bdq.bailleurId,
                    tenantId: tenant.id,
                    startDate: bdq.dateEntreeEstimee || new Date(),
                    rentAmount: bdq.loyerDeclareMensuel as any,
                    durationMonths: 12,
                    status: LeaseStatus.ACTIVE_DECLARATIF,
                    typeBail: TypeBail.DECLARATIF_BDQ,
                    confirmationLocataireSms: true,
                    confirmationLocataireAt: new Date(),
                }
            });
            leaseEntryId = newLease.id;
        }

        await prisma.bailDeclaratif.update({
            where: { id: bdqId },
            data: {
                statut: BdqStatut.CONFIRME,
                confirmationLocataire: true,
                confirmationAt: new Date(),
                hashBdqFinal: finalHash,
                qrToken: qrToken,
                bailFormelId: leaseEntryId
            }
        });

        revalidatePath("/dashboard/leases");
        return { success: true, status: "CONFIRME" };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [LEA-05b] Confirm a BDQ directly from the Tenant Dashboard
 */
export async function confirmBDQFromDashboard(bdqId: string, reponse: "OUI" | "NON", motif?: string) {
    try {
        const session = await ensureAuthenticated();
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true } });
        if (!user || !user.phone) throw new Error("Profil utilisateur incomplet.");

        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: bdqId } });
        if (!bdq) throw new Error("Déclaration introuvable.");

        if (normalizePhone(user.phone) !== bdq.telephoneLocataire) {
            throw new Error("Cette déclaration ne vous est pas destinée.");
        }

        return await confirmBDQ(bdqId, "DASHBOARD_AUTH", reponse, motif);
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * [LEA-05c] Créer un Bail Déclaratif (BDQ)
 */
export async function createBDQ(data: any) {
    try {
        const session = await ensureAuthenticated();
        const bailleurId = session.user.id;

        // Normalize Telephone
        let normalizedPhone = data.telephoneLocataire;
        if (normalizedPhone) {
            normalizedPhone = normalizedPhone.replace(/\s+/g, "");
            if (normalizedPhone.startsWith("0") && normalizedPhone.length === 10) normalizedPhone = "+225 " + normalizedPhone;
            data.telephoneLocataire = normalizedPhone;
        }

        const hash = await generateProofHash({ bailleurId, nom: data.nomLocataire, tel: data.telephoneLocataire, date: new Date().toISOString() });

        const bdq = await prisma.bailDeclaratif.create({
            data: {
                bailleurId,
                propertyId: data.propertyId,
                nomLocataireDeclare: data.nomLocataire,
                prenomLocataireDeclare: data.prenomLocataire,
                telephoneLocataire: data.telephoneLocataire,
                descriptionLogement: data.descriptionLogement,
                loyerDeclareMensuel: data.loyerMensuel,
                dateEntreeEstimee: data.dateEntree,
                statut: BdqStatut.PENDING_LOCATAIRE,
                hashDeclaration: hash,
            }
        });

        // [SEC-FIX F-03] OTP cryptographiquement sécurisé
        const otp = randomInt(100000, 999999).toString();
        await sendSMS(data.telephoneLocataire, `QAPRIL : Confirmation requise pour ${data.descriptionLogement} (${data.loyerMensuel} FCFA). Code : ${otp}`);

        return { success: true, bdqId: bdq.id };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [LEA-05d] Relancer un BDQ
 */
export async function relancerBDQ(bdqId: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: bdqId } });
        if (!bdq) throw new Error("BDQ introuvable.");
        
        // [SEC-FIX F-03] OTP cryptographiquement sécurisé
        const otp = randomInt(100000, 999999).toString();
        await sendSMS(bdq.telephoneLocataire, `QAPRIL : Rappel confirmation pour ${bdq.descriptionLogement}. Code : ${otp}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// --- [SIGNATURE] M-SIG-ELEC ---

/**
 * [LEA-06] Initiate Electronic Signature (OTP)
 */
export async function requestSignatureOTP(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const risk = await evaluateTransactionRisk({ userId: session.user.id, action: "SIGNATURE" });
        if (!risk.isSafe) throw new Error(`Risque détecté : ${risk.reason}`);

        const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { tenant: true } });
        if (!lease || !lease.tenant) throw new Error("Bail ou locataire introuvable.");

        // [SEC-FIX F-03] OTP cryptographiquement sécurisé
        const otp = randomInt(100000, 999999).toString();
        await prisma.lease.update({ where: { id: leaseId }, data: { signingOtp: otp } });

        if (lease.tenant.phone) {
            const { sendOpenWAOTP } = await import("@/lib/openwa");
            await sendOpenWAOTP(lease.tenant.phone, otp, "Signature de contrat de bail");
        }
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * [LEA-07] Verify Signature and Seal Lease
 */
export async function signLease(leaseId: string, otp: string) {
    try {
        const session = await ensureAuthenticated();
        const lease = await prisma.lease.findUnique({ 
            where: { id: leaseId },
            include: { tenant: true }
        });
        if (!lease || (lease as any).signingOtp !== otp) throw new Error("Code OTP invalide.");

        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                isSignedElectronically: true,
                signedAt: new Date(),
                signingOtp: null,
                status: "ACTIVE"
            } as any
        });
        await prisma.property.update({ where: { id: lease.propertyId }, data: { status: "rented" } });
        
        // --- [ORCHESTRATION] P1 Transitions ---
        try {
            // 1. Initialise la synthèse de loyer du mois en cours
            await LoyerService.initLeaseSynthesis(leaseId);
            
            // 2. Initialise le dossier fiscal (DGI)
            if (lease.typeBail === TypeBail.ECRIT) {
                await FiscalService.getOrCreateDossier(leaseId);
            }
            
            // 3. Notification aux parties
            await sendSMS(lease.tenant?.phone || "", `Félicitations ! Votre bail QAPRIL est actif. Votre quittance du mois sera disponible bientôt.`);
        } catch (orchestrationError) {
            console.error("[ORCHESTRATION_ERROR] Post-signature logic failed:", orchestrationError);
            // On ne bloque pas la signature si le câblage échoue, mais on log
        }

        revalidatePath(`/dashboard/leases/${leaseId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- [UTILS] Misc ---

export async function getTenantLeases() {
    const session = await ensureAuthenticated();
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, phone: true }
    });
    const leases = await prisma.lease.findMany({
        where: {
            OR: [
                { tenantId: session.user.id },
                ...(user?.phone ? [{ tenant: { phone: user.phone } }] : [])
            ]
        },
        include: { property: true, landlord: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return leases.map(l => serializeLease(l));
}

export async function renewLeaseAction(leaseId: string) {
    try {
        const session = await ensureAuthenticated();
        const userId = session.user.id;

        // 1. Tenter la recherche d'un bail formel (Lease)
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (lease) {
            const isAuthorized = lease.landlordId === userId || 
                                 lease.agentId === userId || 
                                 lease.property.managedByUserId === userId || 
                                 lease.property.ownerUserId === userId;
            if (!isAuthorized && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
                return { success: false, error: "Action non autorisée sur ce bail." };
            }

            // Calculer la nouvelle date de fin (+ 1 an)
            const currentDuration = lease.durationMonths || 12;
            const newDuration = currentDuration + 12;
            const baseDate = lease.endDate 
                ? new Date(lease.endDate) 
                : new Date(new Date(lease.startDate).getTime() + currentDuration * 30 * 24 * 3600 * 1000);
            const newEndDate = new Date(baseDate);
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);

            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    durationMonths: newDuration,
                    endDate: newEndDate,
                    status: (lease.status === 'TERMINATED' || (lease.status as string) === 'EXPIRED') ? 'ACTIVE' : lease.status
                }
            });

            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "LEASE_RENEWAL",
                    module: "LEASES",
                    entityId: leaseId,
                    newValues: { durationMonths: newDuration, endDate: newEndDate }
                }
            }).catch(() => {});

            revalidatePath("/dashboard/leases");
            return { success: true, message: "Bail renouvelé avec succès pour un an supplémentaire." };
        }

        // 2. Tenter la recherche d'un bail verbal / déclaratif (BailDeclaratif)
        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id: leaseId }
        });

        if (bdq) {
            if (bdq.bailleurId !== userId && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
                return { success: false, error: "Action non autorisée sur ce bail verbal." };
            }

            // Si le bail verbal a déjà été formalisé en bail formel, renouveler le bail formel
            if (bdq.bailFormelId) {
                return await renewLeaseAction(bdq.bailFormelId);
            }

            // Si en attente de confirmation locataire, prolonger le délai d'expiration de 5 jours
            if (bdq.statut === "PENDING_LOCATAIRE" || (bdq.statut as string) === "PENDING_AGENT") {
                await prisma.bailDeclaratif.update({
                    where: { id: leaseId },
                    data: { createdAt: new Date() } // Réinitialise le délai des 5 jours
                });
                revalidatePath("/dashboard/leases");
                return { success: true, message: "Délai de confirmation du bail verbal prolongé de 5 jours." };
            }

            // Pour un BDQ confirmé, mettre à jour la date
            await prisma.bailDeclaratif.update({
                where: { id: leaseId },
                data: { updatedAt: new Date() }
            });

            revalidatePath("/dashboard/leases");
            return { success: true, message: "Bail verbal prolongé avec succès." };
        }

        return { success: false, error: "Bail introuvable." };
    } catch (err: any) {
        console.error("[renewLeaseAction Error]", err);
        return { success: false, error: err?.message || "Erreur lors du renouvellement du contrat." };
    }
}

// --- [GENERIC SIGNATURE] Electronic Signature System ---

export async function initiateSignature(data: {
  documentType: "BAIL" | "MANDAT" | "COMPROMIS" | "AUTRE";
  documentId: string;
  signataireId: string;
}) {
  try {
    const signataire = await prisma.user.findUnique({
        where: { id: data.signataireId },
        select: { phone: true }
    });

    if (!signataire || !signataire.phone) {
        return { success: false, error: "Le signataire n'a pas de numéro de téléphone pour l'OTP." };
    }

    // [SEC-FIX F-03] OTP cryptographiquement sécurisé
    const otpCode = randomInt(100000, 999999).toString();
    const signature = await (prisma as any).signatureElectronique.create({
      data: {
        documentType: data.documentType,
        documentId: data.documentId,
        signataireId: data.signataireId,
        otpCode,
        statut: "EN_ATTENTE",
      }
    });

    await sendSMS(signataire.phone, `QAPRIL : Code de signature OTP : ${otpCode}`);
    return { success: true, signatureId: signature.id };
  } catch (error) {
    return { success: false, error: "Erreur lors de l'initiation de la signature" };
  }
}

export async function validateSignature(id: string, otp: string, meta: { ip: string; userAgent: string; }) {
  try {
    const signature = await (prisma as any).signatureElectronique.findUnique({ where: { id } });
    if (!signature || signature.otpCode !== otp) return { success: false, error: "Code OTP invalide" };

    const updated = await (prisma as any).signatureElectronique.update({
      where: { id },
      data: {
        statut: "SIGNE",
        signeAt: new Date(),
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      }
    });

    return { success: true, signature: updated };
  } catch (error) {
    return { success: false, error: "Erreur lors de la validation" };
  }
}

export async function getDocumentSignatures(documentId: string) {
  try {
    return await (prisma as any).signatureElectronique.findMany({
      where: { documentId },
      include: { signataire: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}

/**
 * [LEA-08] Vérification publique BDQ
 */
export async function getBDQByToken(token: string) {
    return prisma.bailDeclaratif.findUnique({
        where: { qrToken: token },
        select: {
            nomLocataireDeclare: true,
            descriptionLogement: true,
            loyerDeclareMensuel: true,
            dateEntreeEstimee: true,
            statut: true,
            confirmationAt: true,
            hashBdqFinal: true,
            hashDeclaration: true,
            bailleur: { select: { firstName: true, lastName: true } }
        }
    });
}
