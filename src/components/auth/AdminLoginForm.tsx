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
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {title}
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        {subtitle}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <label htmlFor="admin-email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-0.5">
                                Identifiant Administrateur
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    id="admin-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                                    placeholder="admin@qapril.ci"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label htmlFor="admin-password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-0.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    id="admin-password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm hover:shadow font-bold text-sm tracking-wide transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Accéder à la console
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center gap-3">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        Retour à l'accueil
                    </Link>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        <p className="text-[11px] font-medium text-slate-500 text-center">
                            Console Institutionnelle v3.5 • Accès sécurisé
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
