import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { formatUserFriendlyError } from '@/lib/friendly-error';
import crypto from 'crypto';
import { dispatchLeaseInitiationNotification } from '@/lib/lease-notification';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, propertyId, tenantId, rentAmount, depositAmount, leaseType } = body;

        if (!token) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }

        const userId = payload.userId;

        // Vérification que le bien appartient au bailleur
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property || property.ownerUserId !== userId) {
             return NextResponse.json({ error: "Propriété invalide ou non autorisée." }, { status: 403 });
        }

        const signingOtp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const signingOtpHash = crypto.createHash('sha256').update(signingOtp).digest('hex');
        const leaseReference = `MOB-BAIL-${Date.now()}`;

        const lease = await prisma.lease.create({
            data: {
                propertyId,
                tenantId: tenantId || null,
                landlordId: userId,
                leaseReference,
                durationMonths: 12,
                leaseType: leaseType || 'RESIDENTIEL',
                startDate: new Date(),
                rentAmount: parseFloat(rentAmount),
                depositAmount: parseFloat(depositAmount || 0),
                status: 'PENDING_SIGNATURE',
                isSignedElectronically: false,
                signingOtpHash,
                signingOtpExpiresAt: otpExpiresAt,
                signingOtpAttempts: 0,
            }
        });

        // Envoi de la notification impérative multicanale au locataire
        if (tenantId) {
            const tenant = await prisma.user.findUnique({ where: { id: tenantId } });
            if (tenant) {
                await dispatchLeaseInitiationNotification({
                    leaseId: lease.id,
                    leaseReference,
                    propertyName: property.name || property.address || 'le logement',
                    rentAmount: parseFloat(rentAmount),
                    depositAmount: parseFloat(depositAmount || 0),
                    signingOtp,
                    recipientRole: 'TENANT',
                    recipientName: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || 'Locataire',
                    recipientPhone: tenant.phone,
                    recipientEmail: tenant.email,
                    recipientUserId: tenant.id,
                    initiatorName: 'Le bailleur'
                });
            }
        }

        return NextResponse.json({ success: true, lease });

    } catch (error: any) {
        console.error("Erreur API Création Bail Mobile:", error);
        return NextResponse.json({ error: formatUserFriendlyError(error, "Impossible de créer le bail.") }, { status: 500 });
    }
}
