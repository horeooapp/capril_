import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getTenantDashboard } from "@/actions/tenant-actions"
import AbonnementsClient from "./abonnements-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TenantAbonnementsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    const dashboard = await getTenantDashboard();
    
    if (!dashboard.success || !dashboard.hasLease) {
        redirect("/mon-espace-locataire");
    }

    // Fetch real subscriptions from DB
    const abonnements = await prisma.abonnementOperateur.findMany({
        where: { leaseId: dashboard.lease.id },
        orderBy: { createdAt: "desc" }
    });

    return <AbonnementsClient lease={dashboard.lease} abonnements={abonnements} />
}
