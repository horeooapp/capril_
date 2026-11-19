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
        const isPropertyLandlord = (lease.landlordId === user.userId || lease.property?.ownerUserId === user.userId);

        if (!isTenant && !isOwner && !isAgent && !isPropertyOwner && !isPropertyLandlord) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        // Expiration OTP à 7 jours pour signature
        const otpExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await prisma.lease.update({ 
            where: { id: leaseId }, 
            data: { 
                signingOtpHash: crypto.createHash('sha256').update(otp).digest('hex'),
                signingOtpExpiresAt: otpExpiresAt,
                signingOtpAttempts: 0
            }
        });

        const { dispatchLeaseInitiationNotification } = await import('@/lib/lease-notification');
        await dispatchLeaseInitiationNotification({
            leaseId: lease.id,
            leaseReference: lease.leaseReference,
            propertyName: lease.property?.name || lease.property?.address || 'le logement',
            rentAmount: lease.rentAmount,
            depositAmount: lease.depositAmount || 0,
            signingOtp: otp,
            recipientRole: 'TENANT',
            recipientName: `${lease.tenant.firstName || ''} ${lease.tenant.lastName || ''}`.trim() || 'Locataire',
            recipientPhone: lease.tenant.phone,
            recipientEmail: lease.tenant.email,
            recipientUserId: lease.tenantId,
            initiatorName: 'Le bailleur'
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[MOBILE API] shared/leases/[id]/otp error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
