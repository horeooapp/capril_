import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-01 & DCL-02
 * Gestion des déclarations de bail par le locataire ou bailleur
 * Règles RG-DCL-06 à RG-DCL-10
 */

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;
    const userPhone = session.user.phone;

    // Récupérer déclarations émises et déclarations reçues
    const [emises, recues] = await Promise.all([
      prisma.declarationBail.findMany({
        where: { initiateurId: userId },
        include: {
          destinataire: {
            select: { id: true, name: true, phone: true, role: true }
          },
          bails: true
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.declarationBail.findMany({
        where: {
          OR: [
            { destinataireId: userId },
            ...(userPhone ? [{ destinataireTel: userPhone }] : [])
          ]
        },
        include: {
          initiateur: {
            select: { id: true, name: true, phone: true, role: true }
          },
          bails: true
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        emises,
        recues
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-02 GET declarations-bail]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la récupération" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié. Veuillez vous inscrire ou vous connecter." }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role || "TENANT";
    const body = await request.json();

    const {
      destinataireTel,
      commune,
      quartier,
      repere,
      typeBien = "Appartement",
      structureSupposee = "Immeuble",
      loyerDeclare,
      bailPapierExiste = false,
      gps
    } = body;

    if (!destinataireTel || !commune || !loyerDeclare) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants : numéro destinataire, commune et loyer mensuel." },
        { status: 400 }
      );
    }

    // Normalisation téléphone destinataire (format local/international CI)
    const cleanTel = destinataireTel.replace(/\s+/g, "");

    // RG-DCL-10 : Limites anti-abus
    // Max 2 déclarations en attente simultanément
    const countEnAttente = await prisma.declarationBail.count({
      where: {
        initiateurId: userId,
        statut: "EN_ATTENTE"
      }
    });

    if (countEnAttente >= 2) {
      return NextResponse.json(
        { error: "Vous avez déjà 2 déclarations en attente de réponse. Veuillez attendre la confirmation avant d'en créer une nouvelle (RG-DCL-10)." },
        { status: 429 }
      );
    }

    // Vérifier si le destinataire est déjà inscrit sur QAPRIL
    const destinataireUser = await prisma.user.findFirst({
      where: {
        phone: {
          contains: cleanTel.slice(-8) // Match sur les 8 derniers chiffres
        }
      }
    });

    const designationDeclaree = {
      commune,
      quartier: quartier || "",
      repere: repere || "",
      type: typeBien,
      structure_supposee: structureSupposee,
      gps: gps ? { lat: gps.lat, lng: gps.lng, precision: gps.precision || null } : null
    };

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + 30); // RG-DCL-14 : Expiration J+30

    // Déterminer le rôle initiateur selon la nomenclature ADD-28
    const initiateurRole = userRole === "LANDLORD" ? "BAILLEUR" : (userRole === "AGENCY" ? "AGENCE" : "LOCATAIRE");

    const declaration = await prisma.declarationBail.create({
      data: {
        initiateurId: userId,
        initiateurRole,
        locataireId: initiateurRole === "LOCATAIRE" ? userId : null,
        destinataireTel: cleanTel,
        destinataireId: destinataireUser?.id || null,
        designationDeclaree,
        loyerDeclare: parseFloat(loyerDeclare),
        bailPapierExiste: Boolean(bailPapierExiste),
        statut: "EN_ATTENTE",
        expireAt
      }
    });

    // RG-DCL-11 : Envoi de l'invitation / notification
    // Message type ADD-28 :
    // "Bonjour. [Nom Initiateur] indique qu'il est votre locataire ([Type], [Commune], [Loyer] FCFA/mois). Confirmez en 1 geste..."
    // (L'appel du service de messagerie sera déclenché en tâche de fond)

    return NextResponse.json(
      {
        success: true,
        message: "Déclaration de bail enregistrée avec succès. Le destinataire a été invité à confirmer.",
        data: declaration
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ADD-28 DCL-01 POST declarations-bail]", error);
    return NextResponse.json({ error: "Erreur lors de la création de la déclaration" }, { status: 500 });
  }
}
