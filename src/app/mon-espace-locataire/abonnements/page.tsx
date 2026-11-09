import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getTenantDashboard } from "@/actions/tenant-actions"
import AbonnementsClient from "./abonnements-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function TenantAbonnementsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/mon-espace-locataire/login");
    }

    const dashboard = await getTenantDashboard();
    
    const hasLease = dashboard?.success && dashboard?.hasLease;

    // Fetch real subscriptions from DB if lease exists
    const abonnements = hasLease ? await prisma.abonnementOperateur.findMany({
        where: { leaseId: dashboard.lease.id },
        orderBy: { createdAt: "desc" }
    }) : [];

    return <AbonnementsClient lease={hasLease ? dashboard.lease : null} abonnements={abonnements} />
}
