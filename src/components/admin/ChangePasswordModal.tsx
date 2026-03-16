"use client"

import { useState } from "react"
import { updateAdminPassword } from "@/actions/admin-actions"

interface ChangePasswordModalProps {
    userId: string
    userName: string
    onClose: () => void
}

export default function ChangePasswordModal({ userId, userName, onClose }: ChangePasswordModalProps) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.")
            return
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

        setIsLoading(true)
        try {
            const result = await updateAdminPassword(userId, password)
            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    onClose()
                }, 2000)
            } else {
                setError(result.error || "Une erreur est survenue")
            }
        } catch (err: any) {
            setError(err.message || "Erreur de connexion au serveur")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">
                        Modifier le mot de passe
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">
                        Modification du mot de passe pour <span className="font-semibold text-gray-900">{userName}</span>.
                    </p>

                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center mb-6 animate-pulse">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Mot de passe mis à jour avec succès !
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Mise à jour..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
