"use server";

import { prisma } from "@/lib/prisma";
import { PaymentCanal } from "@prisma/client";

/**
 * Traite une commission sur une transaction entrante
 * et reverse le reste sur le wallet du bénéficiaire.
 */
export async function processCommissionAndWallet(
    tx: any, 
    paymentPgwId: string, 
    leaseId: string, 
    amountTtc: number, 
    beneficiaireId: string, 
    canal: PaymentCanal
) {
    // 1. Taux par défaut de 1% si aucune configuration trouvée
    let taux = 1.0; 

    // On pourrait chercher un config spécifique au propriétaire, mais on applique 1% en Quick Win.
    const commissionFcfa = Math.round((amountTtc * taux) / 100);
    const montantNet = amountTtc - commissionFcfa;

    // 2. Enregistrement de la commission
    await tx.commissionTransaction.create({
        data: {
            paymentPgwId,
            leaseId,
            montantBrut: amountTtc,
            tauxApplique: taux,
            montantComm: commissionFcfa,
            montantNet: montantNet,
            canal,
            statut: "DEDUITE"
        }
    });

    // 3. Crédit du Wallet du bénéficiaire (propriétaire/agence)
    await tx.walletTransaction.create({
        data: {
            userId: beneficiaireId,
            type: "CREDIT",
            amount: montantNet,
            status: "COMPLETED",
            motif: `Loyer net perçu après commission (1%) - Ref PGW: ${paymentPgwId}`,
            referenceId: paymentPgwId
        }
    });

    return { commissionFcfa, montantNet };
}
