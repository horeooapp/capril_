"use client"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { creerBailDeclaratif } from "@/actions/bail-declaratif.actions"

interface Message {
  role:    "user" | "assistant"
  content: string
}

interface AgentProps {
  propertyId?: string 
  onSuccess?: (bail: any) => void
  onCancel?:  () => void
}

export default function AgentBailDeclaratif({
  propertyId,
  onSuccess,
  onCancel
}: AgentProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [bailData, setBailData] = useState<any>(null)
  const [etape, setEtape] = useState<"chat"|"recap"|"done">("chat")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    demarrerConversation()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const demarrerConversation = async () => {
    setLoading(true)
    const res = await fetch("/api/agent-bail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [] })
    })
    const data = await res.json()
    setMessages([{ role: "assistant", content: data.message }])
    setLoading(false)
  }

  const envoyerMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: "user", content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/agent-bail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()

      if (data.error) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Désolée, une erreur est survenue (Avez-vous configuré la clé Anthropic?)."
        }])
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message
      }])

      if (data.status === "RECAP" && data.data) {
        setBailData(data.data)
        setEtape("recap")
      } else if (data.status === "CONFIRMED" && data.data) {
        setBailData(data.data)
        await confirmerCreation(data.data)
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Erreur de connexion. Vérifiez votre connexion internet."
      }])
    }
    setLoading(false)
  }

  const confirmerCreation = async (data: any) => {
    setLoading(true)
    try {
      if (!session?.user?.id) throw new Error("Non connecté");
      
      const res = await creerBailDeclaratif(
        session.user.id,
        { ...data, propertyId }
      )
      setEtape("done")
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Bail déclaratif créé avec succès !\nRéférence : ${res.bail.leaseReference}\n\nUn SMS d'invitation va être envoyé au locataire.`
      }])
      onSuccess?.(res.bail)
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Erreur lors de la création : ${err.message}`
      }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-[#EEF3FB] rounded-2xl overflow-hidden border border-[#D0DFF5]">
      {/* Header */}
      <div className="bg-[#1B3A6B] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-[#F5A800] tracking-widest">QAPRIL</div>
          <div className="text-xs text-white/60 mt-0.5">Assistant bail déclaratif</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
          <span className="text-xs text-white/60">En ligne</span>
          {onCancel && (
            <button onClick={onCancel} className="text-white/40 text-xs ml-4 hover:text-white/70">
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center
                text-[#F5A800] text-xs font-bold mr-2 flex-shrink-0 mt-1">
                Q
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
              msg.role === "user"
                ? "bg-[#1B3A6B] text-white rounded-br-sm shadow-blue-900/20"
                : "bg-white border border-[#D0DFF5] text-[#1B3A6B] rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-[#F5A800] text-xs font-bold mr-2 flex-shrink-0">Q</div>
            <div className="bg-white border border-[#D0DFF5] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" style={{animationDelay:"0.15s"}} />
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" style={{animationDelay:"0.3s"}} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      {etape !== "done" && (
        <div className="p-3 bg-white border-t border-[#D0DFF5] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && envoyerMessage()}
            placeholder="Répondez ici..."
            disabled={loading}
            className="flex-1 bg-[#F0F5FF] border border-[#C0CFDF] rounded-xl px-4 py-3
              text-[#1B3A6B] text-sm outline-none focus:border-[#1B3A6B] disabled:opacity-50"
          />
          <button
            onClick={envoyerMessage}
            disabled={loading || !input.trim()}
            className="bg-[#1B3A6B] hover:bg-blue-900 transition-colors text-white w-12 rounded-xl flex items-center
              justify-center border-none cursor-pointer disabled:opacity-50 flex-shrink-0">
            <span style={{fontSize:18}}>→</span>
          </button>
        </div>
      )}

      {/* Bouton confirmer si recap */}
      {etape === "recap" && bailData && (
        <div className="p-3 bg-white border-t border-[#D0DFF5] flex gap-2">
          <button
            onClick={() => confirmerCreation(bailData)}
            disabled={loading}
            className="flex-1 bg-[#F5A800] hover:bg-orange-500 text-[#1B2A3B] py-3 rounded-xl font-bold transition-colors
              text-sm border-none cursor-pointer disabled:opacity-50">
            Confirmer & Créer
          </button>
          <button
            onClick={() => {
              setEtape("chat")
              setMessages(prev => [...prev, {
                role: "user", content: "Je veux corriger des informations"
              }])
              envoyerMessage()
            }}
            className="flex-1 bg-white hover:bg-gray-50 border border-[#C0CFDF] text-[#4A6A8A] py-3 transition-colors
              rounded-xl text-sm font-semibold cursor-pointer">
            Corriger
          </button>
        </div>
      )}
    </div>
  )
}
