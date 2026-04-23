import { auth } from "@/auth"
import VaultClient from "./vault-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function VaultPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    // Mock VaultCaution data
    const mockVaultData = {
        totalSecuredFcfa: 4500000,
        totalPendingFcfa: 750000,
        cautions: [
            {
                id: "VAULT-001",
                locataire: "Kouadio Jean",
                bien: "Appartement 3 Pièces - Riviera Palmeraie",
                montant: 400000,
                status: "CONSIGNEE",
                hash: "0x8f2a...391c",
                dateConsignation: "2025-10-12"
            },
            {
                id: "VAULT-002",
                locataire: "Bamba Ali",
                bien: "Studio - Angré",
                montant: 150000,
                status: "A_TRANSFERER",
                hash: null,
                dateConsignation: null
            },
            {
                id: "VAULT-003",
                locataire: "Société SGE",
                bien: "Villa Duplex - Cocody",
                montant: 3950000,
                status: "CONSIGNEE",
                hash: "0x3a1f...9b22",
                dateConsignation: "2026-01-05"
            }
        ]
    };

    return <VaultClient data={mockVaultData} />
}
