import { getSyndicates } from "@/actions/syndic-actions"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SyndicDashboardClient from "./syndic-client"

export const dynamic = "force-dynamic"

export default async function SyndicDashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/dashboard/login");
    }

    // Le module Syndic & Copropriété est 100% gratuit et libre d'accès
    const syndicates = await getSyndicates();

    return <SyndicDashboardClient initialSyndicates={syndicates || []} />;
}
