"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Creates a Data License Contract for an institutional partner
 */
export async function createLicenseContract(data: {
    clientNom: string;
    clientType: string; // BANQUE | ASSUREUR | ETAT | PROMOTEUR
    typeAcces: string;  // AGREGAT | API_SCORING | RAPPORT
    montantAnnuel: number;
    quotaRequetes?: number;
}) {
    try {
        const apiKeyClient = "inst_" + crypto.randomBytes(24).toString("hex");
        
        const dateDebut = new Date();
        const dateFin = new Date();
        dateFin.setFullYear(dateDebut.getFullYear() + 1);

        const contract = await prisma.dataLicenseContract.create({
            data: {
                clientNom: data.clientNom,
                clientType: data.clientType,
                typeAcces: data.typeAcces,
                montantAnnuel: data.montantAnnuel,
                quotaRequetes: data.quotaRequetes || 1000,
                apiKeyClient,
                dateDebut,
                dateFin,
                statut: "ACTIF"
            }
        });

        // We return the raw API Key just once
        return { success: true, contract };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Logs an API call made by an institutional partner and checks quota
 */
export async function logApiCall(apiKey: string, endpoint: string, parametres: any) {
    try {
        return await prisma.$transaction(async (tx) => {
            const contract = await tx.dataLicenseContract.findUnique({
                where: { apiKeyClient: apiKey }
            });

            if (!contract) throw new Error("Invalid API Key");
            if (contract.statut !== "ACTIF") throw new Error("Contract is not active");
            if (new Date() > contract.dateFin) throw new Error("Contract has expired");

            // Check quota for the current month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const callsThisMonth = await tx.dataApiCall.count({
                where: {
                    contractId: contract.id,
                    createdAt: { gte: startOfMonth }
                }
            });

            if (callsThisMonth >= contract.quotaRequetes) {
                // Log failed attempt due to quota
                await tx.dataApiCall.create({
                    data: {
                        contractId: contract.id,
                        endpoint,
                        parametres,
                        responseCode: 429
                    }
                });
                throw new Error("Quota exceeded for this month");
            }

            // Log successful attempt
            const apiCall = await tx.dataApiCall.create({
                data: {
                    contractId: contract.id,
                    endpoint,
                    parametres,
                    responseCode: 200
                }
            });

            return { success: true, apiCall };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Generates a Market Report (Mocked)
 */
export async function generateMarketReport(commune: string | null, periode: string) {
    try {
        // In a real application, we would aggregate data here (e.g. average rent from Lease, delinquency rate)
        const contenuJson = {
            averageRent: Math.floor(Math.random() * 200000) + 150000, // 150k - 350k FCFA
            vacancyRate: (Math.random() * 10).toFixed(2), // 0-10%
            yieldEstimate: (Math.random() * 5 + 3).toFixed(2), // 3-8%
        };

        const report = await prisma.marketReport.create({
            data: {
                titre: `Rapport de Marché ${commune ? commune : 'National'} - ${periode}`,
                commune,
                periode,
                typeRapport: "MARCHÉ",
                contenuJson,
                prixFcfa: 100000, // 100k FCFA
                actif: true
            }
        });

        return { success: true, report };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
