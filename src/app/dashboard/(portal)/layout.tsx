import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import DashboardLayoutClient from "./layout-client"
import { isRoleGloballyActive } from "@/lib/role-lock"
import { normalizeProfileRole, isRouteAllowedForProfile } from "@/lib/rbac"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/dashboard/login")
    }

    // CRITICAL: Verify if user still exists in DB
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            agenceProfile: true,
            legalEntity: true
        }
    });

    if (!dbUser) {
        redirect("/dashboard/login")
    }

    // RÔLE ACTIF STRICT : priorité à la capacité active choisie en base par l'utilisateur
    const activeRole = (dbUser as any).capaciteActive || (session.user as any).chosenRole || session.user.role || 'LANDLORD';

    // Règle stricte : Pas de bascule en cours de session. Un compte connecté en profil locataire ne peut pas accéder au dashboard propriétaire sans se déconnecter.
    if (activeRole === "TENANT" || activeRole === "LOCATAIRE") {
        return redirect("/mon-espace-locataire");
    }

    // Si le rôle actif est Admin, redirection vers la console admin
    if (activeRole === "ADMIN" || activeRole === "SUPER_ADMIN") {
        return redirect("/admin");
    }

    // [RÈGLE 3 & 4] RBAC SERVER-SIDE ENFORCEMENT : Empêcher l'accès par URL directe non autorisée
    const profile = normalizeProfileRole(activeRole);
    const headersList = await headers();
    const currentPath = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

    if (currentPath && currentPath.startsWith("/dashboard") && currentPath !== "/dashboard") {
        if (!isRouteAllowedForProfile(currentPath, profile)) {
            console.warn(`[RBAC] Accès direct refusé: profil ${profile} a tenté d'accéder à ${currentPath}`);
            redirect("/dashboard");
        }
    }

    const isGloballyActive = await isRoleGloballyActive(session.user.id, activeRole);
    if (!isGloballyActive && activeRole) {
        try {
            const { redis } = await import("@/lib/redis");
            if (redis) await redis.set(`user:active_role:${session.user.id}`, activeRole);
        } catch(e) {
            console.error("Redis self-heal error:", e);
        }
    }

    const agencyName = (dbUser as any).agenceProfile?.nomAgence 
        || (dbUser as any).legalEntity?.companyName 
        || ((dbUser as any).agencyConfig as any)?.agencyName 
        || ((dbUser as any).agencyConfig as any)?.name 
        || (session.user as any)?.agencyName 
        || null;

    return (
        <DashboardLayoutClient 
            session={session} 
            dbActiveRole={activeRole} 
            agencyConfig={(dbUser as any).agencyConfig}
            agencyName={agencyName}
            userFirstName={dbUser.firstName}
            userLastName={dbUser.lastName}
        >
            {children}
        </DashboardLayoutClient>
    )
}