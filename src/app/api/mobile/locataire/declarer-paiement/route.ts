import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { sendSMS } from '@/lib/sms';

// ---------------------------------------------------------------------------
// S-14 — Déclaration de paiement idempotente
// Clé d'idempotence : "{bailId}-{mois}-{locataireId}"
// Si la même déclaration est envoyée plusieurs fois (double-tap, retry réseau)
// → retourne la déclaration existante avec HTTP 200 (pas de doublon, pas de 409)
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé. Jeton manquant ou invalide.' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { moyen, montant, datePaiement, mois, preuveUrl, idempotencyKey: clientKey } = body;

        // Récupérer le bail actif du locataire
        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF'] }
            },
            include: {
                property: { include: { owner: true } },
                landlord: true,
                tenant:   true,
            }
        });

        if (!lease) {
            return NextResponse.json({
                error: 'Aucun contrat de bail actif trouvé pour déclarer un paiement.'
            }, { status: 400 });
        }

        const amountNum = Math.round(parseFloat(String(montant || lease.rentAmount || '').replace(/\s/g, '')));
        if (isNaN(amountNum) || amountNum <= 0) {
            return NextResponse.json({ error: 'Montant du paiement invalide.' }, { status: 400 });
        }

        const currentMonthStr = mois || new Date().toISOString().substring(0, 7); // YYYY-MM
        const pDate = datePaiement ? new Date(datePaiement) : new Date();

        // ----------------------------------------------------------------
        // S-14 — Clé d'idempotence : fournie par le client ou dérivée
        // ----------------------------------------------------------------
        const iKey = (clientKey && typeof clientKey === 'string' && clientKey.length > 0)
            ? clientKey.slice(0, 128)                                       // clé custom du client
            : `${lease.id}-${currentMonthStr}-${user.userId}`;             // clé dérivée côté serveur

        // ----------------------------------------------------------------
        // Upsert idempotent : crée ou retourne la déclaration existante
        // ----------------------------------------------------------------
        const existing = await prisma.declarationPaiement.findUnique({
            where: { idempotencyKey: iKey }
        });

        if (existing) {
            // Doublon détecté → renvoyer la déclaration existante (idempotent 200)
            return NextResponse.json({
                success:       true,
                idempotent:    true,
                message:       `Déclaration de paiement pour ${currentMonthStr} déjà enregistrée. Votre bailleur va la confirmer.`,
                declarationId: existing.id,
                statut:        existing.statut,
            });
        }

        // ----------------------------------------------------------------
        // Vérification : pas déjà une déclaration CONFIRME pour ce mois
        // (on bloque les doubles confirmations, pas les doubles déclarations)
        // ----------------------------------------------------------------
        const confirmedDecl = await prisma.declarationPaiement.findFirst({
            where: { bailId: lease.id, mois: currentMonthStr, statut: 'CONFIRME' }
        });

        if (confirmedDecl) {
            return NextResponse.json({
                error: `Un paiement pour ${currentMonthStr} a déjà été confirmé par votre bailleur. La quittance est disponible.`,
                declarationId: confirmedDecl.id,
                quittanceId:   confirmedDecl.quittanceId,
            }, { status: 409 });
        }

        // ----------------------------------------------------------------
        // Création de la déclaration avec la clé d'idempotence
        // ----------------------------------------------------------------
        const declaration = await prisma.declarationPaiement.create({
            data: {
                bailId:         lease.id,
                locataireId:    user.userId,
                montant:        amountNum,
                mois:           currentMonthStr,
                moyen:          (moyen || 'MOBILE_MONEY').toUpperCase(),
                datePaiement:   pDate,
                statut:         'DECLARE',
                preuveUrl:      preuveUrl || null,
                idempotencyKey: iKey,
            }
        });

        // Notification SMS au bailleur (non-bloquante)
        const landlordPhone = lease.landlord?.phone || lease.property?.owner?.phone;
        const tenantName = [lease.tenant?.firstName, lease.tenant?.lastName]
            .filter(Boolean).join(' ').trim() || 'Votre locataire';

        if (landlordPhone) {
            await sendSMS(
                landlordPhone,
                `QAPRIL : ${tenantName} a déclaré un paiement de ${amountNum.toLocaleString('fr-FR')} FCFA (${moyen || 'Mobile Money'}) pour ${currentMonthStr}. Confirmez dans QAPRIL Propriétaire pour émettre la quittance.`
            ).catch(() => null);
        }

        return NextResponse.json({
            success:       true,
            idempotent:    false,
            message:       "Votre paiement a été déclaré avec succès. Dès que votre bailleur aura confirmé sa réception, votre quittance officielle sera émise automatiquement.",
            declarationId: declaration.id,
            statut:        declaration.statut,
            idempotencyKey: iKey,
        });

    } catch (error: any) {
        // Catch de la violation de contrainte unique (race condition extrême)
        if (error?.code === 'P2002' && error?.meta?.target?.includes('idempotency_key')) {
            const existing = await prisma.declarationPaiement.findFirst({
                where: { bailId: { not: undefined } },
                orderBy: { createdAt: 'desc' },
            }).catch(() => null);
            return NextResponse.json({
                success:    true,
                idempotent: true,
                message:    'Déclaration déjà enregistrée (idempotence).',
                declarationId: existing?.id ?? null,
                statut:        existing?.statut ?? 'DECLARE',
            });
        }
        console.error('[MOBILE API] locataire/declarer-paiement error:', error);
        return NextResponse.json({ error: "Erreur lors de l'enregistrement de la déclaration de paiement." }, { status: 500 });
    }
}
