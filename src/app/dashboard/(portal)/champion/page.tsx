import { auth } from "@/auth";
import { getChampionProfile, getLeaderboard } from "@/actions/champion-actions";
import ChampionDashboardClient from "./champion-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChampionPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/dashboard/login");
    return null;
  }

  const profile = await getChampionProfile(session.user.id);
  const leaderboard = await getLeaderboard(profile?.zonePrincipale);

  return (
    <ChampionDashboardClient 
      user={session.user} 
      profile={profile} 
      leaderboard={leaderboard} 
    />
  );
}
