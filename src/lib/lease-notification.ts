import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { sendSMS } from "@/lib/sms";

export interface LeaseNotificationInput {
    leaseId: string;
    leaseReference: string;
    propertyName: string;
    rentAmount: number;
    depositAmount?: number;
    signingOtp: string;
    recipientRole: 'TENANT' | 'LANDLORD';
    recipientName?: string;
    recipientPhone?: string | null;
    recipientEmail?: string | null;
    recipientUserId?: string | null;
    initiatorName?: string;
}

/**
 * Envoi impératif multicanal (WhatsApp + Texto/SMS + Email + In-App/Push)
 * dès qu'un contrat de bail est initié, avec le lien direct et le code de validation.
 */
export async function dispatchLeaseInitiationNotification(input: LeaseNotificationInput) {
    const {
        leaseId,
        leaseReference,
        propertyName,
        rentAmount,
        depositAmount = 0,
        signingOtp,
        recipientRole,
        recipientName = recipientRole === 'TENANT' ? 'Locataire' : 'Bailleur',
        recipientPhone,
        recipientEmail,
        recipientUserId,
        initiatorName = recipientRole === 'TENANT' ? 'Le bailleur' : 'Le locataire'
    } = input;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qapril.net';
    const signatureUrl = recipientRole === 'TENANT'
        ? `${appUrl}/mon-espace-locataire/leases/${leaseId}/signature`
        : `${appUrl}/dashboard/leases/${leaseId}/signature`;
    const rentFmt = Number(rentAmount || 0).toLocaleString('fr-FR');
    const depositFmt = Number(depositAmount || 0).toLocaleString('fr-FR');

    const results = {
        whatsapp: false,
        sms: false,
        email: false,
        push: false,
        inApp: false,
    };

    // 1. WhatsApp
    if (recipientPhone) {
        try {
            const { sendOpenWAMessage } = await import("@/lib/openwa");
            const phoneNorm = normalizePhone(recipientPhone);
            const waMsg = `*QAPRIL — Votre contrat de bail est prêt*\n\nBonjour ${recipientName},\n\n${initiatorName} a initié votre contrat de bail pour *${propertyName}* (Loyer : ${rentFmt} FCFA/mois).\n\n🔑 *Votre code de validation / signature :* *${signingOtp}*\n\n👉 *Pour valider et signer votre contrat dès maintenant :*\n${signatureUrl}\n\nCe contrat est sécurisé et conforme. Saisissez ce code pour valider votre bail.`;
            const waRes = await sendOpenWAMessage(phoneNorm, waMsg).catch(() => ({ success: false }));
            results.whatsapp = Boolean(waRes?.success);
        } catch (waErr) {
            console.error("[LeaseNotification] WhatsApp error:", waErr);
        }
    }

    // 2. Texto / SMS (impératif et systématique, ne pas conditionner à l'échec WhatsApp)
    if (recipientPhone) {
        try {
            const phoneNorm = normalizePhone(recipientPhone);
            const smsText = `QAPRIL : Votre contrat pour "${propertyName}" est prêt. Votre code de validation est : ${signingOtp}. Signez sur : ${signatureUrl}`;
            const smsRes = await sendSMS(phoneNorm, smsText).catch(() => false);
            results.sms = Boolean(smsRes);
        } catch (smsErr) {
            console.error("[LeaseNotification] SMS error:", smsErr);
        }
    }

    // 3. Email
    if (recipientEmail) {
        try {
            const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
            const emailHtml = `
                <p style="margin: 0 0 16px 0;">Bonjour <strong>${recipientName}</strong>,</p>
                <p style="margin: 0 0 16px 0;">${initiatorName} a validé votre dossier et vous a transmis votre contrat de bail pour le bien <strong>${propertyName}</strong>.</p>
                
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1E293B;"><strong>Référence du contrat :</strong> ${leaseReference}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1E293B;"><strong>Loyer mensuel :</strong> ${rentFmt} FCFA</p>
                    ${depositAmount > 0 ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #1E293B;"><strong>Dépôt de garantie :</strong> ${depositFmt} FCFA</p>` : ''}
                    <p style="margin: 0; font-size: 13px; color: #64748B;">Ce contrat respecte les normes légales en vigueur et assure la protection des deux parties.</p>
                </div>

                <div style="background-color: #FEF3C7; border: 2px dashed #F59E0B; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #92400E; text-transform: uppercase; letter-spacing: 1px;">Votre code de validation</p>
                    <p style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #B45309; font-family: monospace;">${signingOtp}</p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #78350F;">Ce code à usage unique est nécessaire pour signer électroniquement votre contrat.</p>
                </div>

                <p style="margin: 0 0 24px 0;">Cliquez sur le bouton ci-dessous pour relire attentivement votre contrat et saisir votre code de validation :</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${signatureUrl}" style="background-color: #10B981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                        Accéder au contrat et signer avec ce code →
                    </a>
                </div>
            `;

            const emailRes = await sendEmail({
                to: recipientEmail,
                subject: `[Code : ${signingOtp}] Votre contrat de bail pour ${propertyName} est prêt - QAPRIL`,
                html: wrapInPremiumTemplate(emailHtml, "Validation de contrat de bail")
            }).catch(() => ({ success: false }));
            results.email = Boolean(emailRes?.success);
        } catch (emailErr) {
            console.error("[LeaseNotification] Email error:", emailErr);
        }
    }

    // 4. In-App Notification & Push
    if (recipientUserId) {
        try {
            await prisma.notification.create({
                data: {
                    userId: recipientUserId,
                    title: "Contrat de bail prêt à signer",
                    content: `Votre bail (${leaseReference}) pour ${propertyName} est prêt. Code de validation : ${signingOtp}`,
                    type: "BAIL_CREE",
                    link: signatureUrl
                }
            }).catch(() => null);
            results.inApp = true;

            const userRec = await prisma.user.findUnique({
                where: { id: recipientUserId },
                select: { pushToken: true }
            });

            if (userRec?.pushToken) {
                const { sendExpoPushNotification } = await import("@/lib/expo-push");
                await sendExpoPushNotification({
                    to: userRec.pushToken,
                    title: "Contrat de bail prêt à signer",
                    body: `Votre code de validation pour ${propertyName} est : ${signingOtp}`,
                    sound: 'default',
                    channelId: 'default',
                    data: { leaseId, type: 'LEASE_SIGNATURE' }
                }).catch(() => null);
                results.push = true;
            }
        } catch (pushErr) {
            console.error("[LeaseNotification] Push/In-App error:", pushErr);
        }
    }

    return results;
}

/**
 * Notification bilatérale dès qu'un bail est signé par les deux parties et activé.
 */
export async function dispatchLeaseSignedBilateralNotification(leaseId: string) {
    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                tenant: true,
                landlord: true,
                property: true,
            }
        });
        if (!lease) return;

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qapril.net';
        const propName = lease.property?.name || lease.property?.address || 'le logement';
        const ref = lease.leaseReference;

        // 1. Locataire
        if (lease.tenant?.phone) {
            const tPhone = normalizePhone(lease.tenant.phone);
            const msgTenant = `QAPRIL : Félicitations ! Votre contrat de bail (${ref}) pour "${propName}" est signé des deux parties et officiellement actif.`;
            await sendSMS(tPhone, msgTenant).catch(() => null);
            const { sendOpenWAMessage } = await import("@/lib/openwa");
            await sendOpenWAMessage(tPhone, `*QAPRIL — Bail validé et actif*\n\nFélicitations !\nVotre contrat de bail *${ref}* pour *${propName}* est signé des deux parties et officiellement actif.\n\nRetrouvez vos documents sur : ${appUrl}/mon-espace-locataire`).catch(() => null);
        }

        // 2. Bailleur
        if (lease.landlord?.phone) {
            const lPhone = normalizePhone(lease.landlord.phone);
            const msgLandlord = `QAPRIL : Le locataire a validé et signé le bail (${ref}) pour "${propName}". Votre contrat est désormais scellé et actif.`;
            await sendSMS(lPhone, msgLandlord).catch(() => null);
            const { sendOpenWAMessage } = await import("@/lib/openwa");
            await sendOpenWAMessage(lPhone, `*QAPRIL — Bail signé et actif*\n\nBonne nouvelle !\nLe locataire a validé et signé le contrat de bail *${ref}* pour *${propName}*.\n\nLe bail est scellé et actif : ${appUrl}/dashboard/leases/${lease.id}`).catch(() => null);
        }

        // In-App Locataire
        if (lease.tenantId) {
            await prisma.notification.create({
                data: {
                    userId: lease.tenantId,
                    title: "Bail signé et actif",
                    content: `Votre contrat de bail (${ref}) est signé des deux parties et validé.`,
                    type: "BAIL_CONFIRME",
                    link: "/mon-espace-locataire"
                }
            }).catch(() => null);
        }

        // In-App Bailleur
        if (lease.landlordId) {
            await prisma.notification.create({
                data: {
                    userId: lease.landlordId,
                    title: "Bail signé et actif",
                    content: `Le bail (${ref}) pour ${propName} a été signé par le locataire et est désormais actif.`,
                    type: "BAIL_CONFIRME",
                    link: `/dashboard/leases/${lease.id}`
                }
            }).catch(() => null);
        }
    } catch (err) {
        console.error("[LeaseNotification] dispatchLeaseSignedBilateralNotification error:", err);
    }
}
