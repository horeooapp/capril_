import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { NextResponse } from 'next/server';
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

        // Validation de sécurité avec JWT
        if (!token || !leaseId || !amount) {
            return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
        }

        const payload = await verifyMobileToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Non autorisé. Jeton invalide ou expiré." }, { status: 401 });
        }
        
        const payeurId = payload.userId;

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

        // [SEC-FIX F-02] Vérification IDOR : l'utilisateur authentifié doit être le locataire du bail
        // Sans cette vérification, n'importe quel locataire peut payer le bail de quelqu'un d'autre
        if (lease.tenantId !== payeurId) {
            console.warn(`[SECURITY] IDOR attempt: user ${payeurId} tried to pay lease ${leaseId} owned by tenant ${lease.tenantId}`);
            return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
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
            // [SEC-FIX F-07] Le montant est lu depuis la DB, jamais depuis le client
            // Cela empêche le price tampering (envoyer amount: 1 pour un loyer de 150 000 FCFA)
            const totalAmount = lease.rentAmount + (lease.chargesAmount || 0);

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
                    moisConcerne: new Date(),
                    payeurId: payeurId,
                    beneficiaireId: lease.landlordId || payeurId,
                    montant: amount,
                    canal: operator === 'WAVE' ? 'WAVE' : (operator === 'MTN' ? 'MTN' : 'ORANGE'),
                    statut: "CONFIRMEE",
                    refInterne: `PGW-${Date.now()}`,
                    quittanceId: receipt.id
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
