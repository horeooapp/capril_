import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, token, documentUrl, content, priority } = body;

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
                    where: { status: { in: ["ACTIVE", "LOYER_IMPAYE"] } }
                }
            }
        });

        if (!user || user.leasesAsTenant.length === 0) {
            return NextResponse.json({ error: "Aucun bail actif" }, { status: 404 });
        }

        const activeLease = user.leasesAsTenant[0];

        if (action === 'SEND') {
            const message = await prisma.disputeMessage.create({
                data: {
                    disputeId: 'MODERATION_SUPPORT', // Simplification technique, à adapter 
                    senderId: user.id,
                    content,
                    attachments: documentUrl ? [documentUrl] : []
                }
            });

            return NextResponse.json({ success: true, message });
        }

        return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur API Messages Mobile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
