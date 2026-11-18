import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Exemple de payload attendu par Wave / TresorPay / Orange Money :
// {
//   "transaction_id": "WAVE-948192849",
//   "reference": "cm1abcdef0000g...", // l'ID du Receipt
//   "amount": 150000,
//   "currency": "XOF",
//   "status": "SUCCESS",
//   "sender_phone": "+2250700000000",
//   "operator": "WAVE_CI"
// }

import { checkWebhookSignature } from "@/lib/security";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-webhook-signature") || req.headers.get("x-signature");
        const secret = process.env.MOBILE_MONEY_SECRET || process.env.WEBHOOK_SECRET;

        // 1. Vérification de la signature cryptographique (Open Banking / Agréateurs Mobile Money)
        if (secret) {
            if (!signature) {
                return NextResponse.json({ error: "Missing webhook signature" }, { status: 401 });
            }
            const isValid = await checkWebhookSignature(rawBody, signature, secret);
            if (!isValid) {
                return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
            }
        } else if (process.env.NODE_ENV === "production") {
            console.error("[MOBILE_MONEY_WEBHOOK] MOBILE_MONEY_SECRET non configuré en production!");
            return NextResponse.json({ error: "Configuration de sécurité manquante" }, { status: 500 });
        }

        let payload: any;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const { transaction_id, reference: receiptId, amount, status, operator } = payload;

        if (status !== "SUCCESS") {
            return NextResponse.json({ message: "Transaction ignored (not SUCCESS)" }, { status: 200 });
        }

        // 2. Trouver la quittance (Receipt) correspondante
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: {
                lease: {
                    include: {
                        property: true,
                        tenant: {
                            include: {
                                locataireProfile: true
                            }
                        }
                    }
                }
            }
        });

        if (!receipt) {
            return NextResponse.json({ error: "Receipt not found for reference " + receiptId }, { status: 404 });
        }

        if (receipt.status === "PAYE") {
            return NextResponse.json({ message: "Receipt already paid" }, { status: 200 });
        }

        // Vérification de cohérence du montant encaissé avec la quittance
        if (amount && Math.abs(Number(amount) - Number(receipt.amount)) > 5) {
            console.error(`[MOBILE_MONEY_WEBHOOK] Montant incohérent: reçu ${amount}, attendu ${receipt.amount}`);
            return NextResponse.json({ error: "Montant incohérent avec la quittance" }, { status: 400 });
        }

        // 3. Exécuter l'automatisation en transaction (ACID)
        await (prisma as any).$transaction(async (tx: any) => {
            // A. Marquer la quittance comme PAYÉE et générer un Hash d'intégrité
            const hashData = `${receipt.id}-${transaction_id}-${amount}-${new Date().toISOString()}`;
            const securityHash = crypto.createHash("sha256").update(hashData).digest("hex");

            await tx.receipt.update({
                where: { id: receipt.id },
                data: {
                    status: "PAYE",
                    hash: securityHash,
                    url: `https://www.qapril.net/receipts/${receipt.id}/pdf?hash=${securityHash.substring(0, 8)}` // Simulate PDF generation
                }
            });

            // B. Créditer le Wallet (Portefeuille) du Propriétaire
            const ownerId = (receipt.lease.property as any).ownerId;
            const commissionQapril = amount * 0.08; // 8% commission
            const netAmount = amount - commissionQapril;

            await tx.walletTransaction.create({
                data: {
                    userId: ownerId,
                    type: "CREDIT",
                    amount: Math.round(netAmount),
                    status: "COMPLETED"
                }
            });

            // Log de la commission QAPRIL (Optionnel : si vous avez un compte interne QAPRIL)
            // tx.walletTransaction.create({ data: { userId: "QAPRIL_CORP", type: "COMMISSION", amount: commissionQapril } })

            // C. Améliorer l'Indice de Confiance Locative (Passeport Locatif)
            const tenantId = receipt.lease.tenantId;
            
            // On met à jour le profil public s'il existe
            const publicProfile = await tx.locataireProfilPublic.findUnique({ where: { userId: tenantId } });
            if (publicProfile) {
                // Le score ICL augmente à chaque loyer payé via Mobile Money (+15 points)
                await tx.locataireProfilPublic.update({
                    where: { id: publicProfile.id },
                    data: {
                        iclScore: { increment: 15 }
                    }
                });
            }

            // Mettre à jour le Passeport Locatif (Taux de paiement)
            const passeport = await tx.passeportLocatif.findFirst({ where: { locataireId: tenantId } });
            if (passeport) {
                await tx.passeportLocatif.update({
                    where: { id: passeport.id },
                    data: {
                        scoreGlobal: { increment: 15 },
                        tauxPaiementGlobal: 100 // Simplification : paiement réussi
                    }
                });
            }
        });

        console.log(`[QAPRIL WEBHOOK] Loyé payé avec succès via ${operator}. Receipt: ${receiptId}`);

        return NextResponse.json({ 
            success: true, 
            message: "Automated workflow completed: Receipt PAID, Wallet CREDITED, Trust Score UPDATED." 
        }, { status: 200 });

    } catch (error) {
        console.error("[WEBHOOK ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
