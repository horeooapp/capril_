import { EnergyDashboard } from "@/components/dashboard/tenant/EnergyDashboard";
import { getTenantDashboard } from "@/actions/tenant-actions"
import { redirect } from "next/navigation"

export default async function CieSodeciPage() {
  const dashboard = await getTenantDashboard()

  const lease = (dashboard?.success && dashboard?.lease) ? dashboard.lease : null
  const utilities = (dashboard?.success && dashboard?.utilities) ? dashboard.utilities : []

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <EnergyDashboard leaseId={lease?.id || ""} utilities={utilities} />
    </div>
  );
}
