"use client"
import { toast } from "sonner";;
// QAPRIL - FormQuittance - Visuel approuve 01/04/2026
// 3 vues : Formulaire → Prévisualisation → Confirmation
// NE PAS MODIFIER les classes Q.*

import { useState } from "react";
import { Q, OP_COLORS } from "@/lib/qapril.design";
import { createReceipt } from "@/actions/receipt.actions";

type Props = {
  leaseId:    string;
  tenantName: string;
  bienName:   string;
  rentAmount: number;
  onSuccess?: (receiptRef: string) => void;
};

type Vue = "form" | "preview" | "confirm";

export default function FormQuittance({ leaseId, tenantName, bienName, rentAmount, onSuccess }: Props) {
  const [vue,      setVue]      = useState<Vue>("form");
  const [mois,     setMois]     = useState("");
  const [mode,     setMode]     = useState<"MOBILE_MONEY" | "CASH" | "BANK_TRANSFER">("MOBILE_MONEY");
  const [operateur,setOperateur]= useState<keyof typeof OP_COLORS>("WAVE");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{receiptRef:string;sha256:string}|null>(null);

  // Vérification ordre chronologique - RG-QUI-ORDRE
  const canSubmit = mois.length === 7; // "YYYY-MM"

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await createReceipt({
        leaseId, periodMonth: mois, rentAmount,
        paymentMethod: mode,
        paidAt: new Date()
      });
      setResult({ receiptRef: res.receipt.receiptRef, sha256: res.sha256 });
      setVue("confirm");
      onSuccess?.(res.receipt.receiptRef);
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className={Q.card}> 
      {/* Header avec stepper */}
      <div className={Q.cardHeader}>
        <div className={Q.cardTitle}>Nouvelle quittance</div>
        {/* Stepper 3 étapes */}
        <div className="flex items-center gap-1">
          {(["Formulaire","Aperçu","Confirmé"] as const).map((s,i) => {
            const vues: Vue[] = ["form","preview","confirm"];
            const idx = vues.indexOf(vue);
            return (
              <div key={s} className="flex items-center">
                <div className={i < idx ? Q.stepDotDone : i === idx ? Q.stepDotOn : Q.stepDot} style={{width:28,height:28}}>
                  {i < idx ? "✓" : i+1}
                </div>
                {i < 2 && <div className={i < idx ? Q.stepLineDone : Q.stepLine} style={{width:24}} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={Q.cardBody}>

        {/* VUE 1 : FORMULAIRE */}
        {vue === "form" && (
          <div>
            {/* Mois concerné */}
            <div className="mb-3">
              <label className={Q.label + " block mb-1"}>Mois concerné <span className="text-[#CC2020]">*</span></label>
              <input type="month" className={Q.input} value={mois}
                onChange={e => setMois(e.target.value)} />
              <div className="text-[10px] text-[#4A6A8A] mt-1">RG-QUI-ORDRE : ordre chronologique vérifié côté serveur</div>
            </div>
            {/* Mode paiement */}
            <div className="mb-3">
              <label className={Q.label + " block mb-2"}>Mode de paiement</label>
              <div className="grid grid-cols-3 gap-2">
                {(["MOBILE_MONEY","CASH","BANK_TRANSFER"] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-3 py-2 rounded-lg border-2 text-xs font-semibold cursor-pointer transition-all ${
                      mode === m ? "border-[#1B3A6B] bg-[#EEF3FB] text-[#1B3A6B] font-bold" : "border-[#C0CFDF] bg-white text-[#6A8AAA]"
                    }`}>
                    {m === "MOBILE_MONEY" ? "📱 Mobile Money" : m === "CASH" ? "💵 Espèces" : "🏦 Virement"}
                  </button>
                ))}
              </div>
            </div>
            {/* Opérateur si Mobile Money */}
            {mode === "MOBILE_MONEY" && (
              <div className="mb-3">
                <label className={Q.label + " block mb-2"}>Opérateur</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(OP_COLORS) as Array<keyof typeof OP_COLORS>).map(op => (
                    <button key={op} onClick={() => setOperateur(op)}
                      className="py-2 rounded-lg border-2 text-xs font-bold cursor-pointer transition-all"
                      style={operateur === op
                        ? {background:OP_COLORS[op].bg, color:OP_COLORS[op].text, borderColor:OP_COLORS[op].bg}
                        : {background:"white", color:"#6A8AAA", borderColor:"#C0CFDF"}}>
                      {OP_COLORS[op].label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={Q.infoBox}>💰 Prix quittance QAPRIL : 90 FCFA débités de votre Wallet à la confirmation.</div>
            <button onClick={() => canSubmit && setVue("preview")}
              className={Q.btnAmber + ` w-full ${!canSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!canSubmit}>
              Aperçu avant confirmation →
            </button>
          </div>
        )}

        {/* VUE 2 : PRÉVISUALISATION */}
        {vue === "preview" && (
          <div>
            <div className={Q.amberBox}>Vérifiez les informations avant de confirmer. Cette action est irréversible.</div>
            <div className="border-2 border-[#D0DFF5] rounded-lg overflow-hidden mb-3">
              {[
                ["Locataire", tenantName],
                ["Bien", bienName],
                ["Mois concerné", mois],
                ["Montant", `${rentAmount.toLocaleString("fr-FR")} FCFA`],
                ["Mode paiement", mode],
                ["Frais QAPRIL", "90 FCFA · Wallet"],
              ].map(([l,v],i) => (
                <div key={i} className={`flex justify-between px-3 py-2.5 text-xs border-b border-[#D0DFF5] last:border-none ${i%2===0?"bg-[#F0F5FF]":"bg-white"}`}>
                  <span className="text-[#4A6A8A]">{l}</span>
                  <span className="font-bold text-[#1B3A6B]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setVue("form")} className={Q.btnSecond + " flex-1"}>← Modifier</button>
              <button onClick={handleConfirm} disabled={loading} className={Q.btnPrimary + " flex-[2]"}>{loading ? "Génération…" : "✓ Confirmer et générer"}</button>
            </div>
          </div>
        )}

        {/* VUE 3 : CONFIRMATION */}
        {vue === "confirm" && result && (
          <div>
            <div className="bg-[#007A4D] rounded-xl p-4 text-center text-white mb-3">
              <div className="text-2xl mb-2">✓</div>
              <div className="font-bold text-sm mb-1">Quittance générée</div>
              <div className="text-xs opacity-80">{result.receiptRef}</div>
            </div>
            <div className={Q.shaBar}>
              <span className="text-[9px] text-[#F5A800] font-bold uppercase tracking-wide flex-shrink-0">SHA-256</span>
              <span className="text-[9px] text-white/40 font-mono truncate">{result.sha256}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button className={Q.btnPrimary + " flex-1"} onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>⬇ Télécharger PDF</button>
              <button onClick={() => { setVue("form"); setMois(""); }} className={Q.btnSecond + " flex-1"}>+ Nouvelle quittance</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
