import { getSyndicates } from "@/actions/syndic-actions"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import SyndicDashboardClient from "./syndic-client"
import SyndicPaywall from "./syndic-paywall"

export default async function SyndicDashboardPage() {
    const session = await auth();
    if (!session?.user) return null;

    // Check if user has paid the SaaS subscription
    const subscriptionTx = await prisma.walletTransaction.findFirst({
        where: {
            userId: session.user.id,
            referenceId: { startsWith: "SAAS_SYNDIC_" },
            status: "COMPLETED"
        }
    });

    if (!subscriptionTx) {
        return <SyndicPaywall />;
    }

    const syndicates = await getSyndicates()

    return <SyndicDashboardClient initialSyndicates={syndicates} />
}
