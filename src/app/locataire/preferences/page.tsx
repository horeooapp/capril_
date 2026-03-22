import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAlertesPreferences } from "@/actions/locataire-profile"
import PreferencesLocataireClient from "@/components/locataire/PreferencesLocataireClient"

export const dynamic = "force-dynamic"

export default async function PreferencesPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/auth/login")
    }

    const profile = await getAlertesPreferences(session.user.id)

    return (
        <PreferencesLocataireClient 
            profile={profile}
            userId={session.user.id}
        />
    )
}
