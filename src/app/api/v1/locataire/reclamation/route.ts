import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { PaymentCanal, DeclStatut } from "@prisma/client";

/**
 * REC-01 — POST /api/v1/locataire/reclamation
 * Créer une réclamation / déclaration de quittance depuis l'app locataire ou WhatsApp (ADD-11 Section 4 & 5.3)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();

    const lease = await prisma.lease.findFirst({
      where: {
        id: body.bail_id || body.leaseId || undefined,
        tenantId: user.id,
        status: { in: ["ACTIVE", "ACTIVE_DECLARATIF", "LOYER_IMPAYE"] as any },
      },
      include: {
        property: {
          include: {
            owner: true,
            accessRoles: {
              where: {
                role: { in: ["MANAGER", "INTERMEDIAIRE"] as any },
                statut: "ACTIF",
              },
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lease) {
      return NextResponse.json({ error: "Aucun bail actif trouvé pour votre compte" }, { status: 404 });
    }

    const amount = Number(body.montant || body.amount || lease.rentAmount || 0);
    const canal =
      body.canal === "WHATSAPP" ? PaymentCanal.WHATSAPP : PaymentCanal.SMS_DECLARATIF;

    const declaration = await prisma.smsDeclaration.create({
      data: {
        leaseId: lease.id,
        tenantId: user.id,
        montantDeclare: amount,
        canal,
        statut: DeclStatut.EN_ATTENTE,
        smsBrut: body.description || `Réclamation quittance (${amount} FCFA)`,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const managers = lease.property?.accessRoles || [];
    const recipients =
      managers.length > 0
        ? managers.map((m) => m.user).filter(Boolean)
        : lease.property?.owner
        ? [lease.property.owner]
        : [];

    const tenantName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.phone || "Locataire";
    const unitLabel =
      lease.property?.unitLabel || lease.property?.name || lease.property?.address || "Logement";

    const alertMsg = `QAPRIL : ${tenantName} (${unitLabel}) déclare avoir payé ${amount.toLocaleString("fr-FR")} FCFA. Confirmez-vous ? Répondez OUI ou NON.`;

    for (const r of recipients) {
      if (r?.phone) {
        await sendSMS(r.phone, alertMsg).catch(() => null);
      }
    }

    return NextResponse.json(
      {
        success: true,
        declaration_id: declaration.id,
        statut: declaration.statut,
        montant_declare: amount,
        message:
          "Votre demande de quittance a bien été enregistrée. Une demande de confirmation a été envoyée à votre gestionnaire.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

