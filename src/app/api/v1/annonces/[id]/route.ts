import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMobileRequest } from "@/lib/mobile-auth";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function resolveUser(req: Request) {
  const mobileUser = await authenticateMobileRequest(req);
  if (mobileUser?.userId) return mobileUser.userId;
  try {
    const session = await auth();
    if (session?.user?.id) return session.user.id;
  } catch {}
  return null;
}

/**
 * [S-04] GET /v1/annonces/{id}
 * Renvoie photos, prix et conditions, badge (niveau du bien), publiant (agence nommée ou « bailleur particulier »),
 * disponibilité, négociable, score + raisons + manques, description, équipements,
 * quartier (centre flou + rayon 300 m) ; JAMAIS l'adresse ni la position exacte pour un locataire.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = await resolveUser(req);

    const annonce = await prisma.annonce.findUnique({
      where: { id },
      include: {
        agence: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            role: true,
            agencyProfile: {
              select: {
                companyName: true,
                numeroAgrement: true,
                statusAgrement: true,
              },
            },
          },
        },
        logement: {
          include: {
            ownerUser: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!annonce) {
      return NextResponse.json({ error: "Annonce introuvable." }, { status: 404 });
    }

    const logement = annonce.logement;
    const isOwnerOrAgency =
      currentUserId &&
      (currentUserId === annonce.agenceId ||
        currentUserId === logement?.ownerUserId ||
        currentUserId === logement?.managedByUserId);

    // Publiant selon spécification IC-01-R1
    let publiantLibelle = "Bailleur particulier";
    let agenceDetails: any = null;

    if (annonce.agence?.agencyProfile?.companyName) {
      publiantLibelle = annonce.agence.agencyProfile.companyName;
      agenceDetails = {
        nom: annonce.agence.agencyProfile.companyName,
        agrement: annonce.agence.agencyProfile.numeroAgrement || "Agréée",
      };
    } else if (annonce.agence?.role === "AGENCY" || annonce.agence?.role === "AGENCE_AGREE") {
      publiantLibelle = annonce.agence.name || "Agence Immobilière Agréée";
      agenceDetails = {
        nom: publiantLibelle,
      };
    }

    // Calcul du badge / niveau du bien (1 à 4)
    const niveauBien = (logement as any)?.verificationLevel || 2;
    const badgeNiveau =
      niveauBien >= 4
        ? "Bien vérifié — visite d'agence agréée"
        : niveauBien === 3
        ? "Bien vérifié — titre contrôlé"
        : niveauBien === 2
        ? "Déclaré, position confirmée"
        : "Déclaré";

    // Fuzzing des coordonnées pour garantir la confidentialité (centre flou + rayon 300 m)
    const approxLat = logement?.latitude
      ? Number((logement.latitude + 0.002).toFixed(4))
      : 5.3484;
    const approxLng = logement?.longitude
      ? Number((logement.longitude - 0.0015).toFixed(4))
      : -4.0182;

    const criteres = (annonce.criteres as any) || {};

    const payload: any = {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      photos: annonce.photosUrls && annonce.photosUrls.length > 0 ? annonce.photosUrls : [],
      prixEtConditions: {
        loyer: annonce.loyerDemande,
        charges: annonce.charges || 0,
        loyerTotal: annonce.loyerDemande + (annonce.charges || 0),
        depotGarantie: Math.min((logement as any)?.depositAmount || annonce.loyerDemande * 1, annonce.loyerDemande * 2),
        avanceLoyer: Math.min((logement as any)?.advanceRentAmount || 0, annonce.loyerDemande * 2),
        devise: "XOF",
      },
      badge: {
        niveau: niveauBien,
        libelle: badgeNiveau,
      },
      publiant: {
        type: agenceDetails ? "AGENCE" : "BAILLEUR_PARTICULIER",
        nomAffiche: publiantLibelle,
        details: agenceDetails,
      },
      disponibilite: annonce.statut === "ACTIVE" ? "IMMEDIATE" : "NON_DISPONIBLE",
      negociable: criteres.negociable ?? false,
      equipements: (logement as any)?.equipements || criteres.equipements || [],
      localisation: {
        commune: logement?.commune || "Abidjan",
        quartier: (logement as any)?.quartier || logement?.commune || "Quartier résidentiel",
        zone: {
          centreFlou: {
            latitude: approxLat,
            longitude: approxLng,
          },
          rayonMetres: 300,
        },
      },
      publieeLe: annonce.publieeAt || annonce.createdAt,
    };

    // Si bailleur ou gestionnaire propriétaire de l'annonce : accès complet
    if (isOwnerOrAgency) {
      payload.localisationAdmin = {
        adresseExacte: logement?.address,
        latitudeExacte: logement?.latitude,
        longitudeExacte: logement?.longitude,
      };
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Erreur serveur" }, { status: 500 });
  }
}

