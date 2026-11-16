import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-05 & DCL-07
 * Fiche de bail pour baux papier existants
 * Règles RG-DCL-17 à RG-DCL-24
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

    const fiche = await prisma.ficheBail.findUnique({
      where: { leaseId },
      include: {
        lease: {
          include: {
            landlord: { select: { id: true, name: true, phone: true } },
            tenant: { select: { id: true, name: true, phone: true } }
          }
        },
        saisiePar: { select: { id: true, name: true } },
        confirmeePar: { select: { id: true, name: true } }
      }
    });

    if (!fiche) {
      return NextResponse.json({ error: "Fiche de bail non trouvée pour ce bail." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...fiche,
        mentionLegale: "Fiche établie à partir du bail papier annexé. Document récapitulatif sans valeur contractuelle. En cas de divergence, le bail annexé prévaut (RG-DCL-20)."
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-07 GET fiche]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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
    const body = await request.json();

    const {
      fichierUrl,
      fichierSha256,
      nbPages,
      dateSignaturePapier,
      parties,
      designation,
      loyerMensuel,
      charges = 0,
      dateEffet,
      dureeMois = 12,
      jourEcheance = 5,
      depotGarantie = 0,
      loyerAvance = 0
    } = body;

    if (!fichierUrl || !loyerMensuel || !dateEffet) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants : fichier du bail papier, loyer mensuel et date d'effet." },
        { status: 400 }
      );
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId }
    });

    if (!lease) {
      return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });
    }

    // RG-DCL-22 : Contrôle légal non bloquant (Loi 2019-576)
    // Plafond légal : max 2 mois de dépôt de garantie et max 2 mois de loyer d'avance
    const ecartsLegaux: any = {};
    const loyerVal = parseFloat(loyerMensuel);
    const depotVal = parseFloat(depotGarantie);
    const avanceVal = parseFloat(loyerAvance);

    if (depotVal > loyerVal * 2) {
      ecartsLegaux.depot_excede_plafond = {
        loyer: loyerVal,
        depotConstate: depotVal,
        plafondLegal: loyerVal * 2,
        message: "Le dépôt de garantie indiqué dépasse le plafond légal de 2 mois prévu par la loi n° 2019-576."
      };
    }

    if (avanceVal > loyerVal * 2) {
      ecartsLegaux.avance_excede_plafond = {
        loyer: loyerVal,
        avanceConstatee: avanceVal,
        plafondLegal: loyerVal * 2,
        message: "L'avance de loyer indiquée dépasse le plafond légal de 2 mois prévu par la loi n° 2019-576."
      };
    }

    const mentions = {
      parties: parties || {},
      designation: designation || lease.designationDeclaree || {},
      loyer: loyerVal,
      charges: parseFloat(charges),
      date_effet: dateEffet,
      duree_mois: parseInt(dureeMois),
      jour_echeance: parseInt(jourEcheance),
      depot_garantie: depotVal,
      loyer_avance: avanceVal
    };

    // RG-DCL-21 : Empreinte SHA-256 de la fiche
    const payloadPourEmpreinte = JSON.stringify({
      fichierSha256: fichierSha256 || "sha256-default",
      mentions
    });
    const empreinteFiche = crypto.createHash("sha256").update(payloadPourEmpreinte).digest("hex");

    const fiche = await prisma.ficheBail.upsert({
      where: { leaseId },
      create: {
        leaseId,
        fichierUrl,
        fichierSha256: fichierSha256 || empreinteFiche,
        nbPages: nbPages ? parseInt(nbPages) : 1,
        dateSignaturePapier: dateSignaturePapier ? new Date(dateSignaturePapier) : null,
        mentions,
        saisieParId: userId,
        empreinteFiche,
        ecartsLegaux: Object.keys(ecartsLegaux).length > 0 ? ecartsLegaux : null
      },
      update: {
        fichierUrl,
        fichierSha256: fichierSha256 || empreinteFiche,
        nbPages: nbPages ? parseInt(nbPages) : undefined,
        dateSignaturePapier: dateSignaturePapier ? new Date(dateSignaturePapier) : undefined,
        mentions,
        saisieParId: userId,
        empreinteFiche,
        ecartsLegaux: Object.keys(ecartsLegaux).length > 0 ? ecartsLegaux : null
      }
    });

    // Mettre à jour le loyer et charges sur le bail
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        rentAmount: Math.round(loyerVal),
        chargesAmount: Math.round(parseFloat(charges)),
        paymentDay: parseInt(jourEcheance)
      }
    });

    return NextResponse.json({
      success: true,
      message: "Fiche de bail enregistrée. En attente de confirmation par l'autre partie (RG-DCL-19).",
      data: fiche
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-05 POST fiche]", error);
    return NextResponse.json({ error: "Erreur serveur lors de la sauvegarde de la fiche" }, { status: 500 });
  }
}
