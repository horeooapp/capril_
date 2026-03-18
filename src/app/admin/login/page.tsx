/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import AdminLoginForm from "@/components/auth/AdminLoginForm"
import { ShieldCheck, ArrowLeft, Lock, Globe } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen bg-ivory-pattern bg-mesh flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 -right-20 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <Link href="/" className="inline-flex items-center justify-center space-x-4 mb-12 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 group-hover:bg-primary/40 transition-all"></div>
                        <img src="/logo.png" alt="QAPRIL Logo" className="h-20 w-auto relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col items-start leading-none uppercase">
                        <span className="font-black text-4xl tracking-tighter text-gray-900 leading-none">QAPRIL.</span>
                        <span className="text-[10px] font-black tracking-[0.4em] text-gray-400 mt-1">Registry Admin</span>
                    </div>
                </Link>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-900 text-white text-[9px] font-black uppercase tracking-[0.2em] mb-6 shadow-2xl shadow-gray-950/20">
                    <ShieldCheck size={14} className="text-primary" />
                    Accès Réservé Habilité
                </div>
                
                <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none italic mb-4">
                    Console.<br/>Directe
                </h2>
                <p className="text-xs font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    Supervision souveraine du registre locatif et contrôle des flux certifiés.
                </p>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card-premium py-12 px-10 rounded-[3.5rem] border border-white/40 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50/5 blur-2xl rounded-full pointer-events-none"></div>
                    <AdminLoginForm />
                </div>
                
                <div className="mt-12 flex flex-col items-center gap-8">
                    <Link href="/" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                            <ArrowLeft size={16} />
                        </div>
                        Retour au portail public
                    </Link>
                    
                    <div className="flex items-center gap-6 opacity-30">
                        <div className="flex items-center gap-2">
                             <Lock size={10} />
                             <span className="text-[8px] font-black uppercase tracking-widest leading-none">AES-256 Enabled</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Globe size={10} />
                             <span className="text-[8px] font-black uppercase tracking-widest leading-none">Security Node: ABJ-01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
