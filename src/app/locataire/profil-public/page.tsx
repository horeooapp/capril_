import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPublicProfile } from "@/actions/locataire-profil-public"
import { ProfilPublicLocataireClient } from "@/components/locataire/ProfilPublicLocataireClient"

export default async function ProfilPublicPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/auth/login")

    const profil = await getPublicProfile(session.user.id)

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Gestion de mon Profil Public</h1>
            <ProfilPublicLocataireClient 
                userId={session.user.id} 
                initialData={profil} 
            />
        </div>
    )
}
