import AdminLoginForm from "@/components/auth/AdminLoginForm"
import Link from "next/link"
import { Activity, Server, Fingerprint } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <main className="min-h-screen bg-[#020617] relative overflow-hidden flex items-center justify-center px-4">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0"></div>
            {/* Glow orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 blur-[150px] rounded-full opacity-50 pointer-events-none z-0"></div>
            <div className="absolute bottom-[0%] right-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full opacity-50 pointer-events-none z-0"></div>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-[#0B1120]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                    <div className="flex flex-col items-center mb-10">
                        <Link href="/" className="inline-flex flex-col items-center mb-8">
                            <img
                                src="/logo.png"
                                alt="QAPRIL Logo"
                                className="w-40 h-auto brightness-0 invert"
                            />
                            <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/30">
                                <Activity className="w-3 h-3 text-amber-500" />
                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">Console Sécurisée v3.0</span>
                            </div>
                        </Link>
                    </div>

                    <AdminLoginForm
                        redirectPath="/admin"
                        title="Authentification"
                        subtitle="Console d'Administration Centrale (Certifiée)"
                    />

                    <div className="mt-12 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <Server className="w-4 h-4 text-gray-500 mb-2" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Serveur <br/> SRV-1472</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <Fingerprint className="w-4 h-4 text-gray-500 mb-2" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Bio-Auth <br/> Prête</span>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <Activity className="w-4 h-4 text-amber-500 mb-2" />
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-center leading-tight">Réseau <br/> Chiffré</span>
                        </div>
                    </div>
                </div>

                <p className="mt-10 text-center text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">
                    Propriété de l&apos;État de Côte d&apos;Ivoire &nbsp;|&nbsp; Accès Restreint
                </p>
            </div>
        </main>
    )
}
