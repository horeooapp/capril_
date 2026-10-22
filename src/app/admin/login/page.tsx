import AdminLoginForm from "@/components/auth/AdminLoginForm"
import Link from "next/link"
import { Activity, Server, Fingerprint } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <main className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center px-4 py-12">
            {/* Background architectural grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A08_1px,transparent_1px),linear-gradient(to_bottom,#0F172A08_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none z-0" />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl">

                    <div className="flex flex-col items-center mb-8">
                        <Link href="/" className="inline-flex flex-col items-center mb-4 group">
                            <img
                                src="/logo.png"
                                alt="QAPRIL Logo"
                                className="w-40 h-auto group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                            <Activity className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Console Centrale Sécurisée</span>
                        </div>
                    </div>

                    <AdminLoginForm
                        redirectPath="/admin"
                        title="Authentification"
                        subtitle="Accès réservé aux administrateurs de la plateforme"
                    />

                    <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <Server className="w-4 h-4 text-slate-500 mb-1" />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider text-center">SRV-SEC<br/>Actif</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <Fingerprint className="w-4 h-4 text-slate-500 mb-1" />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider text-center">Auth 2FA<br/>Conforme</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <Activity className="w-4 h-4 text-amber-600 mb-1" />
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider text-center">Flux SSL<br/>Chiffré</span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    QAPRIL — Architecture Immobilière &bull; Console d&apos;Administration
                </p>
            </div>
        </main>
    )
}
