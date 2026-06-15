import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/documents
 * Documents du propriétaire : contrats de bail, quittances, EDL, mandats
 *
 * Query: type? (lease|receipt|edl|mandat), leaseId?, page?, limit?
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type    = searchParams.get('type') ?? undefined;
        const leaseId = searchParams.get('leaseId') ?? undefined;
        const page    = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit   = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));

        const documents: any[] = [];
        const landlordWhere = {
            OR: [
                { landlordId: user.userId },
                { property: { ownerUserId: user.userId } },
            ],
        };

        // --- Baux (contrats) ---
        if (!type || type === 'lease') {
            const leases = await prisma.lease.findMany({
                where: { ...landlordWhere, ...(leaseId ? { id: leaseId } : {}) },
                select: {
                    id:               true,
                    leaseReference:   true,
                    status:           true,
                    startDate:        true,
                    qrCodeUrl:        true,
                    sha256Hash:       true,
                    isSignedElectronically: true,
                    signedAt:         true,
                    tenant: { select: { firstName: true, lastName: true } },
                    property: { select: { name: true, address: true } },
                },
                orderBy: { startDate: 'desc' },
                take: type === 'lease' ? limit : 10,
            });
            for (const l of leases) {
                documents.push({
                    id:        l.id,
                    type:      'BAIL',
                    label:     `Bail — ${l.leaseReference}`,
                    reference: l.leaseReference,
                    date:      l.startDate?.toISOString() ?? null,
                    isSigned:  l.isSignedElectronically,
                    signedAt:  l.signedAt?.toISOString() ?? null,
                    pdfUrl:    l.qrCodeUrl ?? null,
                    sha256:    l.sha256Hash ?? null,
                    status:    l.status,
                    tenant:    l.tenant ? `${l.tenant.firstName ?? ''} ${l.tenant.lastName ?? ''}`.trim() : null,
                    property:  l.property?.name ?? l.property?.address ?? 'Bien',
                });
            }
        }

        // --- Quittances ---
        if (!type || type === 'receipt') {
            const receipts = await prisma.receipt.findMany({
                where: {
                    lease: landlordWhere,
                    ...(leaseId ? { leaseId } : {}),
                },
                select: {
                    id:          true,
                    receiptRef:  true,
                    periodMonth: true,
                    status:      true,
                    totalAmount: true,
                    paidAt:      true,
                    qrToken:     true,
                    lease: { select: { property: { select: { name: true } } } },
                },
                orderBy: { periodMonth: 'desc' },
                take: type === 'receipt' ? limit : 10,
            });
            for (const r of receipts) {
                documents.push({
                    id:        r.id,
                    type:      'QUITTANCE',
                    label:     `Quittance ${r.periodMonth}`,
                    reference: r.receiptRef,
                    date:      r.paidAt?.toISOString() ?? null,
                    status:    r.status,
                    amount:    Number(r.totalAmount ?? 0),
                    qrToken:   r.qrToken,
                    property:  r.lease?.property?.name ?? 'Bien',
                });
            }
        }

        // --- États des lieux ---
        if (!type || type === 'edl') {
            const edls = await prisma.edl.findMany({
                where: {
                    lease: { ...landlordWhere, ...(leaseId ? { id: leaseId } : {}) },
                },
                select: {
                    id:        true,
                    type:      true,
                    statut:    true,
                    createdAt: true,
                    pdfUrl:    true,
                    lease: { select: { leaseReference: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: type === 'edl' ? limit : 5,
            });
            for (const e of edls) {
                documents.push({
                    id:        e.id,
                    type:      'EDL',
                    label:     `EDL ${e.type === 'ENTREE' ? "Entrée" : 'Sortie'} — ${e.lease?.leaseReference}`,
                    reference: e.lease?.leaseReference ?? '',
                    date:      e.createdAt?.toISOString() ?? null,
                    status:    e.statut,
                    pdfUrl:    e.pdfUrl ?? null,
                });
            }
        }

        // Trier par date décroissante
        documents.sort((a, b) => {
            const da = a.date ? new Date(a.date).getTime() : 0;
            const db = b.date ? new Date(b.date).getTime() : 0;
            return db - da;
        });

        return NextResponse.json({ documents, total: documents.length });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/documents GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
