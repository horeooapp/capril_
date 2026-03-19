"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { detectQaprilKey } from "@/constants/migration-mapping"

/**
 * QAPRIL - Module M-MIGRATION
 * Pipeline d'importation (Normalizer -> Validator -> Loader).
 */

export async function createMigrationSession(agenceId: string, fileName: string, format: string) {
    try {
        const session = await prisma.migrationSession.create({
            data: {
                agenceId,
                fichierNom: fileName,
                fichierFormat: format,
                statut: "UPLOADE"
            }
        })
        return { success: true, sessionId: session.id }
    } catch (error) {
        return { success: false, error: "Échec de création de la session de migration." }
    }
}

/**
 * Traite une ligne brute et la charge en Staging.
 */
export async function stageMigrationRow(sessionId: string, agenceId: string, type: string, rawData: any) {
    try {
        // Normalisation simple des clés
        const mappedData: any = {}
        for (const [key, value] of Object.entries(rawData)) {
            const qaprilKey = detectQaprilKey(key)
            if (qaprilKey) {
                mappedData[qaprilKey] = value
            }
        }

        const staging = await prisma.migrationStaging.create({
            data: {
                sessionId,
                agenceId,
                entityType: type,
                rawData,
                mappedData,
                validationStatus: "PENDING"
            }
        })

        return { success: true, stagingId: staging.id }
    } catch (error) {
        return { success: false, error: "Erreur lors du staging de la ligne." }
    }
}

/**
 * Valide les données en staging pour une session.
 * Applique les règles de validation ADD-04 4.3.
 */
export async function validateMigrationSession(sessionId: string) {
    try {
        const agenceId = await prisma.migrationSession.findUnique({
            where: { id: sessionId },
            select: { agenceId: true }
        }).then(s => s?.agenceId)

        if (!agenceId) return { success: false, error: "Session introuvable." }

        const stagingItems = await prisma.migrationStaging.findMany({
            where: { sessionId }
        })

        let errorCount = 0
        let warningCount = 0

        for (const item of stagingItems) {
            const data: any = item.mappedData || {}
            const errors: string[] = []
            const warnings: string[] = []

            // 1. Validation Téléphone (ADD-04 4.3)
            if (data.telephone) {
                const tel = String(data.telephone).replace(/\s/g, "")
                const ciRegex = /^(01|05|07)\d{8}$/
                if (!ciRegex.test(tel)) {
                    errors.push(`Téléphone invalide : ${tel} (format attendu: 07XXXXXXXX)`)
                }
            } else if (item.entityType === "LOCATAIRE") {
                warnings.push("Numéro de téléphone manquant.")
            }

            // 2. Validation Loyer
            if (data.loyer) {
                const loyer = parseFloat(data.loyer)
                if (isNaN(loyer) || loyer <= 0) {
                    errors.push(`Loyer invalide : ${data.loyer}`)
                } else if (loyer > 2000000) {
                    warnings.push(`Loyer élevé (> 2M FCFA) à confirmer.`)
                }
            }

            // 3. Validation Nom Qualité
            if (data.locataire_nom && String(data.locataire_nom).length < 2) {
                warnings.push(`Nom trop court : ${data.locataire_nom}`)
            }

            const status = errors.length > 0 ? "ERROR" : (warnings.length > 0 ? "WARNING" : "VALID")
            if (status === "ERROR") errorCount++
            if (status === "WARNING") warningCount++

            await prisma.migrationStaging.update({
                where: { id: item.id },
                data: {
                    validationStatus: status,
                    errors: errors,
                    warnings: warnings
                }
            })
        }

        await prisma.migrationSession.update({
            where: { id: sessionId },
            data: { 
                statut: "RAPPORT_GENERE",
                nbErreurs: errorCount,
                nbWarnings: warningCount
            }
        })

        return { success: true, errorCount, warningCount }
    } catch (error) {
        return { success: false, error: "Erreur lors de la validation." }
    }
}

/**
 * Commit final du staging vers la production.
 * Utilise une transaction pour garantir l'intégrité (ADD-04 4.1).
 */
export async function commitMigration(sessionId: string) {
    try {
        const session = await prisma.migrationSession.findUnique({
            where: { id: sessionId },
            include: { stagingData: { where: { committed: false, validationStatus: { in: ["VALID", "WARNING"] } } } }
        })

        if (!session) return { success: false, error: "Session introuvable." }

        // Simulation simplifiée du commit (logique complexe de création d'objets)
        // En conditions réelles, on itérerait sur stagingData pour créer Property, User, Lease
        
        await prisma.$transaction(async (tx) => {
            for (const item of session.stagingData) {
                const data: any = item.mappedData
                
                if (item.entityType === "LOGEMENT") {
                    // tx.property.create({ data: { ...data, sourceMigrationId: sessionId } })
                }
                
                // Marquer comme commité
                await tx.migrationStaging.update({
                    where: { id: item.id },
                    data: { committed: true }
                })
            }

            await tx.migrationSession.update({
                where: { id: sessionId },
                data: { 
                    statut: "COMMITE",
                    committedAt: new Date()
                }
            })
        })

        revalidatePath("/admin/migration")
        return { success: true }
    } catch (error) {
        console.error("MIGRATION_COMMIT_ERROR", error)
        return { success: false, error: "Échec du chargement définitif." }
    }
}
