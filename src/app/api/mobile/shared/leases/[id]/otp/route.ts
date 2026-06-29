import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { sendSMS } from '@/lib/sms';
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

        const lease = await prisma.lease.findUnique({ 
            where: { id: leaseId }, 
            include: { tenant: true, property: true } 
        });

        if (!lease || !lease.tenant) {
            return NextResponse.json({ error: "Bail ou locataire introuvable." }, { status: 404 });
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

        // [SEC-FIX F-03] OTP cryptographiquement sécurisé (remplace Math.random non-crypto)
        const otp = crypto.randomInt(100000, 999999).toString();
        // [SEC-FIX F-04] Expiration OTP à 15 minutes maximum
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        await prisma.lease.update({ 
            where: { id: leaseId }, 
            data: { 
                signingOtp: otp,
                signingOtpExpiresAt: otpExpiresAt
            } as any
        });

        if (lease.tenant.phone) {
            await sendSMS(lease.tenant.phone, `QAPRIL - Code de Signature : ${otp}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id]/otp error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
