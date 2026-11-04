import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { UtilityType } from '@prisma/client';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'DRAFT', 'PENDING_SIGNATURE', 'LOYER_IMPAYE'] }
            }
        });

        const factures = await prisma.factureUtility.findMany({
            where: {
                OR: [
                    { acteurId: user.userId },
                    ...(lease ? [{ leaseId: lease.id }] : [])
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 30
        });

        return NextResponse.json({
            success: true,
            utilities: factures.map(f => ({
                id: f.id,
                typeUtility: f.typeUtility,
                identifiant: f.identifiantCompteur,
                montant: f.montantTotal,
                statut: f.statut,
                datePaiement: f.datePaiement,
                createdAt: f.createdAt,
                mois: f.moisFacture,
                source: f.source,
                token: f.invoiceUrl?.startsWith('TOKEN:') ? f.invoiceUrl.replace('TOKEN:', '') : null
            }))
        });
    } catch (error: any) {
        console.error("[MOBILE API] locataire/utilities GET error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const body = await request.json();
        const { category, serviceName, identifiant, montant, subType, paymentMethod } = body;

        if (!montant || Number(montant) <= 0) {
            return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
        }
        if (!identifiant || !identifiant.trim()) {
            return NextResponse.json({ error: "Numéro de compteur / référence requis." }, { status: 400 });
        }

        let lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'DRAFT', 'PENDING_SIGNATURE', 'LOYER_IMPAYE'] }
            }
        });

        if (!lease) {
            lease = await prisma.lease.findFirst();
        }

        if (!lease) {
            return NextResponse.json({ error: "Aucun bail actif pour associer ce règlement." }, { status: 400 });
        }

        let typeUtility: UtilityType = UtilityType.SODECI;
        if (category === 'ELECTRICITE') {
            typeUtility = UtilityType.CIE;
        } else if (category === 'EAU') {
            typeUtility = UtilityType.SODECI;
        } else if (category === 'TELEPHONE') {
            const s = (serviceName || '').toUpperCase();
            typeUtility = s.includes('MTN') ? UtilityType.MTN : s.includes('MOOV') ? UtilityType.MOOV : UtilityType.ORANGE;
        } else if (category === 'INTERNET') {
            const s = (serviceName || '').toUpperCase();
            typeUtility = s.includes('CANAL') ? UtilityType.CANAL_PLUS : s.includes('MTN') ? UtilityType.MTN : s.includes('MOOV') ? UtilityType.MOOV : UtilityType.ORANGE;
        }

        let prepaidToken: string | null = null;
        if (category === 'ELECTRICITE' && subType === 'PREPAYE') {
            prepaidToken = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');
        }

        const refCode = `QP-${category ? category.slice(0, 3) : 'UTL'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const uniqueMois = `${new Date().toISOString().slice(0, 7)}-${Date.now().toString(36)}`;

        const facture = await prisma.factureUtility.create({
            data: {
                leaseId: lease.id,
                acteurId: user.userId,
                roleActeur: 'LOCATAIRE',
                typeUtility,
                identifiantCompteur: identifiant.trim(),
                moisFacture: uniqueMois,
                montantTotal: Number(montant),
                statut: 'PAYEE',
                source: `MOBILE_${paymentMethod || 'PAYMENT'}`,
                modeUtilities: 'INDIVIDUEL_LOCATAIRE',
                datePaiement: new Date(),
                dateLimitePaiement: new Date(),
                invoiceUrl: prepaidToken ? `TOKEN:${prepaidToken}` : undefined,
            }
        });

        // Bonus ICL score
        await (prisma as any).locataireProfile?.updateMany({
            where: { userId: user.userId },
            data: { scoreActuel: { increment: 5 } }
        }).catch(() => null);

        return NextResponse.json({
            success: true,
            transaction: {
                id: facture.id,
                reference: refCode,
                category,
                serviceName,
                identifiant,
                montant: Number(montant),
                paymentMethod,
                datePaiement: new Date().toISOString(),
                token: prepaidToken,
                status: 'PAYEE'
            }
        });
    } catch (error: any) {
        console.error("[MOBILE API] locataire/utilities POST error:", error);
        return NextResponse.json({ error: error.message || "Erreur lors du règlement." }, { status: 500 });
    }
}

