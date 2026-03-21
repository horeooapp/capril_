 
import Link from "next/link"
import AuthForm from "@/components/auth/AuthForm"
import { Building2, ArrowLeft, ShieldCheck } from "lucide-react"

export default function LandlordLoginPage() {
    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Background Mesh for the whole page */}
            <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-ivory-pattern opacity-15 pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Link href="/" className="flex items-center space-x-5 mb-12 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 group-hover:bg-primary/40 transition-all duration-700"></div>
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto relative z-10 group-hover:scale-105 transition-transform duration-700 rounded-xl border border-white/40 shadow-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-3xl tracking-tighter text-ivoire-dark leading-none">QAPRIL</span>
                            <span className="text-[10px] font-black tracking-[0.3em] text-ivoire-orange mt-1.5 uppercase opacity-80">Patrimoine Excellence</span>
                        </div>
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivoire-dark text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-900/10">
                            <Building2 size={12} className="text-ivoire-orange" />
                            Espace Propriétaire Certifié
                        </div>
                    </div>

                    <div className="glass-card-premium p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-gray-200/50 mb-12">
                        <AuthForm 
                            role="LANDLORD"
                            redirectPath="/dashboard"
                            title="Gestion Bailleur"
                            subtitle="Pilotez votre patrimoine avec la précision du standard QAPRIL."
                        />
                    </div>

                    <Link href="/" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                            <ArrowLeft size={16} />
                        </div>
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>

            <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        className="h-full w-full object-cover scale-105"
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Façade bâtiment moderne"
                    />
                </div>
                {/* Premium Glass Overlay on Image */}
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-20 left-20 right-20 z-10">
                    <div className="glass-panel p-10 rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl">
                        <ShieldCheck className="text-white mb-6" size={40} />
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight italic">
                            Sécurité & <br/>Performance.
                        </h2>
                        <p className="mt-4 text-white/70 font-medium text-sm leading-relaxed max-w-md">
                            Votre patrimoine mérite la meilleure infrastructure digitale de Côte d&apos;Ivoire.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
