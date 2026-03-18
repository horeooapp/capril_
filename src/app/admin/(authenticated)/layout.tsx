import Link from "next/link"
export const dynamic = "force-dynamic"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { logout } from "@/actions/auth"
import AdminHeader from "@/components/admin/AdminHeader"
import { unstable_noStore as noStore } from 'next/cache';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    noStore();
    let session = await auth();

    if (!session?.user) {
        redirect("/admin/login")
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative overflow-x-hidden">
            {/* Mesh Background */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse duration-[10s]"></div>
            
            {/* Sanitize session before passing to Client Component to avoid serialization issues */}
            <AdminHeader 
                session={session ? {
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        role: session.user.role,
                        fullName: session.user.fullName
                    }
                } : null} 
                onLogout={logout} 
            />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer de courtoisie Premium */}
            <footer className="w-full max-w-7xl mx-auto px-8 py-10 border-t border-gray-100/50 mt-12 mb-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">© 2024 QAPRIL • Excellence en Administration Centrale</p>
                    <div className="flex gap-10">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] cursor-pointer hover:opacity-70 transition-opacity">Centre de Commande</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:opacity-70 transition-opacity">Audit Certifié</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
