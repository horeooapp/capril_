/**
 * QAPRIL — Quittance express : remise de la quittance au locataire.
 *
 * Règle : on ne déclare « envoyé » que ce qu'un fournisseur a réellement accepté.
 * Un canal non configuré est signalé NON_CONFIGURE, jamais compté comme un succès.
 */
import { prisma } from "@/lib/prisma";
import { generateReceiptPDF } from "@/lib/pdf-generator";
import { sendSMSWithDetails } from "@/lib/sms";
import { sendEmail, wrapInPremiumTemplate } from "@/lib/email";
import { messageQuittance, libelleModePaiement } from "@/lib/quittance-express";
import { chargerMarque } from "@/lib/quittance-personnalisation";

export const MENTION_DECLARATIVE =
  "Quittance émise sur déclaration du bailleur. Bail en cours de formalisation.";

export type ResultatCanal = { canal: "WHATSAPP" | "SMS" | "EMAIL"; statut: "ENVOYE" | "ECHEC" | "NON_CONFIGURE" | "SANS_ADRESSE"; detail?: string };

export function urlApp(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net").replace(/\/$/, "");
}
export function lienQuittance(q: { id: string }): string {
  return `${urlApp()}/receipts/${q.id}`;
}
export function lienPdf(q: { id: string; qrToken: string | null }): string {
  return `${urlApp()}/api/quittances/${q.id}/pdf?t=${q.qrToken}`;
}

const nomComplet = (u: any) => [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || u?.fullName || "";

export async function pdfQuittance(receiptId: string): Promise<{ pdf: Buffer; quittance: any }> {
  const q = await (prisma as any).receipt.findUnique({
    where: { id: receiptId },
    include: { lease: { include: { property: true, tenant: true, landlord: true, bdq: true } } },
  });
  if (!q) throw new Error("Quittance introuvable.");
  const bail = q.lease;
  const marque = (await chargerMarque(bail.agentId)) || (await chargerMarque(bail.landlordId)) || undefined;
  const marqueNom = bail.landlord?.role === "AGENCY" ? marque?.nom : undefined;
  const pdf = await generateReceiptPDF({
    receiptRef: q.receiptRef,
    leaseRef: bail.leaseReference,
    periodMonth: q.periodMonth,
    rentAmount: Number(q.rentAmount),
    chargesAmount: Number(q.chargesAmount || 0),
    totalAmount: Number(q.totalAmount),
    paymentMethod: libelleModePaiement(q.paymentMethod) + (q.paymentRef ? ` - réf. ${q.paymentRef}` : ""),
    paymentNote: q.declarative ? "Paiement reçu directement par le bailleur, hors plateforme QAPRIL." : undefined,
    emetteurLibelle: bail.landlord?.role === "AGENCY" || bail.agentId ? "Agence gestionnaire" : undefined,
    marque,
    paidAt: q.paidAt,
    tenantName: bail.bdq?.nomLocataireDeclare || nomComplet(bail.tenant) || "Locataire",
    propertyAddress: bail.property?.address || "",
    landlordName: marqueNom || nomComplet(bail.landlord) || "Bailleur",
    receiptHash: q.receiptHash || undefined,
    qrToken: q.qrToken || undefined,
    declarative: q.declarative,
    mention: q.declarative ? MENTION_DECLARATIVE : undefined,
  });
  return { pdf, quittance: q };
}

/** Envoi du PDF par WhatsApp (modèle Meta à en-tête « document »). */
async function envoyerWhatsAppDocument(to: string, lien: string, nomFichier: string, params: string[]): Promise<ResultatCanal> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const modele = process.env.WHATSAPP_TEMPLATE_QUITTANCE;
  if (!token || !phoneNumberId || !modele) {
    return { canal: "WHATSAPP", statut: "NON_CONFIGURE", detail: "WHATSAPP_CLOUD_TOKEN, WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_TEMPLATE_QUITTANCE absent" };
  }
  try {
    const r = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace("+", ""),
        type: "template",
        template: {
          name: modele,
          language: { code: "fr" },
          components: [
            { type: "header", parameters: [{ type: "document", document: { link: lien, filename: nomFichier } }] },
            { type: "body", parameters: params.map((text) => ({ type: "text", text })) },
          ],
        },
      }),
    });
    const corps: any = await r.json().catch(() => ({}));
    if (!r.ok) return { canal: "WHATSAPP", statut: "ECHEC", detail: corps?.error?.message || `HTTP ${r.status}` };
    return { canal: "WHATSAPP", statut: "ENVOYE", detail: corps?.messages?.[0]?.id };
  } catch (e: any) {
    return { canal: "WHATSAPP", statut: "ECHEC", detail: e?.message };
  }
}

/**
 * Remet la quittance au locataire : WhatsApp (PDF), SMS (lien), e-mail (PDF joint).
 * Les trois canaux sont tentés ; chacun rend compte de son résultat réel.
 */
export async function remettreQuittance(receiptId: string, opts: { email?: string } = {}): Promise<ResultatCanal[]> {
  const { pdf, quittance: q } = await pdfQuittance(receiptId);
  const bail = q.lease;
  const nom = bail.bdq?.nomLocataireDeclare || nomComplet(bail.tenant) || "Locataire";
  const telephone: string = bail.tenant?.phone || bail.bdq?.telephoneLocataire;
  const email = opts.email || bail.tenant?.email || undefined;
  const montant = Number(q.totalAmount);
  const fichier = `Quittance-${q.receiptRef}.pdf`;
  const resultats: ResultatCanal[] = [];

  resultats.push(await envoyerWhatsAppDocument(telephone, lienPdf(q), fichier, [nom, q.periodMonth, montant.toLocaleString("fr-FR")]));

  try {
    const sms = await sendSMSWithDetails(telephone, messageQuittance({ nomLocataire: nom, montant, mois: q.periodMonth, lien: lienQuittance(q) }));
    resultats.push({ canal: "SMS", statut: sms.success ? "ENVOYE" : "ECHEC", detail: sms.success ? sms.provider : sms.error });
  } catch (e: any) {
    resultats.push({ canal: "SMS", statut: "ECHEC", detail: e?.message });
  }

  if (!email) {
    resultats.push({ canal: "EMAIL", statut: "SANS_ADRESSE" });
  } else {
    try {
      const html = wrapInPremiumTemplate(
        `<p>Bonjour ${nom},</p><p>Votre quittance de loyer pour <strong>${q.periodMonth}</strong> (${montant.toLocaleString("fr-FR")} F CFA) est jointe à ce message.</p>` +
          (q.declarative ? `<p style="font-size:13px;color:#555">${MENTION_DECLARATIVE}</p>` : "") +
          `<p><a href="${lienQuittance(q)}">Consulter et vérifier la quittance</a></p>`,
        "Votre quittance de loyer"
      );
      const r = await sendEmail({
        to: email,
        subject: `Quittance de loyer ${q.periodMonth} — ${q.receiptRef}`,
        html,
        attachments: [{ filename: fichier, content: pdf, contentType: "application/pdf" }],
      });
      resultats.push({ canal: "EMAIL", statut: r.success ? "ENVOYE" : "ECHEC", detail: r.success ? r.provider : String(r.error || "") });
    } catch (e: any) {
      resultats.push({ canal: "EMAIL", statut: "ECHEC", detail: e?.message });
    }
  }

  return resultats;
}
