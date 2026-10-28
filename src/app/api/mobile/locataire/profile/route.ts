import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/locataire/profile
 * Retourne le profil complet du locataire connecté
 *
 * PATCH /api/mobile/locataire/profile
 * Mise à jour partielle du profil
 * Body: { firstName?, lastName?, email?, address?, commune? }
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id:         true,
                firstName:  true,
                lastName:   true,
                email:      true,
                phone:      true,
                role:       true,
                status:     true,
                kycLevel:   true,
                kycStatus:  true,
                createdAt:  true,
                // Bail actif
                tenantLeases: {
                    where: { status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'LOYER_IMPAYE'] } },
                    take: 1,
                    select: {
                        id:             true,
                        leaseReference: true,
                        status:         true,
                        rentAmount:     true,
                        startDate:      true,
                        durationMonths: true,
                        property: {
                            select: {
                                name:    true,
                                address: true,
                                commune: true,
                            },
                        },
                        landlord: {
                            select: { firstName: true, lastName: true, phone: true },
                        },
                    },
                },
                // Wallet
                walletConfig: {
                    select: { walletBalance: true },
                },
            },
        });

        if (!profile) {
            return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });
        }

        const activeLease = profile.tenantLeases[0] ?? null;

        return NextResponse.json({
            id:         profile.id,
            firstName:  profile.firstName,
            lastName:   profile.lastName,
            email:      profile.email,
            phone:      profile.phone,
            role:       profile.role,
            status:     profile.status,
            kycLevel:   profile.kycLevel,
            kycStatus:  profile.kycStatus,
            memberSince: profile.createdAt?.toISOString() ?? null,
            walletBalance: Number(profile.walletConfig?.walletBalance ?? 0),
            activeLease: activeLease ? {
                id:             activeLease.id,
                leaseReference: activeLease.leaseReference,
                status:         activeLease.status,
                rentAmount:     Number(activeLease.rentAmount),
                startDate:      activeLease.startDate?.toISOString() ?? null,
                durationMonths: activeLease.durationMonths,
                property: {
                    name:    activeLease.property?.name,
                    address: activeLease.property?.address,
                    commune: activeLease.property?.commune,
                },
                landlord: activeLease.landlord ? {
                    firstName: activeLease.landlord.firstName,
                    lastName:  activeLease.landlord.lastName,
                    phone:     activeLease.landlord.phone,
                } : null,
            } : null,
            currency: 'XOF',
        });
    } catch (error: any) {
        console.error('[MOBILE] locataire/profile GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const body = await request.json();
        const allowed = ['firstName', 'lastName', 'email'];
        const updateData: any = {};
        for (const key of allowed) {
            if (body[key] !== undefined && typeof body[key] === 'string' && body[key].trim() !== '') {
                updateData[key] = body[key].trim();
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Aucun champ valide fourni.' }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: user.userId },
            data:  updateData,
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        });

        return NextResponse.json({ success: true, user: updated });
    } catch (error: any) {
        console.error('[MOBILE] locataire/profile PATCH error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
