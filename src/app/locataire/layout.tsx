import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
import { logout } from "@/actions/auth"
import LocataireHeader from "@/components/locataire/LocataireHeader"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (session?.user && session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    const handleLogout = async () => {
        "use server"
        await logout()
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
            <LocataireHeader session={session} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            
            {/* Footer de courtoisie Premium */}
            <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2024 QAPRIL • Systèmes de Gestion Immobilière de Précision</p>
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Support Prioritaire</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mentions Légales</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
