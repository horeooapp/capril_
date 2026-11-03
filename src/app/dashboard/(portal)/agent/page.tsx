"use client"

import { useState, useEffect, useRef } from "react"
import { processAiBdqMessage } from "@/actions/bdq-ai"
import {
    Send,
    User,
    Bot,
    Loader2,
    CheckCircle2,
    RotateCcw,
    FileText,
    Phone,
    Home,
    Wallet,
    Calendar,
    Clock,
    Sparkles,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function AiAgentPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Bonjour ! Je suis l'assistant QAPRIL. Je vais enregistrer votre locataire en 2 minutes par simple conversation. Comment s'appelle votre locataire ?",
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<string>("EN_COURS")
    const [extracted, setExtracted] = useState<Record<string, any>>({})
    const [bdqResult, setBdqResult] = useState<any>(null)
    const [pastConvs, setPastConvs] = useState<any[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    const canalRef = useRef(`chat-${Math.random().toString(36).substring(2, 9)}`)

    async function loadPastConversations() {
        try {
            const res = await fetch("/api/v1/agent/conversations")
            if (res.ok) {
                const json = await res.json()
                setPastConvs(json.conversations || [])
            }
        } catch {
            // ignore
        }
    }

    useEffect(() => {
        loadPastConversations()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (presetText?: string) => {
        const textToSend = (presetText ?? input).trim()
        if (!textToSend || isLoading || status === "COMPLETE") return

        if (!presetText) setInput("")
        setMessages((prev) => [...prev, { role: "user", content: textToSend }])
        setIsLoading(true)

        try {
            const res: any = await processAiBdqMessage(canalRef.current, textToSend)
            setMessages((prev) => [...prev, { role: "assistant", content: res.message }])
            if (res.extracted) {
                setExtracted(res.extracted)
            }
            if (res.status) {
                setStatus(res.status)
            }
            if (res.bdq) {
                setBdqResult(res.bdq)
                loadPastConversations()
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Désolé, une erreur technique est survenue. Veuillez réessayer.",
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = () => {
        canalRef.current = `chat-${Math.random().toString(36).substring(2, 9)}`
        setMessages([
            {
                role: "assistant",
                content:
                    "Nouvelle conversation démarrée ! Comment s'appelle le locataire que vous souhaitez enregistrer ?",
            },
        ])
        setExtracted({})
        setBdqResult(null)
        setStatus("EN_COURS")
        setInput("")
    }

    const fieldsChecklist = [
        {
            key: "nom_locataire",
            label: "Nom du locataire",
            icon: User,
            value: extracted.nom_locataire,
        },
        {
            key: "telephone_locataire",
            label: "Téléphone (CI)",
            icon: Phone,
            value: extracted.telephone_locataire,
        },
        {
            key: "description_logement",
            label: "Porte / Logement",
            icon: Home,
            value: extracted.description_logement,
        },
        {
            key: "loyer_declare_mensuel",
            label: "Loyer mensuel",
            icon: Wallet,
            value: extracted.loyer_declare_mensuel
                ? `${Number(extracted.loyer_declare_mensuel).toLocaleString("fr-FR")} FCFA`
                : null,
        },
        {
            key: "date_entree_estimee",
            label: "Date d'entrée",
            icon: Calendar,
            value: extracted.date_entree_estimee,
        },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne Principale : Chat Conversationnel */}
            <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#1F4E79] to-[#0f2942] text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/15 rounded-2xl">
                            <Bot size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-black text-base">Agent IA — Bail Déclaratif (BDQ)</h1>
                                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase">
                                    ADD-08
                                </span>
                            </div>
                            <p className="text-xs text-blue-100">
                                Français standard & populaire ivoirien (« 35 mille », « depuis les fêtes »)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {status === "COMPLETE" && (
                            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
                                <CheckCircle2 size={14} />
                                BDQ créé
                            </div>
                        )}
                        <button
                            onClick={handleReset}
                            title="Nouveau BDQ"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
                        >
                            <RotateCcw size={14} /> Nouveau
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`flex gap-3 max-w-[85%] ${
                                        msg.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            msg.role === "user"
                                                ? "bg-[#C55A11] text-white"
                                                : "bg-[#1F4E79] text-white shadow-md"
                                        }`}
                                    >
                                        {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
                                    </div>
                                    <div
                                        className={`p-4 rounded-2xl text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                                            msg.role === "user"
                                                ? "bg-[#1F4E79] text-white rounded-tr-none"
                                                : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1F4E79] text-white flex items-center justify-center">
                                <Bot size={15} />
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-[#1F4E79]" />
                                <span className="text-xs text-slate-500 font-medium">
                                    Extraction des informations BDQ en cours...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Examples Bar */}
                {status !== "COMPLETE" && (
                    <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs">
                        <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                            <Sparkles size={12} /> Exemples :
                        </span>
                        {[
                            "Kouassi Jean, 0708123456",
                            "Porte 3 cour Yopougon, 35 mille",
                            "Depuis les fêtes",
                            "OUI",
                        ].map((sample) => (
                            <button
                                key={sample}
                                type="button"
                                onClick={() => handleSend(sample)}
                                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#1F4E79] hover:text-[#1F4E79] font-medium shrink-0 transition-colors cursor-pointer"
                            >
                                {sample}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading || status === "COMPLETE"}
                            placeholder={
                                status === "COMPLETE"
                                    ? "Bail Déclaratif enregistré avec succès."
                                    : "Écrivez naturellement (ex: Il s'appelle Konan, il paie 35 mille dans la porte 2)..."
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] transition-all disabled:bg-slate-100"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading || status === "COMPLETE"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#C55A11] hover:bg-[#a84a0c] text-white rounded-xl transition-colors disabled:bg-slate-300 cursor-pointer"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Colonne Latérale : Extraction Temps Réel & Historique */}
            <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Données Extraites (5 Champs BDQ)
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1F4E79] text-xs font-black">
                            {status}
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {fieldsChecklist.map((f) => {
                            const Icon = f.icon
                            const filled = Boolean(f.value)
                            return (
                                <div
                                    key={f.key}
                                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                                        filled
                                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                                            : "bg-slate-50 border-slate-200/70 text-slate-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon
                                            size={15}
                                            className={filled ? "text-emerald-600" : "text-slate-400"}
                                        />
                                        <span className="font-bold">{f.label}</span>
                                    </div>
                                    <span className="font-black truncate max-w-[150px]">
                                        {f.value || "En attente..."}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {bdqResult && (
                        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs space-y-1">
                            <div className="font-black flex items-center gap-1.5">
                                <CheckCircle2 size={15} /> BDQ Enregistré !
                            </div>
                            <div>Référence : {bdqResult.qrToken || bdqResult.id?.slice(0, 8)}</div>
                            <div>SMS de confirmation envoyé au locataire.</div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <Link
                            href="/dashboard/leases"
                            className="font-bold text-[#1F4E79] hover:underline flex items-center gap-1"
                        >
                            <FileText size={13} /> Voir mes baux & BDQ
                        </Link>
                    </div>
                </div>

                {/* Historique des conversations BDQ (AGT-04) */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Clock size={14} /> Mes Dernières Sessions Agent IA
                    </h3>
                    {pastConvs.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucune session précédente.</p>
                    ) : (
                        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                            {pastConvs.slice(0, 6).map((c: any) => (
                                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-bold text-slate-800">
                                            {c.donneesExtraites?.nom_locataire || c.canalRef}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {c.nbEchanges} échanges · {c.canal}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                            c.statut === "COMPLETE"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {c.statut}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
