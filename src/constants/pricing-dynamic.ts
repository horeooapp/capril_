/**
 * QAPRIL - Tarification Progressive (M-PRIX-DYN)
 * Configuration des frais de service selon le loyer.
 */

export const DYNAMIC_PRICING = {
    /**
     * Frais d'enregistrement de bail (M-PRIX-DYN)
     */
    getRegistrationFee: (rent: number) => {
        if (rent <= 50000) return 3000;
        if (rent <= 150000) return 5000;
        if (rent <= 400000) return 8000;
        if (rent <= 1000000) return 15000;
        return 25000;
    },

    /**
     * Frais de renouvellement de bail
     */
    getRenewalFee: (rent: number) => {
        if (rent <= 50000) return 1500;
        if (rent <= 150000) return 2500;
        if (rent <= 400000) return 4000;
        if (rent <= 1000000) return 7500;
        return 12500;
    },

    /**
     * Frais de service M17 (QAPRIL Service)
     */
    calculateServiceFee: (rent: number) => {
        if (rent <= 50000) return 3000;
        if (rent <= 150000) return 4000;
        if (rent <= 400000) return 5000;
        if (rent <= 1000000) return 8000;
        return 15000;
    }
}
