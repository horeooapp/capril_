"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Récupère l'état du mode Démo depuis la configuration système
 */
export async function getDemoMode() {
    try {
        if (!(prisma as any).systemConfig) return false;
        
        const config = await (prisma as any).systemConfig.findUnique({
            where: { key: "DEMO_MODE" }
        })
        return config?.value === true
    } catch (error) {
        console.error("Erreur lecture DEMO_MODE:", error)
        return false
    }
}

/**
 * Bascule l'état du mode Démo
 */
export async function toggleDemoMode(enabled: boolean) {
    try {
        if (!(prisma as any).systemConfig) throw new Error("Configuration system not initialized");

        await (prisma as any).systemConfig.upsert({
            where: { key: "DEMO_MODE" },
            update: { value: enabled },
            create: { key: "DEMO_MODE", value: enabled }
        })
        
        revalidatePath("/admin")
        return { success: true, enabled }
    } catch (error) {
        console.error("Erreur basculement DEMO_MODE:", error)
        return { success: false, error: "Impossible de changer le mode" }
    }
}
