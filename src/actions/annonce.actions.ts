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
    where: { logementId: data.logementId },
    select: { 
      id: true,
      loyerDemande: true, 
      titre: true,
      agenceId: true,
      agence: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true }
      }
    },
    orderBy: { publieeAt: "desc" }
  });

  if (annonce) {
    loyerDemande = annonce.loyerDemande;
    if (data.revenuMensuel && data.revenuMensuel > 0) {
      tauxEffort = parseFloat(((annonce.loyerDemande / data.revenuMensuel) * 100).toFixed(1));
    }
  }

  const candidature = await prisma.candidature.create({
    data: { 
      logementId: data.logementId,
      candidatId: data.candidatId || null,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      revenuMensuel: data.revenuMensuel ?? null,
      employeur: data.employeur ?? null,
      tauxEffort, 
      statut: "SOUMISE" 
    }
  });

  // Incrémenter le compteur de candidatures sur l'annonce si existante
  if (annonce?.id) {
    await prisma.annonce.update({
      where: { id: annonce.id },
      data: { nbCandidatures: { increment: 1 } }
    }).catch(() => null);
  }

  // Notifier le propriétaire / gestionnaire du logement
  try {
    const logement = await prisma.property.findUnique({
      where: { id: data.logementId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        manager: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }
      }
    });

    if (logement) {
      const nomCandidat = `${data.prenom} ${data.nom}`.trim();
      const bienTitre = logement.name || (logement as any).unitLabel || logement.address || annonce?.titre || "Logement";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qapril.net";
      const matchingUrl = `${appUrl}/dashboard/matching`;

      // Déterminer tous les destinataires à alerter
      const destinataires: Array<{ id: string; name: string; email: string | null; phone: string | null; role: string }> = [];

      // 1. Le Propriétaire (Bailleur)
      if (logement.owner) {
        const ownerName = [logement.owner.firstName, logement.owner.lastName].filter(Boolean).join(" ") || "Propriétaire";
        destinataires.push({
          id: logement.owner.id,
          name: ownerName,
          email: logement.owner.email,
          phone: logement.owner.phone,
          role: "Bailleur"
        });
      }

      // 2. L'Agence gestionnaire mandatée (si différente du propriétaire)
      if (logement.manager && !destinataires.some(d => d.id === logement.manager!.id)) {
        const managerName = [logement.manager.firstName, logement.manager.lastName].filter(Boolean).join(" ") || "Gestionnaire";
        destinataires.push({
          id: logement.manager.id,
          name: managerName,
          email: logement.manager.email,
          phone: logement.manager.phone,
          role: "Agence Gestionnaire"
        });
      }

      // 3. L'Agence ayant publié l'annonce (si différente)
      if (annonce?.agence && !destinataires.some(d => d.id === annonce.agence.id)) {
        const agenceName = [annonce.agence.firstName, annonce.agence.lastName].filter(Boolean).join(" ") || "Agence Partenaire";
        destinataires.push({
          id: annonce.agence.id,
          name: agenceName,
          email: annonce.agence.email,
          phone: annonce.agence.phone,
          role: "Agence"
        });
      }

      for (const dest of destinataires) {
        // 1. Notification In-App
        await prisma.notification.create({
          data: {
            userId: dest.id,
            title: "🏡 Nouvelle candidature reçue",
            content: `${nomCandidat} a postulé pour votre bien "${bienTitre}". Cliquez pour examiner le dossier.`,
            type: "MATCHING_CANDIDATURE",
            link: "/dashboard/matching",
            channel: "IN_APP",
            status: "sent"
          }
        }).catch(err => console.error("[Candidature In-App Notif Error]", err));

        // 2. Email Notification
        if (dest.email) {
          try {
            const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
            const emailContent = `
              <p style="margin: 0 0 16px 0;">Bonjour <strong>${dest.name}</strong>,</p>
              <p style="margin: 0 0 16px 0;">Un locataire vient de sélectionner et de déposer son dossier pour votre bien <strong>${bienTitre}</strong> sur la marketplace QAPRIL.</p>
              
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Candidat :</strong> ${nomCandidat}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Téléphone :</strong> ${data.telephone}</p>
                ${data.employeur ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Employeur / Métier :</strong> ${data.employeur}</p>` : ""}
                ${data.revenuMensuel ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Revenu mensuel déclaré :</strong> ${data.revenuMensuel.toLocaleString("fr-FR")} XOF</p>` : ""}
                ${tauxEffort ? `<p style="margin: 0; font-size: 14px;"><strong>Taux d'effort estimé :</strong> ${tauxEffort}%</p>` : ""}
              </div>

              <p style="margin: 0 0 24px 0;">Depuis votre espace QAPRIL, vous pouvez accepter le dossier et générer directement le contrat de bail, demander des compléments ou refuser la candidature.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${matchingUrl}" style="background-color: #FF8200; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; display: inline-block;">
                  Examiner la candidature & introduire le bail →
                </a>
              </div>
            `;

            await sendEmail({
              to: dest.email,
              subject: `🏡 Nouvelle candidature pour ${bienTitre} - QAPRIL`,
              html: wrapInPremiumTemplate(emailContent, "Nouvelle Candidature Locative")
            });
          } catch (err) {
            console.error("[Candidature Email Error]", err);
          }
        }

        // 3. WhatsApp / SMS Notification
        if (dest.phone) {
          try {
            const { sendOpenWAMessage } = await import("@/lib/openwa");
            const { sendSMS } = await import("@/lib/sms");
            const waText = `*QAPRIL — Nouvelle Candidature*\n\nBonjour ${dest.name},\n\n*${nomCandidat}* vient de postuler pour votre bien *${bienTitre}*.\n\n📱 Téléphone : ${data.telephone}\n💼 Employeur : ${data.employeur || "Non renseigné"}\n💰 Revenu : ${data.revenuMensuel ? `${data.revenuMensuel.toLocaleString("fr-FR")} XOF` : "Non précisé"}\n\nPour valider le dossier, introduire le contrat de bail ou demander des compléments, connectez-vous : ${matchingUrl}`;

            const waRes = await sendOpenWAMessage(dest.phone, waText).catch(() => ({ success: false }));
            if (!waRes?.success) {
              await sendSMS(dest.phone, `QAPRIL : Nouvelle candidature de ${nomCandidat} pour "${bienTitre}". Consultez et validez le dossier sur : ${matchingUrl}`).catch(() => null);
            }
          } catch (smsErr) {
            console.error("[Candidature SMS/WhatsApp Error]", smsErr);
          }
        }
      }

      // 4. Confirmation In-App au candidat
      if (data.candidatId) {
        await prisma.notification.create({
          data: {
            userId: data.candidatId,
            title: "✅ Candidature transmise",
            content: `Votre candidature pour le bien "${bienTitre}" a bien été transmise au propriétaire bailleur. Vous serez notifié dès son traitement.`,
            type: "INFO",
            link: "/mon-espace-locataire/marketplace",
            channel: "IN_APP",
            status: "sent"
          }
        }).catch(() => null);
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
