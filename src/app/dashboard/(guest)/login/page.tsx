"use client"

import Link from "next/link"
import EmailOTPForm from "@/components/auth/EmailOTPForm"
import { ShieldCheck, TrendingUp, Gem } from "lucide-react"
import { motion } from "framer-motion"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function LandlordLoginPage() {
    return (
        <>
            {/* Version Web PC - Intacte */}
            <div className="hidden md:block min-h-screen bg-[#0A1128] relative overflow-hidden">
                {/* Elegant Background Immersive Mesh */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-amber-600/20 blur-[150px] rounded-full animate-pulse opacity-60 mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1F4E79]/30 blur-[150px] rounded-full animate-pulse animation-delay-2000 opacity-60 mix-blend-screen pointer-events-none"></div>
                
                {/* Grid structure overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none"></div>

                <div className="container mx-auto px-4 z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 w-full max-w-7xl relative">
                    
                    {/* Visual Typography Left */}
                    <div className="hidden lg:flex flex-col items-start w-full max-w-lg">
                        <motion.div 
                            initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-[18px] border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase text-amber-500 shadow-xl shadow-black/20">
                                <ShieldCheck className="w-5 h-5" />
                                Accès Distingué & Sécurisé
                            </div>
                            <h2 className="text-6xl xl:text-7xl font-[1000] tracking-tighter leading-[0.9] mb-8 uppercase text-white">
                                Supervisez <br />
                                votre <span className="italic font-serif normal-case text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 text-7xl xl:text-8xl">patrimoine.</span>
                            </h2>
                            
                            <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-transparent mb-10 rounded-full"></div>

                            <p className="text-xl text-gray-400 font-light leading-relaxed mb-12">
                                Accédez en temps réel à vos rapports financiers, vos baux certifiés et la rentabilité de vos actifs sur notre plateforme sécurisée.
                            </p>
                            
                            <div className="flex gap-12 bg-white/5 backdrop-blur-md p-6 rounded-[24px] border border-white/5 inline-flex shadow-2xl">
                                <div>
                                    <div className="text-3xl font-black text-white mb-1 font-serif">A+</div>
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-black">Notation Sûreté</div>
                                </div>
                                <div className="w-px h-12 bg-white/10 mt-1"></div>
                                <div>
                                    <div className="text-3xl font-black text-white mb-1 font-serif">100%</div>
                                    <div className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-black">Connexion Chiffrée</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Login Form Right */}
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
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mt-4 ml-1 drop-shadow-md">Console Propriétaire</p>
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
                                    role="LANDLORD"
                                    redirectPath="/dashboard"
                                    title="Espace Patrimoine"
                                    subtitle="Saisissez votre email pour surveiller vos investissements locatifs."
                                />
                            </div>

                            <div className="mt-12 flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest relative z-10 px-4">
                                <Link href="/auth/help" title="Accès de secours" className="hover:text-amber-500 transition-colors">Assistance</Link>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <Link href="/contact" className="hover:text-amber-500 transition-colors">Contact Expert</Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Version Web Mobile Exclusive - Nouveau design unifié */}
            <div className="block md:hidden w-full min-h-screen">
                <UnifiedLoginPage initialTab="landlord" />
            </div>
        </>
    )
}
