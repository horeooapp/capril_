"use client"

import React, { useState } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { sendMediationMessage, resolveDispute } from '@/actions/dispute-actions'
import { useRouter } from 'next/navigation'

interface MediationControlsProps {
    disputeId: string;
    status: string;
}

export const MediationControls: React.FC<MediationControlsProps> = ({ disputeId, status }) => {
    const [message, setMessage] = useState('')
    const [resolution, setResolution] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [isResolving, setIsResolving] = useState(false)
    const [showResolveForm, setShowResolveForm] = useState(false)
    const router = useRouter()

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setIsSending(true)
        try {
            const res = await sendMediationMessage(disputeId, message)
            if (res.success) {
                setMessage('')
                router.refresh()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSending(false)
        }
    }

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resolution.trim()) return

        setIsResolving(true)
        try {
            const res = await resolveDispute(disputeId, resolution)
            if (res.success) {
                setShowResolveForm(false)
                router.refresh()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsResolving(false)
        }
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-900 uppercase tracking-tight">Litige Résolu</h4>
                <p className="text-emerald-600 text-xs">Ce dossier est officiellement clos.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {!showResolveForm ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Send className="w-3 h-3" />
                        Réponse de Médiation
                    </h4>
                    <form onSubmit={handleSendMessage} className="space-y-3">
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
                            placeholder="Saisissez votre avis ou une demande de pièces complémentaires..."
                            required
                        />
                        <div className="flex items-center justify-between">
                            <button 
                                type="button"
                                onClick={() => setShowResolveForm(true)}
                                className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Clôturer le litige
                            </button>
                            <button 
                                type="submit"
                                disabled={isSending || !message.trim()}
                                className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Envoyer la réponse"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 animate-in zoom-in-95 duration-200">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        Résolution Officielle
                    </h4>
                    <form onSubmit={handleResolve} className="space-y-3">
                        <textarea 
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            className="w-full bg-white border-emerald-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-200 min-h-[100px] resize-none"
                            placeholder="Décrivez la solution finale ou l'accord trouvé entre les parties..."
                            required
                        />
                        <div className="flex items-center justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowResolveForm(false)}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                disabled={isResolving || !resolution.trim()}
                                className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isResolving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirmer la clôture"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
