import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MatchingClient } from "@/components/dashboard/MatchingClient"
import { getProperties } from "@/actions/properties"

export default async function MatchingPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/auth/login")

    const properties = await getProperties()

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none mb-4 uppercase">
                    Matching.
                </h1>
                <p className="text-gray-500 font-medium tracking-wide">
                    Trouvez le locataire idéal via son numéro mobile ou par critères de recherche avancés.
                </p>
            </div>

            <MatchingClient 
                userRole={session.user.role} 
                properties={properties} 
                userId={session.user.id}
            />
        </div>
    )
}
