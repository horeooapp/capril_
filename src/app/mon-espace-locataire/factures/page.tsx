import { getTenantDashboard } from "@/actions/tenant-actions"
import { getTenantUtilitiesData } from "@/actions/utility-actions"
import { redirect } from "next/navigation"
import FacturesClient from "./FacturesClient"

export default async function FacturesPage() {
  const dashboard = await getTenantDashboard()

  if (!dashboard.success) {
    redirect("/mon-espace-locataire/login")
  }

  const utilitiesData = await getTenantUtilitiesData()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <FacturesClient
        initialFactures={utilitiesData.factures || []}
        lease={dashboard.lease}
        user={dashboard.user}
      />
    </div>
  )
}
