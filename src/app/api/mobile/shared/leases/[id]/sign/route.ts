import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { sendSMS } from '@/lib/sms';
import { LoyerService } from '@/lib/loyer-service';
import { FiscalService } from '@/lib/fiscal-service';
import { TypeBail } from '@prisma/client';
import crypto from 'crypto';

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
        const isPropertyLandlord = (lease.landlordId === user.userId || lease.property?.ownerUserId === user.userId);

        if (!isTenant && !isOwner && !isAgent && !isPropertyOwner && !isPropertyLandlord) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        // [SEC-FIX F-04] Vérification expiration OTP (15 min)
        const leaseWithOtp = lease as any;
        if (leaseWithOtp.signingOtpExpiresAt && new Date() > new Date(leaseWithOtp.signingOtpExpiresAt)) {
            return NextResponse.json({ error: "Code OTP expiré. Veuillez en demander un nouveau." }, { status: 400 });
        }

        // [SEC-FIX F-04] Compteur d'échecs - bloquer après 5 tentatives
        const failedAttempts = (leaseWithOtp.signingOtpAttempts || leaseWithOtp.signingOtpFailedAttempts || 0);
        if (failedAttempts >= 5) {
            return NextResponse.json({ error: "Trop de tentatives échouées. Veuillez demander un nouveau code." }, { status: 429 });
        }

        // Verify OTP via hash
        const hashedInput = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
        const isOtpValid = leaseWithOtp.signingOtpHash === hashedInput || leaseWithOtp.signingOtp === otp;

        if (!isOtpValid) {
            // Incrémenter le compteur d'échecs
            await prisma.lease.update({
                where: { id: leaseId },
                data: { signingOtpAttempts: failedAttempts + 1 }
            });
            return NextResponse.json({ error: "Code OTP invalide." }, { status: 400 });
        }

        // Sign Lease — réinitialiser les champs OTP (F-04)
        await prisma.lease.update({
            where: { id: leaseId },
            data: {
                isSignedElectronically: true,
                signedAt: new Date(),
                signingOtpHash: null,
                signingOtpExpiresAt: null,
                signingOtpAttempts: 0,
                status: "ACTIVE"
            }
        });
        
        await prisma.property.update({ where: { id: lease.propertyId }, data: { status: "rented" } });
        
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
