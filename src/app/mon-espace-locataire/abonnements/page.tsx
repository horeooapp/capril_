import { auth } from "@/auth"
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

    // Mocking existing subscriptions for demo
    const mockAbonnements = [
        {
            id: "DOS-94182",
            operateur: "ORANGE",
            statut: "DOSSIER_GENERE", // BROUILLON, DOSSIER_GENERE, ACTIF
            date: "2026-04-22"
        }
    ];

    return <AbonnementsClient lease={dashboard.lease} abonnements={mockAbonnements} />
}
