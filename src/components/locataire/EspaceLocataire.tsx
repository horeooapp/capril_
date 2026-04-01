"use client";
// QAPRIL - Espace Locataire - Shell navigation 6 onglets
// Référence visuelle : qapril_locataire.html (approuvé 01/04/2026)

import { useState } from "react";
import { Q } from "@/lib/qapril.design";

type Tab = "bail" | "quittances" | "paiement" | "factures" | "signalements" | "profil";

const TABS: { id: Tab; icon: string; label: string; badge?: number }[] = [
  { id: "bail",          icon: "🏠", label: "Mon bail" },
  { id: "quittances",    icon: "📄", label: "Quittances" },
  { id: "paiement",      icon: "💳", label: "Paiement" },
  { id: "factures",      icon: "⚡", label: "Factures", badge: 1 },
  { id: "signalements",  icon: "🔔", label: "Signalements" },
  { id: "profil",        icon: "👤", label: "Profil" },
];

type Props = {
  tenantId:   string;
  tenantName: string;
  // Sous-composants injectés (lazy)
  PageBail:         React.ComponentType<{tenantId:string}>;
  PageQuittances:   React.ComponentType<{tenantId:string}>;
  PagePaiement:     React.ComponentType<{tenantId:string}>;
  PageFactures:     React.ComponentType<{tenantId:string}>;
  PageSignalements: React.ComponentType<{tenantId:string}>;
  PageProfil:       React.ComponentType<{tenantId:string}>;
};

export default function EspaceLocataire({ tenantId, tenantName, ...Pages }: Props) {
  const [tab, setTab] = useState<Tab>("bail");

  const pageMap: Record<Tab, React.ComponentType<{tenantId:string}>> = {
    bail:         Pages.PageBail,
    quittances:   Pages.PageQuittances,
    paiement:     Pages.PagePaiement,
    factures:     Pages.PageFactures,
    signalements: Pages.PageSignalements,
    profil:       Pages.PageProfil,
  };
  const Page = pageMap[tab];

  return (
    <div className="min-h-screen bg-[#EEF3FB] pb-20 font-sans">

      {/* Topbar - NE PAS MODIFIER */}
      <div className={Q.topbar}>
        <div>
          <div className={Q.brand}>QAPRIL</div>
          <div className="text-xs text-white/70 mt-0.5">{tenantName} · Locataire</div>
        </div>
        <span className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full font-semibold">Espace locataire</span>
      </div>

      {/* Contenu page */}
      <div className="px-4 pt-4">
        <Page tenantId={tenantId} />
      </div>

      {/* Bottom Nav - 6 onglets - NE PAS MODIFIER */}
      <div className={Q.bottomNav} style={{gridTemplateColumns:"repeat(6,1fr)"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={tab === t.id ? Q.navItemOn : Q.navItem}
            style={{position:"relative"}}
          >
            {/* Badge notification */}
            {t.badge && t.badge > 0 && (
              <span className="absolute top-1.5 right-1/4 bg-[#CC2020] text-white text-[8px] font-bold px-1 rounded-full">{t.badge}</span>
            )}
            {/* Icône avec fond actif */}
            <div className={`w-8 h-8 flex items-center justify-center ${tab === t.id ? "bg-[#F0F5FF] rounded-lg" : ""}`}>
              <span className="text-lg">{t.icon}</span>
            </div>
            <div className={Q.navLabel}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
