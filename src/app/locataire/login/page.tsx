"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { Home, Sparkles, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function TenantLoginPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB] flex relative overflow-hidden">
            {/* Soft Organic Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05)_0%,transparent_40%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(31,78,121,0.05)_0%,transparent_40%)]"></div>
            
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Link href="/" className="flex flex-col items-start mb-12 group">
                            <img 
                                src="/logo.png" 
                                alt="QAPRIL Logo" 
                                className="h-20 w-auto group-hover:scale-105 transition-transform duration-500" 
                            />
                            <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-[0.2em] mt-4 ml-1">Sérénité Locative</p>
                        </Link>

                        <EmailOTPForm 
                            role="TENANT"
                            redirectPath="/locataire"
                            title="Votre Habitat"
                            subtitle="Rejoignez la communauté certifiée de Côte d'Ivoire. Connexion sécurisée."
                        />

                        <div className="mt-12 flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            <Link href="/auth/help" className="hover:text-[#10B981] transition-colors">Aide</Link>
                            <Link href="/" className="hover:text-[#10B981] transition-colors">Accueil</Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Visual Side Panel (Serenity) */}
            <div className="hidden lg:block relative w-0 flex-1 bg-[#10B981] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        className="h-full w-full object-cover scale-105 opacity-60 mix-blend-luminosity"
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Intérieur serein"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/90 via-[#10B981]/70 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-white">
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="max-w-xl"
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase">
                            <Sparkles className="w-4 h-4 text-orange-300" />
                            Expérience Locataire Certifiée
                        </div>
                        <h2 className="text-7xl font-black tracking-tighter leading-[0.85] mb-10 uppercase italic">
                            Habitez en <br />
                            <span className="text-white/40 not-italic">toute</span> <br/>
                            confiance.
                        </h2>
                        <p className="text-2xl text-white/80 font-medium leading-relaxed mb-16">
                            Simplifiez votre vie de locataire avec des outils numériques certifiés par l'État. Baux, quittances et maintenance en un clic.
                        </p>
                        
                        <div className="inline-flex items-center gap-3 p-5 bg-white/5 backdrop-blur-xl rounded-[28px] border border-white/10">
                            <ShieldCheck className="w-8 h-8 text-orange-300" />
                            <div className="text-[10px] uppercase tracking-[0.2em] font-black max-w-[120px]">Protocole de Sécurité National</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
