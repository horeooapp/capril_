/**
 * QAPRIL - Tarification Progressive (M-PRIX-DYN)
 * Configuration des frais de service selon le loyer.
 */

export const DYNAMIC_PRICING = {
    // Frais fixes ou pourcentage selon le loyer mensuel TTC
    calculateServiceFee: (rentAmount: number) => {
        if (rentAmount <= 50000) return 1000; // Social/Populaire
        if (rentAmount <= 150000) return 3000; // Standard (Prix actuel)
        
        // Premium : 2% du loyer avec un minimum de 3000
        const percentageFee = Math.round(rentAmount * 0.02);
        return Math.max(3000, percentageFee);
    }
}
