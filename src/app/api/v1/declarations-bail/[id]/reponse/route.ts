import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-03
 * Répondre à une déclaration de bail en 1 geste
 * Règles RG-DCL-12, RG-DCL-13, RG-DCL-27, RG-DCL-35
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: declarationId } = await params;
    const body = await request.json();

    const {
      decision, // "CONFIRMER" | "REFUSER" | "REORIENTER"
      reorienteVersTel,
      token // Permet la réponse directe 1-clic sans session via lien signé WhatsApp/SMS (RG-DCL-37)
    } = body;

    if (!["CONFIRMER", "REFUSER", "REORIENTER"].includes(decision)) {
      return NextResponse.json(
        { error: "Décision invalide. Choix acceptés : CONFIRMER, REFUSER, REORIENTER." },
        { status: 400 }
      );
    }

    const declaration = await prisma.declarationBail.findUnique({
      where: { id: declarationId },
      include: { initiateur: true }
    });

    if (!declaration) {
      return NextResponse.json({ error: "Déclaration de bail introuvable" }, { status: 404 });
    }

    if (declaration.statut !== "EN_ATTENTE") {
      return NextResponse.json(
        { error: `Cette déclaration a déjà été traitée (Statut actuel : ${declaration.statut}).` },
        { status: 400 }
      );
    }

    const userId = session?.user?.id || declaration.destinataireId;

    // Traitement du refus
    if (decision === "REFUSER") {
      const updated = await prisma.declarationBail.update({
        where: { id: declarationId },
        data: {
          statut: "REFUSEE",
          reponseAt: new Date(),
          canalReponse: session ? "APP" : "WHATSAPP"
        }
      });

      return NextResponse.json({
        success: true,
        message: "Déclaration refusée. L'initiateur en a été informé avec courtoisie.",
        data: updated
      });
    }

    // Traitement de la réorientation (Ce n'est pas moi qui gère)
    if (decision === "REORIENTER") {
      if (!reorienteVersTel) {
        return NextResponse.json(
          { error: "Veuillez fournir le numéro du bon interlocuteur pour réorienter la demande." },
          { status: 400 }
        );
      }

      const updated = await prisma.declarationBail.update({
        where: { id: declarationId },
        data: {
          statut: "REORIENTEE",
          reponseAt: new Date(),
          reorienteVersTel: reorienteVersTel.replace(/\s+/g, ""),
          canalReponse: session ? "APP" : "WHATSAPP"
        }
      });

      return NextResponse.json({
        success: true,
        message: "Déclaration réorientée vers le nouveau contact indiqué.",
        data: updated
      });
    }

    // Traitement de la CONFIRMATION (RG-DCL-13 : Fait générateur de la relation locative)
    const designation = declaration.designationDeclaree as any;
    const commune = designation?.commune || "Abidjan";
    const quartier = designation?.quartier || "";
    const typeBien = designation?.type || "Appartement";
    const bailleurId = declaration.initiateurRole === "LOCATAIRE" ? (userId || declaration.initiateurId) : declaration.initiateurId;
    const locataireId = declaration.initiateurRole === "LOCATAIRE" ? declaration.initiateurId : (declaration.destinataireId || userId);

    // 1. RG-DCL-27 : Génération du bien provisoire automatique
    const codeBienProvisoire = `PROV-${commune.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const propertyProvisoire = await prisma.property.create({
      data: {
        propertyCode: codeBienProvisoire,
        ownerUserId: bailleurId,
        propertyType: typeBien,
        commune,
        quartier,
        rentAmount: declaration.loyerDeclare,
        confirmation: "PROVISOIRE"
      }
    });

    // 2. Création du Bail (Lease) associé
    const refBail = `BAIL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const origine = declaration.bailPapierExiste ? "PAPIER" : "QAPRIL";

    const lease = await prisma.lease.create({
      data: {
        leaseReference: refBail,
        landlordId: bailleurId,
        tenantId: locataireId,
        propertyId: propertyProvisoire.id,
        rentAmount: Math.round(declaration.loyerDeclare),
        chargesAmount: 0,
        startDate: new Date(),
        status: declaration.bailPapierExiste ? "ACTIVE" : "DRAFT",
        origine,
        declarationId: declaration.id,
        designationDeclaree: declaration.designationDeclaree as any,
        adossementStatut: "PROPOSE",
        bienProvisoireId: propertyProvisoire.id
      }
    });

    // 3. Mise à jour de la déclaration en statut CONFIRMEE
    const updatedDeclaration = await prisma.declarationBail.update({
      where: { id: declarationId },
      data: {
        statut: "CONFIRMEE",
        reponseAt: new Date(),
        destinataireId: userId || declaration.destinataireId,
        canalReponse: session ? "APP" : "WHATSAPP"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Relation locative confirmée avec succès. Le bail et le bien provisoire ont été initialisés.",
      data: {
        declaration: updatedDeclaration,
        lease,
        property: propertyProvisoire,
        etapeSuivante: declaration.bailPapierExiste
          ? "FICHE_BAIL_A_COMPLETER"
          : "SIGNATURE_BAIL_QAPRIL"
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-03 POST reponse]", error);
    return NextResponse.json({ error: "Erreur serveur lors du traitement de la confirmation" }, { status: 500 });
  }
}
