import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicMarketplaceAnnonces } from '@/actions/marketplace-actions';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token requis' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                id: token // Simplification pour le mobile (on utilise l'ID comme token pour l'instant)
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
