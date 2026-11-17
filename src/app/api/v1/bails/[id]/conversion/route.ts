import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-08
 * Conversion d'une fiche de bail (bail papier) en bail QAPRIL officiel
 * Règles RG-DCL-23, RG-DCL-24
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: leaseId } = await params;
    const userId = session.user.id;

    const existingLease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        ficheBail: true,
        property: true,
        tenant: true,
        landlord: true
      }
    });

    if (!existingLease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    // RG-DCL-24 : Seule une partie au bail peut proposer la conversion
    const isParty = existingLease.landlordId === userId || existingLease.tenantId === userId;
    if (!isParty) {
      return NextResponse.json(
        { error: "Seules les parties au contrat (bailleur ou locataire) peuvent initier la conversion en bail QAPRIL." },
        { status: 403 }
      );
    }

    // Vérifier que le bail est bien une fiche de bail papier
    if (existingLease.origine !== "PAPIER" && !existingLease.ficheBail) {
      return NextResponse.json(
        { error: "Ce contrat est déjà un bail QAPRIL authentique ou ne provient pas d'une fiche de bail papier." },
        { status: 400 }
      );
    }

    const mentions = (existingLease.ficheBail?.mentions as any) || {};

    // Pré-remplissage du formulaire de bail QAPRIL (RG-DCL-24)
    const rentAmount = Number(mentions.loyer || mentions.loyerMensuel || existingLease.rentAmount || 0);
    const depositAmount = Number(mentions.depotGarantie || mentions.caution || existingLease.depositAmount || 0);
    const advanceAmount = Number(mentions.loyerAvance || mentions.avance || existingLease.advanceAmount || 0);
    const chargesAmount = Number(mentions.charges || existingLease.chargesAmount || 0);
    const billingDay = Number(mentions.jourEcheance || existingLease.billingDay || 5);

    // Date d'effet
    let startDate = existingLease.startDate;
    if (mentions.dateEffet) {
      const parsed = new Date(mentions.dateEffet);
      if (!isNaN(parsed.getTime())) startDate = parsed;
    }

    // Création du brouillon de bail QAPRIL
    const draftLease = await prisma.lease.create({
      data: {
        propertyId: existingLease.propertyId,
        landlordId: existingLease.landlordId,
        tenantId: existingLease.tenantId,
        rentAmount,
        depositAmount,
        advanceAmount,
        chargesAmount,
        billingDay,
        startDate,
        status: "DRAFT",
        origine: "QAPRIL",
        adossementStatut: existingLease.adossementStatut,
        designationDeclaree: existingLease.designationDeclaree || undefined,
        convertiDepuisId: existingLease.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Brouillon de bail QAPRIL créé avec succès à partir de la fiche de bail papier. Les parties peuvent désormais procéder à la signature électronique certifiée par SMS OTP.",
      data: {
        draftLeaseId: draftLease.id,
        convertiDepuisId: existingLease.id,
        origine: "QAPRIL",
        statut: draftLease.status,
        redirectUrl: `/dashboard/leases/${draftLease.id}/finalize`
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-08 POST conversion]", error);
    return NextResponse.json({ error: "Erreur lors de la conversion du bail" }, { status: 500 });
  }
}
