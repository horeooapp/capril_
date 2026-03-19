"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getGlobalFinancialReport() {
    try {
        const session = await auth();
        if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
            throw new Error("Accès refusé");
        }

        // 1. Chiffre d'affaires total (Quittances payées)
        const receipts = await prisma.receipt.findMany({
            where: { status: "paid" },
            select: { rentAmount: true, chargesAmount: true, totalAmount: true }
        });

        const totalRent = receipts.reduce((sum, r) => sum + r.rentAmount, 0);
        const totalCharges = receipts.reduce((sum, r) => sum + r.chargesAmount, 0);
        const totalVolume = receipts.reduce((sum, r) => sum + r.totalAmount, 0);

        // 2. Honoraires Agence & QAPRIL (Depuis PaymentPgw)
        const payments = await (prisma as any).paymentPgw.findMany({
            where: { statut: "CONFIRMEE" },
            select: { honorairesAgence: true, montant: true }
        });

        const totalAgencyFees = payments.reduce((sum: number, p: any) => sum + Number(p.honorairesAgence || 0), 0);
        // Frais QAPRIL (estimation 2% du volume total pour l'admin)
        const estimatedQaprilFees = Math.floor(totalVolume * 0.02);
        const tva = Math.floor(estimatedQaprilFees * 0.18);

        // 3. Performance sur les 6 derniers mois (Optimisé)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const recentReceipts = await prisma.receipt.findMany({
            where: {
                status: "paid",
                paidAt: { gte: sixMonthsAgo }
            },
            select: { totalAmount: true, periodMonth: true }
        });

        const performanceMap: Record<string, number> = {};
        recentReceipts.forEach(r => {
            performanceMap[r.periodMonth] = (performanceMap[r.periodMonth] || 0) + r.totalAmount;
        });

        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().substring(0, 7);
            
            last6Months.push({
                month: date.toLocaleDateString('fr-FR', { month: 'short' }),
                amount: performanceMap[monthStr] || 0
            });
        }

        return {
            success: true,
            data: {
                totalVolume,
                financials: {
                    rentReceived: totalRent,
                    chargesReceived: totalCharges,
                    agencyFees: totalAgencyFees,
                    qaprilFees: estimatedQaprilFees,
                    tva: tva,
                    netToLandlords: totalVolume - totalAgencyFees - estimatedQaprilFees,
                },
                performance: last6Months
            }
        };
    } catch (error: any) {
        console.error("[Report Action] Error:", error);
        return { success: false, error: error.message };
    }
}
