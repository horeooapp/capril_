"use client"
// QAPRIL - Agent IA Bail Déclaratif - Interface chat
// Version corrigée
// Corrections appliquées :
//   BUG-01 : import { Q } inutilisé supprimé (plantait à la compilation)
//   BUG-02 : bouton "Corriger" envoyait un message vide — corrigé via envoyerMessageDirect()
//   BUG-03 : session non-null assertion (!) → accès sécurisé avec vérification explicite
//   BUG-04 : demarrerConversation sans try/catch — erreur silencieuse au démarrage
//   BUG-05 : onSuccess recevait uniquement bail — transmet maintenant bail + bdq + tenant
//   BUG-06 : double déclenchement de confirmerCreation si status=CONFIRMED + bouton visible

import { useState, useRef, useEffect } from "react"
import { useSession }                  from "next-auth/react"
import { creerBailDeclaratif }         from "@/actions/bail-declaratif.actions"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Message {
  role    : "user" | "assistant"
  content : string
}

interface AgentProps {
  propertyId? : string
  onSuccess?  : (result: { bail: any; bdq: any; tenant: any }) => void
  onCancel?   : () => void
}

// ─────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────

export default function AgentBailDeclaratif({
  propertyId,
  onSuccess,
  onCancel,
}: AgentProps) {
  const { data: session } = useSession()

  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [bailData, setBailData] = useState<any>(null)
  const [etape,    setEtape]    = useState<"chat" | "recap" | "done">("chat")
  const [erreur,   setErreur]   = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Démarrage automatique de la conversation
  useEffect(() => {
    demarrerConversation()
  }, [])

  // Scroll automatique vers le dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // ── Appel API avec un historique de messages donné
  async function appelAgent(historique: Message[]): Promise<{
    message : string
    status  : string
    data    : any
  }> {
    const res  = await fetch("/api/agent-bail", {
      method  : "POST",
      headers : { "Content-Type": "application/json" },
      body    : JSON.stringify({ messages: historique }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      // BUG-03 : si 401, la session a expiré
      if (res.status === 401) throw new Error("Session expirée. Veuillez vous reconnecter.")
      throw new Error(err.error ?? `Erreur serveur (${res.status})`)
    }

    return res.json()
  }

  // ── Démarrage : message initial de l'agent (conversation vide)
  async function demarrerConversation() {
    setLoading(true)
    setErreur(null)
    try {                                          // BUG-04 : try/catch ajouté
      const data = await appelAgent([])
      setMessages([{ role: "assistant", content: data.message }])
    } catch (err: any) {
      setErreur("Impossible de démarrer l'assistant. " + err.message)
    }
    setLoading(false)
  }

  // ── Envoi du message saisi par l'utilisateur
  async function envoyerMessage() {
    if (!input.trim() || loading) return

    const userMsg    : Message = { role: "user", content: input.trim() }
    const historique : Message[] = [...messages, userMsg]
    setMessages(historique)
    setInput("")
    await traiterReponseAgent(historique)
  }

  // BUG-02 : ancienne version du bouton "Corriger" appelait envoyerMessage()
  // qui vérifiait input.trim() — input étant vide, rien ne se passait.
  // Cette fonction envoie directement un message sans passer par le champ de saisie.
  async function envoyerMessageDirect(texte: string) {
    if (loading) return

    const userMsg    : Message = { role: "user", content: texte }
    const historique : Message[] = [...messages, userMsg]
    setMessages(historique)
    await traiterReponseAgent(historique)
  }

  // ── Traitement commun de la réponse de l'agent
  async function traiterReponseAgent(historique: Message[]) {
    setLoading(true)
    setErreur(null)
    try {
      const data = await appelAgent(historique)

      setMessages(prev => [...prev, {
        role    : "assistant",
        content : data.message,
      }])

      if (data.status === "RECAP" && data.data) {
        // BUG-06 : on passe en étape recap SANS appeler confirmerCreation
        // La confirmation n'est déclenchée que par le bouton ou la réponse CONFIRMED
        setBailData(data.data)
        setEtape("recap")

      } else if (data.status === "CONFIRMED" && data.data) {
        // Le bailleur a tapé OUI — on confirme directement
        // BUG-06 : on efface bailData pour éviter que le bouton recap reste visible
        setBailData(null)
        setEtape("done")   // passe en done avant l'appel pour désactiver les boutons
        await confirmerCreation(data.data)
      }

    } catch (err: any) {
      setMessages(prev => [...prev, {
        role    : "assistant",
        content : "Erreur de connexion. Vérifiez votre connexion internet et réessayez.",
      }])
      setErreur(err.message)
    }
    setLoading(false)
  }

  // ── Création en base du bail déclaratif
  async function confirmerCreation(data: any) {
    // BUG-03 : vérification explicite de la session au lieu du ! non-null assertion
    const userId = session?.user?.userId
    if (!userId) {
      setMessages(prev => [...prev, {
        role    : "assistant",
        content : "Votre session a expiré. Veuillez vous reconnecter et réessayer.",
      }])
      return
    }

    setLoading(true)
    try {
      const res = await creerBailDeclaratif(userId, { ...data, propertyId })

      setEtape("done")
      setMessages(prev => [...prev, {
        role    : "assistant",
        content : `Bail déclaratif créé avec succès !\nRéférence : ${res.bail.leaseReference}\n\nUn SMS d'invitation va être envoyé au locataire.`,
      }])

      // BUG-05 : onSuccess reçoit maintenant bail + bdq + tenant
      onSuccess?.({ bail: res.bail, bdq: res.bdq, tenant: res.tenant })

    } catch (err: any) {
      // Si la création échoue, on repasse en recap pour que le bailleur puisse réessayer
      setEtape("recap")
      setMessages(prev => [...prev, {
        role    : "assistant",
        content : `Une erreur est survenue lors de la création : ${err.message}\n\nVoulez-vous réessayer ?`,
      }])
    }
    setLoading(false)
  }

  // ─────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#EEF3FB] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="bg-[#1B3A6B] px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-[#F5A800] tracking-widest">QAPRIL</div>
          <div className="text-xs text-white/60 mt-0.5">Assistant bail déclaratif</div>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-2 h-2 rounded-full bg-[#F5A800] animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-[#00D084]" />
          )}
          <span className="text-xs text-white/60">{loading ? "En cours..." : "En ligne"}</span>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-white/40 text-xs ml-2 hover:text-white/70 disabled:opacity-30"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Bandeau d'erreur technique */}
      {erreur && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700">
          {erreur}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center
                text-[#F5A800] text-xs font-bold mr-2 flex-shrink-0 mt-1">
                Q
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-[#1B3A6B] text-white rounded-br-sm"
                  : "bg-white border border-[#D0DFF5] text-[#1B3A6B] rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Indicateur de frappe */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center
              text-[#F5A800] text-xs font-bold mr-2 flex-shrink-0">Q</div>
            <div className="bg-white border border-[#D0DFF5] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie — masquée en fin de conversation */}
      {etape === "chat" && (
        <div className="p-3 bg-white border-t border-[#D0DFF5] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && envoyerMessage()}
            placeholder="Répondez ici..."
            disabled={loading}
            className="flex-1 bg-[#F0F5FF] border border-[#C0CFDF] rounded-xl px-4 py-2.5
              text-[#1B3A6B] text-sm outline-none focus:border-[#1B3A6B] disabled:opacity-50"
          />
          <button
            onClick={envoyerMessage}
            disabled={loading || !input.trim()}
            className="bg-[#1B3A6B] text-white w-10 h-10 rounded-xl flex items-center
              justify-center border-none cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            <span style={{ fontSize: 16 }}>→</span>
          </button>
        </div>
      )}

      {/* Boutons de confirmation — visibles uniquement à l'étape recap */}
      {/* BUG-06 : conditionnés sur etape === "recap" ET bailData non null */}
      {etape === "recap" && bailData && (
        <div className="p-3 bg-white border-t border-[#D0DFF5] flex gap-2">
          <button
            onClick={() => {
              setBailData(null)
              setEtape("done")
              confirmerCreation(bailData)
            }}
            disabled={loading}
            className="flex-1 bg-[#F5A800] text-[#1B2A3B] py-3 rounded-xl font-bold
              text-sm border-none cursor-pointer disabled:opacity-50"
          >
            Confirmer et créer le bail
          </button>
          <button
            onClick={() => {
              // BUG-02 : utilise envoyerMessageDirect au lieu de envoyerMessage
              // pour envoyer le message sans passer par le champ de saisie (qui est vide)
              setEtape("chat")
              setBailData(null)
              envoyerMessageDirect("Je souhaite corriger des informations")
            }}
            disabled={loading}
            className="flex-1 bg-white border border-[#C0CFDF] text-[#4A6A8A] py-3
              rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            Corriger
          </button>
        </div>
      )}
    </div>
  )
}
