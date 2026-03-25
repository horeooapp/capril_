import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLocataireInvitations } from "@/actions/invitations"
import { InvitationsLocataireClient } from "@/components/locataire/InvitationsLocataireClient"

export default async function InvitationsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/locataire/login")

    const invitations = await getLocataireInvitations(session.user.id)

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Invitations Reçues</h1>
            <InvitationsLocataireClient 
                initialInvitations={invitations} 
            />
        </div>
    )
}
