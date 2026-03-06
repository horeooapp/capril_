import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function LocataireLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "TENANT") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Locataire */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/locataire" className="flex items-center space-x-4 group">
                                <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto border border-gray-200 rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <span className="font-bold text-2xl text-gray-900">QAPRIL <span className="text-sm font-normal text-gray-500">| Portail Locataire</span></span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex space-x-6 items-center">
                            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center group">
                                <svg className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Accueil</span>
                            </Link>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <Link href="/locataire" className="text-gray-900 border-b-2 border-primary px-1 py-1.5 text-sm font-medium">Mes Quittances</Link>
                            <Link href="/dashboard/trust" className="text-gray-500 hover:text-gray-900 px-1 py-2 text-sm font-medium flex items-center">
                                <span className="mr-1">⭐</span> Mon Indice de Confiance
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{session.user.email}</span>
                            <form action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}>
                                <button type="submit" className="text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
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
