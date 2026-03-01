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

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar Dashboard */}
            <header className="bg-primary/95 text-primary-foreground shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/dashboard" className="flex items-center space-x-3 group">
                                <img src="/logo.png" alt="QAPRIL Logo" className="h-8 w-auto border border-white/20 rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <span className="font-bold text-xl">QAPRIL <span className="text-sm font-normal text-orange-200">| Portail Gestionnaire</span></span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <Link href="/dashboard" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Vue d'ensemble</Link>
                            <Link href="/dashboard/properties" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Logements</Link>
                            <Link href="/dashboard/leases" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Contrats</Link>
                            <Link href="/dashboard/receipts" className="hover:text-orange-200 px-3 py-2 rounded-md text-sm font-medium">Quittances</Link>
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
