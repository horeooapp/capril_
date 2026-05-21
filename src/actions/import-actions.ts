"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { logAction } from "./audit"
import Papa from "papaparse"
import crypto from "crypto"

export async function processCsvImport(csvContent: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Non autorisé" }

    try {
        // Parse CSV
        const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
        const rows = parsed.data as Array<any>;
        
        if (!rows || rows.length === 0) {
            return { error: "Le fichier CSV est vide ou illisible." };
        }

        // Créer une session de migration
        const migration = await prisma.migrationSession.create({
            data: {
                agenceId: session.user.id,
                fichierNom: "Import_QAPRIL.csv",
                fichierFormat: "CSV",
                nbLogements: rows.length,
                nbLocataires: rows.length
            }
        });

        let insertedCount = 0;

        for (const row of rows) {
            // Mapping de colonnes typiques
            const nom = row['Nom'] || row['Tenant Name'] || row['Locataire'];
            const phone = row['Telephone'] || row['Téléphone'] || row['Phone'];
            const loyer = parseInt(row['Loyer'] || row['Rent'] || "0");
            const codeBien = row['Code Bien'] || row['Property Code'] || `IMP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

            if (!nom || !phone) continue;

            // 1. Créer le bien
            const property = await prisma.property.create({
                data: {
                    propertyCode: codeBien,
                    ownerUserId: session.user.id,
                    propertyType: "apartment",
                    commune: "Importée",
                    address: "Adresse importée",
                    city: "Abidjan",
                    declaredRentFcfa: loyer,
                    status: "ACTIVE",
                    managedByUserId: session.user.id
                }
            });

            // 2. Créer ou trouver le locataire
            // Simulation d'un compte utilisateur pour le locataire
            const tenant = await prisma.user.upsert({
                where: { phone: phone },
                update: {},
                create: {
                    phone: phone,
                    firstName: nom.split(' ')[0] || "Import",
                    lastName: nom.split(' ').slice(1).join(' ') || "",
                    role: "TENANT",
                    onboardingComplete: true
                }
            });

            // 3. Créer le bail ? On peut juste créer le staging pour rester propre, ou un bail direct (simulé).
            await prisma.migrationStaging.create({
                data: {
                    sessionId: migration.id,
                    agenceId: session.user.id,
                    entityType: "LOCATAIRE",
                    rawData: row,
                    validationStatus: "VALID"
                }
            });

            insertedCount++;
        }

        await logAction({
            action: "EXECUTE_IMPORT",
            module: "DATA_ENGINEERING",
            entityId: migration.id
        });
        
        return { success: true, count: insertedCount }
    } catch (e) {
        console.error("Import Error:", e);
        return { error: "Erreur serveur pendant l'import CSV." }
    }
}
