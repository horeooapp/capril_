"use client"

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { ConversationItem } from "@/actions/messaging-actions";
import TenantLandlordChatView from "@/components/messaging/TenantLandlordChatView";

interface LocataireMessagesClientProps {
  conversations: ConversationItem[];
}

export default function LocataireMessagesClient({
  conversations,
}: LocataireMessagesClientProps) {
  const currentConversation = conversations[0] || {
    leaseId: "lease-emeraude-a1",
    propertyTitle: "Appartement 3P · Résidence Émeraude",
    propertyAddress: "Cocody Ambassades, Rue des Jardins",
    otherPartyName: "Koffi N’Guessan (Bailleur)",
    otherPartyRole: "PROPRIETAIRE" as const,
    otherPartyPhone: "+225 07 08 09 10 11",
    unreadCount: 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/mon-espace-locataire"
          className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all text-slate-800"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-black uppercase tracking-wider mb-1">
            <ShieldCheck size={12} className="text-emerald-600" />
            MESSAGERIE SÉCURISÉE AVEC LE BAILLEUR
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter">
            Échanges avec mon Propriétaire
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Signalements, quittances et vie du logement
          </p>
        </div>
      </div>

      {/* CHAT VIEW */}
      <div className="h-[640px] max-h-[80vh]">
        <TenantLandlordChatView
          leaseId={currentConversation.leaseId}
          otherPartyName={currentConversation.otherPartyName}
          otherPartyRole="PROPRIETAIRE"
          propertyTitle={currentConversation.propertyTitle}
          propertyAddress={currentConversation.propertyAddress}
          otherPartyPhone={currentConversation.otherPartyPhone}
          isModal={false}
        />
      </div>
    </div>
  );
}

