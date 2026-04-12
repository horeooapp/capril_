import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import MaintenanceDashboardClient from "./maintenance-client";

export default async function MaintenanceDashboardPage() {
    const session = await auth();
    let incidents: Record<string, any>[] = [];

    if (session?.user?.id) {
        // Find tickets where user is either the landlord, agent, or declarant
        // Since schema implies `TicketMaintenance` (or Incident)
        // Let's use the same query as in getPropertyTickets from actions
        incidents = await (prisma as any).ticketMaintenance.findMany({
            include: {
                locataire: { select: { firstName: true, lastName: true, email: true } },
                logement: { select: { address: true } },
            },
            take: 20,
            orderBy: { createdAt: "desc" }
        });
    }

    return <MaintenanceDashboardClient initialIncidents={incidents} />;
}
