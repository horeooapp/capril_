import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, action, leaseId, content, isOnline } = body;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token requis' }, { status: 401 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ success: false, error: 'Non autorisé. Jeton invalide.' }, { status: 401 });
        }

        const userId = payload.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        if (action === 'TOGGLE_ONLINE') {
            await prisma.user.update({
                where: { id: user.id },
                data: { isChatOnline: isOnline }
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'READ') {
            const { messageIds } = body;
            if (!messageIds || !Array.isArray(messageIds)) {
                return NextResponse.json({ success: false, error: 'messageIds requis' }, { status: 400 });
            }
            await prisma.messagerieBail.updateMany({
                where: {
                    id: { in: messageIds },
                    leaseId: leaseId,
                    expediteurId: { not: user.id }
                },
                data: {
                    statut: 'LU',
                    dateLecture: new Date()
                }
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'FETCH') {
            const lease = await prisma.lease.findUnique({
                where: { id: leaseId },
                include: {
                    property: true,
                }
            });

            const messages = await prisma.messagerieBail.findMany({
                where: { leaseId },
                orderBy: { dateEnvoi: 'asc' },
                include: {
                    expediteur: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            companyName: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            // S-11 & S-15 : RG-CONF et calcul d'identité
            // Si le lecteur est le locataire et que le bailleur est masqué, masquer le nom du bailleur
            const isTenant = lease?.tenantId === user.id;
            const hasAgency = Boolean(lease?.managedByUserId || lease?.property?.managedByUserId);
            const isMasked = Boolean(lease?.bailleurMasque);

            const safeMessages = messages.map(m => {
                const isLandlordMessage = m.roleExpediteur === 'PROPRIO';
                if (isTenant && isLandlordMessage) {
                    if (hasAgency) {
                        return {
                            ...m,
                            expediteur: {
                                ...m.expediteur,
                                firstName: m.expediteur?.companyName || 'Agence de gestion',
                                lastName: '',
                            }
                        };
                    }
                    if (isMasked) {
                        return {
                            ...m,
                            expediteur: {
                                ...m.expediteur,
                                firstName: 'Bailleur',
                                lastName: '(identité protégée)',
                            }
                        };
                    }
                }
                return m;
            });

            return NextResponse.json({ success: true, data: safeMessages });
        }

        if (action === 'SEND') {
            const newMessage = await prisma.messagerieBail.create({
                data: {
                    leaseId,
                    expediteurId: user.id,
                    roleExpediteur: user.role === 'LANDLORD' || user.role === 'LANDLORD_PRO' ? 'PROPRIO' : 'LOCATAIRE',
                    contenu: content,
                    statut: 'ENVOYE'
                },
                include: {
                    expediteur: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatarUrl: true
                        }
                    }
                }
            });
            return NextResponse.json({ success: true, data: newMessage });
        }

        return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });

    } catch (error: any) {
        console.error('Messages API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
