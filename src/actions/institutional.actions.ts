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
        const whereClause: any = {};
        if (commune) {
            whereClause.property = { commune };
        }

        const leases = await prisma.lease.findMany({
            where: whereClause,
            select: { rentAmount: true, status: true }
        });

        const totalLeases = leases.length;
        const totalRent = leases.reduce((sum, l) => sum + (l.rentAmount || 0), 0);
        const averageRent = totalLeases > 0 ? Math.round(totalRent / totalLeases) : 175000;

        const totalProperties = await prisma.property.count({
            where: commune ? { commune } : {}
        });
        const activeLeasesCount = leases.filter(l => l.status === "ACTIVE").length;
        const vacantUnits = Math.max(0, totalProperties - activeLeasesCount);
        const vacancyRate = totalProperties > 0 
            ? parseFloat(((vacantUnits / totalProperties) * 100).toFixed(1)) 
            : 0;

        const yieldEstimate = totalProperties > 0 ? 7.5 : 8.0;

        const contenuJson = {
            averageRent,
            vacancyRate,
            yieldEstimate,
            totalPropertiesTracked: totalProperties,
            activeLeasesCount
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

import { auth } from "@/auth"

const DATA_LICENSE_PRICE = 5000000; // 5,000,000 FCFA / an

export async function getInstitutionalLicenses() {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    try {
        const contracts = await prisma.dataLicenseContract.findMany({
            orderBy: { dateDebut: 'desc' }
        });
        return { success: true, contracts }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function purchaseDataLicense(clientNom: string, clientType: string, typeAcces: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Non authentifié")

    try {
        return await prisma.$transaction(async (tx) => {
            const walletTransactions = await tx.walletTransaction.findMany({
                where: { userId: session.user.id, status: "COMPLETED" }
            });

            const balance = walletTransactions.reduce((acc: number, t: any) => {
                return t.type === "CREDIT" ? acc + t.amount : acc - t.amount;
            }, 0);

            if (balance < DATA_LICENSE_PRICE) {
                throw new Error(`Solde insuffisant. La licence annuelle est de ${DATA_LICENSE_PRICE.toLocaleString()} FCFA.`);
            }

            await tx.walletTransaction.create({
                data: {
                    userId: session.user.id,
                    type: "DEBIT",
                    amount: DATA_LICENSE_PRICE,
                    status: "COMPLETED",
                    motif: `Licence Data QAPRIL (Observatoire) - Accès ${typeAcces}`,
                    referenceId: `DATA_${Date.now()}`
                }
            });

            const apiKeyClient = "qdata_" + crypto.randomBytes(24).toString("hex");
            const dateDebut = new Date();
            const dateFin = new Date();
            dateFin.setFullYear(dateFin.getFullYear() + 1);

            const contract = await tx.dataLicenseContract.create({
                data: {
                    clientNom,
                    clientType,
                    typeAcces,
                    montantAnnuel: DATA_LICENSE_PRICE,
                    apiKeyClient,
                    quotaRequetes: 50000,
                    dateDebut,
                    dateFin,
                    statut: "ACTIF"
                }
            });

            return { success: true, contract };
        });
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
