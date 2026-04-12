import React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ChargesDashboardClient from "./charges-client"

export const dynamic = 'force-dynamic'

export default async function ChargesPage() {
    const session = await auth()
    if (!session || !session.user) return null

    // Get real properties with Utilities configured
    const properties = await prisma.property.findMany({
        where: { ownerUserId: session.user.id },
        select: { id: true, name: true, propertyCode: true }
    });

    // Get real UtilityBills (FactureUtility)
    const facturesBrutes = await prisma.repartitionUtility.findMany({
        where: {
            facture: {
                repartitions: {
                    some: {
                        leaseLocataire: {
                            property: { ownerUserId: session.user.id }
                        }
                    }
                }
            }
        },
        include: {
            facture: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const factures = facturesBrutes.map((f: any) => ({
        id: f.id,
        montantCharge: f.montantQuotePart,
        createdAt: f.createdAt,
        leaseId: f.leaseLocataireId,
        facture: f.facture
    }));

    return (
        <ChargesDashboardClient 
            properties={properties} 
            factures={factures} 
        />
    )
}
