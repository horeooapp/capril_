"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export async function getSuccessions() {
    const session = await auth()
    if (!session?.user?.id) return []

    try {
        const data = await prisma.successionLocataire.findMany({
            include: { lease: { include: { tenant: true, property: true } } },
            orderBy: { dateDeces: 'desc' }
        })
        
        // Map to format used by Dashboard
        return data.map((s: any) => ({
            id: s.id,
            deceasedName: `${s.lease?.tenant?.firstName} ${s.lease?.tenant?.lastName}`,
            claimantName: s.beneficiaireExtNom || 'Non défini',
            relation: s.declarantType || 'Famille',
            propertyInfo: s.lease?.property?.propertyCode,
            notaire: 'Liquidateur désigné',
            createdAt: s.dateDeces,
            status: 'TRANSFERT_LEGAL'
        }))
    } catch {
        return []
    }
}

export async function createSuccession(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    const leaseId = formData.get("leaseId") as string
    const dateDeces = formData.get("dateDeces") as string
    const beneficiaireExtNom = formData.get("beneficiaireExtNom") as string
    const declarantType = formData.get("declarantType") as string
    const declarantPhone = formData.get("declarantPhone") as string

    if (!leaseId || !dateDeces || !beneficiaireExtNom) {
        return { error: "Veuillez remplir toutes les informations obligatoires." }
    }

    try {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId }
        })

        if (!lease) {
            return { error: "Bail introuvable." }
        }

        const dataPayload: any = {
            leaseId,
            tenantId: lease.tenantId,
            dateDeces: new Date(dateDeces),
            beneficiaireExtNom,
            declarantType,
            declarantPhone
        }

        await prisma.successionLocataire.create({
            data: dataPayload
        })

        await logAction({
            action: "CREATE_SUCCESSION_DOSSIER",
            module: "SUCCESSION",
            entityId: session.user.id
        })

        revalidatePath("/dashboard/succession")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { error: "Erreur technique lors de la création du dossier." }
    }
}
