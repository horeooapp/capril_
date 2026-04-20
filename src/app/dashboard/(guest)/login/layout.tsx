import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/features";

export default async function LandlordLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLandingModeActif = await isFeatureEnabled("LANDING_PAGE");
  
  if (isLandingModeActif) {
    redirect("/");
  }

  return <>{children}</>;
}
