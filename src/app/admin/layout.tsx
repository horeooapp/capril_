import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Note: En production, on vérifierait le rôle "ADMIN" du session.user ici.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Admin */}
            <header className="bg-gray-900 border-b border-gray-800 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/admin" className="flex items-center space-x-3 group">
                                <img src="/logo.png" alt="QAPRIL Logo" className="h-8 w-auto border border-gray-700 rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <span className="font-bold text-xl text-white">QAPRIL <span className="text-sm font-normal text-gray-400">| Administration Centrale</span></span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <Link href="/admin" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">Vue Globale</Link>
                            <Link href="/admin/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Utilisateurs</Link>
                            <Link href="/admin/validation" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Validations Agences</Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full">Administrateur</span>
                            <form action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}>
                                <button type="submit" className="text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md font-medium transition-colors border border-gray-700">
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
