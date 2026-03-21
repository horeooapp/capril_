"use client"

import { useState, useTransition, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/auth"
import Link from "next/link"
import { ArrowLeft, Lock, ShieldCheck, CheckCircle2 } from "lucide-react"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    if (!token) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 font-bold mb-4">Lien de réinitialisation invalide ou manquant.</p>
                <Link href="/auth/forgot-password" className="text-ivoire-orange uppercase text-[10px] font-black tracking-widest">Demander un nouveau lien</Link>
            </div>
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Les mots de passe ne correspondent pas." })
            return
        }
        if (password.length < 8) {
            setMessage({ type: 'error', text: "Le mot de passe doit contenir au moins 8 caractères." })
            return
        }

        setMessage(null)
        startTransition(async () => {
            const result = await resetPassword(token!, password)
            if (result.success) {
                setMessage({ type: 'success', text: "Mot de passe réinitialisé avec succès ! Redirection..." })
                setTimeout(() => router.push("/admin/login"), 2000)
            } else {
                setMessage({ type: 'error', text: result.error || "Une erreur est survenue." })
            }
        })
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
                <div className={`mb-8 p-4 rounded-2xl text-[13px] font-bold flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
                    {message.text}
                </div>
            )}

            <div>
                <label htmlFor="pass" className="block text-[12px] font-black text-ivoire-dark uppercase tracking-widest mb-2 ml-1">
                    Nouveau mot de passe
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        id="pass"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-ivoire-orange focus:ring-4 focus:ring-ivoire-orange/10 outline-none transition-all font-bold text-ivoire-dark"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="confirm" className="block text-[12px] font-black text-ivoire-dark uppercase tracking-widest mb-2 ml-1">
                    Confirmer le mot de passe
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        id="confirm"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-ivoire-orange focus:ring-4 focus:ring-ivoire-orange/10 outline-none transition-all font-bold text-ivoire-dark"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-5 px-4 rounded-2xl shadow-xl text-[14px] font-black uppercase tracking-widest text-white bg-ivoire-orange hover:bg-ivoire-dark transition-all active:scale-95 disabled:opacity-50"
            >
                {isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
             {/* Background Layers */}
            <div className="fixed inset-0 bg-mesh opacity-70 z-0"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-15 z-0 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-ivoire-dark text-white text-[9px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl">
                    <ShieldCheck size={14} className="text-ivoire-orange" />
                    Sécurisation du compte
                </div>
                <h2 className="text-4xl font-black text-ivoire-dark uppercase tracking-tighter leading-none italic mb-4">
                    Nouveau.<br/>Secret
                </h2>
                <p className="text-xs font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
                    Définissez un mot de passe hautement sécurisé pour votre console QAPRIL.
                </p>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card-premium p-10 rounded-[3rem] border border-white/60 shadow-2xl">
                    <Suspense fallback={<div className="text-center p-8 animate-pulse text-gray-400 font-bold uppercase text-[10px] tracking-widest">Initialisation...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <Link href="/admin/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-ivoire-dark transition-colors">
                            <ArrowLeft size={14} />
                            Annuler et retourner à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
