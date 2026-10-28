"use client"

import { useState, useEffect, useRef } from "react"
import { addMediationMessage, initiateMediation } from "@/actions/mediation"
import { useRouter } from "next/navigation"

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: Date
}

interface Mediation {
    id: string
    subject: string
    status: string
    messages: Message[]
}

interface MediationCenterProps {
    leaseId: string
    userId: string
    initialMediation: Mediation | null
}

export default function MediationCenter({ leaseId, userId, initialMediation }: MediationCenterProps) {
    const [messages, setMessages] = useState<Message[]>(initialMediation?.messages || [])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [showInitForm, setShowInitForm] = useState(!initialMediation)
    const [subject, setSubject] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !initialMediation) return

        setLoading(true)
        try {
            const msg = await addMediationMessage(initialMediation.id, newMessage)
            if (msg) {
                setMessages([...messages, msg as Message])
                setNewMessage("")
            }
        } catch (_error) {
            alert("Erreur lors de l'envoi du message.")
        } finally {
            setLoading(false)
        }
    }

    const handleInitMediation = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject.trim()) return

        setLoading(true)
        try {
            await initiateMediation(leaseId, subject)
            router.refresh()
            setShowInitForm(false)
        } catch (_error) {
            alert("Erreur lors de l'ouverture de la médiation.")
        } finally {
            setLoading(false)
        }
    }

    if (showInitForm) {
        return (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 border border-indigo-100 rounded-[24px] shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <span className="text-xl">🤝</span>
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            Demander une Médiation Amiable
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-1">
                            Un désaccord, un retard ou un malentendu ? Résolvez-le sereinement. QAPRIL intervient en tiers de confiance neutre pour faciliter un arrangement écrit avant toute démarche contentieuse.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-2xl mb-6 flex items-start gap-3">
                    <span className="text-base text-amber-600">💡</span>
                    <div className="text-xs text-amber-800 font-medium leading-relaxed">
                        <strong>Protection juridique garantie :</strong> Tous les échanges dans cet espace sont certifiés, horodatés et archivés en toute confidentialité pour servir de preuve de bonne foi.
                    </div>
                </div>

                <form onSubmit={handleInitMediation} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider mb-2">
                            Objet du désaccord (en quelques mots simples)
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-800 placeholder-slate-300 text-sm shadow-sm"
                            placeholder="Ex: Demande d'échelonnement du loyer ou Réparation fuite d'eau"
                            required
                        />
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                            Ce titre sera visible par les deux parties ainsi que par le conseiller QAPRIL.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowInitForm(false)}
                            className="px-5 py-3.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all uppercase tracking-wider"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !subject.trim()}
                            className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-[0.98] uppercase tracking-wider cursor-pointer"
                        >
                            {loading ? "Ouverture en cours..." : "Démarrer le dialogue amiable"}
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    if (!initialMediation) {
        return (
            <div className="text-center py-8">
                <button
                    onClick={() => setShowInitForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                >
                    Ouvrir une Médiation
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[500px] border border-gray-100 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 shrink-0 shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-black uppercase tracking-tight text-lg">{initialMediation.subject}</h3>
                        <p className="text-orange-100 text-[10px] uppercase font-bold tracking-widest mt-0.5">Médiation de Confiance QAPRIL</p>
                    </div>
                    <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded font-bold border border-white/20 uppercase">Status: {initialMediation.status}</span>
                </div>
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scroll-smooth shadow-inner"
            >
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-400 italic text-sm">Le médiateur QAPRIL est à votre écoute. Envoyez un message pour débuter l&apos;échange.</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}
                    >
                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm border ${
                            msg.senderId === userId 
                                ? 'bg-primary text-white border-primary-foreground/10 rounded-br-none' 
                                : 'bg-white text-gray-800 border-gray-100 rounded-bl-none'
                        }`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                            <span className={`text-[9px] mt-2 block font-bold uppercase tracking-widest ${msg.senderId === userId ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0 flex items-center space-x-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-200 focus:bg-white outline-none transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
                    placeholder="Tapez votre message ici..."
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-90 disabled:opacity-50"
                >
                    <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </form>
        </div>
    )
}
