/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import AuthForm from "@/components/auth/AuthForm"
import { Home, ArrowLeft, Heart } from "lucide-react"

export default function TenantLoginPage() {
    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Background Mesh with green/secondary tint */}
            <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none"></div>
            <div className="absolute top-0 right-1/2 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Link href="/" className="flex items-center space-x-4 mb-12 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-secondary/20 blur-lg rounded-full scale-125 group-hover:bg-secondary/40 transition-all"></div>
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-14 w-auto relative z-10 group-hover:rotate-3 transition-transform duration-500" />
                        </div>
                        <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
                    </Link>

                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-secondary text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border border-green-100/50">
                            <Home size={12} />
                            Espace Locataire QAPRIL
                        </div>
                    </div>

                    <div className="glass-card-premium p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-gray-200/50 mb-12">
                        <AuthForm 
                            role="TENANT"
                            redirectPath="/locataire"
                            title="Votre Espace"
                            subtitle="Rejoignez la communauté des locataires certifiés et gérez vos documents."
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
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Intérieur moderne et chaleureux"
                    />
                </div>
                {/* Premium Glass Overlay on Image with green tint */}
                <div className="absolute inset-0 bg-secondary/20 mix-blend-multiply backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-20 left-20 right-20 z-10">
                    <div className="glass-panel p-10 rounded-[2.5rem] border border-white/20 backdrop-blur-xl shadow-2xl">
                        <Heart className="text-white mb-6" size={40} />
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight italic">
                            Confort & <br/>Confiance.
                        </h2>
                        <p className="mt-4 text-white/70 font-medium text-sm leading-relaxed max-w-md">
                            Une expérience locative simplifiée, certifiée et humaine, pour votre tranquillité d&apos;esprit.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
