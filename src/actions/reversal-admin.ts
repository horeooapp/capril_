"use server"

import { prisma } from "@/lib/prisma";

export async function getRecentPayments() {
  try {
    // Attempt to fetch payments, using any to bypass dev-time type issues until client is full regenerated
    const payments = await (prisma as any).paymentPgw.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lease: {
          include: {
            landlord: { select: { fullName: true } }
          }
        },
        reversals: true
      },
      take: 20
    });

    return payments || [];
  } catch (error) {
    console.error("[REVERSAL_ADMIN] Error fetching payments:", error);
    return []; // Return empty array to avoid component crash
  }
}
