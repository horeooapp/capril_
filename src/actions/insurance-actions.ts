"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function generateInsuranceContract(leaseId: string) {
    try {
        // Génération d'une police d'assurance liée au bail et enregistrement en base de données.
        await prisma.insurance.create({
            data: {
                leaseId,
                provider: "PARTENAIRE ASSURANCE",
                policyNo: "POL-" + Math.floor(Math.random() * 1000000),
                status: "ACTIVE"
            }
        })
        revalidatePath(`/dashboard/leases/${leaseId}`)
        return { success: true, message: "Document d'assurance généré et police active." }
    } catch (e: any) {
        return { success: false, message: e.message || "Erreur" }
    }
}
