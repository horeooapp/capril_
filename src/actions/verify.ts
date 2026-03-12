"use server"

import { prisma } from "@/lib/prisma";

/**
 * Part 21: Verify a QR Token
 * Validates a token against Receipts or Certificates.
 */
export async function verifyQRToken(token: string) {
    try {
        // 1. Check Receipts (By Token or Fingerprint Hash)
        let receipt = await prisma.receipt.findUnique({
            where: { qrToken: token },
            include: {
                lease: {
                    include: {
                        property: true,
                        tenant: { select: { fullName: true } },
                        landlord: { select: { fullName: true } }
                    }
                }
            }
        });

        // Fallback to searching by receiptHash (fingerprint)
        if (!receipt) {
            receipt = await prisma.receipt.findFirst({
                where: { receiptHash: token },
                include: {
                    lease: {
                        include: {
                            property: true,
                            tenant: { select: { fullName: true } },
                            landlord: { select: { fullName: true } }
                        }
                    }
                }
            }) as any;
        }

        if (receipt) {
            return {
                type: "RECEIPT",
                valid: true,
                entity: {
                    reference: receipt.receiptRef,
                    amount: receipt.totalAmount,
                    period: receipt.periodMonth,
                    tenant: receipt.lease.tenant?.fullName,
                    landlord: receipt.lease.landlord.fullName,
                    date: receipt.paidAt,
                    property: receipt.lease.property.address
                }
            };
        }

        // 2. Check Certificates
        const certificate = await prisma.certificate.findUnique({
            where: { qrToken: token },
            include: {
                user: { select: { fullName: true } }
            }
        });

        if (certificate) {
            return {
                type: "CERTIFICATE",
                valid: certificate.status === "valid" && new Date(certificate.expiresAt) > new Date(),
                entity: {
                    reference: certificate.id.slice(0, 8).toUpperCase(),
                    type: certificate.certType,
                    holder: certificate.user.fullName,
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
