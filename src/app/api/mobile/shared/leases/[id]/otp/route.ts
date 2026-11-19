import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const leaseId = id;

        // [IC-05] Même règle que le web : contrôle d'accès, code limité, envoi au seul locataire.
        const { preparerCodeSignature, SignatureError } = await import('@/lib/lease-signature');
        let r;
        try {
            const { figerBail } = await import('@/lib/bail/figer');
            r = await preparerCodeSignature(prisma, { leaseId, demandeurId: user.userId, demandeurRole: (user as any).role, figer: () => figerBail(leaseId) });
        } catch (e: any) {
            if (e instanceof SignatureError) {
                const statut = e.code === 'ACCES' ? 403 : e.code === 'INTROUVABLE' ? 404 : 400;
                return NextResponse.json({ error: e.message, code: e.code }, { status: statut });
            }
            if (e?.manquants) return NextResponse.json({ error: e.message, code: 'BAIL_INCOMPLET', manquants: e.manquants }, { status: 400 });
            throw e;
        }

        const { dispatchLeaseInitiationNotification } = await import('@/lib/lease-notification');
        await dispatchLeaseInitiationNotification({
            leaseId: r.bail.id,
            leaseReference: r.bail.leaseReference,
            propertyName: r.bail.property?.name || r.bail.property?.address || 'le logement',
            rentAmount: r.bail.rentAmount,
            depositAmount: r.bail.depositAmount || 0,
            signingOtp: r.code,
            recipientRole: 'TENANT',
            recipientName: r.destinataire.nom,
            recipientPhone: r.destinataire.telephone || undefined,
            recipientEmail: r.destinataire.email || undefined,
            recipientUserId: r.destinataire.userId || undefined,
            initiatorName: 'Le bailleur'
        } as any);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id]/otp error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
