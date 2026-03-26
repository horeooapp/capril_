import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TenantOnboardingClient from "@/components/auth/TenantOnboardingClient"
import { getCurrentUser } from "@/actions/users"

export const dynamic = "force-dynamic"

export default async function TenantOnboardingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/locataire/login")
    }

    if (session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    // Always check DB for onboarding status as JWT might be stale
    const user = await getCurrentUser()

    if (user?.onboardingComplete) {
        redirect("/locataire")
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <TenantOnboardingClient session={session} />
        </div>
    )
}
