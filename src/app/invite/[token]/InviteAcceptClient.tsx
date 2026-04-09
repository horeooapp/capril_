"use client"

import React, { useState, useTransition } from "react"
import { acceptInvite } from "@/actions/agency-team-actions"
import { Mail, User, CheckCircle2, ShieldAlert } from "lucide-react"
import { signIn } from "next-auth/react"

export function InviteAcceptClient({ token, email }: { token: string, email: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        fullName: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!formData.fullName.trim()) {
            setError("Votre nom et prénoms sont requis.")
            return
        }

        startTransition(async () => {
            const res = await acceptInvite(token, formData.fullName)
            if (!res.success) {
                setError(res.error || "Une erreur est survenue")
            } else {
                setSuccess(true)
                // Redirection automatique sans passer par la page de choix (/login)
                await signIn("email-otp", {
                    email,
                    otp: res.autoLoginOtp,
                    role: "AGENCY",
                    callbackUrl: "/dashboard"
                })
            }
        })
    }

    if (success) {
        return (
            <div className="space-y-6 mt-8 p-8 bg-green-50 rounded-3xl border border-green-200">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-black text-green-800 uppercase tracking-wider text-center">Profil Activé !</h2>
                <p className="text-sm font-medium text-green-700 text-center flex flex-col items-center gap-3">
                    Redirection vers votre tableau de bord en cours...
                    <span className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-8 text-left">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
                    <ShieldAlert size={18} /> {error}
                </div>
            )}

            <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black uppercase tracking-widest text-qgrey-400 pl-2">Identifiant (Email)</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-qgrey-400" size={18} />
                    <input 
                        readOnly
                        value={email}
                        className="w-full bg-qgrey-50 border border-qgrey-2 rounded-2xl pl-12 pr-4 py-4 font-bold text-qnavy outline-none cursor-not-allowed" 
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-qgrey-400 pl-2">Votre Nom et Prénoms</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-qgrey-400" size={18} />
                    <input 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-white border border-qgrey-2 rounded-2xl pl-12 pr-4 py-4 font-bold text-qnavy focus:ring-2 focus:ring-qorange/30 outline-none transition-all" 
                        placeholder="Ex: Jean Dupont"
                    />
                </div>
            </div>

            <button 
                disabled={isPending}
                type="submit" 
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-qnavy hover:bg-qnavy-dark disabled:bg-qgrey-300 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-[0_12px_24px_rgba(13,43,110,0.25)] mt-8 relative overflow-hidden group"
            >
                <span className="relative z-10">{isPending ? "Finalisation..." : "Activer mon compte"}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
        </form>
    )
}
