import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * RPT-04 : GET /api/v1/rapports/annuel/[annee]
 * Génère et retourne le rapport annuel consolidé d'un propriétaire (synthèse 12 mois).
 */
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ annee: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
        }

        const { annee } = await context.params;
        const yearNum = parseInt(annee, 10);
        if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
            return NextResponse.json({ error: "Année invalide." }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const requestedOwnerId = searchParams.get("ownerId");
        const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string);
        const ownerId = isAdmin && requestedOwnerId ? requestedOwnerId : session.user.id;

        const monthlyReports = await prisma.rapportMensuel.findMany({
            where: {
                userId: ownerId,
                periodeAnnee: yearNum,
            },
            orderBy: { periodeMois: "asc" },
        });

        let totalAttenduAnnuel = 0;
        let totalEncaisseAnnuel = 0;
        let totalImpayesInstances = 0;

        const synthese12Mois = Array.from({ length: 12 }, (_, idx) => {
            const m = idx + 1;
            const found = monthlyReports.find((r) => r.periodeMois === m);
            const data: any = found?.dataRapport || {};
            const attendu = Number(data?.resume_financier?.loyers_attendus ?? data?.metrics?.totalPotentiel ?? 0);
            const recu = Number(data?.resume_financier?.loyers_recus ?? data?.metrics?.totalEncaisse ?? 0);
            const taux = Number(data?.resume_financier?.taux_encaissement_pct ?? data?.metrics?.tauxRecouvrement ?? 0);
            const nbImpayes = Number(data?.resume_financier?.nb_impayes ?? data?.metrics?.nbImpayes ?? 0);

            totalAttenduAnnuel += attendu;
            totalEncaisseAnnuel += recu;
            totalImpayesInstances += nbImpayes;

            return {
                mois: m,
                periode: `${String(m).padStart(2, "0")}/${yearNum}`,
                rapport_id: found?.id || null,
                loyers_attendus: attendu,
                loyers_recus: recu,
                taux_encaissement_pct: taux,
                nb_impayes: nbImpayes,
                genere: Boolean(found),
            };
        });

        const tauxMoyenAnnuelPct =
            totalAttenduAnnuel > 0 ? Math.round((totalEncaisseAnnuel / totalAttenduAnnuel) * 100) : 0;

        return NextResponse.json({
            annee: yearNum,
            proprietaire_id: ownerId,
            total_loyers_attendus_annuel: totalAttenduAnnuel,
            total_loyers_encaisse_annuel: totalEncaisseAnnuel,
            taux_encaissement_annuel_pct: tauxMoyenAnnuelPct,
            total_instances_impayes: totalImpayesInstances,
            nb_mois_generes: monthlyReports.length,
            synthese_mensuelle: synthese12Mois,
        });
    } catch (error: any) {
        console.error("[RPT-04 GET Error]:", error);
        return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
    }
}

