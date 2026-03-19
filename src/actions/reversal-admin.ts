"use server"

import { prisma } from "@/lib/prisma";

export async function getRecentPayments() {
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

  return payments;
}
