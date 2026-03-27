import { prisma } from "@/lib/prisma";
import { calculateSuggestedRecharge } from "./calculator";
import { generateDeepLink, Operator } from "./deeplinks";
import { sendSMS } from "@/lib/sms";
// import { sendWhatsApp } from "@/lib/whatsapp"; // A implémenter si besoin

/**
 * Service central des déclencheurs de recharge (ADD-07 v3).
 * Surveille les soldes et génère les notifications contextuelles.
 */
export async function processWalletTriggers() {
  const now = new Date();
  const today = now.getDate();
  
  // 1. Récupérer les constantes globales depuis ConfigTarif
  const configs = await prisma.configTarif.findMany({
    where: {
      cle: { in: ["wallet_seuil_alerte_defaut", "wallet_alerte_max_par_jour", "quittance_ttc"] }
    }
  });

  const SEUIL_DEFAUT = configs.find(c => c.cle === "wallet_seuil_alerte_defaut")?.valeur || 500;
  const MAX_ALERTES = configs.find(c => c.cle === "wallet_alerte_max_par_jour")?.valeur || 3;
  const PRIX_UNITE = configs.find(c => c.cle === "quittance_ttc")?.valeur || 75;

  const isEndOfMonth = today >= 25 && today <= 28;

  // 2. Traiter les utilisateurs actifs
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
      let triggerType: "SOLDE_BAS" | "FIN_DE_MOIS" | "RAPPEL_MENSUEL" | "CREDIT_GENERE" | null = null;

      // --- TRIGGER 1: Solde Bas ---
      const seuil = user.walletSeuilAlerte || SEUIL_DEFAUT;
      if ((user.walletBalance as number) < (seuil as number) && (user.walletBalance as number) >= 0) {
        // Vérifier le quota quotidien d'alertes auto
        const nbAlertes24h = await prisma.walletRechargeLink.count({
          where: {
            userId: user.id,
            declencheur: { in: ["SOLDE_BAS", "FIN_DE_MOIS"] },
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
          }
        });

        if (nbAlertes24h < MAX_ALERTES) {
          triggerType = "SOLDE_BAS";
        }
      }

      // --- TRIGGER 2: Fin de mois ---
      if (!triggerType && isEndOfMonth) {
        const besoinMoisSuivant = user._count.leasesAsLandlord * PRIX_UNITE;
        if ((user.walletBalance || 0) < besoinMoisSuivant) {
          triggerType = "FIN_DE_MOIS";
        }
      }

      // --- TRIGGER 3: Rappel mensuel programmé ---
      if (!triggerType && user.walletRechargeConfig?.rappelActif && user.walletRechargeConfig.jourDuMois === today) {
        const lastRappel = user.walletRechargeConfig.dernierRappelAt;
        if (!lastRappel || lastRappel.getMonth() !== now.getMonth()) {
          triggerType = "RAPPEL_MENSUEL";
        }
      }

      if (triggerType) {
        await sendRechargeNotification(user.id, triggerType);
      }
    } catch (err) {
      console.error(`Erreur trigger pour user ${user.id}:`, err);
    }
  }
}

/**
 * Déclencheur immédiat pour le mode Crédit (ADD-07 v3).
 * Appelé par l'action de génération de quittance.
 */
export async function triggerCreditGenere(userId: string) {
  return sendRechargeNotification(userId, "CREDIT_GENERE");
}

async function sendRechargeNotification(userId: string, trigger: "SOLDE_BAS" | "FIN_DE_MOIS" | "RAPPEL_MENSUEL" | "CREDIT_GENERE") {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { leasesAsLandlord: { where: { status: "ACTIVE" } } }
      }
    }
  });

  if (!user) return;

  const options = await calculateSuggestedRecharge(user.id);
  const amount = options.recommande;
  const operator = (user.walletOperateurPrefere || "WAVE") as Operator;
  const ref = `AUTO-${trigger}-${Date.now()}`;

  const rawUrl = await generateDeepLink(operator, amount, ref);

  // 1. Créer le lien de tracking pour analyse de conversion
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

  // 2. Templates 2026 (Zero Friction)
  let message = "";
  const name = user.fullName || 'Propriétaire';
  const balance = user.walletBalance || 0;

  switch (trigger) {
    case "SOLDE_BAS":
      message = `⚠️ ${name}, votre Wallet QAPRIL est presque vide (${balance} FCFA). Rechargez en 1 clic pour ne pas bloquer vos quittances :\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
      break;
    case "FIN_DE_MOIS":
      message = `📅 ${name}, préparez le mois prochain. Vos ${user._count.leasesAsLandlord} baux arrivent à échéance.\n👉 Provisionner ${amount} FCFA : ${trackerUrl}`;
      break;
    case "CREDIT_GENERE":
      message = `🚀 Quittance générée en mode CRÉDIT ! Votre solde est de ${balance} FCFA. Régularisez d'un clic pour maintenir votre service :\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
      break;
    case "RAPPEL_MENSUEL":
      message = `📆 Rappel mensuel QAPRIL. Maintenez votre provision pour une gestion sereine. Solde : ${balance} FCFA.\n👉 Recharger ${amount} FCFA : ${trackerUrl}`;
      break;
  }

  // 3. Envoi effectif
  if (user.walletCanalAlertePref === "SMS") {
    await sendSMS(user.phone || "", message);
  } else {
    // Par défaut WhatsApp (Mock implementation for now)
    console.log(`[WHATSAPP 2026] Envoyer à ${user.phone}: ${message}`);
  }
  
  // 4. Mettre à jour les stats de rappel
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
