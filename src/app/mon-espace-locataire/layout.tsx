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

    // Si l'utilisateur n'est pas connecté, afficher les pages publiques sans le shell du dashboard (ex: /mon-espace-locataire/login)
    if (!session?.user) {
        return <>{children}</>;
    }

    // RÔLE ACTIF : Récupérer la capacité active en base pour les comptes multi-profils
    const dbUser = await (prisma as any).user.findUnique({
        where: { id: session.user.id },
        select: { capaciteActive: true, onboardingComplete: true, role: true }
    });

    const computedRole = dbUser?.capaciteActive || (session?.user as any)?.chosenRole || session?.user?.role || 'TENANT';

    // Si le rôle actif est Propriétaire ou Admin, renvoyer immédiatement vers son dashboard respectif
    if (computedRole && !['TENANT', 'LOCATAIRE'].includes(computedRole)) {
        if (['ADMIN', 'SUPER_ADMIN'].includes(computedRole)) {
            return redirect("/admin");
        } else {
            return redirect("/dashboard");
        }
    }

    // Sécurité : Onboarding locataire
    if (computedRole === "TENANT" && dbUser && !dbUser.onboardingComplete) {
        return redirect("/onboarding/tenant");
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
