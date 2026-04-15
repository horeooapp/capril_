import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
    generateReceiptRef, 
    generateQRToken, 
    calculateReceiptHash 
} from '@/lib/financial-utils';
import { generateReceiptPDF } from '@/lib/pdf-generator';

const PRIX_QUITTANCE = Number(process.env.QAPRIL_QUITTANCE_PRIX_FCFA ?? 90);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, leaseId, amount, operator } = body;

        if (!token || !leaseId || !amount) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }

        // 1. Récupérer le bail et les infos nécessaires
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { 
                property: true, 
                landlord: {
                    include: { walletConfig: true }
                },
                tenant: true
            }
        });

        if (!lease) {
            return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
        }

        // 2. RG-QUI-02: Vérification Wallet Bailleur (Comme sur le web)
        const walletBalance = lease.landlord.walletConfig?.walletBalance || 0;
        if (walletBalance < -1500) {
            return NextResponse.json({ 
                error: "Paiement impossible : Le compte du bailleur est débiteur. Veuillez contacter le support." 
            }, { status: 403 });
        }

        // 3. Identification de la période (Pour cet exemple on prend le mois en cours ou le premier impayé)
        const oldestArrear = await prisma.leaseArrear.findFirst({
            where: {
                leaseId,
                status: { in: ["unpaid", "UNPAID", "PARTIAL"] }
            },
            orderBy: { dueDate: "asc" }
        });

        const periodMonth = oldestArrear 
            ? oldestArrear.dueDate.toISOString().slice(0, 7) // YYYY-MM
            : new Date().toISOString().slice(0, 7);

        // 4. Transaction Prisma pour garantir l'atomicité
        const result = await prisma.$transaction(async (tx) => {
            // A. Débiter le wallet bailleur
            await tx.userWalletConfig.upsert({
                where: { userId: lease.landlordId },
                create: { userId: lease.landlordId, walletBalance: -PRIX_QUITTANCE },
                update: { walletBalance: { decrement: PRIX_QUITTANCE } }
            });

            // B. Créer la quittance certifiée
            const receiptRef = await generateReceiptRef(lease.leaseType);
            const qrToken = generateQRToken();
            const paidAt = new Date();
            const totalAmount = amount; // On suppose que le montant envoyé correspond au règlement

            const receiptHash = await calculateReceiptHash({
                leaseId,
                periodMonth,
                totalAmount,
                paidAt
            });

            const receipt = await tx.receipt.create({
                data: {
                    receiptRef,
                    leaseId,
                    periodMonth,
                    rentAmount: lease.rentAmount,
                    chargesAmount: lease.chargesAmount || 0,
                    totalAmount,
                    paymentMethod: "MOBILE_MONEY",
                    paymentRef: `MOB-${operator}-${Date.now()}`,
                    status: "paid",
                    paidAt,
                    qrToken,
                    receiptHash
                }
            });

            // C. Créer l'enregistrement de paiement passerelle
            await tx.paymentPgw.create({
                data: {
                    leaseId,
                    payerUserId: token,
                    amount,
                    currency: "XOF",
                    operator: operator || "MOBILE",
                    status: "CONFIRMEE",
                    paymentRef: receipt.paymentRef ?? "",
                    metadata: { source: "mobile_app_operational" }
                }
            });

            // D. Mettre à jour l'arriéré s'il existe
            if (oldestArrear && amount >= oldestArrear.amount) {
                await tx.leaseArrear.update({
                    where: { id: oldestArrear.id },
                    data: { status: "paid" }
                });
            }

            return { receipt, lease };
        });

        // 5. Génération du PDF à la volée (Base64)
        const pdfBuffer = await generateReceiptPDF({
            receiptRef: result.receipt.receiptRef,
            leaseRef: lease.leaseReference || "",
            periodMonth: result.receipt.periodMonth,
            rentAmount: result.receipt.rentAmount,
            chargesAmount: result.receipt.chargesAmount,
            totalAmount: result.receipt.totalAmount,
            paymentMethod: result.receipt.paymentMethod,
            paidAt: result.receipt.paidAt,
            tenantName: `${lease.tenant?.firstName || ""} ${lease.tenant?.lastName || ""}`.trim() || "Locataire",
            propertyAddress: lease.property.address || "Adresse non spécifiée",
            landlordName: `${lease.landlord.firstName || ""} ${lease.landlord.lastName || ""}`.trim() || "Bailleur",
            receiptHash: result.receipt.receiptHash || undefined,
            qrToken: result.receipt.qrToken || undefined
        });

        const pdfBase64 = pdfBuffer.toString('base64');

        return NextResponse.json({
            success: true,
            message: "Paiement opérationnel effectué",
            receiptRef: result.receipt.receiptRef,
            pdfBase64
        });

    } catch (error: any) {
        console.error("Erreur Paiement Mobile Opérationnel:", error);
        return NextResponse.json({ 
            error: "Échec de l'opération : " + (error.message || "Erreur serveur")
        }, { status: 500 });
    }
}
