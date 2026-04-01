import MaintenanceAgencyDash from "@/components/dashboard/maintenance/MaintenanceAgencyDash"
import { getPropertyTickets } from "@/actions/maintenance-actions"

export default async function MaintenancePage() {
    // getPropertyTickets("all") returns tickets for the user
    const tickets = await getPropertyTickets("all").catch(() => []) as any

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
                    Suivi Maintenance
                </h1>
                <p className="text-sm font-medium text-slate-500">
                    Gérez vos tickets d'intervention, suivez les travaux et les prestataires rattachés.
                </p>
            </div>
            
            <MaintenanceAgencyDash initialTickets={tickets || []} />
        </div>
    )
}
