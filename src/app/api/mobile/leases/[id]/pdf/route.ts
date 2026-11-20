import { prisma } from '@/lib/prisma';
import { generateLeasePDF } from '@/lib/pdf-generator';
import { NextResponse } from 'next/server';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leaseId } = await params;

        // 1. Authentification (Mobile Bearer Token ou Session Web)
        const mobileUser = await authenticateMobileRequest(req);
        let userId = mobileUser?.userId;
        let userRole = mobileUser?.role ? String(mobileUser.role).toUpperCase() : '';

        if (!userId) {
            const session = await auth();
            if (session?.user?.id) {
                userId = session.user.id;
                userRole = String((session.user as any).role || '').toUpperCase();
            }
        }

        if (!userId) {
            return new NextResponse("Authentification requise", { status: 401 });
        }

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                property: true,
                landlord: true,
                tenant: true
            }
        });

        if (!lease) {
            return new Response("Bail introuvable", { status: 404 });
        }

        // 2. Contrôle d'accès strict (BOLA / IDOR)
        const isStaff = ['ADMIN', 'SUPER_ADMIN', 'CDC_AGENT', 'ANAH_AGENT'].includes(userRole);
        const isTenant = lease.tenantId === userId;
        const isLandlord = lease.landlordId === userId || lease.property.ownerUserId === userId;
        const isManagingAgent = lease.property.managedByUserId === userId;

        if (!isStaff && !isTenant && !isLandlord && !isManagingAgent) {
            return new NextResponse("Accès non autorisé à ce contrat de bail", { status: 403 });
        }

        const pdfBuffer = await generateLeasePDF({
            leaseRef: lease.leaseReference,
            nbPagesBail: (lease as any).nbPagesBail,
            landlord: lease.landlord,
            tenant: lease.tenant,
            property: lease.property,
            rentAmount: lease.rentAmount,
            depositAmount: lease.depositAmount,
            avanceAmount: lease.avanceLoyer,
            startDate: lease.startDate,
            durationMonths: lease.durationMonths,
            paymentDay: lease.paymentDay,
            signedAt: lease.signedAt || undefined,
            qrToken: lease.leaseReference, // Fallback to ref if no token
            sha256Hash: lease.sha256Hash || undefined
        });

        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Bail_${lease.leaseReference}.pdf"`
            }
        });

    } catch (error: any) {
        console.error("Error generating lease PDF:", error);
        return new Response("Erreur interne du serveur", { status: 500 });
    }
}
