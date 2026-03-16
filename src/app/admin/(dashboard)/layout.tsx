import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import ProtectedLogo from "@/components/ProtectedLogo"
import MobileMenu from "@/components/MobileMenu"
import { logout } from "@/actions/auth"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/admin/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const navLinks = [
        { href: "/", label: "Accueil", icon: "🏠" },
        { href: "/admin", label: "Vue Globale", icon: "🌍" },
        { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
        { href: "/admin/validation", label: "Validations Agences", icon: "🏢" },
        { href: "/admin/news", label: "Actualités", icon: "📢" },
        { href: "/admin/system", label: "Configuration", icon: "⚙️" },
        { href: "/admin/audit", label: "Journal d'Audit", icon: "📜" },
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
            <div className="bg-ivory-pattern"></div>
            {/* Navbar Admin */}
            <header className="bg-gray-900 border-b border-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="flex items-center space-x-4 group">
                                <ProtectedLogo 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-16 w-auto border border-gray-700 rounded shadow-sm group-hover:scale-105 transition-transform" 
                                />
                                <span className="font-bold text-2xl text-white hidden sm:inline">QAPRIL <span className="text-sm font-normal text-gray-400">| Administration Centrale</span></span>
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <nav className="hidden md:flex space-x-6 items-center">
                                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                                    <svg className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Accueil</span>
                                </Link>
                                <div className="h-4 w-px bg-gray-700"></div>
                                <Link href="/admin" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Vue Globale</Link>
                                <Link href="/admin/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Utilisateurs</Link>
                                <Link href="/admin/validation" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Validations</Link>
                                <Link href="/admin/news" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Actualités</Link>
                                <Link href="/admin/system" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Configuration</Link>
                                <Link href="/admin/audit" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Audit</Link>
                            </nav>

                            <MobileMenu links={navLinks} session={session} variant="dark" onLogout={logout} />

                            <div className="hidden md:flex items-center space-x-4">
                                {session?.user && (
                                    <>
                                        <span className={`text-sm px-3 py-1 rounded-full ${session.user.role === 'SUPER_ADMIN' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}>
                                            {session.user.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur'}
                                        </span>
                                        <form action={async () => {
                                            "use server"
                                            await signOut({ redirectTo: "/" })
                                        }}>
                                            <button type="submit" className="text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md font-medium transition-colors border border-gray-700">
                                                Déconnexion
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
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
