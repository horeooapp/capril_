"use server";
// QAPRIL - Annonces vacance locative · Candidatures

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Creer une annonce de vacance
export async function creerAnnonce(data: {
  logementId:  string;
  agenceId:    string;
  titre:       string;
  description: string;
  loyerDemande: number;
  charges?:    number;
  photosUrls?: string[];
  diffusions?: { jumia?: boolean; whatsapp?: boolean; expat?: boolean };
}) {
  return prisma.annonce.create({
    data: {
      logementId:   data.logementId,
      agenceId:     data.agenceId,
      titre:        data.titre,
      description:  data.description,
      loyerDemande: data.loyerDemande,
      charges:      data.charges ?? 0,
      photosUrls:   data.photosUrls ?? [],
      diffusions:   data.diffusions ?? {},
      statut:       "ACTIVE",
      publieeAt:    new Date(),
    }
  });
}

// Annonces actives (recherche locataire)
export async function getAnnoncesActives(commune?: string) {
  return prisma.annonce.findMany({
    where: {
      statut: "ACTIVE",
      ...(commune ? { logement: { commune } } : {})
    },
    include: { logement: { select: { commune: true, address: true, propertyType: true, superficieM2: true } } },
    orderBy: { publieeAt: "desc" }
  });
}

// Soumettre une candidature
export async function soumettreCandidat(data: {
  logementId:    string;
  candidatId?:   string;
  nom:           string;
  prenom:        string;
  telephone:     string;
  revenuMensuel?: number;
  employeur?:    string;
}) {
  // Calcul taux d'effort si revenu fourni
  let tauxEffort: number | undefined;
  let loyerDemande: number | undefined;
  const annonce = await prisma.annonce.findFirst({
    where: { logementId: data.logementId, statut: "ACTIVE" },
    select: { loyerDemande: true, titre: true }
  });

  if (annonce) {
    loyerDemande = annonce.loyerDemande;
    if (data.revenuMensuel) {
      tauxEffort = parseFloat(((annonce.loyerDemande / data.revenuMensuel) * 100).toFixed(1));
    }
  }

  const candidature = await prisma.candidature.create({
    data: { ...data, tauxEffort, statut: "SOUMISE" }
  });

  // Notifier le propriétaire / gestionnaire du logement
  try {
    const logement = await prisma.property.findUnique({
      where: { id: data.logementId },
      include: {
        ownerUser: { select: { id: true, name: true, email: true, phone: true } },
        managedByUser: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    const destinataire = logement?.managedByUser || logement?.ownerUser;
    if (destinataire) {
      const nomCandidat = `${data.prenom} ${data.nom}`.trim();
      const bienTitre = logement.name || logement.address || annonce?.titre || "Logement";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
      const matchingUrl = `${appUrl}/dashboard/matching`;

      // 1. Notification In-App
      await prisma.notification.create({
        data: {
          userId: destinataire.id,
          title: "Nouvelle candidature reçue",
          message: `${nomCandidat} a postulé pour votre bien "${bienTitre}". Cliquez pour examiner le dossier.`,
          type: "MATCHING_CANDIDATURE",
          link: "/dashboard/matching"
        }
      });

      // 2. Email Notification
      if (destinataire.email) {
        const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
        const emailContent = `
          <p style="margin: 0 0 16px 0;">Bonjour <strong>${destinataire.name || "Propriétaire"}</strong>,</p>
          <p style="margin: 0 0 16px 0;">Un locataire vient de sélectionner et de déposer son dossier pour votre bien <strong>${bienTitre}</strong> sur la marketplace QAPRIL.</p>
          
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Candidat :</strong> ${nomCandidat}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Téléphone :</strong> ${data.telephone}</p>
            ${data.employeur ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Employeur / Métier :</strong> ${data.employeur}</p>` : ""}
            ${data.revenuMensuel ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Revenu mensuel déclaré :</strong> ${data.revenuMensuel.toLocaleString()} FCFA</p>` : ""}
            ${tauxEffort ? `<p style="margin: 0; font-size: 14px;"><strong>Taux d'effort estimé :</strong> ${tauxEffort}%</p>` : ""}
          </div>

          <p style="margin: 0 0 24px 0;">Depuis votre espace, vous pouvez accepter le dossier et générer directement le contrat de bail, demander des compléments ou refuser la candidature.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${matchingUrl}" style="background-color: #FF8200; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
              Examiner la candidature & introduire le bail →
            </a>
          </div>
        `;

        await sendEmail({
          to: destinataire.email,
          subject: `🏡 Nouvelle candidature pour ${bienTitre} - QAPRIL`,
          html: wrapInPremiumTemplate(emailContent, "Nouvelle Candidature Locative")
        }).catch(err => console.error("[Candidature Email Error]", err));
      }

      // 3. WhatsApp / SMS Notification
      if (destinataire.phone) {
        const { sendOpenWAMessage } = await import("@/lib/openwa");
        const { sendSMS } = await import("@/lib/sms");
        const waText = `*QAPRIL — Nouvelle Candidature*\n\nBonjour ${destinataire.name || "Bailleur"},\n\n*${nomCandidat}* vient de postuler pour votre bien *${bienTitre}*.\n\n📱 Téléphone : ${data.telephone}\n💼 Employeur : ${data.employeur || "Non renseigné"}\n💰 Revenu : ${data.revenuMensuel ? `${data.revenuMensuel.toLocaleString()} FCFA` : "Non précisé"}\n\nPour valider le dossier, introduire le contrat de bail ou demander des compléments, connectez-vous : ${matchingUrl}`;

        const waRes = await sendOpenWAMessage(destinataire.phone, waText).catch(() => ({ success: false }));
        if (!waRes?.success) {
          await sendSMS(destinataire.phone, `QAPRIL : Nouvelle candidature de ${nomCandidat} pour "${bienTitre}". Consultez et validez le dossier sur : ${matchingUrl}`).catch(() => null);
        }
      }
    }
  } catch (notifErr) {
    console.error("[Candidature Notification Error]", notifErr);
  }

  return candidature;
}

// Candidatures pour un logement
export async function getCandidaturesLogement(logementId: string) {
  return prisma.candidature.findMany({
    where:   { logementId },
    orderBy: [{ scoreQapril: "desc" }, { createdAt: "asc" }]
  });
}

// Parametrer les charges d'un logement
export async function parametrerCharges(logementId: string, charges: Array<{
  typeCharge: string; // EAU|ELECTRICITE_COMMUNE|GARDIENNAGE|TOM
  mode?:      string; // FORFAIT|PROVISION_REELLE
  montantMensuel: number;
}>) {
  const ops = charges.map(c => prisma.chargeParametrage.create({
    data: { logementId, ...c }
  }));
  return Promise.all(ops);
}
