import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
            async start(controller) {
                let isClientConnected = true;
                
                // Gérer l'annulation côté client
                req.signal.addEventListener('abort', () => {
                    isClientConnected = false;
                    console.log(`[SSE] Connexion interrompue par le client (${user.id})`);
                });

                // Envoi d'un premier message pour valider la connexion
                const sendInitialData = async () => {
                    try {
                        const notifications = await prisma.notification.findMany({
                            where: { userId: user.id },
                            orderBy: { createdAt: 'desc' },
                            take: 20
                        });
                        
                        const payload = `data: ${JSON.stringify(notifications)}\n\n`;
                        controller.enqueue(encoder.encode(payload));
                    } catch (e) {
                        console.error("[SSE] Erreur requête initiale:", e);
                    }
                };

                await sendInitialData();

                // Boucle de polling optimisée (uniquement les nouveaux messages)
                let lastChecked = new Date();

                while (isClientConnected) {
                    // Pause de 10 secondes pour ne pas surcharger la BDD
                    await new Promise((resolve) => setTimeout(resolve, 10000));

                    if (!isClientConnected) break;

                    try {
                        const newNotifications = await prisma.notification.findMany({
                            where: {
                                userId: user.id,
                                createdAt: { gt: lastChecked }
                            },
                            orderBy: { createdAt: 'desc' }
                        });

                        if (newNotifications.length > 0) {
                            lastChecked = new Date();
                            // Pour simplifier côté client, on peut renvoyer toutes les notifs récentes 
                            // (ou juste un flag invitant le client à rafraîchir, mais l'idéal est d'envoyer la liste mise à jour complète)
                            const allNotifications = await prisma.notification.findMany({
                                where: { userId: user.id },
                                orderBy: { createdAt: 'desc' },
                                take: 20
                            });
                            
                            const payload = `data: ${JSON.stringify(allNotifications)}\n\n`;
                            controller.enqueue(encoder.encode(payload));
                        }
                        
                        // Keep-alive (évite que le proxy ne coupe la connexion inactive)
                        controller.enqueue(encoder.encode(":\n\n")); 
                        
                    } catch (error) {
                        console.error("[SSE] Erreur dans la boucle:", error);
                        // On n'interrompt pas la boucle en cas d'erreur réseau temporaire
                    }
                }
            },
            cancel() {
                console.log(`[SSE] Stream annulé côté serveur (${user.id})`);
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // Désactive le buffer Nginx/Hostinger
            },
        });

    } catch (error) {
        console.error('[SSE] Erreur de setup:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
