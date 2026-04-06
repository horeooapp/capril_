"use client";
// src/app/onboarding/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, SessionProvider } from "next-auth/react";
import { finaliserOnboarding, type Capacite } from "@/actions/onboarding.actions";

const CAPACITES = [
  { id: "PROPRIETAIRE",    label: "Propriétaire direct",
    sub: "Je gère mes propres biens" },
  { id: "AGENCE_AGREE",    label: "Agence immobilière agréée",
    sub: "J'ai un agrément et je gère des biens pour des clients" },
  { id: "AGENCE_NON_AGREE",label: "Gestionnaire non agréé",
    sub: "Je gère des biens avec délégation du propriétaire" },
  { id: "INTERMEDIAIRE",   label: "Intermédiaire de gestion",
    sub: "J'aide un proche ou un client à gérer son bien" },
] as const;

function OnboardingContent() {
  const router   = useRouter();
  const { data: session, update } = useSession();
  const [sel,    setSel]    = useState<Set<Capacite>>(new Set(["PROPRIETAIRE"]));
  const [actif,  setActif]  = useState<Capacite>("PROPRIETAIRE");
  const [diaspo, setDiaspo] = useState(false);
  const [loading,setLoading]= useState(false);

  const toggle = (c: Capacite) => {
    const next = new Set(sel);
    if (next.has(c)) { 
      next.delete(c); 
      if (actif === c) setActif("PROPRIETAIRE"); 
    } else {
      next.add(c);
    }
    setSel(next);
  };

  const handleSubmit = async () => {
    if (sel.size === 0) return;
    setLoading(true);
    try {
      await finaliserOnboarding({
        capacites: Array.from(sel),
        capaciteActive: actif,
        activerDiaspora: diaspo
      });
      // 1. Flush NextAuth Token state to respect Dashboard Middleware rules
      if (session) {
          await update({
              ...session,
              user: {
                  ...session.user,
                  onboardingComplete: true,
                  capaciteActive: actif
              }
          });
      }
      // 2. Routing to Dashboard securely
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FB] py-12 px-4 flex justify-center items-start">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between bg-[#1B3A6B] text-white p-4 rounded-xl mb-4 shadow-sm">
          <div className="font-bold tracking-widest text-lg">QAPRIL</div>
          <span className="text-xs text-white/60">Configuration du compte</span>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-[#D0DFF5]">
          <div className="p-6 border-b border-[#EEF3FB] flex justify-between items-center">
            <div className="text-lg font-black text-[#1B3A6B]">Quelles sont vos capacités ?</div>
            <span className="text-[10px] bg-[#1B3A6B] text-white px-2 py-1 rounded-md uppercase font-bold tracking-widest">1 seule fois</span>
          </div>
          <div className="p-6">
            <p className="text-xs text-[#4A6A8A] mb-4">
              Cochez tout ce qui vous correspond.
              Vous pouvez cumuler plusieurs capacités avec le même compte.
            </p>
            {CAPACITES.map(cap => (
              <div key={cap.id}
                onClick={() => toggle(cap.id as Capacite)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer mb-2 transition-all ${
                  sel.has(cap.id as Capacite)
                    ? "border-[#1B3A6B] bg-[#EEF3FB]"
                    : "border-[#D0DFF5] bg-white hover:border-[#8AAABF]"
                }`}>
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  sel.has(cap.id as Capacite) ? "bg-[#1B3A6B] border-[#1B3A6B]" : "border-[#C0CFDF]"
                }`}>
                  {sel.has(cap.id as Capacite) && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1B3A6B]">{cap.label}</div>
                  <div className="text-xs text-[#4A6A8A] mt-0.5">{cap.sub}</div>
                </div>
              </div>
            ))}

            {/* Diaspora */}
            <div className="bg-[#FFF4E5] border border-[#F5A800] rounded-xl p-3 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#5A3A00]">Je vis à l'étranger</div>
                  <div className="text-[10px] font-medium text-[#8A6A20] mt-0.5">Package Diaspora · 7 EUR/mois · Rapports en euros</div>
                </div>
                <button onClick={() => setDiaspo(!diaspo)}
                  className={`relative w-10 h-5 rounded-full border-2 transition-all ${
                    diaspo ? "bg-[#F5A800] border-[#F5A800]" : "bg-[#D0DFF5] border-[#C0CFDF]"
                  }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    diaspo ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>

            {/* Capacite active par defaut */}
            {sel.size > 1 && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#1B3A6B] mb-2">Dashboard par défaut au login</label>
                <select className="w-full border-2 border-[#D0DFF5] rounded-xl px-4 py-3 text-sm text-[#1B3A6B] font-medium outline-none focus:border-[#1B3A6B]"
                  value={actif} onChange={e => setActif(e.target.value as Capacite)}>
                  {Array.from(sel).map(c => (
                    <option key={c} value={c}>
                      {c === "PROPRIETAIRE" ? "Propriétaire"
                       : c === "AGENCE_AGREE" ? "Agence agréée"
                       : c === "AGENCE_NON_AGREE" ? "Gestionnaire non agréé"
                       : "Intermédiaire"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading || sel.size===0}
              className="w-full bg-[#C55A11] hover:bg-[#A64B0E] disabled:opacity-50 text-white font-bold text-sm tracking-wide py-4 rounded-xl mt-6 transition-all active:scale-[0.98]">
              {loading ? "Configuration..." : "Confirmer et accéder à mon espace →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingContent />
    </SessionProvider>
  );
}
