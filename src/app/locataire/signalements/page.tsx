import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getSignalementsLocataire } from "@/actions/signalements"
import { getLocataireDashboardData } from "@/actions/locataire-profile"
import SignalementsLocataireClient from "@/components/locataire/SignalementsLocataireClient"

export default async function SignalementsPage() {
    const session = await auth()
    const activeRole = (session?.user as any)?.chosenRole || session?.user?.role;
    if (!session?.user || activeRole !== "TENANT") redirect("/locataire/login")

    const [signalements, dashboardData] = await Promise.all([
        getSignalementsLocataire(session.user.id),
        getLocataireDashboardData(session.user.id)
    ])

    return (
        <SignalementsLocataireClient 
            initialSignalements={signalements}
            bails={dashboardData.bails}
            userId={session.user.id}
        />
    )
}
