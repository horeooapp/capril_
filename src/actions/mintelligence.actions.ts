"use server";
// QAPRIL - M-INTELLIGENCE ADD-20 - ILI Indice des Loyers Ivoiriens

import { prisma } from "@/lib/prisma";

// Calculer et sauvegarder l'ILI pour une commune/periode
// RG-M20-05 : maille min 10 baux - ne pas publier en dessous
export async function calculerILI(commune: string, propertyType: string, period: string) {
  // Compter les baux actifs dans ce segment
  const leases = await prisma.lease.findMany({
    where: {
      status:   { in: ["ACTIVE","ACTIVE_DECLARATIF"] },
      property: { commune, propertyType }
    },
    select: { rentAmount: true }
  });

  // RG-M20-05 : minimum 10 baux
  if (leases.length < 10) return { published: false, reason: "Maille < 10 baux" };

  const loyers   = leases.map(l => l.rentAmount).sort((a,b) => a-b);
  const avgRent  = Math.round(loyers.reduce((s,v) => s+v,0) / loyers.length);
  const medRent  = loyers[Math.floor(loyers.length / 2)];
  const trendPct = 0; // A calculer vs periode precedente

  const snapshot = await prisma.observatorySnapshot.upsert({
    where: { id: `${commune}-${propertyType}-${period}`.replace(/[^a-z0-9-]/gi,"_") },
    update: { avgRent, medianRent: medRent, minRent: loyers[0],
              maxRent: loyers[loyers.length-1], sampleCount: leases.length, trendPct },
    create: { commune, propertyType, period, avgRent, medianRent: medRent,
              minRent: loyers[0], maxRent: loyers[loyers.length-1],
              sampleCount: leases.length, trendPct }
  });
  return { published: true, snapshot };
}

// ILI par commune (pour carte / observatoire)
export async function getILIParCommune(period?: string) {
  return prisma.observatorySnapshot.findMany({
    where:   period ? { period } : {},
    orderBy: { commune: "asc" }
  });
}

// Tendance loyers pour une commune
export async function getTendanceLoyers(commune: string, propertyType: string) {
  return prisma.observatorySnapshot.findMany({
    where:   { commune, propertyType },
    orderBy: { period: "asc" }
  });
}

// Market data (pour B2B)
export async function getMarketData(commune: string, propertyType?: string) {
  return prisma.marketData.findMany({
    where: { commune, ...(propertyType ? { propertyType } : {}) }
  });
}
