"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getRentCertificateData(leaseId: string) {
    const session = await auth();
    if (!session || !session.user) throw new Error("Unauthorized");

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: {
            tenant: {
                select: { name: true, email: true, phone: true }
            },
            unit: {
                include: {
                    property: {
                        select: { name: true, address: true, city: true }
                    }
                }
            },
            receipts: {
                orderBy: { createdAt: 'desc' },
                take: 3,
                where: { status: 'PAID' }
            }
        }
    });

    if (!lease) throw new Error("Lease not found");

    // Eligibility check: must have at least one paid receipt and no major arrears (simplified)
    const isEligible = lease.receipts.length > 0;

    return {
        lease,
        isEligible,
        generatedAt: new Date().toISOString(),
        issuer: "QAPRIL AUTOMATED SYSTEM"
    };
}

export async function getFinancialReportData(userId: string) {
    const session = await auth();
    // Allow self or admin
    if (!session || (session.user.id !== userId && session.user.role !== 'ADMIN')) {
        throw new Error("Unauthorized");
    }

    const wallet = await prisma.userWalletConfig.findUnique({
        where: { userId },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    if (!wallet) throw new Error("Wallet not found");

    const transactions = await prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        take: 50 // Last 50 transactions for the report
    });

    // Calculate annual stats
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    const yearlyIncome = transactions
        .filter(t => new Date(t.createdAt) >= startOfYear && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const yearlyExpenses = transactions
        .filter(t => new Date(t.createdAt) >= startOfYear && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
        user: wallet.user,
        balance: wallet.walletBalance,
        transactions,
        stats: {
            yearlyIncome,
            yearlyExpenses,
            net: yearlyIncome - yearlyExpenses
        },
        year: now.getFullYear(),
        generatedAt: now.toISOString()
    };
}
