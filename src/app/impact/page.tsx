import ImpactClient from "@/components/public/ImpactClient";
import { getGlobalMarketStats } from "@/actions/observatory-actions";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const stats = await getGlobalMarketStats(10);
  
  return <ImpactClient stats={stats} />;
}
