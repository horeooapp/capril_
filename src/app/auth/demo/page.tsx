"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Bot, Loader2, ShieldCheck, User } from "lucide-react"

function DemoLoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const role = searchParams.get('role') // 'landlord' or 'tenant'

    useEffect(() => {
        const autoLogin = async () => {
            let email = ""
            const password = "DemoQapril2026!"

            if (role === 'landlord') {
                email = "bailleur.demo@qapril.ci"
            } else if (role === 'tenant') {
                email = "locataire.demo@qapril.ci"
            } else {
                console.error("Invalid role for demo login")
                return
            }

            try {
                const result = await signIn("admin-password", {
                    email,
                    password,
                    redirect: false
                })

                if (result?.error) {
                    console.error("Demo login failed:", result.error)
                } else {
                    // Success, redirect to appropriate dashboard
                    if (role === 'landlord') router.push('/dashboard/owner')
                    else router.push('/dashboard/tenant')
                }
            } catch (err) {
                console.error("Error during demo login:", err)
            }
        }

        if (role) {
            autoLogin()
        }
    }, [role, router])

    if (!role) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
                    <Bot size={40} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Accès Demo QAPRIL</h1>
                <p className="text-gray-500 mb-12 font-medium max-w-sm">Choisissez un profil pour accéder à l&apos;interface de test sans numéro de téléphone.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button 
                        onClick={() => router.push('?role=landlord')}
                        className="glass-panel p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all group text-left shadow-lg"
                    >
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Propriétaire</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1">Gérer les bails, reçus et locataires</p>
                    </button>

                    <button 
                        onClick={() => router.push('?role=tenant')}
                        className="glass-panel p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all group text-left shadow-lg"
                    >
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <User size={28} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Locataire</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1">Paiements, quittances et dashboard</p>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                <Loader2 className="animate-spin text-indigo-600 relative" size={48} />
            </div>
            <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">Connexion Sécurisée Demo</p>
                <p className="text-lg font-bold text-gray-900">Préparation de votre compte {role === 'landlord' ? 'Propriétaire' : 'Locataire'}...</p>
            </div>
        </div>
    )
}

export default function DemoLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        }>
            <DemoLoginContent />
        </Suspense>
    )
}
