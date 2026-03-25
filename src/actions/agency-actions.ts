"use server"

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAgencyKpis(agencyId: string) {
  try {
    // Calcul de l'occupation
    const totalProperties = await (prisma as any).property.count({ 
      where: { managedByUserId: agencyId } 
    }).catch(() => 0);
    
    const rentedProperties = await (prisma as any).property.count({ 
      where: { managedByUserId: agencyId, status: "rented" } 
    }).catch(() => 0);
    
    const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

    // Calcul des loyers (simulé sur les baux actifs pour la démo/prod initiale)
    const activeLeases = await (prisma as any).lease.findMany({
      where: { agentId: agencyId, status: "ACTIVE" },
      select: { rentAmount: true, chargesAmount: true }
    }).catch(() => []);

    const expectedRent = activeLeases.reduce((acc: number, l: any) => acc + (l.rentAmount + l.chargesAmount), 0);
    
    // Simuler le recouvrement basé sur les quittances du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const collectedReceipts = await (prisma as any).receipt.aggregate({
      where: { 
        lease: { agentId: agencyId },
        status: "paid",
        paidAt: { gte: startOfMonth }
      },
      _sum: { totalAmount: true }
    }).catch(() => ({ _sum: { totalAmount: 0 } }));

    const collectedRent = Number(collectedReceipts._sum.totalAmount || 0);
    const recoveryRate = expectedRent > 0 ? Math.round((collectedRent / expectedRent) * 100) : 0;

    return {
      occupancyRate,
      expectedRent,
      collectedRent,
      recoveryRate,
      outstandingArrears: expectedRent - collectedRent,
      monthlyFees: Math.round(collectedRent * 0.1), // Commission de 10% par défaut
      leaseExpirations: await (prisma as any).lease.count({
        where: {
          agentId: agencyId,
          status: "ACTIVE",
          endDate: { lte: new Date(new Date().setMonth(new Date().getMonth() + 3)) }
        }
      }).catch(() => 0)
    };
  } catch (error: any) {
    console.error("[Agency KPI] Fatal Error:", error);
    if (error.code === 'P2021') {
      throw new Error("Table de données agence manquante dans la base de données.");
    }
    return null;
  }
}

export async function getMyAgencyId() {
    const session = await auth();
    if (!session?.user?.id) return null;
    return session.user.id; // Dans ce modèle, l'ID utilisateur de type AGENCY est l'agenceId
}
