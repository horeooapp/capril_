"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { Home, Sparkles, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function TenantLoginPage() {
    return (
        <>
            {/* Version Web PC - Intacte */}
            <div className="hidden md:block min-h-screen bg-[#021812] relative overflow-hidden">
                {/* Elegant Background Immersive Mesh */}
                <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
                    <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Intérieur serein"
                    />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-[#021812]/90 via-[#022c22]/80 to-[#064e3b]/90 pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse opacity-50 mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#10B981]/20 blur-[150px] rounded-full animate-pulse animation-delay-2000 opacity-50 mix-blend-screen pointer-events-none"></div>

                <div className="container mx-auto px-4 z-10 min-h-screen flex flex-col lg:flex-row-reverse items-center justify-center gap-12 lg:gap-32 w-full max-w-7xl relative">
                    
                    {/* Visual Typography Right */}
                    <div className="hidden lg:flex flex-col items-start w-full max-w-lg">
                        <motion.div 
                            initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-[18px] border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase text-emerald-400 shadow-xl shadow-black/20">
                                <Sparkles className="w-5 h-5" />
                                Expérience Locataire Certifiée
                            </div>
                            <h2 className="text-6xl xl:text-7xl font-[1000] tracking-tighter leading-[0.9] mb-8 uppercase text-white">
                                Habitez en <br />
                                <span className="italic font-serif normal-case text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 text-7xl xl:text-8xl">confiance.</span>
                            </h2>
                            
                            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-transparent mb-10 rounded-full"></div>

                            <p className="text-xl text-emerald-100/70 font-light leading-relaxed mb-12">
                                Simplifiez votre vie de locataire avec la plateforme certifiée QAPRIL. Payez vos loyers et suivez vos quittances en toute sérénité.
                            </p>
                            
                            <div className="flex gap-12 bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/5 inline-flex shadow-2xl">
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className="w-10 h-10 text-emerald-400" />
                                    <div>
                                        <div className="text-xl font-black text-white mb-0.5">Protocole Sûr</div>
                                        <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/80 font-black">Homologué National</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Login Form Left */}
                    <div className="w-full max-w-md">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            <Link href="/" className="flex flex-col items-center lg:items-start mb-12 group lg:hidden">
                                <img 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-16 w-auto group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] brightness-0 invert" 
                                />
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-4 ml-1 drop-shadow-md">Sérénité Locative</p>
                            </Link>
                            <Link href="/" className="hidden lg:flex flex-col items-center mb-10 group">
                                <img 
                                    src="/logo.png" 
                                    alt="QAPRIL Logo" 
                                    className="h-14 w-auto group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] brightness-0 invert" 
                                />
                            </Link>

                            <div className="relative z-20">
                                <EmailOTPForm 
                                    role="TENANT"
                                    redirectPath="/mon-espace-locataire"
                                    title="Votre Habitat"
                                    subtitle="Saisissez votre email pour intégrer votre domicile sécurisé."
                                />
                            </div>

                            <div className="mt-12 flex items-center justify-center text-[10px] font-black text-emerald-500/50 uppercase tracking-widest relative z-10 px-4">
                                <Link href="/auth/help" className="hover:text-emerald-400 transition-colors">Aide & Assistance</Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Version Web Mobile Exclusive - Nouveau design unifié */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="tenant" />
            </div>
        </>
    )
}
