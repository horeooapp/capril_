import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const lease = await prisma.lease.findFirst({
            where: { tenantId: user.userId, status: 'ACTIVE' },
            include: { property: true }
        });

        if (!lease) {
            return NextResponse.json({ error: "Aucun bail trouvé" }, { status: 404 });
        }

        // Renvoie une URL fictive de PDF pour la démo, ou qrCodeUrl si présent
        return NextResponse.json({
            id: lease.id,
            property: lease.property.name,
            documentUrl: lease.qrCodeUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        });

    } catch (error) {
        console.error("[MOBILE API] locataire/leases error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
