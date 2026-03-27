"use client";

import { useState } from "react";
import { 
  Home, FileText, Receipt, Zap, ShieldCheck, User, 
  ChevronRight, ArrowLeft, Bell, AlertTriangle, 
  CreditCard, Smartphone, CheckCircle, Clock,
  ExternalLink, Download, Share2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── UTILS & THEME ──────────────────────────────────────────────────────────

const T = {
  navy: "#0D2B6E",
  navyDark: "#071A45",
  navyPale: "#EEF2FA",
  green: "#1A7A3C",
  greenPale: "#E8F5EE",
  orange: "#C05B00",
  orangePale: "#FFF3E0",
  red: "#A00000",
  redPale: "#FEECEC",
  gold: "#C9A84C",
  goldPale: "#FDF6E3",
  teal: "#0E7490",
  tealPale: "#E0F4F9",
  purple: "#5B21B6",
  purplePale: "#EDE9FE",
  white: "#FFFFFF",
  bg: "#F2F5FA",
  grey1: "#EEF2F7",
  grey2: "#D6DCE8",
  grey3: "#8FA0BC",
  grey4: "#4A5B7A",
  text: "#0A1930",
  textMid: "#2D3F5E",
  textLight: "#6A7D9E",
};

const fmt = (n: number) => n?.toLocaleString("fr-FR") || "0";

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────

const Badge = ({ label, color, bg, size = 10 }: any) => (
  <span 
    className="inline-flex items-center rounded-md font-bold whitespace-nowrap px-2 py-0.5"
    style={{ background: bg, color, fontSize: size }}
  >
    {label}
  </span>
);

const Row = ({ label, value, color }: any) => (
  <div className="flex justify-between py-2 border-b border-[#EEF2F7]">
    <span className="text-[10px] text-[#6A7D9E] font-medium uppercase tracking-wider">{label}</span>
    <span className="text-[12px] font-bold" style={{ color: color || "#2D3F5E" }}>{value}</span>
  </div>
);

const SecTitle = ({ label, right }: any) => (
  <div className="flex justify-between items-center mb-3 mt-4">
    <div className="text-[10px] font-black text-[#6A7D9E] uppercase tracking-[0.15em]">{label}</div>
    {right}
  </div>
);

const ACard = ({ icon, label, sub, color, bg, onClick, disabled }: any) => (
  <div 
    onClick={disabled ? undefined : onClick} 
    className={`flex items-center gap-4 rounded-2xl p-4 mb-3 transition-all duration-200 ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-98 shadow-sm'}`}
    style={{ background: disabled ? "#EEF2F7" : bg, border: `1px solid ${disabled ? "#D6DCE8" : color}20` }}
  >
    <span className="text-xl">{icon}</span>
    <div className="flex-1">
      <div className="text-[13px] font-bold" style={{ color: disabled ? "#6A7D9E" : color }}>{label}</div>
      {sub && <div className="text-[10px] text-[#6A7D9E] mt-0.5 font-medium leading-tight">{sub}</div>}
    </div>
    {!disabled && <ChevronRight size={16} style={{ color, opacity: 0.4 }} />}
  </div>
);

function Sheet({ open, onClose, title, tc, children }: any) {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[300] flex items-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#071A45]/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white rounded-t-[2.5rem] w-full max-h-[85%] overflow-hidden relative shadow-2xl flex flex-col"
          >
            <div className="p-5 pb-2 flex justify-between items-center bg-white sticky top-0 z-10">
              <span className="text-[15px] font-black uppercase tracking-tight" style={{ color: tc || "#0D2B6E" }}>{title}</span>
              <button onClick={onClose} className="bg-[#EEF2F7] hover:bg-[#D6DCE8] transition-colors rounded-xl p-2.5">
                <span className="text-[11px] font-black text-[#2D3F5E] block px-1">✕</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const BackBtn = ({ label, onClick }: any) => (
  <button 
    onClick={onClick} 
    className="bg-[#EEF2F7] hover:bg-[#D6DCE8] transition-colors rounded-xl px-4 py-2 text-[11px] font-bold text-[#2D3F5E] mb-4 flex items-center gap-2 group"
  >
    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> {label}
  </button>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

export default function DashboardLocataireV2({ data, session }: { data: any, session: any }) {
  const [tab, setTab] = useState("dash");
  const [qSel, setQSel] = useState<any>(null);
  const [aSel, setASel] = useState<any>(null);
  const [dsec, setDsec] = useState<any>(null);
  const [tSel, setTSel] = useState<any>(null);
  const [rclSent, setRclSent] = useState(false);
  const [rclCode, setRclCode] = useState<string | null>(null);
  const [O, setO] = useState({ score: false, caution: false, export: false, ussd: false, notifs: false, mm: false });

  const op = (k: string) => setO(o => ({ ...o, [k]: true }));
  const cl = (k: string) => setO(o => ({ ...o, [k]: false }));

  const go = (t: string) => { 
    setTab(t); 
    setQSel(null); setASel(null); setDsec(null); setTSel(null); setRclSent(false); setRclCode(null);
  };

  const profile = data.profile;
  const mainBail = data.bails?.[0];
  const sc = profile?.scoreActuel || 0;
  const scColor = sc >= 850 ? T.green : sc >= 700 ? T.teal : sc >= 550 ? T.orange : T.red;

  const TABS = [
    { id: "dash", icon: <Home size={20} />, label: "Accueil" },
    { id: "bail", icon: <FileText size={20} />, label: "Mon bail" },
    { id: "quitt", icon: <Receipt size={20} />, label: "Paiements" },
    { id: "util", icon: <Zap size={20} />, label: "Charges" },
    { id: "droits", icon: <ShieldCheck size={20} />, label: "Droits" },
    { id: "profil", icon: <User size={20} />, label: "Profil" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5FA]">
      {/* Full-width container — no phone frame */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col min-h-screen">

        {/* COMPACT APP HEADER */}
        <div className="bg-gradient-to-br from-[#0D2B6E] to-[#0E7490] p-5 pb-6 relative overflow-hidden flex-shrink-0">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="bg-[#0E7490] text-white text-[9px] font-black px-2 py-0.5 rounded-lg tracking-widest uppercase shadow-sm">LOCATAIRE</div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-[18px] font-black text-white leading-none uppercase tracking-tight">{session?.user?.name || "LOCATAIRE"}</h2>
              <p className="text-[11px] text-white/60 mt-2 font-medium">Bail {mainBail?.leaseReference || "..."} · {mainBail?.property?.name || "En cours"}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button 
                onClick={() => op("notifs")}
                className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-90"
              >
                <Bell size={20} />
              </button>
              {mainBail?.status === 'LOYER_IMPAYE' && (
                <Badge label={`RETARD J+${data.nextPaymentInDays}`} color="white" bg={T.red} size={9} />
              )}
            </div>
          </div>

          {/* KPI CAROUSEL / GRID */}
          <div className="flex gap-2 mt-5">
            {[
              { l: "Loyer/m", v: fmt(mainBail?.rentAmount) + "F", icon: "💰" },
              { l: "Quittances", v: data.quittances?.length || 0, icon: "🧾", nav: () => go("quitt") },
              { l: "Score ICL", v: sc, icon: "⭐", nav: () => op("score") },
              { l: "Caution", v: data.caution ? "OK" : "—", icon: "🔒", nav: () => op("caution") },
            ].map((k, i) => (
              <motion.div 
                whileTap={{ scale: 0.95 }}
                key={i} 
                onClick={k.nav as any} 
                className="flex-1 bg-white/10 rounded-[18px] p-2.5 border border-white/10 text-center cursor-pointer backdrop-blur-md"
              >
                <div className="text-[16px] mb-1">{k.icon}</div>
                <div className="text-[13px] font-black text-white">{k.v}</div>
                <div className="text-[8px] font-bold text-white/50 uppercase tracking-tighter mt-0.5">{k.l}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto bg-[#F2F5FA] scroll-smooth pb-24">
          
          {/* TAB: ACCUEIL */}
          {tab === "dash" && (
            <div className="p-4 space-y-4">
              {/* Alert Impayé */}
              {mainBail?.status === 'LOYER_IMPAYE' && (
                <div className="bg-[#FEECEC] border border-[#A00000]/10 rounded-[28px] p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-[#A00000]">
                    <AlertTriangle size={18} />
                    <span className="text-[13px] font-black uppercase tracking-tight">ALERTE IMPAYÉ</span>
                  </div>
                  <p className="text-[11px] font-medium text-[#2D3F5E] leading-relaxed mb-4">
                    Votre loyer de ce mois n'a pas encore été détecté. Si vous avez déjà payé, soumettez votre preuve maintenant.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { go("droits"); setDsec("rcl"); setRclCode("RCL-02"); }}
                      className="flex-1 bg-[#A00000] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Signaler Problème
                    </button>
                    <button onClick={() => go("quitt")} className="flex-1 bg-white border border-[#A00000]/20 text-[#A00000] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                      Voir Historique
                    </button>
                  </div>
                </div>
              )}

              {/* Logement Card */}
              <div className="space-y-3">
                <SecTitle label="Mon installation actuelee" />
                <div 
                  onClick={() => go("bail")}
                  className="bg-white rounded-[32px] p-5 shadow-sm border border-[#D6DCE8] cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[16px] font-black text-[#0D2B6E] tracking-tight">{mainBail?.property?.name || "Propriété"}</h4>
                      <p className="text-[10px] font-medium text-[#6A7D9E] mt-1">{mainBail?.property?.address || "Cocody, Côte d'Ivoire"}</p>
                    </div>
                    <Badge label={mainBail?.status || "ACTIF"} color={T.teal} bg={T.tealPale} />
                  </div>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <Badge label="BAIL CERTIFIÉ" bg={T.navyPale} color={T.navy} size={8} />
                    <Badge label={`ÉCHEANCE : J-${data.nextPaymentInDays}`} bg={T.orangePale} color={T.orange} size={8} />
                  </div>
                  
                  {/* Landlord Info Box */}
                  <div className="bg-[#F2F5FA] rounded-2xl p-4 flex justify-between items-center group overflow-hidden relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-[#0D2B6E]/20" />
                    <div>
                      <p className="text-[9px] font-black text-[#6A7D9E] uppercase tracking-widest mb-1.5">BAILLEUR / GESTION</p>
                      <p className="text-[12px] font-black text-[#2D3F5E]">
                        {mainBail?.typeGestion === 'agreee' 
                          ? `Bailleur Masqué (${mainBail?.landlord?.landlordCode || "AGREEE"})` 
                          : (mainBail?.bailleurMasque ? "Identité masquée" : mainBail?.landlord?.fullName)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#0E7490] tracking-tighter">AGENCE AGRÉÉE</p>
                      <p className="text-[9px] font-medium text-[#6A7D9E] italic mt-0.5">Subst. Totale 🔐</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="space-y-3 pt-2">
                <SecTitle label="Accès rapides" />
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileTap={{scale:0.96}} onClick={() => op("export")} className="bg-[#EEF2FA] rounded-[24px] p-4 border border-[#0D2B6E]/10 cursor-pointer">
                    <div className="text-2xl mb-2">📤</div>
                    <h5 className="text-[12px] font-black text-[#0D2B6E]">Export Certifié</h5>
                    <p className="text-[9px] text-[#2D3F5E]/60 font-bold mt-1 uppercase tracking-tighter">Banque · 36 mois</p>
                  </motion.div>
                  <motion.div whileTap={{scale:0.96}} onClick={() => go("droits")} className="bg-[#EDE9FE] rounded-[24px] p-4 border border-[#5B21B6]/10 cursor-pointer">
                    <div className="text-2xl mb-2">⚖️</div>
                    <h5 className="text-[12px] font-black text-[#5B21B6]">Mes Droits</h5>
                    <p className="text-[9px] text-[#5B21B6]/60 font-bold mt-1 uppercase tracking-tighter">MRL-01 · Préavis</p>
                  </motion.div>
                  <motion.div whileTap={{scale:0.96}} onClick={() => op("caution")} className="bg-[#E0F4F9] rounded-[24px] p-4 border border-[#0E7490]/10 cursor-pointer">
                    <div className="text-2xl mb-2">🔒</div>
                    <h5 className="text-[12px] font-black text-[#0E7490]">Ma Caution</h5>
                    <p className="text-[9px] text-[#0E7490]/60 font-bold mt-1 uppercase tracking-tighter">Statut CDC-CI</p>
                  </motion.div>
                  <motion.div whileTap={{scale:0.96}} onClick={() => op("ussd")} className="bg-[#E8F5EE] rounded-[24px] p-4 border border-[#1A7A3C]/10 cursor-pointer">
                    <div className="text-2xl mb-2">📲</div>
                    <h5 className="text-[12px] font-black text-[#1A7A3C]">Espace USSD</h5>
                    <p className="text-[9px] text-[#1A7A3C]/60 font-bold mt-1 uppercase tracking-tighter">*144*QAPRIL#</p>
                  </motion.div>
                </div>
              </div>

              {/* Utility Preview */}
              <div className="space-y-3 pt-2">
                <SecTitle label="🔌 CIE / SODECI" right={<button onClick={() => go("util")} className="text-[10px] font-black text-[#0E7490] uppercase tracking-widest">Tout voir</button>} />
                <div className="flex gap-3">
                  {data.facturesUtilities?.slice(0, 2).map((fact: any, idx: number) => (
                    <div key={idx} onClick={() => go("util")} className="flex-1 bg-white rounded-[24px] p-4 shadow-sm border border-[#D6DCE8] cursor-pointer">
                      <div className="text-2xl mb-2">{fact.typeUtility === 'CIE' ? '⚡' : '💧'}</div>
                      <h6 className={`text-[11px] font-black tracking-widest uppercase ${fact.typeUtility === 'CIE' ? 'text-orange-500' : 'text-cyan-600'}`}>
                        {fact.typeUtility}
                      </h6>
                      <div className="text-[16px] font-black text-[#0D2B6E] mt-1">{fmt(fact.montantTotal)} F</div>
                      <Badge label={fact.statut} color={T.green} bg={T.greenPale} size={8} />
                    </div>
                  )) || (
                    <div className="w-full text-center p-8 bg-white/50 rounded-3xl border border-dashed border-[#D6DCE8]">
                      <p className="text-[11px] font-bold text-[#6A7D9E]">Aucune facture utility détectée</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MON BAIL */}
          {tab === "bail" && (
            <div className="p-5 space-y-6">
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#D6DCE8]">
                <h3 className="text-[18px] font-black text-[#0D2B6E] mb-2 uppercase tracking-tighter">{mainBail?.property?.name || "LOGEMENT CERTIFIÉ"}</h3>
                <p className="text-[12px] text-[#6A7D9E] font-medium mb-6">{mainBail?.property?.address || "Adresse complète..."}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#F2F5FA] p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-[#6A7D9E] uppercase mb-1">Loyer Mensuel</p>
                    <p className="text-[15px] font-black text-[#0D2B6E] tracking-tight">{fmt(mainBail?.rentAmount)} FCFA</p>
                  </div>
                  <div className="bg-[#F2F5FA] p-3 rounded-2xl">
                    <p className="text-[9px] font-black text-[#6A7D9E] uppercase mb-1">Type de Bail</p>
                    <p className="text-[15px] font-black text-[#0D2B6E] tracking-tight">{mainBail?.leaseReference?.split('-')[0] || "BDQ"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Row label="Référence" value={mainBail?.leaseReference || "—"} color={T.navy} />
                  <Row label="Date Signature" value={mainBail?.createdAt ? new Date(mainBail.createdAt).toLocaleDateString('fr-FR') : "—"} />
                  <Row label="Échéance" value={`Le ${mainBail?.paymentDay || "5"} du mois`} />
                  <Row label="Statut" value={mainBail?.status} color={T.teal} />
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#EEF2F7]">
                   <div style={{background:T.greenPale, border:"1px solid #1A7A3C20"}} className="rounded-2xl p-4">
                      <p className="text-[10px] font-black text-[#1A7A3C] flex items-center gap-2 mb-2">
                         <ShieldCheck size={14} /> CERTIFICATION SHA-256
                      </p>
                      <p className="text-[9px] font-mono text-[#6A7D9E] break-all">{mainBail?.sha || "e8f1b2c3d4a5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0..."}</p>
                   </div>
                </div>
              </div>

              {/* Payment Methods Section (Mobile Money Channels) */}
              <div className="space-y-4">
                <SecTitle label="📲 Payer mon loyer" />
                <div className="bg-white rounded-[32px] p-2 border border-[#D6DCE8] shadow-sm">
                  {data.mobileMoney?.map((mm: any) => (
                    <div key={mm.id} className="flex items-center gap-4 p-4 even:bg-[#F2F5FA] rounded-[24px]">
                      <div className="text-3xl">{mm.icon}</div>
                      <div className="flex-1">
                        <div className="text-[12px] font-black text-[#0D2B6E] tracking-tight">{mm.operateur}</div>
                        <div className="text-[16px] font-black text-[#0D2B6E] tracking-tighter font-mono">{mm.numero}</div>
                      </div>
                      <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${mm.operateur === 'Orange Money' ? 'bg-orange-500' : 'bg-[#0E7490]'} text-white shadow-sm`}>
                        Payer
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-[#EEF2FA] rounded-2xl p-4 text-[10px] text-[#2D3F5E] font-medium leading-relaxed">
                   💡 QAPRIL détecte automatiquement votre paiement via ces canaux. Votre quittance est générée sous 5 minutes chronométrées.
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-3 pt-4">
                <ACard icon="📄" label="Télécharger mon bail PDF" sub="Version certifiée pour vos dossiers" color={T.navy} bg={T.navyPale} />
                <ACard icon="🚪" label="Initier un préavis de sortie" sub="Délai légal 1 mois · Formalisation QAPRIL" color={T.orange} bg={T.orangePale} onClick={() => { go("droits"); setDsec("preavis"); }} />
              </div>
            </div>
          )}

          {/* TAB: QUITTANCES */}
          {tab === "quitt" && !qSel && (
            <div className="p-5 space-y-6">
              <div className="flex gap-3">
                {[
                  { l: "Certifiées", v: data.quittances?.filter((q: any)=>q.status==='paid').length || 0, c: T.green, bg: T.greenPale },
                  { l: "Attente", v: data.quittances?.filter((q: any)=>q.status!=='paid').length || 0, c: T.orange, bg: T.orangePale },
                ].map((k, i) => (
                  <div key={i} className="flex-1 rounded-[24px] p-4 text-center border shadow-sm" style={{ background: k.bg, borderColor: k.c + "20" }}>
                    <div className="text-2xl font-black" style={{ color: k.c }}>{k.v}</div>
                    <div className="text-[9px] font-bold text-[#6A7D9E] mt-1 uppercase tracking-widest">{k.l}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <SecTitle label="Historique des paiements" />
                {data.quittances?.length > 0 ? data.quittances.map((q: any) => (
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    key={q.id} 
                    onClick={() => setQSel(q)}
                    className="bg-white rounded-3xl p-4 border border-[#D6DCE8] shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${q.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {q.status === 'paid' ? '🧾' : '⚠️'}
                      </div>
                      <div>
                        <div className="text-[13px] font-black text-[#0D2B6E] uppercase tracking-tighter">{q.periodMonth}</div>
                        <div className="text-[9px] font-mono text-[#6A7D9E] mt-0.5">{q.receiptRef}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-black text-[#0D2B6E] tracking-tight">{fmt(q.totalAmount)} F</div>
                      <Badge label={q.status === 'paid' ? "Payé" : "En attente"} color={q.status === 'paid' ? T.green : T.red} bg={q.status === 'paid' ? T.greenPale : T.redPale} size={8} />
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-[#D6DCE8]">
                     <p className="text-[13px] font-medium text-[#6A7D9E]">Aucune quittance générée.</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => op("export")}
                className="w-full py-4 bg-[#EEF2FA] text-[#0D2B6E] rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] border border-[#0D2B6E]/10"
              >
                Exporter historique 36 mois certifié
              </button>
            </div>
          )}

          {/* TAB: CIE / SODECI */}
          {tab === "util" && (
            <div className="p-5 space-y-6">
              <div className="bg-[#FFF3E0] rounded-[32px] p-5 border border-orange-200">
                <p className="text-[11px] font-medium text-[#2D3F5E] leading-relaxed">
                   🔎 Suivez votre consommation <strong>CIE (Électricité)</strong> et <strong>SODECI (Eau)</strong> liée directement à votre logement certifié.
                </p>
              </div>

              <div className="space-y-4">
                <SecTitle label="Mes factures utility" />
                {data.facturesUtilities?.map((f: any) => (
                  <div key={f.id} className="bg-white rounded-[32px] p-5 border border-[#D6DCE8] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${f.typeUtility === 'CIE' ? 'bg-orange-50 text-orange-500' : 'bg-cyan-50 text-cyan-600'}`}>
                          {f.typeUtility === 'CIE' ? '⚡' : '💧'}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-[#6A7D9E] uppercase tracking-widest">{f.typeUtility}</p>
                          <p className="text-[14px] font-black text-[#0D2B6E] leading-none mt-1">{f.moisFacture ? new Date(f.moisFacture).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "Mois inconnu"}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[16px] font-black text-[#0D2B6E] tracking-tight">{fmt(f.montantTotal)} F</p>
                       <Badge label={f.statut} color={T.green} bg={T.greenPale} size={8} />
                    </div>
                  </div>
                ))}

                {/* Simulated Graph */}
                <div className="bg-white rounded-[32px] p-6 border border-[#D6DCE8] shadow-sm">
                   <h5 className="text-[10px] font-black text-[#6A7D9E] uppercase tracking-widest mb-6">Évolution consommation (6 mois)</h5>
                   <div className="flex items-end justify-between h-32 px-2">
                     {[45, 62, 58, 74, 92, 85].map((h, i) => (
                       <div key={i} className="flex flex-col items-center gap-3 flex-1 px-1">
                         <div 
                           className="w-full bg-[#0E7490]/20 rounded-t-xl group relative cursor-help" 
                           style={{ height: `${h}%` }}
                         >
                            <div className="absolute inset-0 bg-[#0E7490] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                         </div>
                         <span className="text-[9px] font-black text-[#6A7D9E] uppercase tracking-tighter">{"NDJFM"[i]}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                 <ACard icon="📑" label="Télécharger dernière facture" color={T.navy} bg={T.navyPale} />
                 <ACard icon="📲" label="Payer utility en ligne" sub="Orange · MTN · Wave" color={T.green} bg={T.greenPale} />
              </div>
            </div>
          )}

          {/* TAB: DROITS */}
          {tab === "droits" && !dsec && (
            <div className="p-5 space-y-6">
              <div className="bg-[#EDE9FE] rounded-[32px] p-5 border border-purple-200">
                <h4 className="text-[14px] font-black text-[#5B21B6] mb-1">⚖️ Protection Locataire</h4>
                <p className="text-[11px] font-medium text-[#5B21B6]/70 leading-relaxed">
                   Réclamations, Consentement loyer, Préavis certifié. Vos droits sont garantis par le cadre QAPRIL 2026.
                </p>
              </div>

              {/* Reclamation Active */}
              {mainBail?.reclamations?.length > 0 && (
                <div className="space-y-3">
                  <SecTitle label="Procédure RCL active" />
                  {mainBail.reclamations.map((rcl: any) => (
                    <div key={rcl.id} className="bg-white border-2 border-orange-100 rounded-[32px] p-5 shadow-inner">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <Badge label={rcl.typeReclamation} color={T.purple} bg={T.purplePale} size={9} />
                            <Badge label="144h restants" color={T.orange} bg={T.orangePale} size={9} />
                          </div>
                          <p className="text-[13px] font-black text-[#0D2B6E] tracking-tight">{rcl.typeReclamation === 'RCL-02' ? 'Paiement non acquitté' : 'Réclamation logis'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl">⏳</span>
                        </div>
                      </div>
                      <div className="space-y-1 mb-4">
                         <div className="flex justify-between text-[9px] font-black text-[#6A7D9E] uppercase mb-1.5">
                            <span>Soumission</span>
                            <span>Echéance</span>
                         </div>
                         <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div initial={{width:0}} animate={{width:"60%"}} className="h-full bg-gradient-to-r from-teal-500 to-orange-500 rounded-full" />
                         </div>
                      </div>
                      <p className="text-[10px] text-[#6A7D9E] font-medium italic">🔐 Protection QAPRIL : Si silence bailleur à 144h, le ticket est clos en votre faveur automatiquement.</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Access Rapid for Droits */}
              <div className="space-y-3 pt-4">
                 <SecTitle label="Actions juridiques" />
                 <ACard icon="📋" label="Soumettre une réclamation" sub="Quittance, Harcèlement, Travaux" color={T.purple} bg={T.purplePale} onClick={() => setDsec("rcl")} />
                 <ACard icon="✏️" label="Consentement modification loyer" sub="Règle MRL-01" color={T.orange} bg={T.orangePale} onClick={() => setDsec("mrl")} />
                 <ACard icon="🚪" label="Initier un préavis de sortie" sub="Délai 1 mois (CI)" color={T.navy} bg={T.navyPale} onClick={() => setDsec("preavis")} />
              </div>
            </div>
          )}

          {/* TAB: PROFIL */}
          {tab === "profil" && (
            <div className="p-5 space-y-6">
              <div className="bg-gradient-to-br from-[#0D2B6E] to-[#2D3F5E] rounded-[40px] p-8 text-center relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                 <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl mx-auto mb-4">
                       👤
                    </div>
                    <h3 className="text-[20px] font-black text-white uppercase tracking-tight leading-none mb-1">{session?.user?.name || "Locataire QAPRIL"}</h3>
                    <p className="text-[13px] text-white/60 font-medium mb-6">{session?.user?.email}</p>
                    <div className="flex justify-center gap-2">
                       <Badge label="KYC CERTIFIÉ" bg="#1A7A3C" color="white" size={9} />
                       <Badge label="GRADE A" bg="#C9A84C" color="white" size={9} />
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <SecTitle label="Mon Espace" />
                 <ACard icon="🎫" label="Mon Passeport Locatif" sub="Identité, ICL, Historique CERTIFIÉ" color={T.teal} bg={T.tealPale} onClick={() => {}} />
                 <ACard icon="⚙️" label="Paramètres de notifications" sub="SMS, WhatsApp, Fréquence" color={T.navy} bg={T.navyPale} onClick={() => op("notifs")} />
                 <ACard icon="🔒" label="Authentification & Sécurité" sub="Double facteur, Changement mot de passe" color={T.grey4} bg={T.grey1} />
              </div>

              <div className="pt-6 border-t border-[#D6DCE8]">
                 <button className="w-full py-4 text-[#A00000] font-black uppercase text-[12px] tracking-widest hover:bg-[#FEECEC] transition-colors rounded-2xl">
                    Se déconnecter
                 </button>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM NAVIGATION — sticky on mobile, desktop uses sidebar */}
        <div className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#D6DCE8] px-4 pt-3 pb-6 flex justify-between items-center z-[200] lg:hidden">
          {TABS.map((t) => (
            <button 
              key={t.id} 
              onClick={() => go(t.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${tab === t.id ? 'text-[#0D2B6E]' : 'text-[#8FA0BC]'}`}
            >
              {tab === t.id && (
                <motion.div layoutId="nav-active" className="absolute -top-3 w-8 h-1 bg-[#0D2B6E] rounded-full" />
              )}
              <div className={`p-1 transition-transform ${tab === t.id ? 'scale-110 -translate-y-0.5' : ''}`}>
                {t.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${tab === t.id ? 'opacity-100' : 'opacity-60'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── SHEETS ── */}
        
        {/* Score Sheet */}
        <Sheet open={O.score} onClose={() => cl("score")} title="DÉTAIL DU SCORE ICL" tc={T.teal}>
           <div className="pt-4 text-center">
              <div className="relative w-40 h-40 mx-auto mb-8">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="72" stroke="#EEF2F7" strokeWidth="12" fill="transparent" />
                    <motion.circle 
                      cx="80" cy="80" r="72" stroke={scColor} strokeWidth="12" fill="transparent" 
                      strokeDasharray={452.4} initial={{ strokeDashoffset: 452.4 }} animate={{ strokeDashoffset: 452.4 - (452.4 * sc) / 1000 }} 
                      transition={{ duration: 1.5, ease: "easeOut" }} 
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[44px] font-black text-[#0D2B6E] leading-none mb-1">{sc}</span>
                    <span className="text-[10px] font-black text-[#6A7D9E] uppercase tracking-widest">Sur 1000</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-[#F2F5FA] rounded-3xl">
                   <p className="text-[10px] font-black text-[#6A7D9E] uppercase mb-1">Grade</p>
                   <p className="text-[16px] font-black" style={{ color: scColor }}>CONFIRMÉ {profile?.scoreBadge || "B"}</p>
                </div>
                <div className="p-4 bg-[#F2F5FA] rounded-3xl">
                   <p className="text-[10px] font-black text-[#6A7D9E] uppercase mb-1">Fiabilité</p>
                   <p className="text-[16px] font-black text-[#0D2B6E] tracking-tight">{profile?.tauxPaiement12m || 98}%</p>
                </div>
              </div>

              <div className="text-left space-y-4 px-2 mb-6">
                <p className="text-[11px] font-medium text-[#2D3F5E] leading-relaxed">
                   Votre <strong>Indice de Confiance Locatif (ICL)</strong> est calculé selon 3 piliers :
                </p>
                {[
                  { l: "KYC & Identité", v: "200/200", c: T.green },
                  { l: "Fiabilité de paiement (12 mois)", v: "542/600", c: T.teal },
                  { l: "Comportement & Dialogue", v: "152/200", c: T.orange },
                ].map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white border border-[#D6DCE8] rounded-2xl">
                    <span className="text-[12px] font-bold text-[#6A7D9E]">{p.l}</span>
                    <span className="text-[13px] font-black" style={{ color: p.c }}>{p.v}</span>
                  </div>
                ))}
              </div>
              
              <div className="bg-[#E0F4F9] p-4 rounded-3xl text-[11px] text-[#2D3F5E] font-medium leading-relaxed mb-6">
                 🚀 <strong>Astuce :</strong> Payez vos prochaines factures utility avant l'échéance pour gagner +12 points bonus.
              </div>
              
              <button 
                onClick={() => cl("score")}
                className="w-full bg-[#0D2B6E] text-white py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-xl shadow-[#0D2B6E]/20"
              >
                J'ai compris
              </button>
           </div>
        </Sheet>

        {/* Quittance Sheet */}
        <Sheet open={!!qSel} onClose={() => setQSel(null)} title="DÉTAIL QUITTANCE" tc={T.navy}>
           <div className="pt-6">
              <div className={`p-6 rounded-[32px] border mb-6 ${qSel?.status === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                 <div className="flex justify-between items-start mb-6">
                   <div>
                      <h4 className="text-[18px] font-black text-[#0D2B6E] leading-none mb-1 uppercase italic">{qSel?.periodMonth}</h4>
                      <p className="text-[10px] font-mono text-[#6A7D9E]">{qSel?.receiptRef}</p>
                   </div>
                   <Badge label={qSel?.status === 'paid' ? "REÇU" : "IMPAYÉ"} color="white" bg={qSel?.status === 'paid' ? T.green : T.red} size={10} />
                 </div>
                 <div className="text-center py-4 bg-white/60 rounded-3xl mb-6">
                    <p className="text-[10px] font-black text-[#6A7D9E] uppercase mb-1">Montant Encaissé</p>
                    <p className="text-[32px] font-black text-[#0D2B6E] tracking-tighter leading-none font-mono">
                       {fmt(qSel?.totalAmount)} <span className="text-[14px] text-[#8FA0BC]">FCFA</span>
                    </p>
                 </div>
                 <Row label="Date Paiement" value={qSel?.paidAt ? new Date(qSel.paidAt).toLocaleDateString('fr-FR') : "—"} />
                 <Row label="Mode" value={qSel?.paymentMethod || "Non renseigné"} />
              </div>

              {qSel?.status === 'paid' ? (
                <div className="space-y-3">
                   <div style={{background:T.greenPale, border:"1px solid #1A7A3C20"}} className="rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-black text-[#1A7A3C] flex items-center gap-2 mb-2">
                         <ShieldCheck size={14} /> CERTIFICATION SHA-256
                      </p>
                      <p className="text-[9px] font-mono text-[#6A7D9E] break-all">{"CERT-QAP-77d8..."}</p>
                   </div>
                   <ACard icon="📄" label="Télécharger le PDF certifié" color={T.navy} bg={T.navyPale} />
                   <ACard icon="💬" label="Partager via WhatsApp" color={T.green} bg={T.greenPale} />
                   <ACard icon="🔗" label="Lien de vérification publique" sub="Valide 30 jours pour les tiers" color={T.teal} bg={T.tealPale} />
                </div>
              ) : (
                <div className="space-y-3">
                   <ACard icon="📸" label="Soumettre preuve de paiement" sub="Capture Mobile Money" color={T.orange} bg={T.orangePale} onClick={() => { setQSel(null); go("droits"); }} />
                   <ACard icon="🚨" label="Signaler un paiement non détecté" color={T.red} bg={T.redPale} onClick={() => { setQSel(null); go("droits"); }} />
                </div>
              )}
           </div>
        </Sheet>

        {/* Droits: RCL Flow Sheet */}
        <Sheet open={dsec === "rcl" && !rclSent} onClose={() => { setDsec(null); setRclCode(null); }} title="NOUVELLE RÉCLAMATION (RCL)" tc={T.purple}>
           {!rclCode ? (
             <div className="pt-4 space-y-4">
               {[
                 { code: "RCL-01", label: "Quittance incorrecte", sub: "Montant, période ou nom erroné", icon: "🧾" },
                 { code: "RCL-02", label: "Paiement sans quittance", sub: "Preuve Mobile Money ignorée", icon: "💸" },
                 { code: "RCL-03", label: "Charges suspectes", sub: "Montant hors contrat de bail", icon: "💰" },
                 { code: "RCL-05", label: "Demande de travaux", sub: "Plomberie, Elec, Humidité...", icon: "🔧" },
               ].map((r, i) => (
                 <div key={i} onClick={() => setRclCode(r.code)} className="bg-[#F2F5FA] border border-[#5B21B6]/10 p-5 rounded-[28px] flex items-center gap-4 cursor-pointer hover:bg-[#EDE9FE] transition-colors">
                    <div className="text-3xl">{r.icon}</div>
                    <div className="flex-1">
                       <h6 className="text-[13px] font-bold text-[#5B21B6]">{r.label}</h6>
                       <p className="text-[10px] text-[#6A7D9E] font-medium leading-tight mt-1">{r.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#5B21B6]/40" />
                 </div>
               ))}
             </div>
           ) : (
             <div className="pt-4">
                <BackBtn label="Choix réclamation" onClick={() => setRclCode(null)} />
                <div className="bg-[#EDE9FE] p-4 rounded-3xl mb-6">
                   <h6 className="text-[12px] font-black text-[#5B21B6] uppercase">TYPE : {rclCode}</h6>
                </div>
                
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-[#6A7D9E] uppercase mb-2 block tracking-widest pl-1">Description détaillée</label>
                      <textarea placeholder="Expliquez la situation..." className="w-full h-32 bg-[#F2F5FA] border border-[#D6DCE8] rounded-3xl p-4 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20" />
                   </div>
                   
                   <div>
                      <label className="text-[10px] font-black text-[#6A7D9E] uppercase mb-2 block tracking-widest pl-1">Preuve photo/capture</label>
                      <div className="border-2 border-dashed border-[#5B21B6]/30 rounded-[32px] p-8 text-center bg-[#EDE9FE]/30 cursor-pointer">
                         <div className="text-3xl mb-2">📎</div>
                         <p className="text-[11px] font-black text-[#5B21B6] uppercase tracking-wider">Joindre un justificatif</p>
                      </div>
                   </div>

                   <div className="bg-[#EEF2FA] p-4 rounded-2xl flex items-start gap-4">
                      <div className="text-xl">🔐</div>
                      <p className="text-[10px] text-[#2D3F5E] font-medium leading-relaxed italic">
                         <strong>Protection QAPRIL :</strong> En soumettant ce ticket, un délai de <strong>144h</strong> est accordé au bailleur pour répondre. Passé ce délai, sans réponse, une issue automatique est actée.
                      </p>
                   </div>

                   <button 
                     onClick={() => setRclSent(true)}
                     className="w-full bg-[#5B21B6] text-white py-4 rounded-[28px] text-[12px] font-black uppercase tracking-widest shadow-xl shadow-[#5B21B6]/20 active:scale-95 transition-all"
                   >
                     Soumettre Reclamation →
                   </button>
                </div>
             </div>
           )}
        </Sheet>

        {/* Droits: MRL Flow Sheet */}
        <Sheet open={dsec === "mrl"} onClose={() => setDsec(null)} title="MODIFICATION LOYER (MRL-01)" tc={T.orange}>
           <div className="pt-4">
              <div className="bg-[#FFF3E0] rounded-[32px] p-6 mb-6 border border-orange-200">
                 <h4 className="text-[14px] font-black text-[#C05B00] mb-2 uppercase tracking-tight">Proposition reçue</h4>
                 <p className="text-[11px] text-[#C05B00]/70 font-medium leading-relaxed mb-4">
                    Le bailleur souhaite modifier le montant du loyer de votre bail certifié. Conformément à la règle <strong>MRL-01</strong>, votre consentement explicite est requis.
                 </p>
                 <div className="bg-white/60 rounded-2xl p-4 space-y-3">
                    <Row label="Loyer actuel" value={fmt(mainBail?.rentAmount) + " F"} />
                    <Row label="Nouveau loyer" value={fmt((mainBail?.rentAmount || 0) * 1.1) + " F"} color={T.red} />
                    <Row label="Date d'effet" value="01 Mai 2026" />
                 </div>
              </div>

              <div className="space-y-4">
                 <button className="w-full bg-[#1A7A3C] text-white py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-lg shadow-[#1A7A3C]/20">
                    Accepter la modification
                 </button>
                 <button className="w-full bg-white border border-[#A00000] text-[#A00000] py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest">
                    Refuser (Ouvrir Litige)
                 </button>
                 <p className="text-[9px] text-center text-[#6A7D9E] font-medium italic mt-2">
                    ⚖️ Un refus déclenche une médiation automatique via le CACI (Côte d'Ivoire).
                 </p>
              </div>
           </div>
        </Sheet>

        {/* Droits: Préavis Flow Sheet */}
        <Sheet open={dsec === "preavis"} onClose={() => setDsec(null)} title="DÉPART / PRÉAVIS" tc={T.navy}>
           <div className="pt-4 space-y-6">
              <div className="bg-[#EEF2FA] rounded-[32px] p-6 border border-[#0D2B6E]/20">
                 <h4 className="text-[14px] font-black text-[#0D2B6E] mb-2 uppercase tracking-tight">Initier mon départ</h4>
                 <p className="text-[11px] text-[#0D2B6E]/70 font-medium leading-relaxed">
                    Le cadre légal en Côte d'Ivoire impose un préavis minimum de 1 à 3 mois selon le bail. QAPRIL formalise votre demande pour éviter tout litige de caution.
                 </p>
              </div>

              <div className="space-y-4">
                 {[
                   { t: "Date prévisionnelle de sortie", v: "30 Juin 2026", i: "📅" },
                   { t: "Motif du départ", v: "Déménagement / Fin de bail", i: "🏠" },
                   { t: "État des lieux de sortie", v: "Requis (M-EDL)", i: "📸" },
                 ].map((s, i) => (
                   <div key={i} className="bg-white border border-[#D6DCE8] p-4 rounded-[24px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="text-xl">{s.i}</span>
                         <span className="text-[12px] font-bold text-[#2D3F5E]">{s.t}</span>
                      </div>
                      <span className="text-[11px] font-black text-[#0D2B6E]">{s.v}</span>
                   </div>
                 ))}
              </div>

              <div className="bg-red-50 p-4 rounded-2xl flex items-start gap-4 border border-red-100">
                 <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                 <p className="text-[10px] text-red-700 font-medium leading-relaxed">
                    <strong>Attention :</strong> Une fois le préavis envoyé, il ne peut être annulé qu'avec l'accord écrit du bailleur. Votre caution sera gérée via l'EDL de sortie.
                 </p>
              </div>

              <button className="w-full bg-[#0D2B6E] text-white py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest">
                 Envoyer le préavis certifié
              </button>
           </div>
        </Sheet>

        {/* RCL Success State */}
        <Sheet open={rclSent} onClose={() => { setRclSent(false); setDsec(null); setRclCode(null); }} title="SUCCÈS SOUMISSION" tc={T.green}>
           <div className="pt-10 text-center">
              <div className="w-24 h-24 bg-[#E8F5EE] rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">
                ✅
              </div>
              <h4 className="text-[20px] font-black text-[#0D2B6E] tracking-tight mb-4">Ticket Enregistré !</h4>
              <p className="text-[13px] text-[#6A7D9E] font-medium leading-relaxed mb-8 px-4">
                 Votre réclamation a été transmise au bailleur par <strong>SMS + WhatsApp + Notification QAPRIL</strong>.
              </p>
              <div className="bg-[#F2F5FA] rounded-3xl p-6 text-left mb-8 space-y-4 shadow-inner">
                 <Row label="Rérérence Ticket" value="TX-004277" color={T.navy} />
                 <Row label="Délai Bailleur" value="144 Heures" />
                 <Row label="Échéance" value="31 Mars 2026" color={T.orange} />
              </div>
              <button 
                onClick={() => { setRclSent(false); setDsec(null); setRclCode(null); }}
                className="w-full bg-[#0D2B6E] text-white py-4 rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-xl shadow-[#0D2B6E]/20"
              >
                Retour à mes droits
              </button>
           </div>
        </Sheet>

      </div>
    </div>
  );
}
