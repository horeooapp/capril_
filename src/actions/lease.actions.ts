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
import { serializeLease } from "@/lib/serialize";
import { evaluateTransactionRisk } from "@/lib/m-guard";
import { sendSMS } from "@/lib/sms";
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
        
        // 1. Availability Check
        const activeLease = await prisma.lease.findFirst({
            where: {
                propertyId: data.propertyId,
                status: { notIn: [LeaseStatus.TERMINATED, LeaseStatus.CANCELLED, LeaseStatus.ARCHIVED] }
            }
        });
        if (activeLease) throw new Error("Ce bien est déjà engagé dans un contrat actif.");

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

        // 3. Tenant Identification
        let tenantId: string | undefined;
        if (data.tenantPhone) {
            const normalized = normalizePhone(data.tenantPhone);
            let tenant = await prisma.user.findUnique({ where: { phone: normalized } });
            if (!tenant) {
                tenant = await prisma.user.create({
                    data: { phone: normalized, role: Role.TENANT, status: 'PENDING' }
                });
            }
            tenantId = tenant.id;
        }

        // 4. Legal Validations
        const preavis = data.preavisRequisMois ?? 3;
        if (preavis < 3) throw new Error("Le préavis ne peut être inférieur à 3 mois (Arts. 440 et 442 CCH).");
        const maxLoyerAvanceCaution = data.rentAmount * 2;
        if ((data.avanceLoyer || 0) > maxLoyerAvanceCaution) throw new Error("Avances illégales (Art. 415 CCH).");
        if ((data.depositAmount || 0) > maxLoyerAvanceCaution) throw new Error("Caution illégale (Art. 416 CCH).");

        // 5. Certification Fee (2000 FCFA)
        await prisma.userWalletConfig.upsert({
            where: { userId: ownerId },
            create: { userId: ownerId, walletBalance: -2000 },
            update: { walletBalance: { decrement: 2000 } }
        });

        // 6. Security Hash
        const leaseRef = await generateLeaseRef(data.leaseType);
        const sha256 = await generateProofHash({ leaseRef, propertyId: data.propertyId, landlordId: ownerId, rent: data.rentAmount });

        // 7. DB Save
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
                status: data.typeBail === TypeBail.DECLARATIF_BDQ ? LeaseStatus.PENDING_CONFIRMATION : LeaseStatus.DRAFT,
                deadlineEnregistrement: new Date(new Date(data.startDate).getTime() + (30 * 24 * 60 * 60 * 1000))
            }
        });

        // 8. Envoyer l'invitation au locataire
        if (data.tenantPhone) {
            const tenantPhone = normalizePhone(data.tenantPhone);
            await sendSMS(
                tenantPhone, 
                `QAPRIL : Un contrat de bail a été préparé pour vous par le propriétaire. Veuillez vous connecter pour le consulter.`
            );
        }

        await writeAuditLog({ userId: session.user.id, action: "LEASE_CREATED", module: "LEASE", entityId: lease.id });
        revalidatePath("/dashboard/leases");
        return { success: true, leaseId: lease.id, leaseReference: leaseRef };
    } catch (error: any) {
        return { error: error.message || "Erreur lors de la création du bail." };
    }
}

/**
 * [LEA-02] Update Lease Draft
 */
export async function updateLeaseDraft(leaseId: string, data: any) {
    try {
        const session = await ensureAuthenticated();
        const lease = await ensureLeaseAccess(leaseId, [Role.LANDLORD, Role.LANDLORD_PRO, Role.AGENCY, Role.ADMIN, Role.SUPER_ADMIN]);
        if (![LeaseStatus.DRAFT, LeaseStatus.PENDING_SIGNATURE, LeaseStatus.PENDING_CONFIRMATION].includes(lease.status as any)) {
            throw new Error("Ce bail ne peut plus être modifié.");
        }
        await prisma.lease.update({
            where: { id: leaseId },
            data: { ...data, commercialData: data.commercialData as Prisma.InputJsonValue }
        });
        revalidatePath(`/dashboard/leases/${leaseId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * [LEA-03] Get Lease Details
 */
export async function getLeaseById(id: string) {
    try {
        await ensureLeaseAccess(id);
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
        return lease ? serializeLease(lease) : null;
    } catch (error) {
        return null;
    }
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
            await sendSMS(lease.tenant.phone, `QAPRIL - Code de Signature : ${otp}`);
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
    const leases = await prisma.lease.findMany({
        where: { tenantId: session.user.id },
        include: { property: true, landlord: { select: { firstName: true, lastName: true } } }
    });
    return leases.map(l => serializeLease(l));
}

export async function renewLeaseAction(leaseId: string) {
    const session = await ensureAuthenticated();
    await prisma.lease.update({ where: { id: leaseId }, data: { endDate: new Date() } }); // Simplified for logic
    revalidatePath("/dashboard/leases");
    return { success: true };
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
