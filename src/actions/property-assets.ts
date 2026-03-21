"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeAuditLog } from "@/lib/audit"
import { ensurePropertyAccess } from "./auth-helpers"

/**
 * Phase 10.2: Add Maintenance Record
 */
export async function addMaintenanceRecord(propertyId: string, data: {
    type: string;
    description: string;
    cost?: number;
    provider?: string;
    date?: string;
}) {
    await ensurePropertyAccess(propertyId)

    try {
        const record = await prisma.propertyMaintenance.create({
            data: {
                propertyId,
                type: data.type,
                description: data.description,
                cost: data.cost,
                provider: data.provider,
                date: data.date ? new Date(data.date) : new Date(),
            }
        })

        await writeAuditLog({
            action: 'MAINTENANCE_RECORD_ADDED',
            module: 'SYSTEM',
            entityId: record.id,
            newValues: { propertyId, type: data.type, cost: data.cost }
        })

        revalidatePath(`/dashboard/properties/${propertyId}/passport`)
        return { success: true, record }
    } catch (error) {
        console.error("Error adding maintenance record:", error)
        return { error: "Erreur lors de l'ajout du record de maintenance." }
    }
}

/**
 * Phase 10.2: Add Property Document
 */
export async function addPropertyDocument(propertyId: string, data: {
    name: string;
    type: string;
    fileUrl: string;
    expiryDate?: string;
}) {
    await ensurePropertyAccess(propertyId)

    try {
        const doc = await prisma.propertyDocument.create({
            data: {
                propertyId,
                name: data.name,
                type: data.type,
                fileUrl: data.fileUrl,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            }
        })

        await writeAuditLog({
            action: 'PROPERTY_DOCUMENT_ADDED',
            module: 'SYSTEM',
            entityId: doc.id,
            newValues: { propertyId, docName: data.name, docType: data.type }
        })

        revalidatePath(`/dashboard/properties/${propertyId}/passport`)
        return { success: true, doc }
    } catch (error) {
        console.error("Error adding property document:", error)
        return { error: "Erreur lors de l'ajout du document." }
    }
}
