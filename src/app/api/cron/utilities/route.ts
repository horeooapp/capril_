import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReminderService } from "@/lib/reminder-service"; // Supposant l'existence d'un service de relance existant

export async function GET(req: Request) {
    // Dans un environnement Vercel, on vérifie l'en-tête Authorization CRON_SECRET
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliser à minuit

        // Récupérer toutes les factures impayées
        const unpaidUtilities = await prisma.factureUtility.findMany({
            where: {
                statut: { in: ["EN_COURS", "EN_RETARD"] },
                dateLimitePaiement: { not: null }
            },
            include: {
                lease: {
                    include: { tenant: true }
                }
            }
        });

        const notificationsSent = [];

        for (const facture of unpaidUtilities) {
            const dueDate = new Date(facture.dateLimitePaiement!);
            dueDate.setHours(0, 0, 0, 0);

            // Différence en jours
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Règles de relance : 
            // 1. Démarre 10 jours avant la date limite (diffDays === 10)
            // 2. Revient chaque 3 jours : (10, 7, 4, 1) -> (10 - diffDays) % 3 === 0
            // 3. Cas critique : J-0 et En retard (diffDays <= 0 && diffDays > -10) -> Relance tous les jours ou tous les 3 jours
            
            let shouldRemind = false;
            let urgency = "INFO";

            if (diffDays === 10) {
                shouldRemind = true;
            } else if (diffDays < 10 && diffDays > 0) {
                // (10 - 7) = 3 % 3 == 0 (OUI) -> donc au jour 7
                // (10 - 4) = 6 % 3 == 0 (OUI) -> donc au jour 4
                // (10 - 1) = 9 % 3 == 0 (OUI) -> donc au jour 1
                if ((10 - diffDays) % 3 === 0) {
                    shouldRemind = true;
                    urgency = diffDays <= 4 ? "WARNING" : "INFO";
                }
            } else if (diffDays <= 0) {
                // En retard
                if (Math.abs(diffDays) % 3 === 0) {
                    shouldRemind = true;
                    urgency = "CRITICAL";
                }
            }

            if (shouldRemind && facture.lease?.tenant) {
                // Simuler l'envoi de notification
                const msg = `QAPRIL - Facture ${facture.typeUtility} (${facture.montantTotal} FCFA) à régler avant le ${dueDate.toLocaleDateString()}. Date Limite ${diffDays > 0 ? `dans ${diffDays} jours` : 'DÉPASSÉE'}.`;
                
                // await ReminderService.sendSMS(facture.lease.tenant.phone, msg);
                // On log dans la table ReminderLog pour le suivi UI Dashboard
                await prisma.reminderLog.create({
                    data: {
                        leaseId: facture.leaseId,
                        type: `RELANCE_${facture.typeUtility}_${urgency}`,
                        sentAt: new Date(),
                        status: "SENT"
                    }
                });

                notificationsSent.push({
                    leaseId: facture.leaseId,
                    typeUtility: facture.typeUtility,
                    tenant: (facture.lease.tenant.firstName ? facture.lease.tenant.firstName + " " : "") + (facture.lease.tenant.lastName || ""),
                    diffDays,
                    urgency
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: unpaidUtilities.length,
            reminded: notificationsSent.length,
            details: notificationsSent
        });

    } catch (error: any) {
        console.error("Cron Utility Engine Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
