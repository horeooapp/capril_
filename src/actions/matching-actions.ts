"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getPendingCandidatures() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const fullUser = await prisma.user.findUnique({ 
            where: { id: session.user.id }, 
            select: { capaciteActive: true, role: true } 
        })
        const activeRole = fullUser?.capaciteActive || (session.user as any)?.chosenRole || fullUser?.role

        let logementCondition: any = {}
        if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE'].includes(activeRole)) {
            logementCondition = { ownerUserId: session.user.id }
        } else {
            logementCondition = {
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            }
        }

        const candidatures = await prisma.candidature.findMany({
            where: {
                statut: "SOUMISE",
                logement: logementCondition
            },
            include: {
                logement: true,
                candidat: {
                    include: {
                        locataireProfile: true,
                        reliabilityScores: true
                    }
                }
            },
            orderBy: { scoreQapril: 'desc' }
        })
        return candidatures
    } catch {
        return []
    }
}

export async function getAcceptedCandidatures() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const fullUser = await prisma.user.findUnique({ 
            where: { id: session.user.id }, 
            select: { capaciteActive: true, role: true } 
        })
        const activeRole = fullUser?.capaciteActive || (session.user as any)?.chosenRole || fullUser?.role

        let logementCondition: any = {}
        if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE'].includes(activeRole)) {
            logementCondition = { ownerUserId: session.user.id }
        } else {
            logementCondition = {
                OR: [
                    { ownerUserId: session.user.id },
                    { managedByUserId: session.user.id }
                ]
            }
        }

        const candidatures = await prisma.candidature.findMany({
            where: {
                statut: "ACCEPTE",
                logement: logementCondition
            },
            include: {
                logement: true,
                candidat: {
                    include: {
                        locataireProfile: true,
                        reliabilityScores: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return candidatures
    } catch {
        return []
    }
}

export async function processCandidature(
    candidatureId: string, 
    action: "ACCEPTE" | "REJETE" | "INFO_DEMANDEE",
    options?: {
        messageComplement?: string;
        leaseData?: {
            startDate?: string;
            rentAmount?: number;
            chargesAmount?: number;
            depositAmount?: number;
            durationMonths?: number;
        }
    }
) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        const candidature = await prisma.candidature.findUnique({
            where: { id: candidatureId },
            include: {
                logement: true,
                candidat: true
            }
        });

        if (!candidature) return { error: "Candidature introuvable." };

        let createdLeaseId: string | null = null;
        let createdLeaseRef: string | null = null;

        // 1. Mise à jour de la candidature
        await prisma.candidature.update({
            where: { id: candidatureId },
            data: { 
                statut: action,
                noteAgence: options?.messageComplement ? options.messageComplement : undefined
            }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
        const tenantPhone = candidature.telephone || candidature.candidat?.phone;
        const tenantEmail = candidature.candidat?.email;
        const tenantNom = `${candidature.prenom} ${candidature.nom}`.trim();
        const bienNom = candidature.logement.name || candidature.logement.address || "le logement";

        // 2. Si acceptation avec introduction de bail
        if (action === "ACCEPTE") {
            try {
                const { createLease } = await import("./lease.actions");
                const rent = options?.leaseData?.rentAmount || candidature.logement.priceMonthly || 150000;
                const deposit = options?.leaseData?.depositAmount ?? Math.min(rent * 2, rent * 2);
                const charges = options?.leaseData?.chargesAmount ?? 0;
                const duration = options?.leaseData?.durationMonths ?? 12;
                const startDate = options?.leaseData?.startDate ? new Date(options.leaseData.startDate) : new Date();

                const leaseRes = await createLease({
                    propertyId: candidature.logementId,
                    leaseType: "residential",
                    tenantPhone: tenantPhone || undefined,
                    startDate,
                    durationMonths: duration,
                    rentAmount: rent,
                    chargesAmount: charges,
                    depositAmount: deposit,
                    preavisRequisMois: 3
                });

                if (leaseRes && !leaseRes.error) {
                    createdLeaseId = leaseRes.leaseId || null;
                    createdLeaseRef = leaseRes.leaseReference || null;
                }
            } catch (leaseErr) {
                console.error("[Create Lease From Candidature Error]", leaseErr);
            }

            // Notification Locataire : Contrat introduit !
            const leaseUrl = createdLeaseId 
                ? `${appUrl}/mon-espace-locataire/leases/${createdLeaseId}`
                : `${appUrl}/mon-espace-locataire/leases`;

            // Notification In-App
            if (candidature.candidatId) {
                await prisma.notification.create({
                    data: {
                        userId: candidature.candidatId,
                        title: "🎉 Candidature acceptée & Contrat de bail prêt !",
                        message: `Le propriétaire a accepté votre candidature pour ${bienNom} et a initié votre contrat de bail.`,
                        type: "BAIL_CREE",
                        link: "/mon-espace-locataire/leases"
                    }
                }).catch(() => null);
            }

            // Email Locataire
            if (tenantEmail) {
                const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
                const emailHtml = `
                    <p style="margin: 0 0 16px 0;">Félicitations <strong>${tenantNom}</strong>,</p>
                    <p style="margin: 0 0 16px 0;">Excellente nouvelle ! Votre candidature pour le bien <strong>${bienNom}</strong> a été validée par le propriétaire.</p>
                    
                    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #065F46;"><strong>Statut :</strong> Candidature retenue & Contrat de bail introduit</p>
                        ${createdLeaseRef ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #065F46;"><strong>Référence Bail :</strong> ${createdLeaseRef}</p>` : ""}
                        <p style="margin: 0; font-size: 14px; color: #065F46;">Votre projet de contrat conforme à la législation ivoirienne (CCH & CDC-CI) est maintenant disponible.</p>
                    </div>

                    <p style="margin: 0 0 24px 0;">Veuillez cliquer sur le bouton ci-dessous pour relire les clauses du bail et procéder à votre signature électronique sécurisée :</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${leaseUrl}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                            Consulter & Signer mon Bail →
                        </a>
                    </div>
                `;

                await sendEmail({
                    to: tenantEmail,
                    subject: `🎉 Félicitations ! Votre contrat de bail pour ${bienNom} est prêt - QAPRIL`,
                    html: wrapInPremiumTemplate(emailHtml, "Validation de Candidature & Bail")
                }).catch(err => console.error("[Tenant Acceptance Email Error]", err));
            }

            // WhatsApp Locataire
            if (tenantPhone) {
                const { sendOpenWAMessage } = await import("@/lib/openwa");
                const { sendSMS } = await import("@/lib/sms");
                const waMsg = `🎉 *QAPRIL — Candidature Validée & Contrat de Bail*\n\nBonjour ${tenantNom},\n\nFélicitations ! Votre dossier pour *${bienNom}* a été accepté par le propriétaire.\n\nVotre contrat de bail a été préparé et est prêt pour relecture et signature.\n\n👉 Accéder à mon contrat de bail : ${leaseUrl}`;
                
                const waRes = await sendOpenWAMessage(tenantPhone, waMsg).catch(() => ({ success: false }));
                if (!waRes?.success) {
                    await sendSMS(tenantPhone, `QAPRIL : Félicitations ! Votre dossier pour ${bienNom} a été validé. Votre contrat de bail est prêt sur : ${leaseUrl}`).catch(() => null);
                }
            }
        } 
        // 3. Demande de compléments d'informations
        else if (action === "INFO_DEMANDEE") {
            const complementTexte = options?.messageComplement || "Le propriétaire sollicite des précisions ou pièces complémentaires pour l'étude de votre dossier.";

            if (candidature.candidatId) {
                await prisma.notification.create({
                    data: {
                        userId: candidature.candidatId,
                        title: "Information demandée sur votre candidature",
                        message: `Le propriétaire de ${bienNom} vous a envoyé une demande : "${complementTexte}".`,
                        type: "INFO_CANDIDATURE",
                        link: "/mon-espace-locataire/marketplace"
                    }
                }).catch(() => null);
            }

            if (tenantEmail) {
                const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
                const emailHtml = `
                    <p style="margin: 0 0 16px 0;">Bonjour <strong>${tenantNom}</strong>,</p>
                    <p style="margin: 0 0 16px 0;">Le propriétaire du bien <strong>${bienNom}</strong> a consulté votre dossier de candidature et souhaite obtenir un complément d'information :</p>
                    
                    <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 0 12px 12px 0; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #1E40AF; font-style: italic;">« ${complementTexte} »</p>
                    </div>

                    <p style="margin: 0 0 24px 0;">Veuillez vous rendre sur votre espace QAPRIL ou contacter directement le gestionnaire pour fournir ces éléments afin de finaliser votre dossier.</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${appUrl}/mon-espace-locataire/marketplace" style="background-color: #3B82F6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                            Accéder à mon espace locataire →
                        </a>
                    </div>
                `;

                await sendEmail({
                    to: tenantEmail,
                    subject: `💬 Complément d'information demandé pour ${bienNom} - QAPRIL`,
                    html: wrapInPremiumTemplate(emailHtml, "Complément d'Information")
                }).catch(err => console.error("[Tenant Info Request Email Error]", err));
            }

            if (tenantPhone) {
                const { sendOpenWAMessage } = await import("@/lib/openwa");
                const { sendSMS } = await import("@/lib/sms");
                const waMsg = `💬 *QAPRIL — Complément d'information*\n\nBonjour ${tenantNom},\n\nLe propriétaire de *${bienNom}* a examiné votre candidature et souhaite un complément :\n\n"${complementTexte}"\n\nConsultez votre espace : ${appUrl}/mon-espace-locataire/marketplace`;
                
                const waRes = await sendOpenWAMessage(tenantPhone, waMsg).catch(() => ({ success: false }));
                if (!waRes?.success) {
                    await sendSMS(tenantPhone, `QAPRIL : Complément demandé par le bailleur pour ${bienNom} : "${complementTexte.substring(0, 80)}...".`).catch(() => null);
                }
            }
        }
        // 4. Rejet
        else if (action === "REJETE") {
            if (candidature.candidatId) {
                await prisma.notification.create({
                    data: {
                        userId: candidature.candidatId,
                        title: "Mise à jour de votre candidature",
                        message: `Votre candidature pour le bien ${bienNom} n'a pas été retenue pour cette fois.`,
                        type: "CANDIDATURE_REJETEE",
                        link: "/mon-espace-locataire/marketplace"
                    }
                }).catch(() => null);
            }

            if (tenantEmail) {
                const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
                const emailHtml = `
                    <p style="margin: 0 0 16px 0;">Bonjour <strong>${tenantNom}</strong>,</p>
                    <p style="margin: 0 0 16px 0;">Nous vous remercions pour l'intérêt porté au bien <strong>${bienNom}</strong> sur QAPRIL.</p>
                    <p style="margin: 0 0 16px 0;">Après examen de l'ensemble des candidatures reçues, le propriétaire a informé qu'il ne pouvait donner une suite favorable à votre dossier pour ce logement spécifique.</p>
                    <p style="margin: 0 0 24px 0;">D'autres opportunités certifiées sont régulièrement publiées sur le catalogue. N'hésitez pas à postuler à nouveau avec votre profil pré-rempli.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${appUrl}/mon-espace-locataire/marketplace" style="background-color: #1E293B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                            Voir d'autres logements disponibles →
                        </a>
                    </div>
                `;
                await sendEmail({
                    to: tenantEmail,
                    subject: `Information concernant votre candidature pour ${bienNom} - QAPRIL`,
                    html: wrapInPremiumTemplate(emailHtml, "Suivi de Candidature")
                }).catch(err => console.error("[Tenant Rejection Email Error]", err));
            }
        }

        await logAction({
            action: `CANDIDATURE_${action}`,
            module: "MATCHING",
            entityId: candidatureId
        });

        revalidatePath("/dashboard/matching");
        return { 
            success: true, 
            leaseId: createdLeaseId,
            leaseReference: createdLeaseRef
        };
    } catch (e: any) {
        console.error("[processCandidature Error]", e);
        return { error: e.message || "Erreur lors du traitement de la candidature." }
    }
}
