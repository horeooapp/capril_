import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token, action, leaseId, content, isOnline } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token requis' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { id: token }
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
            const { messageIds } = await request.json();
            await prisma.messagerieBail.updateMany({
                where: {
                    id: { in: messageIds },
                    leaseId: leaseId,
                    expediteurId: { not: user.id } // Ne pas marquer ses propres messages comme lus
                },
                data: {
                    statut: 'LU',
                    dateLecture: new Date()
                }
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'FETCH') {
            const messages = await prisma.messagerieBail.findMany({
                where: { leaseId },
                orderBy: { dateEnvoi: 'asc' },
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
            return NextResponse.json({ success: true, data: messages });
        }

        if (action === 'SEND') {
            const newMessage = await prisma.messagerieBail.create({
                data: {
                    leaseId,
                    expediteurId: user.id,
                    roleExpediteur: user.role === 'LANDLORD' ? 'PROPRIO' : 'LOCATAIRE',
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
