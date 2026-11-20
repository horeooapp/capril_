import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { preparerCodeSignature } from "@/lib/lease-signature";
import { figerBail } from "@/lib/bail/figer";
import { dispatchLeaseInitiationNotification } from "@/lib/lease-notification";
import { sendSMSWithDetails } from "@/lib/sms";

/**
 * [IC-09] Baux envoyés à la signature et restés sans réponse. À appeler une fois par jour
 * (en-tête Authorization: Bearer CRON_SECRET).
 *  - J+2 et J+7 après l'envoi : le locataire reçoit de nouveau le bail, avec un nouveau code ;
 *  - J+30 : le bailleur est prévenu une fois, pour corriger le numéro, relancer ou annuler.
 */
const JOUR = 86_400_000;

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) return new Response("Unauthorized", { status: 401 });
  const maintenant = Date.now();
  const baux = await (prisma as any).lease.findMany({
    where: { deletedAt: null, isSignedElectronically: false, status: { in: ["PENDING_SIGNATURE", "PENDING_CONFIRMATION", "ACTIVE_DECLARATIF"] }, signatureContext: { not: null } },
    include: { landlord: true, tenant: true, property: true },
  });

  let relances = 0, alertes = 0, echecs = 0;
  for (const b of baux) {
    const ctx = (b.signatureContext as any) || {};
    if (!ctx.premierEnvoiLe && !ctx.envoyeLe) continue;
    const premier = new Date(ctx.premierEnvoiLe || ctx.envoyeLe).getTime();
    const age = (maintenant - premier) / JOUR;
    const suivi = ctx.relancesSignature || { nb: 0, alerteBailleur: false };
    const due = (suivi.nb === 0 && age >= 2) || (suivi.nb === 1 && age >= 7);
    try {
      if (due) {
        const r = await preparerCodeSignature(prisma, { leaseId: b.id, demandeurId: b.landlordId, figer: () => figerBail(b.id) });
        const envoi: any = await dispatchLeaseInitiationNotification({
          leaseId: b.id, leaseReference: b.leaseReference, propertyName: b.property?.name || b.property?.address || "le logement",
          rentAmount: b.rentAmount, depositAmount: b.depositAmount || 0, signingOtp: r.code, recipientRole: "TENANT",
          recipientName: r.destinataire.nom, recipientPhone: r.destinataire.telephone || undefined, recipientEmail: r.destinataire.email || undefined,
          recipientUserId: r.destinataire.userId || undefined, initiatorName: "Le bailleur",
        } as any);
        const parti = envoi && (envoi.sms || envoi.whatsapp || envoi.email || envoi.inApp || envoi.push);
        const frais = await (prisma as any).lease.findUnique({ where: { id: b.id }, select: { signatureContext: true } });
        await (prisma as any).lease.update({
          where: { id: b.id },
          data: { signatureContext: { ...((frais?.signatureContext as any) || {}), premierEnvoiLe: new Date(premier).toISOString(), relancesSignature: { ...suivi, nb: parti ? suivi.nb + 1 : suivi.nb } } },
        });
        if (parti) relances++; else echecs++;
      } else if (age >= 30 && !suivi.alerteBailleur && b.landlord?.phone) {
        const nom = [b.tenant?.firstName, b.tenant?.lastName].filter(Boolean).join(" ") || "votre locataire";
        const r = await sendSMSWithDetails(b.landlord.phone, `QAPRIL : le bail ${b.leaseReference} attend depuis 30 jours la signature de ${nom}`.normalize("NFD").replace(/[̀-ͯ]/g, "") + ". Verifiez son numero, relancez ou annulez depuis vos baux.");
        if (r.success) {
          await (prisma as any).lease.update({ where: { id: b.id }, data: { signatureContext: { ...ctx, relancesSignature: { ...suivi, alerteBailleur: true } } } });
          alertes++;
        } else echecs++;
      }
    } catch (e: any) {
      echecs++; // bail devenu incomplet, locataire injoignable… : retenté au prochain passage
      console.warn(`[CRON baux-en-attente] ${b.leaseReference} : ${e?.message}`);
    }
  }
  return NextResponse.json({ bauxEnAttente: baux.length, relances, alertes, echecs });
}
