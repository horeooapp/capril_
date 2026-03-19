"use server"

import { prisma } from "@/lib/prisma";

export async function generateLandlordStatement(landlordId: string, month: number, year: number) {
  try {
    // Calcul de la synthèse financière pour le CRG
    // 1. Loyers encaissés
    // 2. Commissions agence
    // 3. Travaux/Dépenses déduits
    // 4. Net à reverser
    
    // Ceci est une simulation de la logique de calcul
    const statement = {
      landlordId,
      period: `${month}/${year}`,
      grossRent: 850000,
      commissions: 85000,
      charges: 45000,
      netToPay: 720000,
      generatedAt: new Date(),
    };

    return { success: true, statement };
  } catch (error) {
    return { success: false, error: "Erreur lors de la génération du CRG" };
  }
}

export async function getLandlordFinancialHistory(landlordId: string) {
  try {
    return [
       { period: "02/2026", net: 720000, status: "REVERSE" },
       { period: "01/2026", net: 715000, status: "REVERSE" },
    ];
  } catch (error) {
    return [];
  }
}
