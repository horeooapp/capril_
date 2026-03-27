import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPublicProfile } from "@/actions/locataire-profil-public"
import { ProfilPublicLocataireClient } from "@/components/locataire/ProfilPublicLocataireClient"

export default async function ProfilPublicPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/locataire/login")

    const profil = await getPublicProfile(session.user.id)

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter mb-8">Profil Public Expert.</h1>
            <ProfilPublicLocataireClient 
                userId={session.user.id} 
                initialData={profil} 
            />
        </div>
    )
}
