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

  // Etat du paywall
  const paywallActif = await isPaywallActive();

  // VITRINE OFFICIELLE D'ACCUEIL QAPRIL
  // La vitrine marketing avec le showcase vidéo officiel (FNUI & Enregistrement du Bail)
  // est la porte d'entrée publique pour tous les visiteurs et utilisateurs.
  return <QaprilLandingV2 session={session} paywallActif={paywallActif} />;
}

