import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LocatairePortalWrapper from "./LocatairePortalWrapper"

export const dynamic = "force-dynamic"

export default async function LocataireDashboardPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    return (
        <LocatairePortalWrapper />
    )
}
