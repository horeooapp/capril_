import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicMarketplaceAnnonces } from '@/actions/marketplace-actions';

export async function GET(request: Request) {
    try {
        const annonces = await getPublicMarketplaceAnnonces();
        return NextResponse.json({
            success: true,
            annonces: annonces || []
        });
    } catch (error: any) {
        console.error('Marketplace GET API Error:', error);
        return NextResponse.json({ success: false, annonces: [] }, { status: 500 });
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
