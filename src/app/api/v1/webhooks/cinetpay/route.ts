import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cinetpay } from "@/lib/cinetpay";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // CinetPay sends data as form-urlencoded or JSON. We check the content-type.
    const contentType = req.headers.get("content-type") || "";
    let data: any;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      data = await req.json();
    }

    const cpm_trans_id = data.cpm_trans_id;
    const cpm_site_id = data.cpm_site_id;
    
    // Validate signature (Optional depending on CinetPay version, usually HMAC in header)
    const signature = req.headers.get("x-token") || "";

    if (!cpm_trans_id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    // Verify payment status with CinetPay API
    const verification = await cinetpay.verifyPayment(cpm_trans_id);

    if (verification.success && verification.status === "ACCEPTED") {
      // Find the lease associated with this transaction.
      // Assuming transaction ID was saved somewhere, or transaction ID contains the lease ID.
      // For PATCH-07, let's assume cpm_trans_id = `ENREG_BAIL_${leaseId}`
      const leaseIdMatch = cpm_trans_id.match(/ENREG_BAIL_(.+)/);
      if (leaseIdMatch) {
        const leaseId = leaseIdMatch[1];
        
        const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
        if (lease) {
          const montant = Number(verification.amount);
          
          // Ventilation 50 / 20 / 30
          const partHabiteax = Math.floor(montant * 0.50);
          const partCpraima = Math.floor(montant * 0.20);
          const partReserve = montant - partHabiteax - partCpraima;

          // Transaction atomique
          await prisma.$transaction([
            // Enregistrer la ventilation
            prisma.ventilationFrais.create({
              data: {
                leaseId: lease.id,
                montantTotal: montant,
                partHabiteax,
                partCpraima,
                partReserve,
                webhookRef: cpm_trans_id
              }
            }),
            // Finaliser le bail
            prisma.lease.update({
              where: { id: lease.id },
              data: {
                fraisEnregMontant: montant,
                // On met à jour un statut "FINALISE" si besoin, ou on déclenche le webhook
              }
            })
          ]);
        }
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Erreur Webhook CinetPay:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
