import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import crypto from 'crypto';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE'
            }
        });

        if (!lease) {
            return NextResponse.json({ preavis: null });
        }

        const preavis = await prisma.preavisBail.findFirst({
            where: {
                bailId: lease.id,
                locataireId: user.userId,
                statut: { in: ['EMIS', 'ACCUSE'] }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ preavis });
    } catch (e: any) {
        console.error("[MOBILE API] locataire/preavis GET error:", e);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { dateDepartPrevue, motif } = body;

        const lease = await prisma.lease.findFirst({
            where: {
                tenantId: user.userId,
                status: 'ACTIVE'
            },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Aucun bail actif trouvé." }, { status: 400 });
        }

        const targetDate = dateDepartPrevue ? new Date(dateDepartPrevue) : null;
        if (!targetDate || isNaN(targetDate.getTime())) {
            return NextResponse.json({ error: "Date de départ prévue invalide." }, { status: 400 });
        }

        // Vérification du délai légal minimum (30 jours selon le CCH art. 434)
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 29); // 30 jours calendaires
        if (targetDate < minDate) {
            return NextResponse.json({
                error: `Le préavis légal est de 30 jours minimum (Art. 434 CCH). Première date de sortie possible : ${minDate.toLocaleDateString('fr-FR')}.`
            }, { status: 400 });
        }

        const year = new Date().getFullYear();
        const randCode = Math.floor(10000 + Math.random() * 90000);
        const ref = `PREV-${year}-${randCode}`;

        const rawContent = `${user.userId}-${lease.id}-${targetDate.toISOString()}-${ref}`;
        const hash = crypto.createHash('sha256').update(rawContent).digest('hex');

        const preavis = await prisma.preavisBail.create({
            data: {
                locataireId: user.userId,
                bailId: lease.id,
                dateDepartPrevue: targetDate,
                motif: motif?.trim() || "Congé donné par le locataire",
                refPreavis: ref,
                hashSha256: hash,
                statut: 'EMIS'
            }
        });

        return NextResponse.json({
            success: true,
            message: "Votre préavis officiel de départ a été enregistré et notifié à votre bailleur conformément au Code de la Construction et de l'Habitat.",
            preavis
        });

    } catch (e: any) {
        console.error("[MOBILE API] locataire/preavis POST error:", e);
        return NextResponse.json({ error: "Erreur lors de l'enregistrement du préavis." }, { status: 500 });
    }
}

