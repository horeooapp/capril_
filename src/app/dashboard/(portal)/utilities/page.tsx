import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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

    // Fetch real factures
    const propertyIds = multiUnitProps.map((p: any) => p.id);
    const factures = await prisma.factureUtility.findMany({
        where: { lease: { propertyId: { in: propertyIds } } },
        include: {
            lease: {
                include: {
                    tenant: true,
                    repartitionsUtilities: {
                        include: { locataire: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const initialFactures = factures.map((f: any) => ({
        id: f.id,
        type: f.typeUtility,
        montantGlobal: f.montantTotal,
        mois: f.moisFacture, // moisFacture is String in schema
        property: { name: f.lease.property?.name || "N/A" },
        status: f.statut || "EN_COURS",
        repartitions: f.repartitionsUtilities?.map((r: any) => ({
            locataireName: `${r.locataire?.firstName} ${r.locataire?.lastName}`,
            montant: r.montantQuotePart,
            status: r.statutPaiement
        })) || []
    }));

    return <UtilitiesClient properties={multiUnitProps} initialFactures={initialFactures} />
}
