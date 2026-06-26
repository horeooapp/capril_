import Link from "next/link";
import { auth } from "@/auth";
import QaprilLandingV2 from "@/components/landing-v2/QaprilLandingV2";
import RestrictedPortal from "@/components/landing-v3/RestrictedPortal";
import { isFeatureEnabled } from "@/lib/features";
import { isPaywallActive } from "@/lib/paywall-utils";

export const revalidate = 60; // Cache the landing page structure for 1 minute

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

  // LOGIQUE DE ROUTAGE (PORTAIL RESTREINT VS MARKETING PUBLIC)
  if (isLandingModeActif) {
      if (adminConnected) {
          return <QaprilLandingV2 session={session} paywallActif={paywallActif} />; // Admin passe au travers
      } else {
          return <RestrictedPortal />; // Public bloqué sur le Premium Portal
      }
  } else {
      // Mode restreint désactivé -> Le site est public pour tout le monde
      return <QaprilLandingV2 session={session} paywallActif={paywallActif} />;
  }
}

