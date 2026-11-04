"use client"

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Building2,
  CheckCheck,
  Check,
  User,
  ShieldCheck,
  Phone,
  Sparkles,
} from "lucide-react";
import { ConversationItem } from "@/actions/messaging-actions";
import TenantLandlordChatView from "@/components/messaging/TenantLandlordChatView";

interface MessagesClientProps {
  initialConversations: ConversationItem[];
}

export default function MessagesClient({ initialConversations }: MessagesClientProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(
    initialConversations[0]?.leaseId || ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  const activeConversation = conversations.find((c) => c.leaseId === selectedLeaseId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.otherPartyName.toLowerCase().includes(term) ||
      c.propertyTitle.toLowerCase().includes(term) ||
      c.propertyAddress.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
            <ShieldCheck size={12} className="text-amber-600" />
            CANAL CONTRADICTOIRE SÉCURISÉ · BAILLEUR ↔ LOCATAIRES
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <MessageSquare className="text-amber-500" size={30} /> Messagerie Locataires
          </h1>
          <p className="text-[13px] font-medium text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Échangez directement avec vos locataires concernant la vie du logement, les signalements d’incidents reçus et les quittances.
            Les messages reçus affichent deux encoches grises, et deux encoches rouges une fois lus.
          </p>
        </div>
      </div>

      {/* CONTAINER SPLIT 2 COLONNES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* LISTE DES DISCUSSIONS (GAUCHE) */}
        <div className="lg:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Rechercher un locataire ou un bien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.leaseId === selectedLeaseId;
              const timeStr = conv.lastMessageDate
                ? new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <button
                  key={conv.leaseId}
                  onClick={() => setSelectedLeaseId(conv.leaseId)}
                  className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-l-4 border-amber-600"
                      : "hover:bg-slate-100/80 bg-white"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {conv.otherPartyName.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-[13px] font-black text-slate-900 truncate">
                        {conv.otherPartyName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {timeStr}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-slate-500 truncate mb-1">
                      {conv.propertyTitle}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] text-slate-600 truncate flex-1 font-medium">
                        {conv.lastMessage}
                      </p>

                      {/* ENCOCHES RÉGLEMENTAIRES SUR LA LISTE */}
                      {conv.lastMessageIsMe && (
                        <div className="shrink-0">
                          {conv.lastMessageStatut === "LU" ? (
                            <span title="Reçu et lu (2 encoches rouges)">
                              <CheckCheck size={14} className="text-red-600 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span title="Reçu (2 encoches grises)">
                              <CheckCheck size={14} className="text-slate-400 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aucune conversation trouvée.
              </div>
            )}
          </div>
        </div>

        {/* ZONE DE CHAT ACTIVE (DROITE) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {activeConversation ? (
            <TenantLandlordChatView
              key={activeConversation.leaseId}
              leaseId={activeConversation.leaseId}
              otherPartyName={activeConversation.otherPartyName}
              otherPartyRole="LOCATAIRE"
              propertyTitle={activeConversation.propertyTitle}
              propertyAddress={activeConversation.propertyAddress}
              otherPartyPhone={activeConversation.otherPartyPhone}
              isModal={false}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center">
              <MessageSquare size={48} className="mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-600">Sélectionnez une discussion</p>
              <p className="text-xs text-slate-400 mt-1">
                Choisissez un locataire dans la liste pour démarrer l’échange.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

