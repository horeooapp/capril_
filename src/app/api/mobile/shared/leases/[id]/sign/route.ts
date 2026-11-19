import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { LoyerService } from '@/lib/loyer-service';
import { FiscalService } from '@/lib/fiscal-service';
import { TypeBail } from '@prisma/client';

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
        
        const body = await request.json();
        const { otp } = body;

        if (!otp) {
            return NextResponse.json({ error: "Code OTP manquant." }, { status: 400 });
        }

        // [IC-05] Même règle que le web : seul le locataire signe (plus le bailleur ni l'agence).
        const { signerBail, SignatureError } = await import('@/lib/lease-signature');
        let lease: { typeBail: string };
        try {
            await (await import('@/lib/bail/figer')).verifierBailAvantSignature(leaseId);
            lease = await signerBail(prisma, {
                leaseId,
                signataireId: user.userId,
                code: String(otp),
                ip: (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            });
        } catch (e: any) {
            if (e instanceof SignatureError) {
                const statut = e.code === 'ACCES' ? 403 : e.code === 'INTROUVABLE' ? 404 : e.code === 'BLOQUE' ? 429 : 400;
                return NextResponse.json({ error: e.message, code: e.code }, { status: statut });
            }
            throw e;
        }

        // Orchestration (Loyer, Fiscal, Notification bilatérale)
        try {
            await LoyerService.initLeaseSynthesis(leaseId);
            
            if (lease.typeBail === TypeBail.ECRIT) {
                await FiscalService.getOrCreateDossier(leaseId);
            }
            
            const { dispatchLeaseSignedBilateralNotification } = await import('@/lib/lease-notification');
            await dispatchLeaseSignedBilateralNotification(leaseId);
        } catch (orchestrationError) {
            console.error("[ORCHESTRATION_ERROR] Post-signature logic failed:", orchestrationError);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id]/sign error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
