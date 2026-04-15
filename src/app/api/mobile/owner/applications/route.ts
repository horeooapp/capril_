import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action, applicationId } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        if (action === 'GET_ALL') {
            const properties = await prisma.property.findMany({ where: { ownerUserId: token }, select: { id: true }});
            const propertyIds = properties.map(p => p.id);

            const applications = await prisma.candidature.findMany({
                where: { logementId: { in: propertyIds }, statut: 'SOUMISE' },
                include: {
                    candidat: { select: { firstName: true, lastName: true, phone: true } },
                    logement: { select: { address: true, propertyType: true } }
                }
            });

            return NextResponse.json({ success: true, applications });
        }

        if (action === 'APPROVE' || action === 'REJECT') {
            const newStatus = action === 'APPROVE' ? 'ACCEPTEE' : 'REFUSEE';
            const updated = await prisma.candidature.update({
                where: { id: applicationId },
                data: { statut: newStatus }
            });
            return NextResponse.json({ success: true, application: updated });
        }

        return NextResponse.json({ error: "Action invalide." }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Applications Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
