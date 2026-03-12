/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import AdminLoginForm from "@/components/auth/AdminLoginForm"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-900 rounded-full blur-3xl -ml-48 -mb-48"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex items-center justify-center space-x-3 mb-10 group">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto group-hover:scale-110 transition-transform" />
                    <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
                </Link>
                <div className="text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        Accès Réservé
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">
                        Console Admin
                    </h2>
                    <p className="mt-4 text-gray-500 font-medium">
                        Supervision du registre locatif national.
                    </p>
                </div>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-10 px-8 shadow-2xl shadow-gray-200 rounded-[2.5rem] border border-gray-100">
                    <AdminLoginForm />
                </div>
            </div>

            <div className="mt-12 text-center relative z-10">
                <Link href="/" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                    ← Retour au portail public
                </Link>
            </div>
        </div>
    )
}
