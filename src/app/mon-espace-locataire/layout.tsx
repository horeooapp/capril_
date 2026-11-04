import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

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
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    const isLoginPage = pathname.includes('/mon-espace-locataire/login')

    // Si l'utilisateur n'est pas connecté
    if (!session?.user) {
        if (isLoginPage) {
            return <>{children}</>;
        }
        return redirect("/mon-espace-locataire/login");
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

    // Si l'utilisateur connecté visite la page de connexion locataire, rediriger directement vers l'espace
    if (isLoginPage) {
        return redirect("/mon-espace-locataire");
    }

    // Sécurité : Onboarding locataire
    if (computedRole === "TENANT" && dbUser && !dbUser.onboardingComplete) {
        return redirect("/onboarding/tenant");
    }

    const handleLogout = async () => {
        "use server"
        await logout("/mon-espace-locataire/login")
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
