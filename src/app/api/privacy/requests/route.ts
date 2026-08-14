import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logPrivacyEvent } from "@/lib/consent-manager";

/**
 * Endpoint de gestion des demandes d'exercice des droits (RGPD Art. 15-22).
 * Permet au DPO/Admin de lister et de mettre à jour le statut des demandes.
 */

// GET /api/privacy/requests - Liste des demandes (Admin/DPO)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès DPO/Admin requis" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const requests = await prisma.privacyRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/privacy/requests - Mettre à jour une demande (Admin/DPO)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès DPO/Admin requis" }, { status: 403 });
    }

    const { requestId, status, adminNotes, rejectionReason } = await req.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const updated = await prisma.privacyRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes,
        rejectionReason,
        completedAt: ["COMPLETED", "REJECTED"].includes(status) ? new Date() : null,
      },
    });

    await logPrivacyEvent({
      userId: updated.userId,
      eventType: "RIGHT_EXERCISED",
      severity: "INFO",
      resource: "privacy_requests",
      details: { requestId, status, adminId: session.user.id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
