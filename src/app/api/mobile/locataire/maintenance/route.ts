import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const body = await request.json();
        const { issueType, title, description } = body;

        if (!title || !description) {
            return NextResponse.json({ error: "Le titre et la description sont requis." }, { status: 400 });
        }

        // Récupérer le bail (pour lier la requête à une propriété)
        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' }
        });

        if (!lease || !lease.propertyId) {
            return NextResponse.json({ error: "Aucun bail actif pour lier ce signalement." }, { status: 400 });
        }

        // Créer l'enregistrement de maintenance
        const maintenance = await prisma.propertyMaintenance.create({
            data: {
                propertyId: lease.propertyId,
                title: title,
                description: description,
                // Assurez-vous que votre schéma Prisma accepte ces champs ou ajustez en fonction
                status: 'PENDING',
                priority: 'NORMAL',
                type: issueType || 'OTHER',
                dateReported: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: "Votre signalement a été envoyé avec succès.",
            ticket: maintenance
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/maintenance error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur. Vérifiez le modèle Prisma." }, { status: 500 });
    }
}
