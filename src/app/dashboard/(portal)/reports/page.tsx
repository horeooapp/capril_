import { getFinancialReports } from "@/actions/report-actions"
import { prisma } from "@/lib/prisma"
import ReportsDashboardClient from "./reports-client"

export default async function ReportsDashboardPage() {
    const reports = await getFinancialReports()



    return <ReportsDashboardClient initialReports={reports} />
}
