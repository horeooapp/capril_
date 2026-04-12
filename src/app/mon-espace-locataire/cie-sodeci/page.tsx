import { EnergyDashboard } from "@/components/dashboard/tenant/EnergyDashboard";
import { getTenantDashboard } from "@/actions/tenant-actions"
import { redirect } from "next/navigation"

export default async function CieSodeciPage() {
  const dashboard = await getTenantDashboard()
  
  if (!dashboard.success || !dashboard.hasLease) {
      redirect("/mon-espace-locataire")
  }

  const lease = dashboard.lease as any

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <EnergyDashboard leaseId={lease.id} />
    </div>
  );
}
