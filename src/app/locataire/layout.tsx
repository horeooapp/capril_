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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Locataire */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/locataire" className="flex items-center space-x-3 group">
                                <img src="/logo.png" alt="QAPRIL Logo" className="h-8 w-auto border border-gray-200 rounded shadow-sm group-hover:scale-105 transition-transform" />
                                <span className="font-bold text-xl text-gray-900">QAPRIL <span className="text-sm font-normal text-gray-500">| Portail Locataire</span></span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex space-x-8">
                            <Link href="/locataire" className="text-gray-900 border-b-2 border-primary px-1 py-2 text-sm font-medium">Mes Quittances</Link>
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
