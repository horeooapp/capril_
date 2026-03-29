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
      const user = await tx.user.update({
        where: { id: userId },
        data: {
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
            newBalance: user.walletBalance,
            ...metadata
          }
        }
      });

      return user;
    });
  }

  /**
   * Débiter le compte (Paiement service/quittance)
   */
  static async debit(userId: string, amount: number, action: string, entityId: string, metadata: any = {}) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
      if (!user) throw new Error("User not found");

      const OVERDRAFT_LIMIT = -1500;
      if (user.walletBalance - amount < OVERDRAFT_LIMIT) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
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
            newBalance: updatedUser.walletBalance,
            ...metadata
          }
        }
      });

      return updatedUser;
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
