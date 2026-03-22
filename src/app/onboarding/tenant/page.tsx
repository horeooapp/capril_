import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TenantOnboardingClient from "@/components/auth/TenantOnboardingClient"

export const dynamic = "force-dynamic"

export default async function TenantOnboardingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/locataire/login")
    }

    if (session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    if (session.user.onboardingComplete) {
        redirect("/locataire")
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <TenantOnboardingClient session={session} />
        </div>
    )
}
