import { getFinancialReports } from "@/actions/report-actions"
import { prisma } from "@/lib/prisma"
import ReportsDashboardClient from "./reports-client"

export default async function ReportsDashboardPage() {
    let reports = await getFinancialReports()

    if (reports.length === 0) {
        await prisma.financialReport.createMany({
            data: [
                {
                    ownerName: "Mme BA Adjoua",
                    period: "Avril 2026",
                    propertiesCount: 2,
                    totalGross: 850000,
                    agencyFee: 85000,
                    tva: 15300,
                    repairCosts: 0,
                    netPayout: 749700,
                    status: "EN_ATTENTE"
                },
                {
                    ownerName: "M. YAO Koffi",
                    period: "Avril 2026",
                    propertiesCount: 1,
                    totalGross: 300000,
                    agencyFee: 30000,
                    tva: 5400,
                    repairCosts: 15000,
                    netPayout: 249600,
                    status: "EN_ATTENTE"
                },
                {
                    ownerName: "Mme BA Adjoua",
                    period: "Mars 2026",
                    propertiesCount: 2,
                    totalGross: 850000,
                    agencyFee: 85000,
                    tva: 15300,
                    repairCosts: 50000,
                    netPayout: 699700,
                    status: "PAYE"
                }
            ]
        })
        reports = await getFinancialReports()
    }

    return <ReportsDashboardClient initialReports={reports} />
}
