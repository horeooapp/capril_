"use client";
// QAPRIL - WalletSidebar - ADD-07 v3 - Visuel approuve

import { useState } from "react";
import { Q, OP_COLORS } from "@/lib/qapril.design";
import { genererDeepLink, calculerMontantRecharge } from "@/actions/wallet.actions";

type Props = {
  userId:       string;
  solde:        number;
  nbBails:      number;
  seuilAlerte?: number;
  operateurPref?: keyof typeof OP_COLORS;
};

export default function WalletSidebar({userId,solde,nbBails,seuilAlerte=1000,operateurPref="WAVE"}: Props) {
  const [op,      setOp]      = useState<keyof typeof OP_COLORS>(operateurPref);
  const [montant, setMontant] = useState(1000);
  const [url,     setUrl]     = useState("");

  const pct = Math.min(100, (solde / 5000) * 100);
  const besoinMois = nbBails * 90;

  const handleSelOp = async (newOp: keyof typeof OP_COLORS) => {
    setOp(newOp);
    const m = await calculerMontantRecharge(userId, "RECOMMANDE");
    setMontant(m);
    const { url: u } = await genererDeepLink(userId, newOp, m);
    setUrl(u);
  };

  return (
    <div className={Q.walletCard}>
      <div className="text-[10px] text-[#7A9AC0] font-semibold uppercase tracking-wide mb-1">Wallet QAPRIL · ADD-07 v3</div>
      <div className="text-[26px] font-bold text-white font-mono mb-1">{solde.toLocaleString("fr-FR")} XOF</div>
      <div className="text-xs text-[#7A9AC0] mb-2.5">{nbBails} baux · Besoin : {besoinMois.toLocaleString("fr-FR")} XOF/mois</div>
      {/* Barre progression */}
      <div className="bg-white/10 rounded-full h-2 mb-1 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#CC2020] to-[#F5A800] transition-all duration-500" style={{width:`${pct}%`}} />
      </div>
      <div className="flex justify-between text-[9px] text-[#7A9AC0] mb-3">
        <span>0</span>
        <span className="text-[#F5A800] font-bold">⚠ Seuil {seuilAlerte.toLocaleString("fr-FR")}</span>
        <span>5 000</span>
      </div>
      {/* Sélecteur 4 opérateurs */}
      <div className="text-[9px] text-[#7A9AC0] font-semibold uppercase tracking-wide mb-1.5">Opérateur</div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {(Object.keys(OP_COLORS) as Array<keyof typeof OP_COLORS>).map(o => (
          <button key={o} onClick={() => handleSelOp(o)}
            className="py-2 rounded-lg border-2 text-[10px] font-bold cursor-pointer transition-all"
            style={op === o
              ? {background:OP_COLORS[o].bg, color:OP_COLORS[o].text, borderColor:"transparent"}
              : {background:"transparent", color:"rgba(255,255,255,0.55)", borderColor:"rgba(255,255,255,0.2)"}}
          >{OP_COLORS[o].label.split(" ")[0]}</button>
        ))}
      </div>
      {/* Zone recharge */}
      <div className="bg-white/8 border border-white/15 rounded-lg p-2.5">
        <div className="text-[9px] text-[#7A9AC0] font-semibold uppercase tracking-wide mb-2">Lien de rechargement</div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all"
            style={{background:OP_COLORS[op].bg, color:OP_COLORS[op].text}}>
            {op[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white">{OP_COLORS[op].label}</div>
            <div className="text-[10px] text-[#F5A800] font-mono">→ Recharger {montant.toLocaleString("fr-FR")} XOF</div>
          </div>
          <a href={url || "#"} target="_blank"
            className="border-none px-2.5 py-1.5 rounded-md text-xs font-bold cursor-pointer no-underline transition-all"
            style={{background:OP_COLORS[op].bg, color:OP_COLORS[op].text}}>
            Ouvrir →
          </a>
        </div>
        {url && <div className="mt-2 text-[8px] text-white/25 font-mono break-all">{url}</div>}
      </div>
    </div>
  );
}
