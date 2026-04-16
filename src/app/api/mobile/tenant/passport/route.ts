import { NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { PasseportService } from '@/lib/passport-service';
import { generatePassportPDF } from '@/lib/pdf-generator';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action } = body;

        if (!token) return NextResponse.json({ error: "Token requis" }, { status: 401 });

        const payload = await verifyMobileToken(token);
        if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const userId = payload.userId;

        if (action === 'GET_PASSPORT') {
            const passport = await PasseportService.getOrCreatePassport(userId);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true, phone: true }
            });

            return NextResponse.json({ 
                success: true, 
                passport,
                tenantName: (user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || user?.phone
            });
        }

        if (action === 'DOWNLOAD_PDF') {
            const passport = await PasseportService.getOrCreatePassport(userId);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });

            const summary = await PasseportService.getTenantReliabilitySummary(userId);
            
            const pdfBuffer = await generatePassportPDF({
                refPasseport: passport.refPasseport || 'PAS-TEMP',
                tenantName: (user?.firstName ? user.firstName + " " : "") + (user?.lastName || "") || 'Locataire',
                score: summary.score,
                badge: summary.badge,
                tauxPaiement: summary.tauxPaiement,
                nbBails: passport.nbBailsInclus,
                hashSha256: passport.hashSha256 || '',
                dateEmission: new Date()
            });

            return NextResponse.json({ 
                success: true, 
                pdfBase64: pdfBuffer.toString('base64'),
                fileName: `Passeport_QAPRIL_${passport.refPasseport}.pdf`
            });
        }

        return NextResponse.json({ error: "Action non valide" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur Passport API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
