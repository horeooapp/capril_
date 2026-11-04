"use client"

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ShieldCheck, Building2, Phone, Home } from "lucide-react";
import { ConversationItem } from "@/actions/messaging-actions";
import TenantLandlordChatView from "@/components/messaging/TenantLandlordChatView";

interface LocataireMessagesClientProps {
  conversations: ConversationItem[];
}

export default function LocataireMessagesClient({
  conversations = [],
}: LocataireMessagesClientProps) {
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(
    conversations[0]?.leaseId || ""
  );

  const activeConversation = conversations.find((c) => c.leaseId === selectedLeaseId) || conversations[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/mon-espace-locataire"
            className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-800 shadow-xs shrink-0"
            title="Retour au tableau de bord"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              MESSAGERIE SÉCURISÉE AVEC MON BAILLEUR
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Échanges avec mon Propriétaire
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Canal contradictoire horodaté · Quittances, signalements & vie du logement
            </p>
          </div>
        </div>

        {activeConversation?.otherPartyPhone && (
          <a
            href={`tel:${activeConversation.otherPartyPhone}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Phone size={14} className="text-emerald-600" />
            <span>Appeler le bailleur</span>
          </a>
        )}
      </div>

      {/* Multi-lease selector tabs if tenant has more than 1 active lease */}
      {conversations.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {conversations.map((conv) => (
            <button
              key={conv.leaseId}
              onClick={() => setSelectedLeaseId(conv.leaseId)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                (activeConversation?.leaseId === conv.leaseId)
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Building2 size={14} />
              <span>{conv.propertyTitle}</span>
              <span className="text-[10px] opacity-75 font-normal">({conv.otherPartyName})</span>
            </button>
          ))}
        </div>
      )}

      {/* CHAT VIEW OU ÉTAT VIDE */}
      {activeConversation ? (
        <div className="h-[640px] max-h-[80vh]">
          <TenantLandlordChatView
            key={activeConversation.leaseId}
            leaseId={activeConversation.leaseId}
            otherPartyName={activeConversation.otherPartyName}
            otherPartyRole="PROPRIETAIRE"
            propertyTitle={activeConversation.propertyTitle}
            propertyAddress={activeConversation.propertyAddress}
            otherPartyPhone={activeConversation.otherPartyPhone}
            isModal={false}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            💬
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Aucun contrat de bail actif
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Votre messagerie sécurisée avec votre bailleur ou gérant sera automatiquement activée dès que votre bail sera validé.
          </p>
          <Link
            href="/mon-espace-locataire"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Home size={14} />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>
      )}
    </div>
  );
}
