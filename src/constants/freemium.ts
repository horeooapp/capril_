/**
 * QAPRIL - Configuration Freemium 2026 (M-FREEMIUM)
 * Définit les limites et fonctionnalités par palier.
 */

export const FREEMIUM_CONFIG = {
    LOCATAIRE: {
        maxUnits: 0,
        features: ["PORTAL_ACCESS", "DIGITAL_RECEIPTS", "RENT_CERTIFICATE"],
        price: 0
    },
    ESSENTIEL: {
        maxUnits: 3,
        features: ["BASIC_CRM", "PAYMENT_NOTIFS", "VAT_REPORTING"],
        price: 5000 // Mensuel
    },
    PRO: {
        maxUnits: 20,
        features: ["ADVANCED_CRM", "BULK_RECEIPTS", "ACCOUNTING_EXPORT", "M-BAIL-VERBAL"],
        price: 15000
    },
    PREMIUM: {
        maxUnits: 100,
        features: ["PRIORITY_SUPPORT", "API_ACCESS", "M-FRAUDE-KYC", "M-DIASPORA"],
        price: 50000
    },
    INSTITUTIONNEL: {
        maxUnits: 999999,
        features: ["WHITE_LABEL", "MULTI_ACCOUNT", "CUSTOM_WORKFLOWS", "AUDIT_LOG_FULL"],
        price: 250000
    }
}

export type PlanTier = keyof typeof FREEMIUM_CONFIG
