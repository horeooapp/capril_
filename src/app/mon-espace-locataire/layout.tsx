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
    const currentPath = headersList.get("x-pathname") || ""

    // Si on est sur la page de connexion de l'espace locataire
    if (currentPath.startsWith("/mon-espace-locataire/login")) {
        if (session?.user) {
            // Déjà connecté : renvoyer vers l'espace actif
            const active = (session.user as any).chosenRole || session.user.role;
            if (active && !['TENANT', 'LOCATAIRE'].includes(active)) {
                return redirect("/dashboard");
            }
            return redirect("/mon-espace-locataire");
        }
        // Non connecté sur la page login : afficher la page de connexion épurée sans le layout dashboard
        return <>{children}</>;
    }

    // Si l'utilisateur n'est pas connecté et n'est pas sur la page login
    if (!session?.user) {
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
