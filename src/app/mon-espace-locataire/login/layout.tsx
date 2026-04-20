import { redirect } from "next/navigation";
import { isFeatureEnabled } from "@/lib/features";

export default async function TenantLoginLayout({
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
