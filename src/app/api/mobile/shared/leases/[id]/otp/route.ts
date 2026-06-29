import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { sendSMS } from '@/lib/sms';

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

        // OTP Generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await prisma.lease.update({ 
            where: { id: leaseId }, 
            data: { signingOtp: otp } as any
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
