import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Role-based redirection out of dashboard
    if (session.user.role === "TENANT") {
        redirect("/locataire")
    }

    if (session.user.role === "ADMIN") {
        redirect("/admin")
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar Dashboard */}
            <header className="bg-primary/95 text-primary-foreground shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center space-x-4 group">
                                <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto border border-white/20 rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <span className="font-bold text-2xl">QAPRIL <span className="text-sm font-normal text-orange-200">| Portail Gestionnaire</span></span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex space-x-6 items-center">
                            <Link href="/" className="text-orange-200 hover:text-white transition-colors flex items-center group">
                                <svg className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Accueil</span>
                            </Link>
                            <div className="h-4 w-px bg-white/20"></div>
                            <Link href="/dashboard" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Vue d'ensemble</Link>
                            <Link href="/dashboard/properties" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Logements</Link>
                            <Link href="/dashboard/leases" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Contrats</Link>
                            <Link href="/dashboard/receipts" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Quittances</Link>
                            <Link href="/dashboard/trust" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                <span className="mr-1">⭐</span> Mon ICL
                            </Link>
                            {((session.user.role as string) === "ADMIN" || (session.user.role as string) === "AUDITOR") && (
                                <Link href="/dashboard/audit" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Audit</Link>
                            )}
                        </nav>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm border border-orange-400 px-3 py-1 rounded-full bg-orange-800/20">{session.user.email}</span>
                            <form action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}>
                                <button type="submit" className="text-sm bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors">
                                    Déconnexion
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}
