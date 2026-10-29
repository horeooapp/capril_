import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireHeader from "@/components/locataire/LocataireHeader"
import BottomNav from "@/components/BottomNav"
import { Home, Receipt, Bell, User } from "lucide-react"

import LocataireLayoutClient from "./layout-client"
import { prisma } from "@/lib/prisma"
import { isRoleGloballyActive } from "@/lib/role-lock"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/mon-espace-locataire/login");
    }

    // RÔLE ACTIF : Priorité absolue au rôle de session choisi à la connexion
    const computedRole = (session?.user as any)?.chosenRole || session?.user?.role;

    // Si le rôle actif n'est pas Locataire, renvoyer immédiatement vers le dashboard propriétaire ou admin
    if (computedRole && !['TENANT', 'LOCATAIRE'].includes(computedRole)) {
        if (['ADMIN', 'SUPER_ADMIN'].includes(computedRole)) {
            redirect("/admin");
        } else {
            redirect("/dashboard");
        }
    }


    // 3. Security: Check onboarding but with extreme robustness
    if (computedRole === "TENANT") {
        try {
            if (!session?.user?.id) {
                // Should not happen, but prevents Prisma crash
                return redirect("/mon-espace-locataire/login")
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { onboardingComplete: true }
            })

            if (!user) {
                // User probably deleted after DB reset
                return redirect("/mon-espace-locataire/login")
            }

            if (!user.onboardingComplete) {
                return redirect("/onboarding/tenant")
            }
        } catch (dbError) {
            console.error("[LAYOUT-LOCATAIRE] Critical Error in Onboarding Check:", dbError)
            // If DB is failing, better to allow access with a console log than to crash everything
            // or we could redirect to a maintenance page
        }
    }

    const handleLogout = async () => {
        "use server"
        await logout()
    }

    return (
        <LocataireLayoutClient
            session={session}
            onLogout={handleLogout}
            dbActiveRole={computedRole}
        >
            {children}
        </LocataireLayoutClient>
    )
}