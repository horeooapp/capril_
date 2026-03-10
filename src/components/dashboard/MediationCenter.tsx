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

interface MediationCenterProps {
    leaseId: string
    userId: string
    initialMediation: any
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
            // @ts-ignore
            setMessages([...messages, msg])
            setNewMessage("")
        } catch (error) {
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
        } catch (error) {
            alert("Erreur lors de l'ouverture de la médiation.")
        } finally {
            setLoading(false)
        }
    }

    if (showInitForm) {
        return (
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in zoom-in duration-300">
                <h3 className="text-xl font-black text-blue-900 mb-2 uppercase tracking-tight">Ouvrir une Médiation Numérique</h3>
                <p className="text-sm text-blue-800 mb-6 font-medium leading-relaxed">
                    Un litige ? Entamez une médiation sécurisée et horodatée sur QAPRIL. 
                    Tous les échanges ont une valeur probante devant les autorités compétentes.
                </p>
                <form onSubmit={handleInitMediation} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1 ml-1">Sujet du litige</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-blue-900 placeholder-blue-300 shadow-sm"
                            placeholder="Ex: Retard de loyer (Mois d&apos;Octobre)"
                            required
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowInitForm(false)}
                            className="flex-1 px-4 py-3 text-sm font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-widest"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !subject.trim()}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            {loading ? "Ouverture..." : "Ouvrir le Litige"}
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
