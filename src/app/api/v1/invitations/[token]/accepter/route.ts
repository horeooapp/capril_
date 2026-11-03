import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

/**
 * ROL-05 — POST /api/v1/invitations/[token]/accepter
 * Gestionnaire accepte l'invitation reçue par SMS (R11-UAT-01)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { token } = await params;

    const accessRecord = await prisma.propertyAccess.findUnique({
      where: { id: token },
      include: {
        property: { include: { owner: true } },
        user: true,
      },
    });

    if (!accessRecord) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    }

    if (accessRecord.statut === "REVOQUE") {
      return NextResponse.json({ error: "Cette invitation a été révoquée" }, { status: 400 });
    }

    // Si connecté avec un compte, vérifier qu'il correspond ou lier
    if (user && user.id !== accessRecord.userId && !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json({ error: "Cette invitation est destinée à un autre compte" }, { status: 403 });
    }

    const updated = await prisma.propertyAccess.update({
      where: { id: accessRecord.id },
      data: {
        statut: "ACTIF",
        acceptedAt: new Date(),
      },
    });

    // Notifier le propriétaire de l'acceptation (R11-UAT-01)
    const owner = accessRecord.property?.owner;
    const managerName =
      [accessRecord.user.firstName, accessRecord.user.lastName].filter(Boolean).join(" ").trim() ||
      accessRecord.user.phone ||
      "Votre gestionnaire";

    if (owner?.phone) {
      await sendSMS(
        owner.phone,
        `QAPRIL : ${managerName} a accepté votre invitation pour gérer le bien ${accessRecord.property.name || accessRecord.property.address}.`
      ).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      statut: updated.statut,
      accepted_at: updated.acceptedAt,
      property_id: updated.propertyId,
      role: updated.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

