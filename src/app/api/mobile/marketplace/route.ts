import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicMarketplaceAnnonces } from '@/actions/marketplace-actions';

export async function GET(request: Request) {
    try {
        const [annoncesRaw, allProperties] = await Promise.all([
            getPublicMarketplaceAnnonces(),
            prisma.property.findMany({
                where: { deletedAt: null, status: { not: 'archived' } },
                include: {
                    images: true,
                    leases: {
                        where: {
                            status: { in: ['ACTIVE', 'LOYER_IMPAYE', 'ACTIVE_DECLARATIF', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'] }
                        },
                        select: { id: true, status: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const annonces = Array.isArray(annoncesRaw) ? [...annoncesRaw] : [];
        const existingLogementIds = new Set(annonces.map((a: any) => a.logementId || a.logement?.id).filter(Boolean));

        // Extraire toutes les localités (communes, villes, quartiers) de tous les biens de la base
        const localitySet = new Set<string>();
        for (const p of allProperties) {
            if (p.commune && p.commune.trim()) localitySet.add(p.commune.trim());
            if (p.city && p.city.trim()) localitySet.add(p.city.trim());
            if (p.address && p.address.trim()) {
                // Ajouter l'adresse/quartier s'il est pertinent (entre 3 et 45 caractères)
                const parts = p.address.split(/[,;·\-]/).map(s => s.trim()).filter(s => s.length >= 3 && s.length <= 45);
                for (const part of parts) {
                    localitySet.add(part);
                }
            }

            // Si le bien est disponible (aucun bail actif) et n'a pas encore d'annonce, l'inclure dans les offres disponibles
            const isOccupied = p.leases && p.leases.length > 0;
            if (!isOccupied && !existingLogementIds.has(p.id)) {
                const imgs = p.images?.map((img: any) => img.s3Key).filter(Boolean) || [];
                annonces.push({
                    id: `prop-${p.id}`,
                    logementId: p.id,
                    titre: p.name || `${p.propertyType || 'Logement'} · ${p.commune || 'Abidjan'}`,
                    description: `${p.propertyType || 'Logement'}${p.rooms ? ` ${p.rooms} pièce(s)` : ''}${p.superficieM2 ? ` · ${p.superficieM2} m²` : ''} situé à ${p.address || ''}, ${p.commune || ''}`.trim(),
                    loyerDemande: Number(p.declaredRentFcfa || 0),
                    statut: 'ACTIVE',
                    photosUrls: imgs,
                    logement: {
                        id: p.id,
                        name: p.name,
                        commune: p.commune,
                        city: p.city,
                        address: p.address,
                        propertyType: p.propertyType,
                        superficieM2: p.superficieM2,
                        rooms: p.rooms,
                        bedrooms: p.bedrooms,
                        declaredRentFcfa: p.declaredRentFcfa,
                        images: p.images || [],
                        leases: []
                    }
                });
            }
        }

        const localities = Array.from(localitySet).sort((a, b) => a.localeCompare(b, 'fr'));

        return NextResponse.json({
            success: true,
            annonces,
            localities
        });
    } catch (error: any) {
        console.error('Marketplace GET API Error:', error);
        return NextResponse.json({ success: false, annonces: [], localities: [] }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token requis' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                id: token
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Récupérer les annonces actives
        const annonces = await getPublicMarketplaceAnnonces();

        return NextResponse.json({
            success: true,
            data: annonces
        });

    } catch (error: any) {
        console.error('Marketplace API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
