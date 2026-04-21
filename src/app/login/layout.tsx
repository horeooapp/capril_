import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/features";

export default async function CentralLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLandingModeActif = await isFeatureEnabled("LANDING_PAGE");
  
  // Retrait de la redirection forcée pour permettre l'accès aux portails même en mode restreint
  /*
  if (isLandingModeActif) {
    redirect("/");
  }
  */

  return <>{children}</>;
}
