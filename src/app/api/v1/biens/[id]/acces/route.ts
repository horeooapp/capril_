import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { BienRole } from "@prisma/client";

function normalizePhoneCI(phone: string): string {
  const digits = String(phone || "").replace(/[^0-9]/g, "");
  if (digits.startsWith("225") && digits.length === 13) return `+${digits}`;
  if (digits.length === 10) return `+225${digits}`;
  return phone.trim();
}

/**
 * ROL-01 — GET /api/v1/biens/[id]/acces
 * Lister tous les accès actifs sur un bien (Propriétaire uniquement — Règle Absolue ADD-11)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: propertyId } = await params;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
    }

    if (property.ownerUserId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json(
        { error: "Seul le propriétaire peut consulter la liste complète des accès de ce bien" },
        { status: 403 }
      );
    }

    const acces = await prisma.propertyAccess.findMany({
      where: { propertyId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true, role: true },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({ success: true, count: acces.length, acces });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

/**
 * ROL-02 — POST /api/v1/biens/[id]/acces
 * Inviter un gestionnaire (MANAGER / INTERMEDIAIRE) ou agent terrain (FIELD_AGENT)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id: propertyId } = await params;
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
    }

    if (property.ownerUserId !== user.id && !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json(
        { error: "Seul le propriétaire peut inviter un gestionnaire sur son bien" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawPhone = body.telephone || body.phone;
    const roleRequested = (body.role || "MANAGER").toUpperCase();
    const note = body.note || null;
    const nomIntermediaire = body.nom || body.fullName || "Gestionnaire";

    if (!rawPhone) {
      return NextResponse.json({ error: "Numéro de téléphone requis" }, { status: 400 });
    }

    const validRole: BienRole =
      roleRequested === "FIELD_AGENT"
        ? BienRole.FIELD_AGENT
        : roleRequested === "INTERMEDIAIRE"
        ? BienRole.INTERMEDIAIRE
        : BienRole.MANAGER;

    const phoneNorm = normalizePhoneCI(rawPhone);
    const digits10 = phoneNorm.replace("+225", "");

    let targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: phoneNorm }, { phone: digits10 }, { phone: rawPhone }],
      },
    });

    if (!targetUser) {
      const parts = String(nomIntermediaire).trim().split(/\s+/);
      targetUser = await prisma.user.create({
        data: {
          phone: phoneNorm,
          firstName: parts[0] || "Gestionnaire",
          lastName: parts.slice(1).join(" ") || "",
          role: "NON_CERTIFIED_AGENT",
          status: "INVITED",
        },
      });
    }

    const accessRecord = await prisma.propertyAccess.upsert({
      where: {
        propertyId_userId: {
          propertyId,
          userId: targetUser.id,
        },
      },
      update: {
        role: validRole,
        statut: "ACTIF",
        invitedById: user.id,
        invitedAt: new Date(),
        revokedAt: null,
        note,
      },
      create: {
        propertyId,
        userId: targetUser.id,
        role: validRole,
        profilInterm: "PARENT_AMI",
        statut: "ACTIF",
        invitedById: user.id,
        invitedAt: new Date(),
        note,
      },
    });

    const ownerName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Un propriétaire";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
    const smsText = `${ownerName} vous invite à gérer ses biens sur QAPRIL (${property.name || property.address}). Acceptez l'invitation sur : ${appUrl}/invitations/${accessRecord.id}`;
    await sendSMS(phoneNorm, smsText).catch(() => null);

    return NextResponse.json(
      {
        success: true,
        acces_id: accessRecord.id,
        invitation_token: accessRecord.id,
        acces: accessRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

