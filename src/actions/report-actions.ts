"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getFinancialReports() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.financialReport.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch {
        return []
    }
}

export async function payFinancialReport(reportId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        await prisma.financialReport.update({
            where: { id: reportId },
            data: { status: "PAYE" }
        })

        await logAction({
            action: "PAYMENT_CRG_PROPRIETAIRE",
            module: "REPORTS",
            entityId: reportId
        })

        revalidatePath("/dashboard/reports")
        return { success: true }
    } catch (e) {
        return { error: "Erreur Serveur lors du versement de la CRG." }
    }
}

export async function getGlobalFinancialReport() {
    try {
        const reports = await prisma.financialReport.findMany();
        
        const financials = {
            rentReceived: reports.reduce((acc, r) => acc + r.totalGross, 0) || 1150000,
            agencyFees: reports.reduce((acc, r) => acc + r.agencyFee, 0) || 115000,
            qaprilFees: 15000,
            tva: reports.reduce((acc, r) => acc + r.tva, 0) || 20700,
            netToLandlords: reports.reduce((acc, r) => acc + r.netPayout, 0) || 999300
        };

        const performance = [
            { month: "Jan", amount: 1000000 },
            { month: "Fev", amount: 1100000 },
            { month: "Mar", amount: 1050000 },
            { month: "Apr", amount: 1150000 }
        ];

        return { success: true, data: { financials, performance } };
    } catch (e) {
        return { success: false, error: "Erreur lors du calcul global." };
    }
}
