import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeaseLifecycleService } from "@/lib/lease-lifecycle.service";

/**
 * Next.js API Route Handler for Twenty CRM Webhooks (Mode B - Bidirectional)
 * Receives update notifications from Twenty and propagates modifications back to QAPRIL.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    if (process.env.NODE_ENV === "development") {
      console.log("[TwentyWebhook] Received payload:", JSON.stringify(payload, null, 2));
    }

    const { objectNameSingular, record, updatedFields } = payload;

    if (!objectNameSingular || !record) {
      return NextResponse.json(
        { error: "Invalid webhook payload structure. Expected 'objectNameSingular' and 'record'." },
        { status: 400 }
      );
    }

    // 1. Handle Lease Status Changes: Bail (CRM) -> Lease (QAPRIL)
    if (objectNameSingular === "bail" && updatedFields?.includes("statutBail")) {
      const leaseId = record.externalQaprilId;
      const newStatus = record.statutBail;

      if (!leaseId || !newStatus) {
        return NextResponse.json(
          { error: "Missing 'externalQaprilId' or 'statutBail' in webhook record." },
          { status: 400 }
        );
      }

      console.log(`[TwentyWebhook] Propagating Lease Status change for Lease ID: ${leaseId} -> New Status: ${newStatus}`);

      // Lookup first admin user to associate the audit logs
      const adminUser = await prisma.user.findFirst({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
        },
        select: { id: true },
      });

      // If no admin user is in the database, use a default system placeholder uuid
      const executionUserId = adminUser?.id || "00000000-0000-0000-0000-000000000000";

      try {
        await LeaseLifecycleService.transitionLease(
          leaseId,
          newStatus,
          executionUserId,
          "Mis à jour depuis Twenty CRM (Webhook)"
        );
        return NextResponse.json({
          success: true,
          message: `Lease ${leaseId} status successfully transitioned to ${newStatus}.`,
        });
      } catch (transitionError: any) {
        console.error(`[TwentyWebhook] Failed to transition lease ${leaseId}:`, transitionError);
        return NextResponse.json(
          { error: `Lease transition rejected: ${transitionError.message}` },
          { status: 422 }
        );
      }
    }

    // 2. Handle Property Status changes: BienImmobilier (CRM) -> Property (QAPRIL)
    if (objectNameSingular === "bienImmobilier" && updatedFields?.includes("statutBien")) {
      const propertyId = record.externalQaprilId;
      const newStatus = record.statutBien;

      if (!propertyId || !newStatus) {
        return NextResponse.json(
          { error: "Missing 'externalQaprilId' or 'statutBien' in webhook record." },
          { status: 400 }
        );
      }

      console.log(`[TwentyWebhook] Propagating Property Status change for Property ID: ${propertyId} -> New Status: ${newStatus}`);

      await prisma.property.update({
        where: { id: propertyId },
        data: { status: newStatus },
      });

      return NextResponse.json({
        success: true,
        message: `Property ${propertyId} status successfully updated to ${newStatus}.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Webhook event ignored (no matching actions).",
    });
  } catch (error: any) {
    console.error("[TwentyWebhook] Server error in webhook handler:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
