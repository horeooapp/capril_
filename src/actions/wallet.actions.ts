"use server";
// QAPRIL — Wallet ADD-07 v3 · Deep Links · Rechargement Auto

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SEUIL_DEFAUT = Number(process.env.QAPRIL_WALLET_SEUIL_DEFAUT ?? 1000);
const PRIX_Q       = Number(process.env.QAPRIL_QUITTANCE_PRIX_FCFA ?? 90);
const MOIS_COUV    = 2;

// Deep links opérateurs
const DEEPLINKS: Record<string, string> = {
  WAVE:   `https://pay.wave.com/m/${process.env.QAPRIL_WAVE_MERCHANT_ID}?amount={amt}&note=Recharge+Wallet+QAPRIL&ref={ref}`,
  ORANGE: `orangemoney://pay?merchant=${process.env.QAPRIL_OM_MERCHANT_ID}&amount={amt}&reference={ref}&note=Recharge`,
  MTN:    `https://momo.mtn.ci/pay?receiver=${process.env.QAPRIL_MTN_MERCHANT_ID}&amount={amt}&externalId={ref}`,
  MOOV:   `https://moovmoney.ci/pay?merchant=${process.env.QAPRIL_MOOV_MERCHANT_ID}&amount={amt}&ref={ref}`,
  DEFAULT:`https://qapril.ci/recharger?montant={amt}&op={op}&ref={ref}`,
};

// ── Calcul montant suggéré ────────────────────────────────
export async function calculerMontantRecharge(
  userId:  string,
  option:  "MINIMUM" | "RECOMMANDE" | "CONFORT" = "RECOMMANDE"
) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { walletConfig: { select: { walletBalance: true } } }
  });
  const nbBails = await prisma.lease.count({
    where: { landlordId: userId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } }
  });
  const solde    = (user?.walletConfig?.walletBalance || 0) ?? 0;
  const besoin   = (nbBails * PRIX_Q * MOIS_COUV) - solde;
  const minimum  = Math.max(500, Math.ceil(besoin / 500) * 500);
  if (option === "MINIMUM")    return minimum;
  if (option === "RECOMMANDE") return Math.max(500, Math.ceil(minimum * 1.5 / 500) * 500);
  return nbBails > 50 ? 20000 : 5000; // CONFORT
}

// ── Générer deep link ─────────────────────────────────────
export async function genererDeepLink(
  userId: string,
  operateur: "WAVE" | "ORANGE" | "MTN" | "MOOV",
  montant:   number
) {
  const ref  = `WLT-${Date.now().toString(36).toUpperCase()}`;
  const base = DEEPLINKS[operateur] ?? DEEPLINKS.DEFAULT;
  const url  = base.replace("{amt}", String(montant))
                   .replace("{ref}", ref)
                   .replace("{op}",  operateur);
  return { url, ref };
}

// ── Déclencheur 1 : Alerte solde bas ─────────────────────
export async function checkAndAlertSoldeBas(userId: string) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { walletConfig: { select: { walletBalance: true, walletSeuilAlerte: true, walletOperateurPrefere: true, walletCanalAlertePref: true } } }
  });
  if (!user) return;
  const seuil = user?.walletConfig?.walletSeuilAlerte ?? SEUIL_DEFAUT;
  if (((user?.walletConfig?.walletBalance || 0) || 0) < seuil) {
    const montant = await calculerMontantRecharge(userId, "RECOMMANDE");
    const { url, ref } = await genererDeepLink(
      userId,
      (user?.walletConfig?.walletOperateurPrefere as any) ?? "WAVE",
      montant
    );
    // Logger le lien dans wallet_recharge_links
    await prisma.walletRechargeLink.create({
      data: {
        userId, declencheur: "SOLDE_BAS",
        operateur: (user?.walletConfig?.walletOperateurPrefere as any) ?? "WAVE",
        montantSuggere: montant,
        soldeAuMoment: ((user?.walletConfig?.walletBalance || 0) || 0),
        nbBailsActifs: await prisma.lease.count({
          where: { landlordId: userId, status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } }
        }),
        urlGeneree: url, canalEnvoi: user?.walletConfig?.walletCanalAlertePref ?? "WHATSAPP",
        expireAt: new Date(Date.now() + 48 * 3600 * 1000)
      }
    });
    return { alerte: true, montant, url, ref };
  }
  return { alerte: false };
}

// ── Lire config rappel ───────────────────────────────────
export async function getWalletConfig(userId: string) {
  return prisma.walletRechargeConfig.findUnique({ where: { userId } });
}

// ── Sauvegarder config rappel ────────────────────────────
export async function updateWalletConfig(userId: string, data: {
  rappelActif?:       boolean;
  jourDuMois?:        number;
  montantFixe?:       number;
  operateurPrefere?:  string;
  canalPrefere?:      string;
}) {
  return prisma.walletRechargeConfig.upsert({
    where:  { userId },
    update: data,
    create: { userId, ...data }
  });
}

// ── Historique des liens envoyés ─────────────────────────
export async function getRechargeLinks(userId: string, limit = 20) {
  return prisma.walletRechargeLink.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    take:    limit
  });
}

// ── Marquer un lien comme cliqué ────────────────────────
export async function markLinkClicked(linkId: string) {
  return prisma.walletRechargeLink.update({
    where: { id: linkId },
    data:  { clique: true, cliqueAt: new Date() }
  });
}
