import { prisma } from "@/lib/prisma";

export type TransactionType = "RECHARGE" | "QUITTANCE_DEBIT" | "ABONNEMENT" | "PENALITE" | "REFUND";

/**
 * Service central pour les transactions wallet QAPRIL.
 * Gère les mises à jour de solde atomiques et l'historique via AuditLog.
 */
export class WalletService {
  /**
   * Créditer le compte (Rechargement réussi)
   */
  static async credit(userId: string, amount: number, reference: string, provider: string = "CINETPAY", metadata: any = {}) {
    return prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le solde utilisateur
      const userWallet = await tx.userWalletConfig.upsert({
        where: { userId: userId },
        create: {
            userId: userId,
            walletBalance: Math.floor(amount)
        },
        update: {
            walletBalance: { increment: Math.floor(amount) }
        }
      });

      // 2. Créer l'entrée d'audit pour l'historique UI
      await tx.auditLog.create({
        data: {
          userId,
          action: "WALLET_CREDIT",
          module: "WALLET",
          entityId: reference,
          newValues: {
            amount,
            type: "RECHARGE",
            provider,
            newBalance: userWallet.walletBalance,
            ...metadata
          }
        }
      });

      return userWallet;
    });
  }

  /**
   * Débiter le compte (Paiement service/quittance)
   */
  static async debit(userId: string, amount: number, action: string, entityId: string, metadata: any = {}) {
    return prisma.$transaction(async (tx) => {
      const userWallet = await tx.userWalletConfig.findUnique({ where: { userId: userId } });
      if (!userWallet) throw new Error("User not found");

      const OVERDRAFT_LIMIT = -1500;
      if (userWallet.walletBalance - amount < OVERDRAFT_LIMIT) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const updatedUserWallet = await tx.userWalletConfig.update({
        where: { userId: userId },
        data: {
            walletBalance: { decrement: Math.floor(amount) }
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "WALLET_DEBIT",
          module: "WALLET",
          entityId,
          newValues: {
            amount,
            action,
            newBalance: updatedUserWallet.walletBalance,
            ...metadata
          }
        }
      });

      return updatedUserWallet;
    });
  }

  /**
   * Récupérer l'historique des transactions depuis AuditLog
   */
  static async getHistory(userId: string, limit: number = 20) {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        module: "WALLET",
        action: { in: ["WALLET_CREDIT", "WALLET_DEBIT", "RECEIPT_PAID"] }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return logs.map(log => {
      const data = log.newValues as any;
      return {
        id: log.id,
        date: log.createdAt,
        type: log.action === "WALLET_CREDIT" ? "CREDIT" : "DEBIT",
        amount: data.amount || 0,
        label: log.action === "WALLET_CREDIT" ? `Rechargement ${data.provider || ''}` : (data.action || "Paiement Quittance"),
        reference: log.entityId,
        balanceAfter: data.newBalance
      };
    });
  }
}
