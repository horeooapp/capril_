"use server"

import { prisma } from "@/lib/prisma"

export interface DashboardAggregates {
    walletBalance: number;
    activeLeasesCount: number;
    occupancyRate: number;
    pendingReclamationsCount: number;
    totalPortfolioValue: number;
    recentPayments: Array<{
        locataire: string;
        mois: string;
        montant: string;
        mode: string;
        statut: string;
        color: string;
    }>;
    alerts: Array<{
        icon: string;
        text: string;
        btn: string;
    }>;
}

export async function getDashboardAggregates(userId: string, role: string): Promise<DashboardAggregates> {
    const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

    // Determines properties scope based on role logic
    let propertyCondition = {};
    if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(role)) {
        propertyCondition = { managedByUserId: userId };
    } else {
        propertyCondition = {
            OR: [
                { ownerUserId: userId },
                { managedByUserId: userId }
            ]
        };
    }

    // 1. Calculate Wallet Balance
    const walletTransactions = await prisma.walletTransaction.findMany({
        where: { userId: userId, status: "COMPLETED" }
    });

    const walletBalance = walletTransactions.reduce((acc, curr) => {
        if (["CREDIT", "RECHARGE", "REVERSEMENT"].includes(curr.type)) return acc + curr.amount;
        if (["DEBIT", "WITHDRAWAL", "PAYMENT"].includes(curr.type)) return acc - curr.amount;
        return acc;
    }, 0);

    // 2. Fetch Operational Metrics
    const [totalUnits, occupiedUnits, activeLeasesCount, pendingReclamationsCount] = await Promise.all([
        prisma.property.count({ where: propertyCondition }),
        prisma.property.count({ where: { ...propertyCondition, status: "active", leases: { some: { status: "ACTIVE" } } } }),
        prisma.lease.count({ where: { property: propertyCondition, status: "ACTIVE" } }),
        prisma.reclamationLocataire.count({ 
            where: { 
                lease: { property: propertyCondition },
                statut: { in: ["OUVERT", "EN_COURS"] }
            } 
        })
    ]);

    const activeLeases = await prisma.lease.findMany({
        where: { property: propertyCondition, status: "ACTIVE" },
        select: { rentAmount: true, chargesAmount: true }
    });
    const totalPortfolioValue = activeLeases.reduce((sum, l) => sum + l.rentAmount + l.chargesAmount, 0);
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // 3. Fetch Recent Receipts
    const recentReceipts = await prisma.receipt.findMany({
        where: {
            lease: { property: propertyCondition },
            status: { in: ["paid", "PAYE"] }
        },
        orderBy: { paidAt: 'desc' },
        take: 5,
        include: {
            lease: { include: { tenant: true } }
        }
    });

    const mappedPayments = recentReceipts.map(r => {
        const tenantName = r.lease.tenant ? `${r.lease.tenant.firstName || ''} ${r.lease.tenant.lastName || ''}`.trim() : "Anonyme";
        const dateObj = new Date(r.periodMonth + "-01");
        const mois = dateObj.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        
        return {
            locataire: tenantName || "Locataire Inconnu",
            mois: mois,
            montant: `${fmt(r.totalAmount)} ₣`,
            mode: r.paymentMethod || "VIREMENT",
            statut: "COMPLET",
            color: "green"
        };
    });

    // 4. Fetch Alertes (Disputes and Critial Risk)
    const openDisputes = await prisma.dispute.findMany({
        where: {
            lease: { property: propertyCondition },
            status: { in: ["OPEN", "ESCALATED"] }
        },
        take: 3,
        include: {
            lease: { include: { property: true } }
        }
    });

    const mappedAlerts = openDisputes.map(d => ({
        icon: "🔴",
        text: `Contentieux — ${d.type} sur ${d.lease?.property?.name || d.lease?.property?.propertyCode || "logement"}`,
        btn: "Gérer"
    }));

    if (pendingReclamationsCount > 0) {
        mappedAlerts.push({
            icon: "🛠️",
            text: `${pendingReclamationsCount} réclamations techniques en attente`,
            btn: "Voir"
        });
    }

    return {
        walletBalance,
        activeLeasesCount,
        occupancyRate,
        pendingReclamationsCount,
        totalPortfolioValue,
        recentPayments: mappedPayments,
        alerts: mappedAlerts.slice(0, 5)
    };
}
