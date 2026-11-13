import { NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { PasseportService } from '@/lib/passport-service';
import { generatePassportPDF } from '@/lib/pdf-generator';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Upsert LocataireProfile et retourner les prefs S-09 */
async function getOrCreateLocataireProfile(userId: string) {
    return prisma.locataireProfile.upsert({
        where:  { userId },
        create: { userId, scoreActuel: 0, scoreBadge: 'D', tauxPaiement12m: 0, nbBailsActifs: 0, nbBailsClos: 0 },
        update: {},
        select: {
            shareTranche:   true,
            shareBadges:    true,
            shareFoyer:     true,
            shareDureeBail: true,
        },
    });
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action } = body;

        if (!token) return NextResponse.json({ error: 'Token requis' }, { status: 401 });

        const payload = await verifyMobileToken(token);
        if (!payload) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const userId = payload.userId;

        // ----------------------------------------------------------------
        // GET_PASSPORT — passeport + prefs S-09
        // ----------------------------------------------------------------
        if (action === 'GET_PASSPORT') {
            const [passport, user, prefs] = await Promise.all([
                PasseportService.getOrCreatePassport(userId),
                prisma.user.findUnique({
                    where:  { id: userId },
                    select: { firstName: true, lastName: true, phone: true },
                }),
                getOrCreateLocataireProfile(userId),
            ]);

            return NextResponse.json({
                success: true,
                passport,
                tenantName:
                    (user?.firstName ? user.firstName + ' ' : '') +
                    (user?.lastName || '') || user?.phone,
                prefs: {
                    shareTranche:   prefs.shareTranche,
                    shareBadges:    prefs.shareBadges,
                    shareFoyer:     prefs.shareFoyer,
                    shareDureeBail: prefs.shareDureeBail,
                },
            });
        }

        // ----------------------------------------------------------------
        // GET_PREFS — lecture seule des préférences
        // ----------------------------------------------------------------
        if (action === 'GET_PREFS') {
            const prefs = await getOrCreateLocataireProfile(userId);
            return NextResponse.json({ success: true, prefs });
        }

        // ----------------------------------------------------------------
        // UPDATE_PREFS — S-09 : persister les interrupteurs du passeport
        // ----------------------------------------------------------------
        if (action === 'UPDATE_PREFS') {
            const { shareTranche, shareBadges, shareFoyer, shareDureeBail } = body;

            const updateData: Record<string, boolean> = {};
            if (typeof shareTranche   === 'boolean') updateData.shareTranche   = shareTranche;
            if (typeof shareBadges    === 'boolean') updateData.shareBadges    = shareBadges;
            if (typeof shareFoyer     === 'boolean') updateData.shareFoyer     = shareFoyer;
            if (typeof shareDureeBail === 'boolean') updateData.shareDureeBail = shareDureeBail;

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ error: 'Aucune préférence valide fournie.' }, { status: 400 });
            }

            await prisma.locataireProfile.upsert({
                where:  { userId },
                create: { userId, scoreActuel: 0, scoreBadge: 'D', tauxPaiement12m: 0, nbBailsActifs: 0, nbBailsClos: 0, ...updateData },
                update: updateData,
            });

            return NextResponse.json({ success: true });
        }

        // ----------------------------------------------------------------
        // DOWNLOAD_PDF
        // ----------------------------------------------------------------
        if (action === 'DOWNLOAD_PDF') {
            const passport = await PasseportService.getOrCreatePassport(userId);
            const user = await prisma.user.findUnique({
                where:  { id: userId },
                select: { firstName: true, lastName: true },
            });

            const summary = await PasseportService.getTenantReliabilitySummary(userId);

            const pdfBuffer = await generatePassportPDF({
                refPasseport: passport.refPasseport || 'PAS-TEMP',
                tenantName:
                    (user?.firstName ? user.firstName + ' ' : '') +
                    (user?.lastName || '') || 'Locataire',
                score:        summary.score,
                badge:        summary.badge,
                tauxPaiement: summary.tauxPaiement,
                nbBails:      passport.nbBailsInclus,
                hashSha256:   passport.hashSha256 || '',
                dateEmission: new Date(),
            });

            return NextResponse.json({
                success:  true,
                pdfBase64: pdfBuffer.toString('base64'),
                fileName: `Passeport_QAPRIL_${passport.refPasseport}.pdf`,
            });
        }

        return NextResponse.json({ error: 'Action non valide' }, { status: 400 });

    } catch (error: any) {
        console.error('[PASSPORT] API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
