import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewPropertyClient from "./NewPropertyClient"
import RequireAgencyProfile from "@/components/dashboard/agency/RequireAgencyProfile"

export default async function NewPropertyPage() {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/auth/login")
    }

    // Step 1: Enforce Agency Profile if the user has the AGENCY role
    if (session.user.role === "AGENCY") {
        // Find if they have a completed profile
        const agencyProfile = await prisma.agenceProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!agencyProfile || !agencyProfile.nomAgence || !agencyProfile.rccm || !agencyProfile.dfe) {
            // Render the blocking barrier form
            return <RequireAgencyProfile />
        }
    }

    // Otherwise, render the standard Property Registration form
    return <NewPropertyClient />
}
