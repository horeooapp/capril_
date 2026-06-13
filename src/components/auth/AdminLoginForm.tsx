"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
            try {
                const result = await loginWithAdminCredentials(email, password)
                if (!result || result.success) {
                    router.push(redirectPath)
                    router.refresh()
                } else {
                    setError(result.error || "Identifiants incorrects.")
                }
            } catch (err) {
                console.error(err)
            }
        })
    }

    return (
        <div className="w-full relative">
            <div className="relative p-2">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-8 h-8 text-amber-600" />
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                            {title}
                        </h2>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">
                        {subtitle}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="admin-email" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                Identifiant Admin
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="admin-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all font-bold text-white placeholder:text-gray-600"
                                    placeholder="admin@qapril.ci"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label htmlFor="admin-password" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    id="admin-password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all font-bold text-white placeholder:text-gray-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-[#C55A11] to-[#E87B2E] text-white rounded-2xl shadow-xl shadow-[#C55A11]/20 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Accéder à la console
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-amber-600 uppercase tracking-[0.2em] transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Retour à l'accueil
                    </Link>
                    <div className="flex items-center gap-2 opacity-30">
                        <Activity className="w-3 h-3 text-amber-600 animate-pulse" />
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
