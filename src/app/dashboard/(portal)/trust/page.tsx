import { getVaultCautions } from "@/actions/trust-actions"
import { prisma } from "@/lib/prisma"
import TrustVaultDashboardClient from "./trust-client"

export default async function TrustVaultDashboardPage() {
    let cautions = await getVaultCautions()

    // Seed init si vide (pour la démo)
    if (cautions.length === 0) {
        await prisma.vaultCaution.createMany({
            data: [
                {
                    tenantName: "KOUAME Jean",
                    propertyInfo: "Appart 04 - Rés. Olympe",
                    amount: 300000,
                    status: "CONSIGNEE",
                    hash: "a3f9c21...8b4",
                    dateConsignation: "10 Avr 2026"
                },
                {
                    tenantName: "TOURE Aminata",
                    propertyInfo: "Studio A - Cour SICOGI",
                    amount: 120000,
                    status: "A_TRANSFERER",
                    hash: "Non consigné"
                },
                {
                    tenantName: "DIABATE Oumar",
                    propertyInfo: "Villa 12 - Riviéra Palmeraie",
                    amount: 1200000,
                    status: "RESTITUEE",
                    hash: "f7d1a22...3c1",
                    dateConsignation: "15 Fév 2025"
                }
            ]
        })
        cautions = await getVaultCautions()
    }

    return <TrustVaultDashboardClient initialCautions={cautions} />
}
