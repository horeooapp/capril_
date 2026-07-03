// ══════════════════════════════════════════════════════════════════════════════
// QAPRIL — Contrat d'API POR-02 : Consulter une annonce complète + Historique de prix
// Référence : SPEC/026-B & SPEC/026-C/2026 (ADD-26 §8 Table 26, RG-PORT-05, RG-PORT-13)
// GET /api/v1/portail/annonces/[id]
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculerTagsDynamiques } from "@/lib/portail/tags";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Identifiant d'annonce manquant." }, { status: 400 });
    }

    const annonce = await prisma.annonce.findUnique({
      where: { id },
      include: {
        logement: true,
        agence: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyRegNumber: true,
            isCertified: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!annonce || annonce.logement?.deletedAt) {
      return NextResponse.json(
        { error: "Annonce introuvable ou retirée de la publication (bien déjà loué)." },
        { status: 404 }
      );
    }

    // Incrémentation du compteur de vues (non-bloquante pour la latence utilisateur)
    prisma.annonce
      .update({
        where: { id: annonce.id },
        data: { nbVisites: { increment: 1 } }
      })
      .catch((err) => console.warn("[API POR-02] Erreur incrément vues:", err));

    // Calcul des tags dynamiques (RG-PORT-17)
    const tags = calculerTagsDynamiques(annonce);

    // Historique des prix immuable (RG-PORT-13 / Table 10)
    let historiquePrix: Array<{ ancien_prix: number | null; nouveau_prix: number; modifie_at: string }> = [];
    if (annonce.criteres && typeof annonce.criteres === "object" && Array.isArray((annonce.criteres as any).historique_prix)) {
      historiquePrix = (annonce.criteres as any).historique_prix;
    } else {
      // Entrée initiale par défaut si pas d'historique explicite stocké
      let prixPrecedent = null;
      if (annonce.criteres && (annonce.criteres as any).prix_precedent) {
        prixPrecedent = Number((annonce.criteres as any).prix_precedent);
        historiquePrix.push({
          ancien_prix: null,
          nouveau_prix: prixPrecedent,
          modifie_at: (annonce.createdAt || new Date()).toISOString()
        });
      }
      historiquePrix.push({
        ancien_prix: prixPrecedent,
        nouveau_prix: Number(annonce.loyerDemande),
        modifie_at: (annonce.publieeAt || annonce.createdAt || new Date()).toISOString()
      });
    }

    // RG-PORT-05 / RG-CONF-01 : Confidentialité absolue de l'identité du propriétaire.
    // Seule l'agence agréée est l'interlocuteur visible.
    const agenceNom = `${annonce.agence?.firstName || ""} ${annonce.agence?.lastName || ""}`.trim() || "Agence Partenaire QAPRIL";
    const contactWhatsapp = annonce.agence?.phone
      ? `https://wa.me/${annonce.agence.phone.replace(/[^0-9]/g, "")}?text=Bonjour,%20je%20suis%20intéressé%20par%20l'annonce%20${encodeURIComponent(annonce.titre)}%20(Réf:%20${annonce.id})`
      : null;

    const data = {
      annonce_id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      statut: annonce.statut,
      loyer: Number(annonce.loyerDemande),
      charges: Number(annonce.charges || 0),
      type_bien: annonce.logement?.propertyType || "Logement",
      commune: annonce.logement?.commune || "Abidjan",
      quartier: annonce.logement?.address || undefined,
      geo_point:
        annonce.logement?.gpsLatitude != null && annonce.logement?.gpsLongitude != null
          ? {
              lat: Number(annonce.logement.gpsLatitude),
              lng: Number(annonce.logement.gpsLongitude)
            }
          : null,
      surface_m2: annonce.logement?.areaSurface || null,
      nb_pieces: annonce.logement?.rooms || null,
      photos_urls: annonce.photosUrls || [],
      tags,
      label_confiance: annonce.agence?.companyRegNumber ? "AGENCE_AGREEE_CPRAIMA_CI" : "BIEN_VERIFIE",
      proprietaire_verifie: true, // Garanti par le socle d'onboarding QAPRIL (Bail réel / Titre foncier)
      historique_prix: historiquePrix,
      agence: {
        id: annonce.agence?.id,
        nom: agenceNom,
        agreee: Boolean(annonce.agence?.companyRegNumber || annonce.agence?.isCertified),
        numero_agrement: annonce.agence?.companyRegNumber || "Agrément CPRAIMA-CI",
        contact_telephone: annonce.agence?.phone || "+225 00 00 00 00 00",
        contact_email: annonce.agence?.email || "contact@qapril.ci",
        contact_whatsapp: contactWhatsapp
      },
      publiee_at: annonce.publieeAt || annonce.createdAt || null,
      vues: (annonce.nbVisites || 0) + 1
    };

    return NextResponse.json({ data, succes: true }, { status: 200 });
  } catch (error: any) {
    console.error("[API POR-02 ANNONCE DETAIL ERROR]", error);
    return NextResponse.json(
      { error: "Erreur lors de la consultation des détails de l'annonce." },
      { status: 500 }
    );
  }
}
