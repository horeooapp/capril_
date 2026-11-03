import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { DeclStatut } from "@prisma/client";

/**
 * DCL-06 — GET /api/v1/admin/declarations/stats
 * Statistiques déclarations SMS/WhatsApp : taux de confirmation · délais moyens
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role as string)) {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const all = await prisma.smsDeclaration.findMany({
      select: {
        id: true,
        statut: true,
        canal: true,
        montantDeclare: true,
        createdAt: true,
        confirmeAt: true,
        rappel1At: true,
        alerteProprioAt: true,
      },
    });

    const total = all.length;
    const confirmes = all.filter((d) => d.statut === DeclStatut.CONFIRME);
    const contestes = all.filter((d) => d.statut === DeclStatut.CONTESTE);
    const enAttente = all.filter((d) => d.statut === DeclStatut.EN_ATTENTE);
    const expires = all.filter((d) => d.statut === DeclStatut.EXPIRE);

    const tauxConfirmationPct = total > 0 ? Math.round((confirmes.length / total) * 1000) / 10 : 0;

    const withConfirmDelay = confirmes.filter((d) => d.confirmeAt && d.createdAt);
    const delaiMoyenMinutes =
      withConfirmDelay.length > 0
        ? Math.round(
            withConfirmDelay.reduce(
              (s, d) => s + (new Date(d.confirmeAt!).getTime() - new Date(d.createdAt).getTime()) / 60000,
              0
            ) / withConfirmDelay.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      total_declarations: total,
      repartition: {
        CONFIRME: confirmes.length,
        CONTESTE: contestes.length,
        EN_ATTENTE: enAttente.length,
        EXPIRE: expires.length,
      },
      taux_confirmation_pct: tauxConfirmationPct,
      delai_moyen_confirmation_minutes: delaiMoyenMinutes,
      rappels_2h_declenches: all.filter((d) => d.rappel1At).length,
      alertes_proprio_6h_declenchees: all.filter((d) => d.alerteProprioAt).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

