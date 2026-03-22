import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPasseportsLocataire } from "@/actions/passeport"
import PasseportLocataireClient from "@/components/locataire/PasseportLocataireClient"

export default async function PasseportPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== "TENANT") redirect("/auth/login")

    const passeports = await getPasseportsLocataire(session.user.id)

    return (
        <PasseportLocataireClient 
            passeports={passeports}
            userId={session.user.id}
        />
    )
}
