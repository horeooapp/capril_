"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, Loader2, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
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
    const [legalAgreed, setLegalAgreed] = useState(false)
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
            try {
                const result = await loginWithOTP(email, otp, role)
                if (!result || result.success) {
                    // Determine redirection based on onboarding status (default to redirectPath if unknown)
                    const finalPath = result?.onboardingComplete === false ? "/onboarding" : redirectPath
                    router.push(finalPath)
                    router.refresh()
                } else {
                    setError(result.error || "Code incorrect ou expiré.")
                }
            } catch (err) {
                console.error(err)
            }
        })
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
    }

    const theme = {
        TENANT: {
            primaryText: "text-slate-900",
            focusWithin: "group-focus-within:text-[#D97706]",
            inputFocus: "focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
            btn1Bg: "bg-[#D97706] hover:bg-[#B45309]",
            btn1Shadow: "shadow-sm",
            accentText: "text-[#D97706]",
            btn2Bg: "bg-[#D97706] hover:bg-[#B45309]",
            btn2Shadow: "shadow-sm",
            hoverText: "hover:text-[#B45309]"
        },
        LANDLORD: {
            primaryText: "text-slate-900",
            focusWithin: "group-focus-within:text-[#D97706]",
            inputFocus: "focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
            btn1Bg: "bg-[#D97706] hover:bg-[#B45309]",
            btn1Shadow: "shadow-sm",
            accentText: "text-[#D97706]",
            btn2Bg: "bg-[#D97706] hover:bg-[#B45309]",
            btn2Shadow: "shadow-sm",
            hoverText: "hover:text-[#B45309]"
        },
        ADMIN: {
            primaryText: "text-slate-900",
            focusWithin: "group-focus-within:text-[#D97706]",
            inputFocus: "focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]",
            btn1Bg: "bg-slate-900 hover:bg-slate-800",
            btn1Shadow: "shadow-sm",
            accentText: "text-[#D97706]",
            btn2Bg: "bg-slate-900 hover:bg-slate-800",
            btn2Shadow: "shadow-sm",
            hoverText: "hover:text-slate-700"
        }
    }[role];

    return (
        <div className="w-full relative">
            {/* Opaque Architectural White Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 relative">
                <div className="mb-8 text-center">
                    <motion.h2 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-2xl sm:text-3xl font-black tracking-tight uppercase leading-tight mb-2.5 ${theme.primaryText}`}
                    >
                        {title}
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-slate-500 font-medium max-w-[280px] mx-auto leading-relaxed"
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
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-600 shrink-0"></div>
                            <span>{error}</span>
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
                            className="space-y-5"
                        >
                            <div className="relative group">
                                <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-wider mb-2 text-slate-700">
                                    Identifiant Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className={`h-4 w-4 text-slate-400 transition-colors ${theme.focusWithin}`} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-semibold placeholder:text-slate-400 text-slate-900 ${theme.inputFocus}`}
                                        placeholder="nom@exemple.ci"
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 pt-1 pb-2">
                                <input
                                    type="checkbox"
                                    id="legalAgreed"
                                    required
                                    checked={legalAgreed}
                                    onChange={(e) => setLegalAgreed(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#D97706] focus:ring-[#D97706]"
                                />
                                <label htmlFor="legalAgreed" className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    J'accepte les <Link href="/cgu" className="font-bold underline text-slate-700 hover:text-[#D97706]">CGU</Link>, les <Link href="/mentions-legales" className="font-bold underline text-slate-700 hover:text-[#D97706]">Mentions Légales</Link> et la charte de <Link href="/confidentialite" className="font-bold underline text-slate-700 hover:text-[#D97706]">Confidentialité</Link>.
                                </label>
                            </div>

                            <motion.button
                                whileHover={legalAgreed ? { scale: 1.01 } : { scale: 1 }}
                                whileTap={legalAgreed ? { scale: 0.99 } : { scale: 1 }}
                                type="submit"
                                disabled={isPending || !legalAgreed}
                                className={`w-full flex items-center justify-center gap-2.5 py-3.5 ${theme.btn1Bg} text-white rounded-xl font-black uppercase tracking-wider text-xs transition-all disabled:opacity-50 group shadow-sm`}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Recevoir mon code</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                            className="space-y-5"
                        >
                            <div className="relative">
                                <label htmlFor="otp" className="block text-[11px] font-black uppercase tracking-wider mb-2 text-slate-700">
                                    Code de sécurité à usage unique (6 chiffres)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-[#D97706]" />
                                    </div>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        required
                                        autoFocus
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all font-black text-2xl tracking-[0.4em] text-center placeholder:text-slate-300 text-slate-900 focus:ring-2 focus:ring-[#D97706]/20 focus:border-[#D97706]"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={isPending}
                                    className={`w-full py-3.5 ${theme.btn2Bg} text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-sm`}
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier et me connecter"}
                                </motion.button>
                                
                                <button
                                    type="button"
                                    onClick={() => setStep('EMAIL')}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors py-1.5 hover:text-slate-900"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Changer d'email
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col items-center gap-2">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Retour à l'accueil
                    </Link>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                        QAPRIL · Protocole Institutionnel Certifié
                    </p>
                </div>
            </div>
        </div>
    )
}
