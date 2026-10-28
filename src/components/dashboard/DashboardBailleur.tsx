"use client"
import { toast } from "sonner";
import Link from "next/link";
// QAPRIL - Dashboard Bailleur - Visuel approuve 01/04/2026
// NE PAS MODIFIER les classes Q.* - elles encodent le design approuve

import { useState } from "react";
import { Q, OP_COLORS, QAPRIL_COLORS } from "@/lib/qapril.design";
import type { DashboardBailleur as DashData } from "@/types/qapril.types";

type Props = { data: DashData };

export default function DashboardBailleur({ data }: Props) {
  const [alerteOuverte, setAlerteOuverte] = useState<string | null>(null);
  const [bienOuvert,    setBienOuvert]    = useState<string | null>(null);
  const [opWallet,      setOpWallet]      = useState<keyof typeof OP_COLORS>("WAVE");

  const seuil = data?.walletSeuilAlerte ?? 1000;
  const pct   = Math.min(100, (data.walletBalance / 5000) * 100);

  return (
    <div className={Q.page}>
      <div className={Q.wrap}>

        {/* Topbar */}
        <div className={Q.topbar + " rounded-xl mb-3"}>
          <div>
            <div className={Q.brand}>QAPRIL</div>
            <div className="text-xs text-white/70 mt-0.5">{data.landlordName} · Bailleur</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#7A9AC0]">{new Date().toLocaleDateString("fr-FR", {weekday:"long",day:"numeric",month:"long"})}</div>
            {data.alertes.length > 0 && (
              <div className="text-xs bg-[#CC2020] text-white px-2.5 py-1 rounded-full font-bold mt-1 cursor-pointer">
                {data.alertes.length} alerte{data.alertes.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {/* Wallet alerte si sous seuil */}
        {data.walletBalance < seuil && (
          <div className="bg-[#FFFBF0] border-2 border-[#F5A800] rounded-xl p-3 mb-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠</span>
              <div>
                <div className="text-xs font-semibold text-[#5A3A00]">Wallet sous le seuil {seuil.toLocaleString("fr-FR")} XOF</div>
                <div className="text-[10px] text-[#B87000] mt-0.5">
                  Solde : {data.walletBalance.toLocaleString("fr-FR")} XOF · Besoin : {(data.biensActifs * 90).toLocaleString("fr-FR")} XOF/mois
                </div>
              </div>
            </div>
            <Link href="/dashboard/billing" className={Q.btnAmber + " !px-3 !py-2 text-xs inline-flex items-center"}>⚡ Recharger</Link>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2.5 mb-3">
          {[
            { val: data.biensActifs, lbl: "Biens", sub: `${data.biensVacants} vacants`, color: QAPRIL_COLORS.navy },
            { val: data.loyersMensuels.toLocaleString("fr-FR"), lbl: "Loyers/mois", sub: "XOF", color: QAPRIL_COLORS.orange },
            { val: data.tauxRecouvrement + "%", lbl: "Recouvrement", sub: "Ce mois", color: QAPRIL_COLORS.green },
            { val: data.quittancesGenerees, lbl: "Quittances", sub: "Ce mois", color: QAPRIL_COLORS.blue },
          ].map((k,i) => (
            <div key={i} className={Q.card + " !mb-0 p-3 text-center cursor-pointer hover:border-[#1B3A6B]"}>
              <div className="text-xl font-bold font-mono mb-0.5" style={{color:k.color}}>{k.val}</div>
              <div className="text-[9px] text-[#4A6A8A] font-semibold uppercase tracking-wide">{k.lbl}</div>
              <div className="text-[9px] mt-0.5" style={{color:k.color}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Grille main */}
        <div className="grid grid-cols-[1fr_280px] gap-3 items-start">
          <div>

            {/* Portefeuille */}
            <div className={Q.card}>
              <div className={Q.cardHeader}>
                <div className={Q.cardTitle}>Portefeuille · {data.biensActifs} biens</div>
                <span className={Q.badgeWarn}>{data.biensVacants} vacants</span>
              </div>
              <div className="px-4 py-2">
                {data.biens.map(b => (
                  <div key={b.id}>
                    <button
                      onClick={() => setBienOuvert(bienOuvert === b.id ? null : b.id)}
                      className="w-full flex items-center gap-2.5 py-2.5 border-b border-dashed border-[#EEF3FB] text-left hover:bg-[#FAFCFF] hover:px-2 hover:-mx-2 transition-all last:border-none"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        b.leaseStatus === "ACTIVE" ? "bg-[#007A4D]" :
                        b.leaseStatus === "LOYER_IMPAYE" ? "bg-[#B87000]" : "bg-[#C0CFDF]"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#1B3A6B] truncate">{b.address}</div>
                        <div className="text-[10px] text-[#6A8AAA] mt-0.5">{b.commune} · {b.tenantName ?? "Vacant"}</div>
                      </div>
                      <div className="text-xs font-bold text-[#C05000] font-mono flex-shrink-0">{b.rentAmount?.toLocaleString("fr-FR")}</div>
                      <span className={b.status === "rented" ? Q.badgeOk : Q.badgeErr + " flex-shrink-0"}>{b.status === "rented" ? "LOUE" : "VACANT"}</span>
                    </button>
                    {bienOuvert === b.id && (
                      <div className={Q.accDetail + " !rounded-none border-x-0"}>
                        <div className={Q.infoRow}><span className={Q.rowLabel}>Reference</span><span className={Q.rowValue + " font-mono"}>{b.leaseReference ?? "-"}</span></div>
                        <div className={Q.infoRow}><span className={Q.rowLabel}>Loyer</span><span className={Q.rowValue}>{b.rentAmount?.toLocaleString("fr-FR")} XOF</span></div>
                        <div className={Q.infoRow}><span className={Q.rowLabel}>Commune</span><span className={Q.rowValue}>{b.commune}</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div>

            {/* Wallet */}
            <div className={Q.walletCard}>
              <div className="text-[10px] text-[#7A9AC0] font-semibold uppercase tracking-wide mb-1">Wallet QAPRIL</div>
              <div className="text-[26px] font-bold text-white font-mono mb-1">{data.walletBalance.toLocaleString("fr-FR")} XOF</div>
              <div className="text-xs text-[#7A9AC0] mb-2.5">{data.biensActifs} baux · Besoin : {(data.biensActifs * 90).toLocaleString("fr-FR")} XOF/mois</div>
              <div className="bg-white/10 rounded-full h-1.5 mb-1 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#CC2020] to-[#F5A800] rounded-full transition-all" style={{width:`${pct}%`}} />
              </div>
              <div className="flex justify-between text-[9px] text-[#7A9AC0] mb-3">
                <span>0</span>
                <span className="text-[#F5A800] font-bold">⚠ Seuil {seuil.toLocaleString("fr-FR")}</span>
                <span>5 000</span>
              </div>
              {/* Sélecteur opérateur */}
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {(Object.keys(OP_COLORS) as Array<keyof typeof OP_COLORS>).map(op => (
                  <button key={op}
                    onClick={() => setOpWallet(op)}
                    className="py-1.5 rounded-md text-[10px] font-bold border-2 border-white/20 text-white/55 bg-transparent hover:text-white hover:bg-white/10 transition-all"
                    style={opWallet === op ? {background:OP_COLORS[op].bg, color:OP_COLORS[op].text, borderColor:"transparent"} : {}}
                  >{OP_COLORS[op].label.split(" ")[0]}</button>
                ))}
              </div>
              {/* Zone rechargement */}
              <div className="bg-white/8 border border-white/15 rounded-lg p-2.5">
                <div className="text-[9px] text-[#7A9AC0] font-semibold uppercase tracking-wide mb-2">Lien de rechargement</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                    style={{background:OP_COLORS[opWallet].bg, color:OP_COLORS[opWallet].text}}>
                    {opWallet[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{OP_COLORS[opWallet].label}</div>
                    <div className="text-[10px] text-[#F5A800] font-mono">→ Recharger 2 000 XOF</div>
                  </div>
                  <Link href={`/dashboard/billing?operator=${opWallet}`} className="border-none px-2.5 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-all inline-block"
                    style={{background:OP_COLORS[opWallet].bg, color:OP_COLORS[opWallet].text}}>
                    Ouvrir →
                  </Link>
                </div>
              </div>
            </div>

            {/* Alertes */}
            <div className={Q.card}>
              <div className={Q.cardHeader}>
                <div className={Q.cardTitle}>🔔 Alertes actives</div>
                {data.alertes.length > 0 && <span className={Q.badgeErr}>{data.alertes.length}</span>}
              </div>
              <div className="p-2">
                {data.alertes.map((a, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setAlerteOuverte(alerteOuverte === String(i) ? null : String(i))}
                      className={alerteOuverte === String(i) ? Q.accBtnOpen : Q.accBtn}
                    >
                      <div className="flex items-center gap-2 pointer-events-none">
                        <span className="text-sm">{a.type === "WALLET" ? "💰" : a.type === "IMPAYE" ? "⚠" : "🏠"}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-[#1B3A6B]">{a.message}</div>
                        </div>
                        <span className="text-sm font-bold text-[#1B3A6B] transition-transform" style={alerteOuverte === String(i) ? {transform:"rotate(90deg)"} : {}}>›</span>
                      </div>
                    </button>
                    {alerteOuverte === String(i) && (
                      <div className={Q.accDetail}>
                        {Object.entries(a.details).map(([k,v]) => (
                          <div key={k} className={Q.infoRow}>
                            <span className={Q.rowLabel}>{k}</span>
                            <span className={Q.rowValue}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
