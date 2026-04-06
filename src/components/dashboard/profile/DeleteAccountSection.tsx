"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { deleteUserAccount } from "@/actions/profile"
import { signOut } from "next-auth/react"

export function DeleteAccountSection() {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmationText, setConfirmationText] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        if (confirmationText !== "SUPPRIMER") return
        
        setLoading(true)
        setError(null)
        try {
            const result = await deleteUserAccount()
            if (result.success) {
                await signOut({ callbackUrl: "/" })
            } else {
                setError(result.error || "Une erreur est survenue")
            }
        } catch (err: any) {
            setError(err.message || "Erreur interne")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-12 pt-8 border-t border-red-100">
            <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-lg font-black text-red-600 uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
                            <AlertTriangle size={20} />
                            Zone de Danger
                        </h3>
                        <p className="text-sm text-red-500/80 font-medium max-w-md">
                            La suppression de votre compte est irréversible. Toutes vos données seront désactivées et vous perdrez l'accès à vos services.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="px-8 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm"
                    >
                        Supprimer mon compte
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-qnavy-dark/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                        <Trash2 size={24} />
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-qnavy-dark uppercase tracking-tight">Suppression du compte</h2>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        Êtes-vous absolument certain ? Cette action désactivera votre accès plateforme. 
                                        Pour confirmer, veuillez saisir <span className="font-black text-red-600 uppercase">SUPPRIMER</span> ci-dessous.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <input 
                                        type="text"
                                        placeholder="Saisissez SUPPRIMER"
                                        value={confirmationText}
                                        onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-red-200 focus:outline-none font-black text-lg text-center tracking-widest transition-all"
                                    />

                                    {error && (
                                        <p className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            {error}
                                        </p>
                                    )}

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            disabled={confirmationText !== "SUPPRIMER" || loading}
                                            onClick={handleDelete}
                                            className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                                                confirmationText === "SUPPRIMER" && !loading
                                                ? "bg-red-600 text-white shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98]" 
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                        >
                                            {loading ? "Suppression..." : "Confirmer la suppression"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
