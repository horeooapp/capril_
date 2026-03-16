"use server"

import { prisma } from "./prisma"

export type AppFeature = 
    | "M17_FISCAL" 
    | "M16_ANAH" 
    | "CDC_CONSIGNATION" 
    | "ASSURANCE_LOYER" 
    | "MEDIATION_CENTER"
    | "KYC_VERIFICATION"
    | "SMS_NOTIFICATIONS"
    | "USSD_PORTAL"
    | "NEWS_TICKER"
    | "LANDING_PAGE"

/**
 * Checks if a feature is enabled in the system config.
 * Default is TRUE if not specified.
 */
export async function isFeatureEnabled(feature: AppFeature): Promise<boolean> {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key: "feature_flags" }
        })

        if (!config || !config.value) return true

        const flags = config.value as Record<string, boolean>
        return flags[feature] !== false // Default to true if not set
    } catch (error) {
        console.error(`[FEATURES] Error checking ${feature}:`, error)
        return true // Fallback to true to avoid breaking the app if DB is down
    }
}

/**
 * Ensures a feature is enabled, otherwise throws a Redirect or Error.
 */
export async function ensureFeatureEnabled(feature: AppFeature) {
    const enabled = await isFeatureEnabled(feature)
    if (!enabled) {
        throw new Error(`Le module ${feature} est actuellement désactivé par l'administrateur.`)
    }
}
