import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { sendSMS } from '@/lib/sms';
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

        const lease = await prisma.lease.findUnique({ 
            where: { id: leaseId }, 
            include: { tenant: true, property: true } 
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable." }, { status: 404 });
        }

        // Verify access
        const isTenant = lease.tenantId === user.userId;
        const isOwner = lease.ownerId === user.userId;
        const isAgent = lease.agentId === user.userId;
        const isPropertyOwner = lease.property?.ownerUserId === user.userId;
        const isPropertyLandlord = lease.property?.landlordId === user.userId;

        if (!isTenant && !isOwner && !isAgent && !isPropertyOwner && !isPropertyLandlord) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // [SEC-FIX F-04] Vérification expiration OTP (15 min)
        const leaseWithOtp = lease as any;
        if (leaseWithOtp.signingOtpExpiresAt && new Date() > new Date(leaseWithOtp.signingOtpExpiresAt)) {
            return NextResponse.json({ error: "Code OTP expiré. Veuillez en demander un nouveau." }, { status: 400 });
        }

        // [SEC-FIX F-04] Compteur d'échecs - bloquer après 5 tentatives
        const failedAttempts = (leaseWithOtp.signingOtpFailedAttempts || 0);
        if (failedAttempts >= 5) {
            return NextResponse.json({ error: "Trop de tentatives échouées. Veuillez demander un nouveau code." }, { status: 429 });
        }

        // Verify OTP
        if (leaseWithOtp.signingOtp !== otp) {
            // Incrémenter le compteur d'échecs
            await prisma.lease.update({
                where: { id: leaseId },
                data: { signingOtpFailedAttempts: failedAttempts + 1 } as any
            });
            return NextResponse.json({ error: "Code OTP invalide." }, { status: 400 });
        }

        // Sign Lease — réinitialiser les champs OTP (F-04)
        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                isSignedElectronically: true,
                signedAt: new Date(),
                signingOtp: null,
                signingOtpExpiresAt: null,    // [SEC-FIX F-04] Effacer l'expiration
                signingOtpFailedAttempts: 0,  // [SEC-FIX F-04] Réinitialiser le compteur
                status: "ACTIVE"
            } as any
        });
        
        await prisma.property.update({ where: { id: lease.propertyId }, data: { status: "rented" } });
        
        // Orchestration (Loyer, Fiscal, Notification)
        try {
            await LoyerService.initLeaseSynthesis(leaseId);
            
            if (lease.typeBail === TypeBail.ECRIT) {
                await FiscalService.getOrCreateDossier(leaseId);
            }
            
            if (lease.tenant?.phone) {
                await sendSMS(lease.tenant.phone, `Félicitations ! Votre bail QAPRIL est actif. Votre quittance du mois sera disponible bientôt.`);
            }
        } catch (orchestrationError) {
            console.error("[ORCHESTRATION_ERROR] Post-signature logic failed:", orchestrationError);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id]/sign error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
