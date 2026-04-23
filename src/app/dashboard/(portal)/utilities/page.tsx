import { auth } from "@/auth"
import { getProperties } from "@/actions/property.actions"
import UtilitiesClient from "./utilities-client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function UtilitiesPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    const properties = await getProperties();
    // Filter properties that have units (Cour commune, Immeuble, Residence)
    const multiUnitProps = properties.filter((p: any) => p.typeStructure !== "INDEPENDANT");

    // Fetch existing factures (Placeholder for now, will implement DB fetch later)
    const mockFactures = [
        {
            id: "FAC-001",
            type: "CIE",
            montantGlobal: 45000,
            mois: "Avril 2026",
            property: { name: "Cour Commune Riviera" },
            status: "EN_ATTENTE", // EN_ATTENTE, REPARTIE, PAYEE
            repartitions: [
                { locataireName: "Koné Kassoum", montant: 15000, status: "PAYEE" },
                { locataireName: "Bamba Ali", montant: 30000, status: "EN_ATTENTE" }
            ]
        }
    ];

    return <UtilitiesClient properties={multiUnitProps} initialFactures={mockFactures} />
}
