import { prisma } from '@/lib/prisma';
import { generateLeasePDF } from '@/lib/pdf-generator';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const leaseId = params.id;

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

        const pdfBuffer = await generateLeasePDF({
            leaseRef: lease.leaseReference,
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
