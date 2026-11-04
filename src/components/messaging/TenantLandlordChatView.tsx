"use client"

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Check,
  CheckCheck,
  User,
  Building2,
  Clock,
  Phone,
  X,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChatMessage, getBailMessages, sendBailMessage } from "@/actions/messaging-actions";

interface TenantLandlordChatViewProps {
  leaseId: string;
  otherPartyName: string;
  otherPartyRole?: "LOCATAIRE" | "PROPRIETAIRE";
  propertyTitle?: string;
  propertyAddress?: string;
  otherPartyPhone?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function TenantLandlordChatView({
  leaseId,
  otherPartyName,
  otherPartyRole = "LOCATAIRE",
  propertyTitle,
  propertyAddress,
  otherPartyPhone,
  onClose,
  isModal = false,
}: TenantLandlordChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const res = await getBailMessages(leaseId);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [leaseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Ajout optimiste immédiat
    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      leaseId,
      expediteurId: "me",
      roleExpediteur: otherPartyRole === "LOCATAIRE" ? "PROPRIO" : "LOCATAIRE",
      contenu: textToSend,
      statut: "RECU", // 2 encoches grises dès émission
      dateEnvoi: new Date().toISOString(),
      dateReception: new Date().toISOString(),
      dateLecture: null,
      senderName: "Moi",
      isMe: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await sendBailMessage(leaseId, textToSend);
      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? res.message! : m))
        );
      }
    } catch (e) {
      console.error("Erreur envoi message:", e);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * RÈGLE D'AFFICHAGE DES ENCOCHES DEMANDÉE PAR L'UTILISATEUR :
   * - 2 encoches grises : Message reçu (non encore lu)
   * - 2 encoches rouges : Message reçu et lu
   * - 1 encoche grise : Message envoyé / en cours
   */
  const renderStatusTicks = (statut: "ENVOYE" | "RECU" | "LU") => {
    if (statut === "LU") {
      return (
        <span
          title="Reçu et lu (2 encoches rouges)"
          className="inline-flex items-center text-red-600 font-black ml-1 select-none"
        >
          <CheckCheck size={14} className="stroke-[2.5]" />
        </span>
      );
    }

    if (statut === "RECU") {
      return (
        <span
          title="Reçu par le destinataire (2 encoches grises)"
          className="inline-flex items-center text-slate-400 font-black ml-1 select-none"
        >
          <CheckCheck size={14} className="stroke-[2.5]" />
        </span>
      );
    }

    return (
      <span
        title="Envoyé (1 encoche grise)"
        className="inline-flex items-center text-slate-400 font-bold ml-1 select-none"
      >
        <Check size={13} className="stroke-[2]" />
      </span>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-slate-50 ${isModal ? "max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200" : "rounded-2xl border border-slate-200 shadow-sm"}`}>
      {/* EN-TÊTE DE LA CONVERSATION */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-black text-sm shrink-0">
            {otherPartyName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {otherPartyName}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {otherPartyRole === "LOCATAIRE" ? "Locataire en titre" : "Bailleur en titre"}
              </span>
            </div>
            {(propertyTitle || propertyAddress) && (
              <p className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <Building2 size={11} className="text-slate-400 shrink-0" />
                {propertyTitle || propertyAddress}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {otherPartyPhone && (
            <a
              href={`tel:${otherPartyPhone}`}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Appeler"
            >
              <Phone size={14} />
              <span className="hidden md:inline">{otherPartyPhone}</span>
            </a>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Fermer la messagerie"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* BANDEAU RÈGLE & LÉGENDE DES ENCOCHES */}
      <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Fil sécurisé horodaté contradictoire</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-slate-500">
            <CheckCheck size={12} className="text-slate-400" /> Reçu (2 encoches grises)
          </span>
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <CheckCheck size={12} className="text-red-600 stroke-[2.5]" /> Lu (2 encoches rouges)
          </span>
        </div>
      </div>

      {/* CORPS DES MESSAGES */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-xs font-semibold">
            Chargement de la messagerie...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold">Aucun message échangé pour le moment.</p>
            <p className="text-[11px] mt-1">Vous pouvez envoyer le premier message ci-dessous.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.isMe || msg.roleExpediteur === (otherPartyRole === "LOCATAIRE" ? "PROPRIO" : "LOCATAIRE");
            const timeStr = msg.dateEnvoi
              ? new Date(msg.dateEnvoi).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-black text-slate-500 mb-1 ml-1 uppercase tracking-wider">
                    {msg.senderName || otherPartyName}
                  </span>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-slate-900 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-medium">{msg.contenu}</p>

                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    <span>{timeStr}</span>
                    {/* ENCOCHES RÉGLEMENTAIRES UNIQUEMENT SUR LES MESSAGES ENVOYÉS */}
                    {isMe && renderStatusTicks(msg.statut)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE DE SAISIE */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-slate-200 p-3 sm:p-4 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Écrire à ${otherPartyName}...`}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="bg-slate-900 hover:bg-amber-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Envoyer</span>
        </button>
      </form>
    </div>
  );
}

