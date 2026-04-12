import { TrustHistory } from "@/components/dashboard/tenant/TrustHistory";
import { getLocataireDashboardData } from "@/actions/locataire-profile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TrustPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getLocataireDashboardData(session.user.id);
  const score = data?.profile?.scoreActuel || 750; // Fallback to Silver baseline if not found
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <TrustHistory score={score} />
    </div>
  );
}
