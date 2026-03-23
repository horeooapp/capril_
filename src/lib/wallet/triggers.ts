import { prisma } from "@/lib/prisma";
import { calculateSuggestedRecharge } from "./calculator";
import { generateDeepLink, Operator } from "./deeplinks";
import { sendSMS } from "@/lib/sms";
// import { sendWhatsApp } from "@/lib/whatsapp"; // A implémenter si besoin

export async function processWalletTriggers() {
  const now = new Date();
  const today = now.getDate();
  const isEndOfMonth = today >= 25 && today <= 28;

  // 1. Récupérer tous les utilisateurs ayant des baux actifs
  const users = await prisma.user.findMany({
    where: {
      status: "active",
      leasesAsLandlord: { some: { status: "ACTIVE" } }
    },
    include: {
      walletRechargeConfig: true,
      _count: {
        select: { leasesAsLandlord: { where: { status: "ACTIVE" } } }
      }
    }
  });

  for (const user of users) {
    try {
      let triggerType: "SOLDE_BAS" | "FIN_DE_MOIS" | "RAPPEL_MENSUEL" | null = null;

      // --- TRIGGER 1: Solde Bas ---
      const seuil = user.walletSeuilAlerte?.toNumber() || 500;
      if (user.walletBalance < seuil) {
        // Vérifier si une alerte a été envoyée dans les dernières 24h
        const lastAlert = await prisma.walletRechargeLink.findFirst({
          where: {
            userId: user.id,
            declencheur: "SOLDE_BAS",
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          }
        });

        if (!lastAlert) triggerType = "SOLDE_BAS";
      }

      // --- TRIGGER 2: Fin de mois (si pas déjà déclenché par Solde Bas) ---
      if (!triggerType && isEndOfMonth) {
        const besoinMoisSuivant = user._count.leasesAsLandlord * 75;
        if (user.walletBalance < besoinMoisSuivant) {
          triggerType = "FIN_DE_MOIS";
        }
      }

      // --- TRIGGER 3: Rappel mensuel programmé ---
      if (!triggerType && user.walletRechargeConfig?.rappelActif && user.walletRechargeConfig.jourDuMois === today) {
        // Vérifier si déjà envoyé ce mois-ci
        const lastRappel = user.walletRechargeConfig.dernierRappelAt;
        if (!lastRappel || lastRappel.getMonth() !== now.getMonth()) {
          triggerType = "RAPPEL_MENSUEL";
        }
      }

      if (triggerType) {
        await sendRechargeNotification(user, triggerType);
      }
    } catch (err) {
      console.error(`Erreur trigger pour user ${user.id}:`, err);
    }
  }
}

async function sendRechargeNotification(user: any, trigger: "SOLDE_BAS" | "FIN_DE_MOIS" | "RAPPEL_MENSUEL") {
  const options = await calculateSuggestedRecharge(user.id);
  const amount = options.recommande;
  const operator = (user.walletOperateurPrefere || "WAVE") as Operator;
  const ref = `AUTO-${trigger}-${Date.now()}`;

  const rawUrl = await generateDeepLink(operator, amount, ref);

  // Créer le lien de tracking
  const rechargeLink = await prisma.walletRechargeLink.create({
    data: {
      userId: user.id,
      declencheur: trigger,
      operateur: operator,
      montantSuggere: amount,
      soldeAuMoment: user.walletBalance,
      nbBailsActifs: user._count.leasesAsLandlord,
      urlGeneree: rawUrl,
      canalEnvoi: user.walletCanalAlertePref || "WHATSAPP",
      expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    }
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://qapril.ci";
  const trackerUrl = `${baseUrl}/api/v1/wallet/deeplink/${rechargeLink.id}/tracker`;

  let message = "";
  if (trigger === "SOLDE_BAS") {
    message = `⚠️ ${user.fullName || 'Propriétaire'}, votre Wallet QAPRIL est presque vide (${user.walletBalance} FCFA). Rechargez pour continuer vos quittances :\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
  } else if (trigger === "FIN_DE_MOIS") {
    message = `📅 ${user.fullName || 'Propriétaire'}, préparez le mois prochain. Vos ${user._count.leasesAsLandlord} baux arrivent à échéance.\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
  } else {
    message = `📆 Rappel mensuel QAPRIL. Solde : ${user.walletBalance} FCFA.\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
  }

  // Envoi effectif
  if (user.walletCanalAlertePref === "SMS") {
    await sendSMS(user.phone, message);
  } else {
    // Par défaut WhatsApp (à enrichir avec le service WHATSAPP réel)
    console.log(`[WHATSAPP] Envoyer à ${user.phone}: ${message}`);
    // await sendWhatsApp(user.phone, message); 
  }
  
  // Mettre à jour la config rappel si c'est le cas
  if (trigger === "RAPPEL_MENSUEL") {
    await prisma.walletRechargeConfig.update({
      where: { userId: user.id },
      data: {
        dernierRappelAt: new Date(),
        nbRappelsEnvoyes: { increment: 1 }
      }
    });
  }
}
