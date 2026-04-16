import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                leasesAsTenant: {
                    where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } },
                    include: { landlord: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        // 1. Récupérer l'annuaire de base public
        const annuaire = await prisma.annuaireUrgences.findMany();

        const contacts = annuaire.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            location: a.location || 'N/A',
            hours: a.hours || 'N/A',
            phone: a.phone,
            lat: a.lat || 5.3094,
            lng: a.lng || -3.9897,
            iconName: a.iconName || 'Phone'
        }));

        // 2. Récupérer le contact du bailleur si disponible
        const activeLease = user.leasesAsTenant[0];
        if (activeLease && activeLease.landlord) {
            contacts.push({
                id: activeLease.landlord.id,
                name: `${activeLease.landlord.firstName || ''} ${activeLease.landlord.lastName || ''}`.trim() || 'Votre Bailleur',
                category: 'Bailleur / Gestion',
                location: activeLease.landlord.neighborhood || 'Inconnue',
                hours: 'Heures de bureau',
                phone: activeLease.landlord.phone || 'Non renseigné',
                lat: 5.3484, // Default Abidjan ref
                lng: -3.9702,
                iconName: 'Building'
            });
        }

        return NextResponse.json({ success: true, contacts });
    } catch (error: any) {
        console.error("Erreur API Emergency Contacts:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
