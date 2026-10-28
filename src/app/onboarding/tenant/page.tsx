import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TenantOnboardingClient from "@/components/auth/TenantOnboardingClient"
import { getCurrentUser } from "@/actions/users"

export const dynamic = "force-dynamic"

export default async function TenantOnboardingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/mon-espace-locataire/login")
    }

    const userRole = (session.user as any)?.capaciteActive || (session.user as any)?.chosenRole || session.user.role
    const isTenant = userRole === "TENANT" || session.user.role === "TENANT" || (session.user as any)?.eligibleRoles?.includes("TENANT")

    if (!isTenant) {
        redirect("/dashboard")
    }

    // Always check DB for onboarding status as JWT might be stale
    const user = await getCurrentUser()
    console.log(`[ONBOARDING_PAGE] User ID: ${user?.id}, DB onboardingComplete: ${user?.onboardingComplete}`);

    if (user?.onboardingComplete) {
        console.log(`[ONBOARDING_PAGE] User already completed onboarding, redirecting to /locataire`);
        redirect("/mon-espace-locataire")
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <TenantOnboardingClient session={session} />
        </div>
    )
}
