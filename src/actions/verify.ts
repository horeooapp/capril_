"use server"

import { prisma } from "@/lib/prisma";

/**
 * Part 21: Verify a QR Token
 * Validates a token against Receipts or Certificates.
 */
export async function verifyQRToken(token: string) {
    try {
        // 1. Check Receipts (By Token, Fingerprint Hash, Official Ref, Payment Ref or ID)
        let receipt = await prisma.receipt.findFirst({
            where: {
                OR: [
                    { qrToken: token },
                    { receiptHash: token },
                    { receiptRef: token },
                    { paymentRef: token },
                    { id: token }
                ]
            },
            include: {
                lease: {
                    include: {
                        property: true,
                        tenant: { select: { firstName: true, lastName: true } },
                        landlord: { select: { firstName: true, lastName: true } }
                    }
                }
            }
        });

        // Fallback: Si le token est une référence de paiement PGW ou PaymentIntent (ex: FP-9611d8a2-...)
        if (!receipt) {
            const pgwPayment = await prisma.paymentPgw.findFirst({
                where: {
                    OR: [
                        { refInterne: token },
                        { refOperateur: token },
                        { id: token }
                    ]
                },
                include: { quittance: { include: { lease: { include: { property: true, tenant: true, landlord: true } } } } }
            });

            if (pgwPayment?.quittance) {
                receipt = pgwPayment.quittance as any;
            } else if (pgwPayment?.leaseId) {
                // Trouver la dernière quittance émise pour ce bail
                receipt = await prisma.receipt.findFirst({
                    where: { leaseId: pgwPayment.leaseId },
                    orderBy: { createdAt: "desc" },
                    include: { lease: { include: { property: true, tenant: true, landlord: true } } }
                }) as any;
            }
        }

        // Fallback: Recherche dans PaymentIntent
        if (!receipt) {
            const match = token.match(/^FP-([a-f0-9-]+)-\d+$/);
            const prefix = match ? match[1] : token;
            const intent = await prisma.paymentIntent.findFirst({
                where: {
                    OR: [
                        { id: token },
                        { operatorRef: token },
                        { id: { startsWith: prefix } }
                    ]
                }
            });

            if (intent) {
                receipt = await prisma.receipt.findFirst({
                    where: { leaseId: intent.leaseId },
                    orderBy: { createdAt: "desc" },
                    include: { lease: { include: { property: true, tenant: true, landlord: true } } }
                }) as any;
            }
        }

        if (receipt) {
            return {
                type: "RECEIPT",
                valid: true,
                receiptId: receipt.id,
                entity: {
                    reference: receipt.receiptRef,
                    amount: receipt.totalAmount,
                    period: receipt.periodMonth,
                    tenant: (receipt.lease?.tenant?.firstName ? receipt.lease.tenant.firstName + " " : "") + (receipt.lease?.tenant?.lastName || ""),
                    landlord: (receipt.lease?.landlord?.firstName ? receipt.lease.landlord.firstName + " " : "") + (receipt.lease?.landlord?.lastName || ""),
                    date: receipt.paidAt,
                    property: receipt.lease?.property?.address || "Logement QAPRIL"
                }
            };
        }

        // 2. Check Certificates
        const certificate = await prisma.certificate.findUnique({
            where: { qrToken: token },
            include: {
                user: { select: { firstName: true, lastName: true } }
            }
        });

        if (certificate) {
            return {
                type: "CERTIFICATE",
                valid: certificate.status === "valid" && new Date(certificate.expiresAt) > new Date(),
                entity: {
                    reference: certificate.id.slice(0, 8).toUpperCase(),
                    type: certificate.certType,
                    holder: (certificate.user.firstName ? certificate.user.firstName + " " : "") + (certificate.user.lastName || ""),
                    issuedAt: certificate.issuedAt,
                    expiresAt: certificate.expiresAt
                }
            };
        }

        return { valid: false, error: "Token non trouvé ou invalide." };

    } catch (error) {
        console.error("[VERIFY_QR_ERROR]", error);
        return { valid: false, error: "Erreur lors de la vérification." };
    }
}
