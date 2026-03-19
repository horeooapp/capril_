/**
 * QAPRIL - Tarification Officielle 2026 (ADD-05)
 * Toutes les valeurs sont exprimées en FCFA TTC.
 */

export const PRICING = {
    // TVA par défaut à 18%
    TVA_RATE: 0.18,

    // Services Immédiats
    BAILS: {
        ENREGISTREMENT: 3000,
        RENOUVELLEMENT: 1500,
    },

    QUITTANCES: {
        DECLARATIVE: 200,
    },

    CERTIFICATS: {
        LOCATIF: 2000,
    },

    // M17 Frais de service loyer < 100K
    SERVICE_LOYER_MIN: 3000,
}

export type ServiceType = keyof typeof PRICING
