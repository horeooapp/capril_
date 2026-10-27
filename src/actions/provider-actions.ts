"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"

export interface ProviderMetadata {
    commune?: string;
    baseAddress?: string;
    telephoneUrgence?: string;
    zonesIntervention?: string[];
    rccm?: string;
    statutJuridique?: string;
    certifications?: string[];
    sousSpecialites?: string[];
    description?: string;
    experienceAnnees?: number;
    tauxHoraire?: number;
    forfaitDeplacement?: number;
    delaiIntervention?: string;
    disponible247?: boolean;
    garantieMois?: number;
    moyensPaiement?: string[];
}

export interface CreateProviderInput {
    nom: string;
    specialite: string;
    telephone: string;
    telephoneUrgence?: string;
    email?: string;
    adresse?: string;
    commune?: string;
    zonesIntervention?: string[];
    rccm?: string;
    statutJuridique?: string;
    certifications?: string[];
    sousSpecialites?: string[];
    description?: string;
    experienceAnnees?: number;
    tauxHoraire?: number;
    forfaitDeplacement?: number;
    delaiIntervention?: string;
    disponible247?: boolean;
    garantieMois?: number;
    noteMoyenne?: number;
    moyensPaiement?: string[];
}

export async function createProvider(data: CreateProviderInput) {
    try {
        const session = await auth()
        if (!session?.user) return { success: false, error: "Non authentifié" }

        if (!data.nom || !data.specialite || !data.telephone) {
            return { success: false, error: "Veuillez renseigner le nom, le corps de métier et le téléphone." }
        }

        const metadata: ProviderMetadata = {
            commune: data.commune || "Abidjan",
            baseAddress: data.adresse || data.commune || "Abidjan",
            telephoneUrgence: data.telephoneUrgence || undefined,
            zonesIntervention: data.zonesIntervention && data.zonesIntervention.length > 0 ? data.zonesIntervention : [data.commune || "Abidjan"],
            rccm: data.rccm || undefined,
            statutJuridique: data.statutJuridique || "Artisan Indépendant Certifié",
            certifications: data.certifications || [],
            sousSpecialites: data.sousSpecialites || [],
            description: data.description || undefined,
            experienceAnnees: Number(data.experienceAnnees || 5),
            tauxHoraire: Number(data.tauxHoraire || 0),
            forfaitDeplacement: Number(data.forfaitDeplacement || 10000),
            delaiIntervention: data.delaiIntervention || "Sous 4h",
            disponible247: Boolean(data.disponible247),
            garantieMois: Number(data.garantieMois || 3),
            moyensPaiement: data.moyensPaiement || ["WAVE", "ORANGE_MONEY", "VIREMENT"]
        }

        const serializedAdresse = JSON.stringify(metadata)

        const provider = await prisma.prestataire.create({
            data: {
                nom: data.nom.trim(),
                specialite: data.specialite,
                telephone: data.telephone.trim(),
                email: data.email?.trim() || null,
                adresse: serializedAdresse,
                noteMoyenne: data.noteMoyenne || 5.0
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: "CREATE_PROVIDER",
                module: "MAINTENANCE",
                entityId: provider.id,
                newValues: { nom: provider.nom, specialite: provider.specialite }
            }
        }).catch(() => {})

        revalidatePath("/dashboard/providers")
        return { success: true, provider }
    } catch (error: any) {
        console.error("[createProvider Error]", error)
        return { success: false, error: error?.message || "Erreur lors de l'enregistrement de l'artisan." }
    }
}

export async function getAllProviders() {
    try {
        const session = await auth()
        if (!session?.user) return { success: false, error: "Non authentifié", providers: [] }

        const rawProviders = await prisma.prestataire.findMany({
            include: {
                _count: {
                    select: { tickets: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const providers = rawProviders.map(p => {
            let metadata: ProviderMetadata = {
                commune: p.adresse || "Abidjan",
                baseAddress: p.adresse || "Abidjan",
                zonesIntervention: [p.adresse || "Abidjan"],
                statutJuridique: "Artisan Certifié",
                certifications: [],
                sousSpecialites: [],
                disponible247: false,
                delaiIntervention: "Sous 24h",
                tauxHoraire: 15000,
                forfaitDeplacement: 10000,
                garantieMois: 3,
                moyensPaiement: ["WAVE", "ORANGE_MONEY"]
            }

            let displayAddress = p.adresse || "Abidjan"
            if (p.adresse && p.adresse.startsWith("{")) {
                try {
                    const parsed = JSON.parse(p.adresse)
                    metadata = { ...metadata, ...parsed }
                    displayAddress = metadata.baseAddress || metadata.commune || "Abidjan"
                } catch {
                    // Fallback
                }
            }

            return {
                ...p,
                adresseAffichee: displayAddress,
                metadata
            }
        })

        return { success: true, providers }
    } catch (error: any) {
        console.error("[getAllProviders Error]", error)
        return { success: false, error: error?.message || "Erreur de chargement des prestataires", providers: [] }
    }
}

export async function deleteProvider(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return { success: false, error: "Non authentifié" }

        await prisma.prestataire.delete({
            where: { id }
        })

        revalidatePath("/dashboard/providers")
        return { success: true }
    } catch (error: any) {
        console.error("[deleteProvider Error]", error)
        return { success: false, error: error?.message || "Impossible de supprimer ce prestataire." }
    }
}
