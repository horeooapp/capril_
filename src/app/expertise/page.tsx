import ExpertiseClient from "@/components/public/ExpertiseClient";
import { getGlobalMarketStats } from "@/actions/observatory-actions";

export const dynamic = "force-dynamic";

export default async function ExpertisePage() {
  const stats = await getGlobalMarketStats(3);
  
  return <ExpertiseClient stats={stats} />;
}
