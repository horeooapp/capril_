"use server";

import { prisma } from "@/lib/prisma";
import { FloatPool, FloatMovement, CDCDeposit, VaultCaution } from "@prisma/client";

/**
 * Creates or updates a Float Pool configuration.
 */
export async function upsertFloatPool(data: {
    compteRef: string;
    partenaireBanque: string;
    tauxRendement?: number;
}) {
    try {
        const pool = await prisma.floatPool.create({
            data: {
                compteRef: data.compteRef,
                partenaireBanque: data.partenaireBanque,
                tauxRendement: data.tauxRendement || 4.5,
                soldeTotal: 0,
                soldeDisponible: 0,
            }
        });
        return { success: true, pool };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Consign a deposit into a Float Pool.
 */
export async function consignDeposit(
    depositId: string, 
    depositType: "CDC_DEPOSIT" | "VAULT_CAUTION", 
    poolId: string
) {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Fetch deposit amount and verify it hasn't been consigned yet
            let amount = 0;
            if (depositType === "CDC_DEPOSIT") {
                const dep = await tx.cDCDeposit.findUnique({ where: { id: depositId } });
                if (!dep) throw new Error("Deposit not found");
                if (dep.floatEntreeAt) throw new Error("Deposit is already in a pool");
                amount = dep.amount;
                
                await tx.cDCDeposit.update({
                    where: { id: depositId },
                    data: { floatEntreeAt: new Date(), status: "CONSIGNED" }
                });
            } else {
                const vault = await tx.vaultCaution.findUnique({ where: { id: depositId } });
                if (!vault) throw new Error("Vault caution not found");
                if (vault.floatPoolId) throw new Error("Caution is already in a pool");
                amount = vault.montant;

                await tx.vaultCaution.update({
                    where: { id: depositId },
                    data: { floatPoolId: poolId }
                });
            }

            // 2. Update Pool Balances
            const pool = await tx.floatPool.update({
                where: { id: poolId },
                data: {
                    soldeTotal: { increment: amount },
                    soldeDisponible: { increment: amount }
                }
            });

            // 3. Create Movement
            const movement = await tx.floatMovement.create({
                data: {
                    poolId,
                    sourceType: depositType,
                    sourceId: depositId,
                    type: "ENTREE",
                    montant: amount,
                    soldeApres: pool.soldeTotal,
                    dateValeur: new Date()
                }
            });

            return { success: true, movement, pool };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Release a deposit from a Float Pool (restitution)
 */
export async function releaseDeposit(
    depositId: string, 
    depositType: "CDC_DEPOSIT" | "VAULT_CAUTION"
) {
    try {
        return await prisma.$transaction(async (tx) => {
            let amount = 0;
            let poolId = "";
            let daysConsigned = 0;
            let yieldGenerated = 0;
            const dateSortie = new Date();

            if (depositType === "CDC_DEPOSIT") {
                const dep = await tx.cDCDeposit.findUnique({ where: { id: depositId } });
                if (!dep || !dep.floatEntreeAt) throw new Error("Deposit is not in a pool");
                amount = dep.amount;
                
                // For CDC_DEPOSIT, we need to find the pool from the ENTREE movement
                const entryMovement = await tx.floatMovement.findFirst({
                    where: { sourceId: depositId, sourceType: "CDC_DEPOSIT", type: "ENTREE" },
                    orderBy: { createdAt: 'desc' }
                });
                if (!entryMovement) throw new Error("Could not trace original pool");
                poolId = entryMovement.poolId;

                // Calculate Yield
                const pool = await tx.floatPool.findUnique({ where: { id: poolId }});
                const taux = pool?.tauxRendement || 4.5;
                const diffTime = Math.abs(dateSortie.getTime() - dep.floatEntreeAt.getTime());
                daysConsigned = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                yieldGenerated = (amount * (taux / 100)) * (daysConsigned / 365);

                await tx.cDCDeposit.update({
                    where: { id: depositId },
                    data: { 
                        floatSortieAt: dateSortie, 
                        joursConsignes: daysConsigned,
                        rendementGenere: yieldGenerated,
                        status: "RETURNED" 
                    }
                });
            } else {
                const vault = await tx.vaultCaution.findUnique({ where: { id: depositId } });
                if (!vault || !vault.floatPoolId) throw new Error("Caution is not in a pool");
                amount = vault.montant;
                poolId = vault.floatPoolId;

                // To find floatEntreeAt we look for the movement
                const entryMovement = await tx.floatMovement.findFirst({
                    where: { sourceId: depositId, sourceType: "VAULT_CAUTION", type: "ENTREE" },
                    orderBy: { createdAt: 'desc' }
                });
                const dateEntree = entryMovement ? entryMovement.dateValeur : new Date();

                const pool = await tx.floatPool.findUnique({ where: { id: poolId }});
                const taux = pool?.tauxRendement || 4.5;
                const diffTime = Math.abs(dateSortie.getTime() - dateEntree.getTime());
                daysConsigned = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                yieldGenerated = (amount * (taux / 100)) * (daysConsigned / 365);

                await tx.vaultCaution.update({
                    where: { id: depositId },
                    data: { 
                        floatPoolId: null, // Removed from pool
                        rendementGenere: (vault.rendementGenere || 0) + yieldGenerated
                    }
                });
            }

            // 2. Update Pool Balances
            const pool = await tx.floatPool.update({
                where: { id: poolId },
                data: {
                    soldeTotal: { decrement: amount },
                    soldeDisponible: { decrement: amount }
                }
            });

            // 3. Create Movement
            const movement = await tx.floatMovement.create({
                data: {
                    poolId,
                    sourceType: depositType,
                    sourceId: depositId,
                    type: "SORTIE",
                    montant: amount,
                    soldeApres: pool.soldeTotal,
                    dateValeur: dateSortie,
                    rendementEstime: yieldGenerated
                }
            });

            return { success: true, movement, yieldGenerated };
        });
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
