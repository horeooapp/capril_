import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireLayoutClient from "./layout-client"
import { prisma } from "@/lib/prisma"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Si l'utilisateur n'est pas connecté, permettre l'accès aux pages publiques de l'espace (ex: /mon-espace-locataire/login)
    if (!session?.user) {
        return (
            <LocataireLayoutClient session={null} onLogout={logout as any}>
                {children}
            </LocataireLayoutClient>
        )
    }

    // RÔLE ACTIF : Priorité absolue au rôle de session choisi à la connexion
    const computedRole = (session?.user as any)?.chosenRole || session?.user?.role;

    // Si le rôle actif est Propriétaire ou Admin, renvoyer immédiatement vers son dashboard respectif
    if (computedRole && !['TENANT', 'LOCATAIRE'].includes(computedRole)) {
        if (['ADMIN', 'SUPER_ADMIN'].includes(computedRole)) {
            redirect("/admin");
        } else {
            redirect("/dashboard");
        }
    }

    // Sécurité : Onboarding locataire
    if (computedRole === "TENANT") {
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { onboardingComplete: true }
            });

            if (user && !user.onboardingComplete) {
                return redirect("/onboarding/tenant");
            }
        } catch (dbError) {
            console.error("[LAYOUT-LOCATAIRE] Error in Onboarding Check:", dbError);
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
