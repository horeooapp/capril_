import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { sendSMSWithDetails } from "@/lib/sms";
import { etatDossier, messageRelance } from "@/lib/quittance-express";
import { urlApp } from "@/lib/quittance-express-envoi";

/**
 * Relances de complétion des dossiers nés d'une quittance express.
 * Cadence après la première quittance : J+2, J+7, J+15, J+30, puis une fois par mois.
 * Jamais bloquant : le bailleur continue de quittancer quel que soit l'avancement.
 * À appeler une fois par jour (en-tête Authorization: Bearer CRON_SECRET).
 */
const PALIERS = [2, 7, 15, 30];
const JOUR = 86_400_000;

function relanceDue(creeLe: Date, nb: number, derniere: Date | null, maintenant: Date): boolean {
  const age = (maintenant.getTime() - creeLe.getTime()) / JOUR;
  if (nb < PALIERS.length) return age >= PALIERS[nb];
  return !!derniere && (maintenant.getTime() - derniere.getTime()) / JOUR >= 30;
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) return new Response("Unauthorized", { status: 401 });
  const maintenant = new Date();
  const baux = await (prisma as any).lease.findMany({
    where: { modeCreation: "QUITTANCE_EXPRESS", deletedAt: null, status: { in: ["ACTIVE_DECLARATIF", "ACTIVE"] } },
    include: { property: true, bdq: true, landlord: true, _count: { select: { receipts: true } } },
  });

  let envoyees = 0, echecs = 0, completes = 0;
  for (const b of baux) {
    const etat = etatDossier({ bail: b, bien: b.property, bdq: b.bdq, nbQuittances: b._count.receipts });
    if (etat.complet || !etat.prochaine) { completes++; continue; }
    const suivi = ((b.draftData as any) || {}).relances || { nb: 0, derniere: null };
    if (!relanceDue(new Date(b.createdAt), suivi.nb, suivi.derniere ? new Date(suivi.derniere) : null, maintenant)) continue;
    if (!b.landlord?.phone) continue;

    const texte = messageRelance({
      nomLocataire: b.bdq?.nomLocataireDeclare || "votre locataire",
      pourcentage: etat.pourcentage,
      action: etat.prochaine.action,
      lien: `${urlApp()}/dashboard/quittance-express`,
    });
    const r = await sendSMSWithDetails(b.landlord.phone, texte);
    if (r.success) {
      envoyees++;
      await (prisma as any).lease.update({
        where: { id: b.id },
        data: { draftData: { ...((b.draftData as any) || {}), relances: { nb: suivi.nb + 1, derniere: maintenant.toISOString() } } },
      });
      await (prisma as any).notification.create({
        data: { userId: b.landlordId, title: "Dossier à compléter", content: texte, status: "sent", read: false },
      }).catch(() => {});
    } else {
      echecs++; // non comptée : elle sera retentée au prochain passage
    }
  }
  return NextResponse.json({ dossiers: baux.length, completes, envoyees, echecs });
}
