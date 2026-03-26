"use client"

import { useState, useTransition } from "react"
import { requestPasswordReset } from "@/actions/auth"
import Link from "next/link"
import { ArrowLeft, Mail, ShieldCheck, Home } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setMessage(null)
        startTransition(async () => {
            const result = await requestPasswordReset(email)
            if (result.success) {
                setMessage({ type: 'success', text: "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé." })
            } else {
                setMessage({ type: 'error', text: result.error || "Une erreur est survenue." })
            }
        })
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Background Layers */}
            <div className="fixed inset-0 bg-mesh opacity-70 z-0"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-15 z-0 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-ivoire-dark text-white text-[9px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
                    <ShieldCheck size={14} className="text-ivoire-orange" />
                    Récupération de compte
                </div>
                <h2 className="text-4xl font-black text-ivoire-dark uppercase tracking-tighter leading-none italic mb-4">
                    Accès.<br/>Perdu ?
                </h2>
                <p className="text-xs font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    Saisissez votre email administratif pour recevoir un lien de sécurisation.
                </p>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card-premium p-10 rounded-[3rem] border border-white/60 shadow-2xl">
                    {message && (
                        <div className={`mb-8 p-4 rounded-2xl text-[13px] font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-[12px] font-black text-ivoire-dark uppercase tracking-widest mb-2 ml-1">
                                Email de récupération
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-ivoire-orange focus:ring-4 focus:ring-ivoire-orange/10 outline-none transition-all font-bold text-ivoire-dark"
                                    placeholder="admin@qapril.net"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-5 px-4 rounded-2xl shadow-xl text-[14px] font-black uppercase tracking-widest text-white bg-ivoire-orange hover:bg-ivoire-dark transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? 'Envoi...' : 'Envoyer le lien'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <Link href="/admin/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-ivoire-dark transition-colors">
                            <ArrowLeft size={14} />
                            Retour à la connexion
                        </Link>
                        <Link 
                            href="/" 
                            className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1F4E79] hover:text-[#C55A11] transition-colors group"
                        >
                            <Home size={14} className="group-hover:scale-110 transition-transform" />
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
