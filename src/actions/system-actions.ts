"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { logAction } from "./audit"
import { AppFeature } from "@/lib/features"

/**
 * Toggles a system feature (M17, M16, etc.)
 */
export async function toggleFeature(feature: AppFeature, status: boolean) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
        return { error: "Non autorisé" }
    }

    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "feature_flags" }
        })

        let flags: Record<string, boolean> = {}
        if (config && config.value) {
            flags = config.value as Record<string, boolean>
        }

        flags[feature] = status

        await prisma.systemConfig.upsert({
            where: { key: "feature_flags" },
            create: {
                key: "feature_flags",
                value: flags
            },
            update: {
                value: flags
            }
        })

        await logAction({
            action: status ? "ENABLE_FEATURE" : "DISABLE_FEATURE",
            module: "SYSTEM",
            entityId: feature,
            newValues: { status }
        })

        revalidatePath("/admin/system")
        return { success: true }
    } catch (error) {
        console.error("[SYSTEM] Toggle feature error:", error)
        return { error: "Erreur lors de la mise à jour de la configuration" }
    }
}

/**
 * Gets all current feature flags
 */
export async function getFeatureFlags(): Promise<Record<string, boolean>> {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "feature_flags" }
        })

        if (!config || !config.value) return {}
        return config.value as Record<string, boolean>
    } catch (error) {
        console.error("[SYSTEM] Get flags error:", error)
        return {}
    }
}
