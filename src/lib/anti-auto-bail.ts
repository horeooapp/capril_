import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

/**
 * QAPRIL — Infrastructure numérique de confiance pour l’immobilier en Côte d’Ivoire
 * ADDENDUM ADD-33 — Règles RG-IDN-24 à RG-IDN-27 : Interdiction formelle du bail avec soi-même
 *
 * RG-IDN-24 (Principe) :
 * Un même compte ne peut pas être à la fois bailleur et locataire d’un même bail.
 * Le contrôle porte sur le compte, donc sur tous ses numéros :
 * utiliser son second numéro ne contourne pas la règle.
 *
 * RG-IDN-25 (Périmètre) :
 * Le contrôle s’applique à la création d’un bail par le bailleur, à la quittance express (ADD-31),
 * à la déclaration de bail dans les deux sens (ADD-30, RG-DCL-08 et RG-DCL-16), à la correction
 * du numéro d’une partie (IC-09) et à la fusion de comptes (RG-IDN-09).
 *
 * RG-IDN-26 (Aucune exception) :
 * La règle ne connaît aucune exception, y compris lorsque le bailleur est une société et le locataire son gérant.
 *
 * RG-IDN-27 (Message officiel) :
 * Refus affiché : « Ce numéro est le vôtre. Vous ne pouvez pas être à la fois le bailleur et le locataire d’un même bail. Saisissez le numéro de votre locataire. »
 */

export const MSG_AUTO_BAIL_LOCATAIRE = "Une personne ne peut être locataire de sa propre maison. Vous ne pouvez pas être à la fois le bailleur et le locataire d’un même bail. Saisissez le numéro de votre locataire.";
export const MSG_AUTO_BAIL_BAILLEUR = "Une personne ne peut être locataire de sa propre maison. Vous ne pouvez pas être à la fois le bailleur et le locataire d’un même bail. Saisissez le numéro de votre bailleur.";

export interface VerifyPartiesParams {
    initiatorUserId: string;
    propertyId?: string | null;
    targetPhone?: string | null;
    targetEmail?: string | null;
    targetUserId?: string | null;
    direction?: 'BAILLEUR_TO_LOCATAIRE' | 'LOCATAIRE_TO_BAILLEUR';
}

export interface VerifyPartiesResult {
    valid: boolean;
    error?: string;
    code?: string;
}

export async function verifyPartiesDistinctes(params: VerifyPartiesParams): Promise<VerifyPartiesResult> {
    const {
        initiatorUserId,
        propertyId,
        targetPhone,
        targetEmail,
        targetUserId,
        direction = 'BAILLEUR_TO_LOCATAIRE',
    } = params;

    const refusalMessage = direction === 'LOCATAIRE_TO_BAILLEUR' 
        ? MSG_AUTO_BAIL_BAILLEUR 
        : MSG_AUTO_BAIL_LOCATAIRE;

    // 0. Contrôle de propriété du bien : Une personne ne peut être locataire de sa propre maison
    if (propertyId) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { id: true, ownerUserId: true, ownerId: true }
        });
        const propertyOwnerId = property?.ownerUserId || property?.ownerId;
        if (propertyOwnerId) {
            // Le locataire ciblé par ID est le propriétaire du bien
            if (targetUserId && targetUserId === propertyOwnerId) {
                return {
                    valid: false,
                    error: "Une personne ne peut être locataire de sa propre maison.",
                    code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
                };
            }

            // Le numéro de téléphone cible correspond au propriétaire du bien
            const normTarget = targetPhone ? normalizePhone(targetPhone) : null;
            if (normTarget) {
                const owner = await prisma.user.findUnique({
                    where: { id: propertyOwnerId },
                    select: { id: true, phone: true }
                });
                if (owner?.phone && normalizePhone(owner.phone) === normTarget) {
                    return {
                        valid: false,
                        error: "Une personne ne peut être locataire de sa propre maison.",
                        code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
                    };
                }
                const ownerTel = await prisma.userTelephone.findFirst({
                    where: {
                        userId: propertyOwnerId,
                        numeroE164: normTarget,
                        statut: { not: 'RETIRE' }
                    },
                    select: { id: true }
                });
                if (ownerTel) {
                    return {
                        valid: false,
                        error: "Une personne ne peut être locataire de sa propre maison.",
                        code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
                    };
                }
            }

            // L'email cible correspond au propriétaire du bien
            if (targetEmail) {
                const owner = await prisma.user.findUnique({
                    where: { id: propertyOwnerId },
                    select: { email: true }
                });
                if (owner?.email && owner.email.trim().toLowerCase() === targetEmail.trim().toLowerCase()) {
                    return {
                        valid: false,
                        error: "Une personne ne peut être locataire de sa propre maison.",
                        code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
                    };
                }
            }
        }
    }

    // 1. Contrôle par identifiant unique de compte
    if (targetUserId && targetUserId === initiatorUserId) {
        return {
            valid: false,
            error: refusalMessage,
            code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
        };
    }

    // 2. Récupération des informations de l'initiateur
    const initiator = await prisma.user.findUnique({
        where: { id: initiatorUserId },
        select: {
            id: true,
            phone: true,
            email: true,
        },
    });

    if (!initiator) {
        return { valid: true };
    }

    const normTargetPhone = targetPhone ? normalizePhone(targetPhone) : null;
    const normInitiatorPhone = initiator.phone ? normalizePhone(initiator.phone) : null;

    // 3. Contrôle par comparaison directe du numéro de téléphone
    if (normTargetPhone && normInitiatorPhone && normTargetPhone === normInitiatorPhone) {
        return {
            valid: false,
            error: refusalMessage,
            code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
        };
    }

    // 4. Contrôle par comparaison d'email
    if (targetEmail && initiator.email) {
        const cleanTargetEmail = targetEmail.trim().toLowerCase();
        const cleanInitiatorEmail = initiator.email.trim().toLowerCase();
        if (cleanTargetEmail === cleanInitiatorEmail) {
            return {
                valid: false,
                error: refusalMessage,
                code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
            };
        }
    }

    // 5. Contrôle en base : le numéro cible est-il rattaché au compte de l'initiateur ?
    if (normTargetPhone) {
        const existingTargetUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: normTargetPhone },
                    { phone: normTargetPhone.replace(/^\+225/, '') },
                    { phone: `+225${normTargetPhone.replace(/^\+/, '')}` },
                ],
            },
            select: { id: true },
        });

        if (existingTargetUser && existingTargetUser.id === initiatorUserId) {
            return {
                valid: false,
                error: refusalMessage,
                code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
            };
        }

        // 5b. RG-IDN-24 : Contrôle sur la table multi-téléphones user_telephones (ADD-33)
        const telMatch = await prisma.userTelephone.findFirst({
            where: {
                numeroE164: normTargetPhone,
                userId: initiatorUserId,
                statut: { not: 'RETIRE' },
            },
            select: { id: true },
        });

        if (telMatch) {
            return {
                valid: false,
                error: refusalMessage,
                code: 'RG_IDN_24_AUTO_BAIL_INTERDIT',
            };
        }
    }

    return { valid: true };
}
