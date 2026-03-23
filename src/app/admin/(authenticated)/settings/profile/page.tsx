"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
    Lock, 
    ShieldCheck, 
    AlertCircle, 
    CheckCircle2, 
    KeyRound, 
    User,
    ChevronRight,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { changeAdminPassword } from "@/actions/admin-auth"

export default function AdminProfilePage() {
    const [isPending, setIsPending] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas.")
            return
        }

        if (formData.newPassword.length < 8) {
            toast.error("Le nouveau mot de passe doit faire au moins 8 caractères.")
            return
        }

        setIsPending(true)
        try {
            const res = await changeAdminPassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            })

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Mot de passe mis à jour avec succès.")
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                })
            }
        } catch (error) {
            toast.error("Une erreur imprévue est survenue.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-12 pb-20 max-w-4xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Mon Profil.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Gérez vos paramètres de sécurité personnels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-[#1F4E79] text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-[#1F4E79]/20">
                        <ShieldCheck size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C55A11]">Sécurité Maximale</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Info Card */}
                <div className="space-y-6">
                    <div className="glass-card-premium p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 text-white rotate-3">
                            <User size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tighter">Compte Admin</h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                            L'accès administratif est protégé par le protocole QAPRIL. Assurez-vous d'utiliser un mot de passe robuste.
                        </p>
                        
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OAuth 2.0 / NextAuth</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SHA-256 Hashing</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Audit Tracing Actif</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
                        <AlertCircle size={20} className="text-blue-600 shrink-0" />
                        <p className="text-[10px] text-blue-700 font-bold uppercase leading-tight tracking-widest">
                            Le mot de passe doit contenir au moins 8 caractères.
                        </p>
                    </div>
                </div>

                {/* Right: Change Password Form */}
                <div className="lg:col-span-2">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-premium p-10 rounded-[3rem] border border-white shadow-2xl relative overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <KeyRound size={20} className="text-gray-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Modifier le mot de passe</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Mot de passe actuel</label>
                                    <input 
                                        type="password"
                                        required
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                                        className="w-full h-16 bg-gray-50 border border-transparent rounded-[1.5rem] px-8 text-sm font-bold focus:bg-white focus:border-[#C55A11] focus:ring-0 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nouveau mot de passe</label>
                                        <input 
                                            type="password"
                                            required
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                            className="w-full h-16 bg-gray-50 border border-transparent rounded-[1.5rem] px-8 text-sm font-bold focus:bg-white focus:border-[#1F4E79] focus:ring-0 transition-all outline-none"
                                            placeholder="Min. 8 caractères"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Confirmer le nouveau</label>
                                        <input 
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            className="w-full h-16 bg-gray-50 border border-transparent rounded-[1.5rem] px-8 text-sm font-bold focus:bg-white focus:border-[#1F4E79] focus:ring-0 transition-all outline-none"
                                            placeholder="Confirmation"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isPending}
                                className="w-full h-20 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase tracking-widest text-xs hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-gray-900/20"
                            >
                                {isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Mettre à jour la sécurité
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
