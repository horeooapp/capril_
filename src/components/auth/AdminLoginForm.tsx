"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, ArrowRight, Loader2, Home, ShieldCheck, Activity } from "lucide-react"
import Link from "next/link"
import { loginWithAdminCredentials } from "@/actions/auth"

interface AdminLoginFormProps {
    redirectPath: string
    title: string
    subtitle: string
}

export default function AdminLoginForm({ redirectPath, title, subtitle }: AdminLoginFormProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = await loginWithAdminCredentials(email, password)
            if (result.success) {
                router.push(redirectPath)
                router.refresh()
            } else {
                setError(result.error || "Identifiants incorrects.")
            }
        })
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
    }

    return (
        <div className="w-full relative">
            {/* Dark Cyberpunk Background Card */}
            <div className="absolute -inset-4 bg-slate-900/60 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] -z-10"></div>
            
            <div className="relative p-2">
                <div className="mb-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-3"
                    >
                        <ShieldCheck className="w-8 h-8 text-[#C55A11]" />
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                            {title}
                        </h2>
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-400 font-medium"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.form 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleLogin}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                Identifiant Admin
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#C55A11] transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-[#C55A11]/10 focus:border-[#C55A11] outline-none transition-all font-bold text-white placeholder:text-gray-600"
                                    placeholder="admin@qapril.ci"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label htmlFor="password" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#C55A11] transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-[#C55A11]/10 focus:border-[#C55A11] outline-none transition-all font-bold text-white placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-[#C55A11] to-[#E87B2E] text-white rounded-2xl shadow-xl shadow-[#C55A11]/20 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 group"
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Accéder à la console
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </motion.form>

                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#C55A11] uppercase tracking-[0.2em] transition-colors group"
                    >
                        <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        Retour à l'accueil
                    </Link>
                    <div className="flex items-center gap-2 opacity-30">
                        <Activity className="w-3 h-3 text-[#C55A11] animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-relaxed">
                            Terminal QAPRIL v3.5 <br />
                            <span className="opacity-50">Accès restreint aux domaines certifiés</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
