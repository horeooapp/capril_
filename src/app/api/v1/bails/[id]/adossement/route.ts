import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-09 & DCL-10
 * Adossement différé du bien au bail
 * Règles RG-DCL-27 à RG-DCL-31, RG-DCL-35
 */

export async function GET(
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

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: true
      }
    });

    if (!lease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    // Récupérer les biens existants du bailleur pour proposition de rapprochement (RG-DCL-27)
    const biensExistants = await prisma.property.findMany({
      where: {
        ownerUserId: userId,
        confirmation: "CONFIRME"
      },
      select: {
        id: true,
        propertyCode: true,
        propertyType: true,
        commune: true,
        quartier: true,
        rentAmount: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        bailId: lease.id,
        adossementStatut: lease.adossementStatut,
        bienActuel: lease.property,
        biensExistantsProposes: biensExistants,
        designationDeclaree: lease.designationDeclaree
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-09 GET adossement]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: leaseId } = await params;
    const body = await request.json();

    const {
      reponse, // "OUI" | "CORRIGER" | "BIEN_EXISTANT"
      bienExistantId,
      correctionsBien // Données corrigées si "CORRIGER"
    } = body;

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { property: true }
    });

    if (!lease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    const userId = session?.user?.id || lease.landlordId;

    // 1. Réponse "OUI" : Validation du bien provisoire généré
    if (reponse === "OUI") {
      if (lease.propertyId) {
        // Confirmer le bien provisoire
        await prisma.property.update({
          where: { id: lease.propertyId },
          data: {
            confirmation: "CONFIRME",
            confirmeAt: new Date()
          }
        });
      }

      // Adosser définitivement le bail
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          adossementStatut: "CONFIRME",
          adosseAt: new Date(),
          bienProvisoireId: null
        }
      });

      // RG-DCL-35 : Activation rétroactive de la pleine valeur probante sur toutes les quittances
      await prisma.receipt.updateMany({
        where: { leaseId },
        data: {
          valeurProbanteActive: true
        }
      });

      return NextResponse.json({
        success: true,
        message: "Logement confirmé et adossé avec succès à votre patrimoine. Les quittances bénéficient désormais de la pleine certification probante (ARC La Poste, ICL, DGI).",
        data: { adossementStatut: "CONFIRME" }
      });
    }

    // 2. Réponse "CORRIGER" : Ajustement des caractéristiques et validation
    if (reponse === "CORRIGER") {
      if (!correctionsBien || typeof correctionsBien !== "object") {
        return NextResponse.json({ error: "Veuillez fournir les caractéristiques corrigées du bien." }, { status: 400 });
      }

      if (lease.propertyId) {
        await prisma.property.update({
          where: { id: lease.propertyId },
          data: {
            commune: correctionsBien.commune || lease.property?.commune,
            quartier: correctionsBien.quartier || lease.property?.quartier,
            propertyType: correctionsBien.type || lease.property?.propertyType,
            confirmation: "CONFIRME",
            confirmeAt: new Date()
          }
        });
      }

      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          adossementStatut: "CONFIRME",
          adosseAt: new Date(),
          bienProvisoireId: null
        }
      });

      await prisma.receipt.updateMany({
        where: { leaseId },
        data: { valeurProbanteActive: true }
      });

      return NextResponse.json({
        success: true,
        message: "Caractéristiques du logement mises à jour et bien adossé avec succès.",
        data: { adossementStatut: "CONFIRME" }
      });
    }

    // 3. Réponse "BIEN_EXISTANT" : Rapprochement avec un bien déjà dans le patrimoine
    if (reponse === "BIEN_EXISTANT") {
      if (!bienExistantId) {
        return NextResponse.json({ error: "Veuillez sélectionner le bien existant à rattacher." }, { status: 400 });
      }

      const bienCible = await prisma.property.findUnique({
        where: { id: bienExistantId }
      });

      if (!bienCible) {
        return NextResponse.json({ error: "Le bien sélectionné n'existe pas." }, { status: 404 });
      }

      const ancienBienProvisoireId = lease.bienProvisoireId;

      // Rattacher le bail au bien existant
      await prisma.lease.update({
        where: { id: leaseId },
        data: {
          propertyId: bienExistantId,
          adossementStatut: "CONFIRME",
          adosseAt: new Date(),
          bienProvisoireId: null
        }
      });

      // Supprimer le bien provisoire devenu inutile (RG-DCL-28)
      if (ancienBienProvisoireId && ancienBienProvisoireId !== bienExistantId) {
        try {
          await prisma.property.delete({
            where: { id: ancienBienProvisoireId }
          });
        } catch (e) {
          console.warn("Bien provisoire non supprimé :", e);
        }
      }

      // Activer valeur probante sur quittances
      await prisma.receipt.updateMany({
        where: { leaseId },
        data: { valeurProbanteActive: true }
      });

      return NextResponse.json({
        success: true,
        message: "Bail rattaché avec succès à votre bien existant.",
        data: { adossementStatut: "CONFIRME", propertyId: bienExistantId }
      });
    }

    return NextResponse.json({ error: "Type de réponse non reconnu." }, { status: 400 });
  } catch (error: any) {
    console.error("[ADD-28 DCL-10 POST adossement]", error);
    return NextResponse.json({ error: "Erreur serveur lors du traitement de l'adossement" }, { status: 500 });
  }
}
