import Link from "next/link";
import { auth } from "@/auth";
import QaprilLandingV2 from "@/components/landing-v2/QaprilLandingV2";
import RestrictedPortal from "@/components/landing-v3/RestrictedPortal";
import { isFeatureEnabled } from "@/lib/features";
import { isPaywallActive } from "@/lib/paywall-utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    console.error("[HOME] Error during initial auth fetch:", error);
  }

  // 1. Lire le bouton dans la Base de données
  const isLandingModeActif = await isFeatureEnabled("LANDING_PAGE");
  
  // 2. Vérifier si un Admin est en ligne
  const adminConnected = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  // 3. Etat du paywall
  const paywallActif = await isPaywallActive();

  // LOGIQUE DE ROUTAGE (VITRINE PUBLIQUE LANDING PAGE VS PORTAIL RESTREINT)
  // Si LANDING_PAGE est désactivé et que l'utilisateur n'est pas admin, affichage du portail restreint.
  // Par défaut et en mode public normal, affichage de la vitrine marketing QaprilLandingV2 pour tous.
  if (!isLandingModeActif && !adminConnected) {
      return <RestrictedPortal />;
  }

  return <QaprilLandingV2 session={session} paywallActif={paywallActif} />;
}

