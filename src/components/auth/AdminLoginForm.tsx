"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { loginAdmin } from "@/actions/admin-auth"

export default function AdminLoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            try {
                const result = await loginAdmin(formData)
                if (result?.error) {
                    setError(result.error)
                } else if (result?.success) {
                    router.push("/admin")
                }
            } catch (error) {
                // If it's a redirect, nextjs will handle it, but we can also force it
                console.log("Caught potential redirect or error:", error);
                router.push("/admin");
            }
        })
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">
                    Email administratif
                </label>
                <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-300"
                        placeholder="admin@qapril.net"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">
                    Mot de passe
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900 placeholder-gray-300"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isPending ? 'Vérification...' : 'Accéder à la console'}
                </button>
            </div>

            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                <p className="text-xs text-indigo-700">
                    <strong>Accès Restreint :</strong> Cette zone est réservée au personnel autorisé de QAPRIL.
                </p>
            </div>
        </form>
    )
}
