import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

// Récupérer les messages et la liste des conversations
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const url = new URL(request.url);
        let requestedLeaseId = url.searchParams.get('leaseId');
        const listOnly = url.searchParams.get('list') === '1' || url.searchParams.get('list') === 'true';

        // 1. Récupérer tous les baux accessibles par cet utilisateur (locataire, bailleur ou agence)
        const accessibleLeases = await prisma.lease.findMany({
            where: {
                OR: [
                    { tenantId: user.userId },
                    { landlordId: user.userId },
                    { property: { ownerUserId: user.userId } },
                    { property: { managedByUserId: user.userId } }
                ],
                status: { notIn: ['CANCELLED', 'ARCHIVED'] }
            },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        commune: true,
                        ownerUserId: true,
                        managedByUserId: true
                    }
                },
                tenant: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                landlord: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                messagesBail: {
                    orderBy: { dateEnvoi: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        if (accessibleLeases.length === 0) {
            return NextResponse.json({
                messages: [],
                conversations: [],
                activeLeaseId: null,
                interlocutorName: '',
                interlocutorRole: '',
                leaseReference: '',
                propertyName: '',
                unreadTotal: 0
            });
        }

        // 2. Compter les messages non lus pour chaque bail
        const unreadCounts = await prisma.messagerieBail.groupBy({
            by: ['leaseId'],
            where: {
                leaseId: { in: accessibleLeases.map(l => l.id) },
                expediteurId: { not: user.userId },
                statut: { not: 'LU' }
            },
            _count: { id: true }
        });

        const unreadMap = new Map<string, number>();
        let unreadTotal = 0;
        unreadCounts.forEach(c => {
            const count = c._count.id;
            unreadMap.set(c.leaseId, count);
            unreadTotal += count;
        });

        // 3. Formater les conversations
        const conversations = accessibleLeases.map(l => {
            const isTenant = l.tenantId === user.userId;
            const isAgency = l.property?.managedByUserId === user.userId;
            let otherPartyName = 'Correspondant';
            let otherPartyRole = 'Bailleur';

            if (isTenant) {
                otherPartyRole = l.property?.managedByUserId ? 'Agence' : 'Bailleur';
                if (l.bailleurMasque) {
                    otherPartyName = 'Bailleur certifié';
                } else if (l.landlord) {
                    otherPartyName = `${l.landlord.firstName || ''} ${l.landlord.lastName || ''}`.trim() || 'Bailleur';
                }
            } else if (isAgency) {
                otherPartyRole = 'Locataire';
                if (l.tenant) {
                    otherPartyName = `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() || 'Locataire';
                }
            } else {
                // Landlord
                otherPartyRole = 'Locataire';
                if (l.tenant) {
                    otherPartyName = `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() || 'Locataire';
                }
            }

            const lastMsg = l.messagesBail?.[0];

            return {
                leaseId: l.id,
                leaseReference: l.leaseReference,
                propertyName: l.property?.name || l.property?.address || 'Logement',
                propertyCommune: l.property?.commune || 'Abidjan',
                otherPartyName,
                otherPartyRole,
                lastMessage: lastMsg?.contenu || '',
                lastMessageDate: lastMsg?.dateEnvoi ? lastMsg.dateEnvoi.toISOString() : null,
                lastMessageIsMe: lastMsg ? lastMsg.expediteurId === user.userId : false,
                unreadCount: unreadMap.get(l.id) || 0
            };
        });

        if (listOnly) {
            return NextResponse.json({
                conversations,
                unreadTotal
            });
        }

        // 4. Identifier le bail actif à ouvrir
        let targetLease = requestedLeaseId
            ? accessibleLeases.find(l => l.id === requestedLeaseId)
            : accessibleLeases[0];

        if (!targetLease) {
            targetLease = accessibleLeases[0];
        }

        // 5. Charger les messages du bail sélectionné
        const messages = await prisma.messagerieBail.findMany({
            where: { leaseId: targetLease.id },
            orderBy: { dateEnvoi: 'asc' }
        });

        const activeConv = conversations.find(c => c.leaseId === targetLease.id);

        return NextResponse.json({
            messages,
            conversations,
            activeLeaseId: targetLease.id,
            interlocutorName: activeConv?.otherPartyName || 'Correspondant',
            interlocutorRole: activeConv?.otherPartyRole || 'Bailleur',
            leaseReference: targetLease.leaseReference,
            propertyName: activeConv?.propertyName || 'Logement',
            unreadTotal
        });

    } catch (error) {
        console.error("[MOBILE API] chat GET error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

// Envoyer un nouveau message
export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const body = await request.json();
        let { leaseId } = body;
        const { contenu, role } = body;

        if (!contenu || !contenu.trim()) {
            return NextResponse.json({ error: "Le contenu du message est requis" }, { status: 400 });
        }

        if (!leaseId) {
            const activeLease = await prisma.lease.findFirst({
                where: {
                    OR: [
                        { tenantId: user.userId },
                        { landlordId: user.userId },
                        { property: { ownerUserId: user.userId } },
                        { property: { managedByUserId: user.userId } }
                    ],
                    status: { notIn: ['CANCELLED', 'ARCHIVED'] }
                },
                orderBy: { updatedAt: 'desc' }
            });
            if (activeLease) {
                leaseId = activeLease.id;
            } else {
                return NextResponse.json({ error: "Aucun bail actif pour associer ce message" }, { status: 400 });
            }
        }

        // Vérification d'accès
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        const isAuthorized = lease && (
            lease.tenantId === user.userId ||
            lease.landlordId === user.userId ||
            lease.property?.ownerUserId === user.userId ||
            lease.property?.managedByUserId === user.userId
        );

        if (!isAuthorized || !lease) {
            return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }

        const isTenant = lease.tenantId === user.userId;
        const expediteurRole = role || (isTenant ? 'LOCATAIRE' : (lease.property?.managedByUserId === user.userId ? 'AGENCE' : 'PROPRIO'));

        // Création du message infalsifiable
        const message = await prisma.messagerieBail.create({
            data: {
                leaseId,
                expediteurId: user.userId,
                roleExpediteur: expediteurRole,
                contenu: contenu.trim(),
                statut: 'RECU', // Immédiatement "reçu" par le serveur central QAPRIL (2 encoches grises)
                dateEnvoi: new Date()
            }
        });

        // Envoi immédiat de la notification push au destinataire
        const destinataireId = isTenant
            ? (lease.property?.managedByUserId || lease.landlordId || lease.property?.ownerUserId)
            : lease.tenantId;

        if (destinataireId) {
            try {
                const [destinataire, expediteur] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: destinataireId },
                        select: { pushToken: true, firstName: true, lastName: true }
                    }),
                    prisma.user.findUnique({
                        where: { id: user.userId },
                        select: { firstName: true, lastName: true }
                    })
                ]);

                const senderName = expediteur
                    ? `${expediteur.firstName || ''} ${expediteur.lastName || ''}`.trim()
                    : (isTenant ? 'Locataire' : 'Bailleur');

                const isE2EE = contenu.startsWith('QAPRIL_E2EE:v1:');
                const notificationBody = isE2EE ? 'Nouveau message sécurisé' : contenu.trim();

                if (destinataire?.pushToken) {
                    const { sendExpoPushNotification } = await import('@/lib/expo-push');
                    await sendExpoPushNotification({
                        to: destinataire.pushToken,
                        title: `💬 Message de ${senderName || 'votre correspondant'}`,
                        body: notificationBody,
                        sound: 'default',
                        channelId: 'messages',
                        data: {
                            type: 'chat',
                            leaseId,
                            messageId: message.id
                        }
                    });
                }

                // Déclencher également la notification via NotificationService
                const { NotificationService } = await import('@/lib/notification-service');
                await NotificationService.envoyerNotification(
                    destinataireId,
                    "NOUVEAU_MESSAGE_BAIL",
                    {
                        payload: {
                            titre: `Nouveau message de ${senderName || 'votre correspondant'}`,
                            message: notificationBody,
                            smsText: `QAPRIL: Nouveau message de ${senderName || 'votre correspondant'}: ${isE2EE ? 'Nouveau message sécurisé' : contenu.trim().substring(0, 100)}`,
                            leaseId,
                            msgId: message.id
                        }
                    }
                ).catch((err: any) => console.warn('[Chat POST] NotificationService warning:', err));

            } catch (notifErr) {
                console.warn('[Chat POST] Erreur envoi push:', notifErr);
            }
        }

        return NextResponse.json({ success: true, message });

    } catch (error) {
        console.error("[MOBILE API] chat POST error:", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
