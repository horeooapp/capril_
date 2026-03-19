"use client"

import { useState, useEffect, useRef } from "react"
import { processAiBdqMessage } from "@/actions/bdq-ai"
import { MessageSquare, Send, User, Bot, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function AiAgentPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Bonjour ! Je suis l'assistant QAPRIL. Je vais enregistrer votre locataire en 2 minutes. Quel est son nom ?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<"EN_COURS" | "COMPLETE">("EN_COURS")
    const scrollRef = useRef<HTMLDivElement>(null)

    const canalRef = useRef(`chat-${Math.random().toString(36).substring(7)}`)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading || status === "COMPLETE") return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setIsLoading(true)

        try {
            const res = await processAiBdqMessage(canalRef.current, userMsg)
            setMessages(prev => [...prev, { role: "assistant", content: res.message }])
            if (res.status === "COMPLETE") {
                setStatus("COMPLETE")
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur technique est survenue. Veuillez réessayer." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold">Assistant BDQ</h1>
                        <p className="text-xs text-blue-100">Enregistrement par conversation • IA Claude</p>
                    </div>
                </div>
                {status === "COMPLETE" && (
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full text-xs animate-pulse">
                        <CheckCircle2 size={14} />
                        Bail créé avec succès
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    msg.role === "user" ? "bg-indigo-100 text-indigo-600" : "bg-blue-600 text-white shadow-md"
                                }`}>
                                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === "user" 
                                        ? "bg-indigo-600 text-white rounded-tr-none" 
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="text-xs text-gray-500 italic">L'assistant réfléchit...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoading || status === "COMPLETE"}
                        placeholder={status === "COMPLETE" ? "Conversation terminée" : "Répondez ici..."}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || status === "COMPLETE"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:shadow-none shadow-lg shadow-blue-500/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                    En continuant, vous acceptez que l'IA enregistre les informations du bail déclaré.
                </p>
            </div>
        </div>
    )
}
