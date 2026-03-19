"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Process the automatic split of a payment between stakeholders
 * Triggered after a successful PGW webhook
 */
export async function processSplitPayment(paymentId: string) {
  try {
    const payment = await prisma.paymentPgw.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            landlord: true,
            property: true,
          }
        }
      }
    });

    if (!payment || payment.statut !== "CONFIRMEE") {
      return { error: "Paiement non éligible au reversement." };
    }

    if (payment.reversalStatus === "REVERSED") {
      return { error: "Paiement déjà reversé." };
    }

    // 1. Calculate Split
    // For v3.0, we assume a standard 10% commission for agencies if managed
    // In production, this would be fetched from the Mandate or Agency configuration
    const rentAmount = Number(payment.montant);
    const agencyCommissionRate = 0.10; // 10%
    const agencyCommission = rentAmount * agencyCommissionRate;
    const landlordNet = rentAmount - agencyCommission;

    // 2. Identify Recipients
    const agencyId = payment.lease.landlordId; // Simplification for demo: landlord is the agency user context
    const landlordId = payment.lease.property?.ownerUserId; // Real owner

    if (!landlordId) throw new Error("Propriétaire introuvable pour ce bien.");

    // 3. Trigger Transfers (Log for demo)
    console.log(`[M-PAY-AUTO] Initiating reversals for payment ${payment.refInterne}`);
    
    // Transfer to Agency
    await createReversal(paymentId, agencyId, agencyCommission, "AGENCY_COMMISSION");
    
    // Transfer to Landlord
    await createReversal(paymentId, landlordId, landlordNet, "LANDLORD_RENT");

    // 4. Update Payment Status
    await prisma.paymentPgw.update({
      where: { id: paymentId },
      data: {
        reversalStatus: "REVERSED",
        honorairesAgence: agencyCommission,
      }
    });

    revalidatePath("/dashboard/admin/payments");
    return { success: true };

  } catch (error) {
    console.error("Error in split payment:", error);
    await prisma.paymentPgw.update({
      where: { id: paymentId },
      data: { reversalStatus: "FAILED" }
    });
    return { error: "Échec de la ventilation des fonds." };
  }
}

async function createReversal(paymentId: string, recipientId: string, amount: number, type: "AGENCY_COMMISSION" | "LANDLORD_RENT") {
  // Logic to call Wave/CinetPay Transfer API would go here
  const refPgw = `XFER-${Math.random().toString(36).substring(7).toUpperCase()}`;

  await prisma.reversalTransaction.create({
    data: {
      paymentId: paymentId,
      recipientId: recipientId,
      amount: amount,
      type: type,
      referencePgw: refPgw,
      status: "SUCCESS"
    }
  });

  console.log(`[REVERSAL] Sent ${amount} FCFA to ${recipientId} (${type}). Ref: ${refPgw}`);
}

/**
 * Retry a failed reversal manually
 */
export async function retryReversal(paymentId: string) {
  return processSplitPayment(paymentId);
}
