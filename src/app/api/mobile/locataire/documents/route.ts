import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/locataire/documents
 * Retourne les documents accessibles au locataire connecté :
 *  - Contrat de bail (avec URL PDF si disponible)
 *  - Quittances émises
 *  - États des lieux
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') ?? undefined; // 'lease' | 'receipts' | 'edl' | null

        // Bail actif du locataire
        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE'] } },
            select: {
                id:               true,
                leaseReference:   true,
                status:           true,
                startDate:        true,
                qrCodeUrl:        true,
                sha256Hash:       true,
                isSignedElectronically: true,
                signedAt:         true,
                property: {
                    select: { name: true, address: true },
                },
                receipts: (type === undefined || type === 'receipts') ? {
                    orderBy: { periodMonth: 'desc' },
                    select: {
                        id:          true,
                        receiptRef:  true,
                        periodMonth: true,
                        status:      true,
                        totalAmount: true,
                        paidAt:      true,
                        qrToken:     true,
                    },
                } : false,
            },
        });

        const documents: any[] = [];

        if (lease) {
            // Document Bail
            if (!type || type === 'lease') {
                documents.push({
                    type:        'BAIL',
                    label:       `Contrat de bail — ${lease.leaseReference}`,
                    reference:   lease.leaseReference,
                    date:        lease.startDate?.toISOString() ?? null,
                    isSigned:    lease.isSignedElectronically,
                    signedAt:    lease.signedAt?.toISOString() ?? null,
                    pdfUrl:      lease.qrCodeUrl ?? null,
                    sha256:      lease.sha256Hash ?? null,
                    property:    lease.property?.name ?? lease.property?.address ?? 'Bien',
                    leaseId:     lease.id,
                });
            }

            // Quittances
            if ((!type || type === 'receipts') && lease.receipts && (lease.receipts as any[]).length > 0) {
                for (const r of lease.receipts as any[]) {
                    documents.push({
                        type:       'QUITTANCE',
                        label:      `Quittance ${r.periodMonth}`,
                        reference:  r.receiptRef,
                        date:       r.paidAt ?? null,
                        status:     r.status,
                        amount:     Number(r.totalAmount ?? 0),
                        qrToken:    r.qrToken,
                        receiptId:  r.id,
                        verifyUrl:  `/api/mobile/locataire/receipts/${r.id}`,
                    });
                }
            }
        }

        // États des lieux
        if (!type || type === 'edl') {
            const edls = await prisma.edl.findMany({
                where: { lease: { tenantId: user.userId } },
                select: {
                    id:        true,
                    type:      true,
                    statut:    true,
                    createdAt: true,
                    pdfUrl:    true,
                    lease:     { select: { leaseReference: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            for (const edl of edls) {
                documents.push({
                    type:        'EDL',
                    label:       `État des lieux ${edl.type === 'ENTREE' ? "d'entrée" : 'de sortie'}`,
                    reference:   edl.lease?.leaseReference ?? '',
                    date:        edl.createdAt?.toISOString() ?? null,
                    status:      edl.statut,
                    pdfUrl:      edl.pdfUrl ?? null,
                    edlId:       edl.id,
                });
            }
        }

        return NextResponse.json({
            documents,
            total:    documents.length,
            hasLease: !!lease,
        });
    } catch (error: any) {
        console.error('[MOBILE] locataire/documents GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
