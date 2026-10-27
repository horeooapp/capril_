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
    let computedRole = (session?.user as any)?.chosenRole || session?.user?.role;
    if (session?.user) {
        const dbUser = await prisma.user.findUnique({
             where: { id: session.user.id },
             select: { capaciteActive: true }
        });
        
        // CRITICAL (Rule R-01): Standardized Role Identification
        computedRole = (dbUser as any)?.capaciteActive || (session.user as any).chosenRole || session.user.role;

        // CRITICAL: Verify Global Role Concurrency Lock
        const isGloballyActive = await isRoleGloballyActive(session.user.id, computedRole);
        if (!isGloballyActive) {
            // Just sync redis with DB to self-heal
            const { redis } = await import("@/lib/redis");
            if (redis) await redis.set(`user:active_role:${session.user.id}`, computedRole);
        }

        // Si l'utilisateur consulte son espace locataire, basculer sa capacité active sur TENANT
        const isTenant = computedRole === "TENANT" || (session.user as any).role === "TENANT";
        if (computedRole !== "TENANT") {
            // Vérifier s'il a un bail locataire actif ou le rôle tenant
            const hasTenantLease = await prisma.lease.findFirst({
                where: { tenantId: session.user.id },
                select: { id: true }
            });

            if (hasTenantLease || isTenant) {
                computedRole = "TENANT";
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { capaciteActive: "TENANT" }
                }).catch(() => {});
            } else {
                redirect("/dashboard");
            }
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
