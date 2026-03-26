"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, Loader2, ArrowLeft } from "lucide-react"
import { requestOTP, loginWithOTP } from "@/actions/auth"

interface EmailOTPFormProps {
    role: 'TENANT' | 'LANDLORD' | 'ADMIN'
    redirectPath: string
    title: string
    subtitle: string
}

export default function EmailOTPForm({ role, redirectPath, title, subtitle }: EmailOTPFormProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleRequestOTP(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = await requestOTP(email)
            if (result.success) {
                setStep('OTP')
            } else {
                setError(result.error || "Échec de l'envoi du code.")
            }
        })
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = await loginWithOTP(email, otp, role)
            if (result.success) {
                router.push(redirectPath)
                router.refresh()
            } else {
                setError(result.error || "Code incorrect ou expiré.")
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
            {/* Glassmorphism Background Card */}
            <div className="absolute -inset-4 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-2xl -z-10"></div>
            
            <div className="relative p-2">
                <div className="mb-8">
                    <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black text-[#1F4E79] tracking-tight uppercase leading-none mb-3"
                    >
                        {title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-500 font-medium"
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
                            className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {step === 'EMAIL' ? (
                        <motion.form 
                            key="email-step"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onSubmit={handleRequestOTP}
                            className="space-y-6"
                        >
                            <div className="relative group">
                                <label htmlFor="email" className="block text-[10px] font-black text-[#1F4E79] uppercase tracking-[0.2em] mb-2 ml-1">
                                    Identifiant Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#C55A11] transition-colors" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-[#C55A11]/10 focus:border-[#C55A11] outline-none transition-all font-bold text-[#1F4E79] placeholder:text-gray-300"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isPending}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-[#1F4E79] to-[#2c6ca7] text-white rounded-2xl shadow-xl shadow-[#1F4E79]/20 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 group"
                            >
                                {isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Recevoir mon code
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="otp-step"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onSubmit={handleVerifyOTP}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <label htmlFor="otp" className="block text-[10px] font-black text-[#1F4E79] uppercase tracking-[0.2em] mb-2 ml-1">
                                    Code de sécurité (6 chiffres)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-[#C55A11]" />
                                    </div>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-5 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-4 focus:ring-[#C55A11]/10 focus:border-[#C55A11] outline-none transition-all font-black text-3xl tracking-[0.5em] text-center text-[#1F4E79] placeholder:text-gray-100"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full py-5 bg-gradient-to-r from-[#C55A11] to-[#E87B2E] text-white rounded-2xl shadow-xl shadow-[#C55A11]/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Vérifier et me connecter"}
                                </motion.button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStep('EMAIL')}
                                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#1F4E79] uppercase tracking-widest transition-colors py-2"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Changer d'email
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-10 pt-6 border-t border-gray-100/50 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Protocole de Sécurité QAPRIL v3.0 <br />
                        <span className="opacity-50">Validation par email certifiée</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
