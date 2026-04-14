"use server"

import { prisma } from "@/lib/prisma"

export interface DashboardAggregates {
    walletBalance: number;
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

    // 1. Calculate Wallet Balance
    const walletTransactions = await prisma.walletTransaction.findMany({
        where: {
            userId: userId,
            status: "COMPLETED"
        }
    });

    const walletBalance = walletTransactions.reduce((acc, curr) => {
        if (curr.type === "CREDIT" || curr.type === "RECHARGE" || curr.type === "REVERSEMENT") {
            return acc + curr.amount;
        } else if (curr.type === "DEBIT" || curr.type === "WITHDRAWAL" || curr.type === "PAYMENT") {
            return acc - curr.amount;
        }
        return acc;
    }, 0);

    // Determines properties scope based on role logic
    let propertyCondition = {};
    if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(role)) {
        propertyCondition = { managedByUserId: userId };
    } else {
        // Owner default
        propertyCondition = {
            OR: [
                { ownerUserId: userId },
                { managedByUserId: userId }
            ]
        };
    }

    // 2. Fetch Recent Receipts
    const recentReceipts = await prisma.receipt.findMany({
        where: {
            lease: {
                property: propertyCondition
            },
            status: {
                in: ["paid", "PAYE"]
            }
        },
        orderBy: {
            paidAt: 'desc'
        },
        take: 5,
        include: {
            lease: {
                include: {
                    tenant: true
                }
            }
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

    // 3. Fetch Alertes (Disputes and Unpaid Leases / Maintenance)
    const openDisputes = await prisma.dispute.findMany({
        where: {
            lease: {
                property: propertyCondition
            },
            status: {
                in: ["OPEN", "ESCALATED"]
            }
        },
        take: 3,
        include: {
            lease: {
                include: { property: true }
            }
        }
    });

    const mappedAlerts = openDisputes.map(d => ({
        icon: "🔴",
        text: `Contentieux ouvert — ${d.type} sur ${d.lease?.property?.name || d.lease?.property?.address || "logement inconnu"}`,
        btn: "Gérer"
    }));

    return {
        walletBalance,
        recentPayments: mappedPayments,
        alerts: mappedAlerts
    };
}
