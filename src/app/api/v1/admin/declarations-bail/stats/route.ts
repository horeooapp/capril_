import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-12
 * Métriques & Statistiques administratives des déclarations de bail et adossements
 * Règles Section 13
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const [
      totalDeclarations,
      confirmes,
      refusees,
      enAttente,
      reorientes,
      expires,
      fichesTotal,
      fichesConverties,
      bailsAdosses,
      bailsNonAdosses,
      bailsEnConflit
    ] = await Promise.all([
      prisma.declarationBail.count(),
      prisma.declarationBail.count({ where: { statut: "CONFIRMEE" } }),
      prisma.declarationBail.count({ where: { statut: "REFUSEE" } }),
      prisma.declarationBail.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.declarationBail.count({ where: { statut: "REORIENTEE" } }),
      prisma.declarationBail.count({ where: { statut: "EXPIREE" } }),
      prisma.ficheBail.count(),
      prisma.lease.count({ where: { convertiDepuisId: { not: null } } }),
      prisma.lease.count({ where: { adossementStatut: "CONFIRME" } }),
      prisma.lease.count({ where: { adossementStatut: "NON_ADOSSE" } }),
      prisma.lease.count({ where: { adossementStatut: "EN_CONFLIT" } })
    ]);

    const tauxConfirmation = totalDeclarations > 0 ? (confirmes / totalDeclarations) * 100 : 0;
    const tauxConversion = fichesTotal > 0 ? (fichesConverties / fichesTotal) * 100 : 0;
    const totalBauxDcl = bailsAdosses + bailsNonAdosses + bailsEnConflit;
    const tauxAdossement = totalBauxDcl > 0 ? (bailsAdosses / totalBauxDcl) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        declarations: {
          total: totalDeclarations,
          confirmes,
          refusees,
          enAttente,
          reorientes,
          expires,
          tauxConfirmationPct: Math.round(tauxConfirmation * 10) / 10
        },
        fiches: {
          total: fichesTotal,
          convertiesEnBailQapril: fichesConverties,
          tauxConversionPct: Math.round(tauxConversion * 10) / 10
        },
        adossements: {
          confirmes: bailsAdosses,
          nonAdosses: bailsNonAdosses,
          enConflit: bailsEnConflit,
          tauxAdossementPct: Math.round(tauxAdossement * 10) / 10
        },
        seuilsSante: {
          tauxConfirmationSain: tauxConfirmation >= 50,
          tauxConversionSain: tauxConversion >= 15,
          tauxAdossementSain: tauxAdossement >= 70
        }
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-12 GET stats]", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
