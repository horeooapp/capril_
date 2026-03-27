"use client";

import { useState } from "react";
import {
  Home, FileText, Receipt, Zap, ShieldCheck, User,
  ChevronRight, AlertTriangle, Bell, ShieldAlert,
  CreditCard, CheckCircle, Clock, Download, Share2,
  Menu, X, LogOut, Star, TrendingUp, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── THEME ──────────────────────────────────────────────────────────────────
const T = {
  navy: "#0D2B6E", navyDark: "#071A45", navyPale: "#EEF2FA",
  green: "#1A7A3C", greenPale: "#E8F5EE",
  orange: "#C05B00", orangePale: "#FFF3E0",
  red: "#A00000", redPale: "#FEECEC",
  teal: "#0E7490", tealPale: "#E0F4F9",
  purple: "#5B21B6", purplePale: "#EDE9FE",
  gold: "#C9A84C",
  grey1: "#F2F5FA", grey2: "#D6DCE8", grey3: "#8FA0BC", grey4: "#4A5B7A",
  text: "#0A1930", textMid: "#2D3F5E", textLight: "#6A7D9E",
};

const fmt = (n: number) => n?.toLocaleString("fr-FR") || "0";

// ── NAV MODULES ─────────────────────────────────────────────────────────────
const MODULES = [
  { id: "dash",   icon: <Home size={18} />,        label: "Vue d'ensemble",  desc: "KPIs & alertes",      color: T.navy },
  { id: "bail",   icon: <FileText size={18} />,    label: "Mon Bail",        desc: "Contrat & certif.",   color: T.teal },
  { id: "quitt",  icon: <Receipt size={18} />,     label: "Paiements",       desc: "Quittances & histo.", color: T.green },
  { id: "util",   icon: <Zap size={18} />,         label: "CIE / SODECI",   desc: "Charges & utilities", color: T.orange },
  { id: "droits", icon: <ShieldCheck size={18} />, label: "Mes Droits",      desc: "RCL, MRL, Préavis",  color: T.purple },
  { id: "profil", icon: <User size={18} />,        label: "Mon Profil",      desc: "Compte & sécurité",  color: T.grey4 },
];

// ── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ label, color, bg, size = 10 }: any) => (
  <span className="inline-flex items-center rounded-md font-bold whitespace-nowrap px-2 py-0.5"
    style={{ background: bg, color, fontSize: size }}>{label}</span>
);

const InfoRow = ({ label, value, color }: any) => (
  <div className="flex justify-between py-2.5 border-b border-[#EEF2F7] last:border-0">
    <span className="text-xs text-[#6A7D9E] font-medium uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold" style={{ color: color || T.textMid }}>{value}</span>
  </div>
);

const ModuleCard = ({ icon, label, sub, color, bg, onClick, disabled }: any) => (
  <div onClick={disabled ? undefined : onClick}
    className={`flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 border ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-100" : "cursor-pointer hover:shadow-md active:scale-[0.99] shadow-sm"}`}
    style={!disabled ? { background: bg, borderColor: color + "20" } : {}}>
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <div className="text-sm font-bold" style={{ color: disabled ? T.grey3 : color }}>{label}</div>
      {sub && <div className="text-[11px] text-[#6A7D9E] mt-0.5 font-medium">{sub}</div>}
    </div>
    {!disabled && <ChevronRight size={16} style={{ color, opacity: 0.4 }} />}
  </div>
);

const SectionTitle = ({ label, action }: any) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em]">{label}</h3>
    {action}
  </div>
);

const StatCard = ({ label, value, icon, color, bg, onClick }: any) => (
  <div onClick={onClick} className={`rounded-2xl p-4 border flex flex-col gap-1 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    style={{ background: bg || T.grey1, borderColor: (color || T.grey2) + "40" }}>
    <div className="text-2xl">{icon}</div>
    <div className="text-xl font-black" style={{ color: color || T.navy }}>{value}</div>
    <div className="text-[10px] font-bold text-[#6A7D9E] uppercase tracking-wider">{label}</div>
  </div>
);

// ── SHEET (MODAL/DRAWER) ──────────────────────────────────────────────────────
const Sheet = ({ open, onClose, title, tc, children }: any) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 z-10 shadow-2xl"
          initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: tc || T.navy }}>{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DashboardLocataireV2({ data, session }: { data: any; session: any }) {
  const [tab, setTab] = useState("dash");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sheets, setSheets] = useState<Record<string, boolean>>({});
  const [dsec, setDsec] = useState<string | null>(null);
  const [qSel, setQSel] = useState<any>(null);
  const [rclCode, setRclCode] = useState<string | null>(null);
  const [rclSent, setRclSent] = useState(false);

  const op = (k: string) => setSheets(s => ({ ...s, [k]: true }));
  const cl = (k: string) => setSheets(s => ({ ...s, [k]: false }));
  const go = (t: string) => { setTab(t); setSidebarOpen(false); setQSel(null); setDsec(null); };

  const profile = data?.profile;
  const mainBail = data?.bails?.[0];
  const sc = profile?.scoreActuel || 0;
  const scColor = sc >= 850 ? T.green : sc >= 700 ? T.teal : sc >= 550 ? T.orange : T.red;
  const activeModule = MODULES.find(m => m.id === tab) || MODULES[0];

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex">

      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-[#D6DCE8] z-50
        flex flex-col transition-transform duration-300 shadow-xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Sidebar header */}
        <div className="p-6 border-b border-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0D2B6E] to-[#0E7490] flex items-center justify-center text-white font-black text-lg">
              {session?.user?.name?.[0] || "L"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#0D2B6E] truncate">{session?.user?.name || "Locataire"}</p>
              <p className="text-[10px] text-[#6A7D9E] font-medium truncate">{session?.user?.email}</p>
            </div>
          </div>
          {/* Score badge */}
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: scColor + "15" }}>
            <Star size={12} style={{ color: scColor }} />
            <span className="text-[11px] font-black" style={{ color: scColor }}>Score ICL : {sc} / 1000</span>
          </div>
        </div>

        {/* Nav modules */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MODULES.map(m => (
            <button key={m.id} onClick={() => go(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${tab === m.id ? "bg-[#EEF2FA] shadow-sm" : "hover:bg-gray-50"}`}>
              <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${tab === m.id ? "bg-white shadow-sm" : "bg-transparent group-hover:bg-white"}`}
                style={{ color: tab === m.id ? m.color : T.grey3 }}>
                {m.icon}
              </span>
              <div>
                <div className="text-[13px] font-bold" style={{ color: tab === m.id ? m.color : T.textMid }}>{m.label}</div>
                <div className="text-[10px] text-[#8FA0BC] font-medium">{m.desc}</div>
              </div>
              {tab === m.id && <div className="ml-auto w-1.5 h-6 rounded-full" style={{ background: m.color }} />}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-[#EEF2F7]">
          <Link href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 text-[#A00000] hover:bg-red-50 rounded-xl transition-colors w-full">
            <LogOut size={16} />
            <span className="text-sm font-bold">Se déconnecter</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-[#D6DCE8] px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] text-[#8FA0BC] font-bold uppercase tracking-widest mb-0.5">
              <span>Espace Locataire</span>
              <ChevronRight size={10} />
              <span style={{ color: activeModule.color }}>{activeModule.label}</span>
            </div>
            <h1 className="text-lg font-black text-[#0D2B6E]">{activeModule.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            {mainBail?.status === "LOYER_IMPAYE" && (
              <Badge label="LOYER EN RETARD" color="white" bg={T.red} size={9} />
            )}
            <button onClick={() => op("notifs")} className="w-9 h-9 rounded-xl bg-[#EEF2FA] flex items-center justify-center text-[#0D2B6E] hover:bg-[#D6DCE8] transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* === VUE D'ENSEMBLE === */}
          {tab === "dash" && (
            <div className="space-y-8 max-w-5xl">

              {/* Alert impayé */}
              {mainBail?.status === "LOYER_IMPAYE" && (
                <div className="bg-[#FEECEC] border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-[#A00000] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-black text-[#A00000] text-sm mb-1">ALERTE IMPAYÉ</h4>
                    <p className="text-sm text-[#2D3F5E] leading-relaxed">Votre loyer de ce mois n'a pas encore été détecté. Si vous avez déjà payé, soumettez votre preuve maintenant.</p>
                  </div>
                  <button onClick={() => { go("droits"); setDsec("rcl"); setRclCode("RCL-02"); }}
                    className="flex-shrink-0 bg-[#A00000] text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                    Signaler
                  </button>
                </div>
              )}

              {/* KPI Grid */}
              <section>
                <SectionTitle label="Indicateurs clés" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Loyer / mois" value={`${fmt(mainBail?.rentAmount)} F`} icon="💰" color={T.navy} bg={T.navyPale} />
                  <StatCard label="Quittances" value={data?.quittances?.length || 0} icon="🧾" color={T.green} bg={T.greenPale} onClick={() => go("quitt")} />
                  <StatCard label="Score ICL" value={sc} icon="⭐" color={scColor} bg={scColor + "15"} onClick={() => op("score")} />
                  <StatCard label="Caution" value={data?.caution ? "Séquestrée ✓" : "Non déposée"} icon="🔒" color={T.teal} bg={T.tealPale} onClick={() => op("caution")} />
                </div>
              </section>

              {/* Logement + bail */}
              <section>
                <SectionTitle label="Mon installation" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div onClick={() => go("bail")} className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-black text-[#0D2B6E]">{mainBail?.property?.name || "Propriété"}</h4>
                        <p className="text-xs text-[#6A7D9E] mt-1">{mainBail?.property?.address || "—"}</p>
                      </div>
                      <Badge label={mainBail?.status || "ACTIF"} color={T.teal} bg={T.tealPale} />
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      <Badge label="BAIL CERTIFIÉ" bg={T.navyPale} color={T.navy} size={9} />
                      <Badge label={`ÉCHÉANCE J-${data?.nextPaymentInDays || "?"}`} bg={T.orangePale} color={T.orange} size={9} />
                    </div>
                    <div className="bg-[#F2F5FA] rounded-xl p-3 flex justify-between items-center text-xs">
                      <span className="text-[#6A7D9E] font-medium">Bailleur / Gestion</span>
                      <span className="font-black text-[#2D3F5E]">
                        {mainBail?.typeGestion === "agreee" ? `Masqué (${mainBail?.landlord?.landlordCode || "AGRÉÉE"})` : (mainBail?.landlord?.fullName || "—")}
                      </span>
                    </div>
                  </div>

                  {/* Payment countdown */}
                  <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                    <h4 className="text-xs font-black text-[#6A7D9E] uppercase tracking-widest mb-4">Prochain paiement</h4>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black"
                        style={{ background: (data?.nextPaymentInDays <= 5 ? T.red : T.teal) + "20", color: data?.nextPaymentInDays <= 5 ? T.red : T.teal }}>
                        {data?.nextPaymentInDays ?? "?"}
                      </div>
                      <div>
                        <p className="text-2xl font-black text-[#0D2B6E]">{data?.nextPaymentInDays <= 5 ? "URGENT" : "jours"}</p>
                        <p className="text-xs text-[#6A7D9E] font-medium mt-1">Loyer dû le {mainBail?.paymentDay || 5} du mois</p>
                      </div>
                    </div>
                    <button onClick={() => go("bail")} className="w-full bg-[#0D2B6E] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                      Payer maintenant →
                    </button>
                  </div>
                </div>
              </section>

              {/* Modules rapides */}
              <section>
                <SectionTitle label="Accès rapides par module" />
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                  {MODULES.filter(m => m.id !== "dash").map(m => (
                    <button key={m.id} onClick={() => go(m.id)}
                      className="bg-white border border-[#D6DCE8] rounded-2xl p-4 text-center hover:shadow-md transition-all hover:border-opacity-50 group"
                      style={{ borderTopWidth: 3, borderTopColor: m.color }}>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{
                        m.id === "bail" ? "📄" : m.id === "quitt" ? "🧾" : m.id === "util" ? "⚡" : m.id === "droits" ? "⚖️" : "👤"
                      }</div>
                      <p className="text-xs font-black" style={{ color: m.color }}>{m.label}</p>
                      <p className="text-[9px] text-[#8FA0BC] font-medium mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* CIE/SODECI preview */}
              {data?.facturesUtilities?.length > 0 && (
                <section>
                  <SectionTitle label="🔌 CIE / SODECI — Dernières factures"
                    action={<button onClick={() => go("util")} className="text-xs font-black text-[#0E7490] uppercase tracking-widest">Tout voir →</button>} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.facturesUtilities.slice(0, 3).map((f: any, i: number) => (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-[#D6DCE8] shadow-sm">
                        <div className="text-2xl mb-2">{f.typeUtility === "CIE" ? "⚡" : "💧"}</div>
                        <p className="text-xs font-black uppercase" style={{ color: f.typeUtility === "CIE" ? "#F97316" : T.teal }}>{f.typeUtility}</p>
                        <p className="text-lg font-black text-[#0D2B6E] mt-1">{fmt(f.montantTotal)} F</p>
                        <Badge label={f.statut} color={T.green} bg={T.greenPale} size={8} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* === MON BAIL === */}
          {tab === "bail" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-[#0D2B6E] uppercase">{mainBail?.property?.name || "LOGEMENT CERTIFIÉ"}</h2>
                    <p className="text-sm text-[#6A7D9E] mt-1">{mainBail?.property?.address || "—"}</p>
                  </div>
                  <Badge label={mainBail?.status || "ACTIF"} color={T.teal} bg={T.tealPale} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { l: "Loyer mensuel", v: `${fmt(mainBail?.rentAmount)} FCFA` },
                    { l: "Type de bail", v: mainBail?.leaseReference?.split("-")[0] || "BDQ" },
                    { l: "Échéance", v: `Le ${mainBail?.paymentDay || 5} du mois` },
                    { l: "Statut", v: mainBail?.status || "—" },
                  ].map((r, i) => (
                    <div key={i} className="bg-[#F2F5FA] rounded-xl p-3">
                      <p className="text-[9px] font-black text-[#6A7D9E] uppercase mb-1">{r.l}</p>
                      <p className="text-sm font-black text-[#0D2B6E]">{r.v}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-0">
                  <InfoRow label="Référence" value={mainBail?.leaseReference || "—"} color={T.navy} />
                  <InfoRow label="Date signature" value={mainBail?.createdAt ? new Date(mainBail.createdAt).toLocaleDateString("fr-FR") : "—"} />
                  <InfoRow label="Bailleur" value={mainBail?.landlord?.fullName || "Masqué"} />
                </div>
                <div className="mt-6 p-4 rounded-xl" style={{ background: T.greenPale, border: `1px solid ${T.green}20` }}>
                  <p className="text-xs font-black text-[#1A7A3C] flex items-center gap-2 mb-1"><CheckCircle size={14} /> CERTIFICATION SHA-256</p>
                  <p className="text-[10px] font-mono text-[#6A7D9E] break-all">{mainBail?.sha || "e8f1b2c3d4a5e6f7...CERT-QAPRIL-2026"}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                <SectionTitle label="📲 Canaux de paiement Mobile Money" />
                {data?.mobileMoney?.length > 0 ? (
                  <div className="space-y-2">
                    {data.mobileMoney.map((mm: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-[#F2F5FA] rounded-xl">
                        <div className="text-2xl">{mm.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#0D2B6E]">{mm.operateur}</p>
                          <p className="text-sm font-mono text-[#6A7D9E]">{mm.numero}</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-xs font-black uppercase text-white"
                          style={{ background: mm.operateur === "Orange Money" ? "#F97316" : T.teal }}>Payer</button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[#6A7D9E] italic">Aucun canal configuré</p>}
              </div>
              <div className="space-y-3">
                <ModuleCard icon="📄" label="Télécharger mon bail PDF" sub="Version certifiée pour vos dossiers" color={T.navy} bg={T.navyPale} />
                <ModuleCard icon="🚪" label="Initier un préavis de sortie" sub="Délai légal 1 mois — Formalisation QAPRIL" color={T.orange} bg={T.orangePale} onClick={() => { go("droits"); setDsec("preavis"); }} />
              </div>
            </div>
          )}

          {/* === PAIEMENTS === */}
          {tab === "quitt" && !qSel && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Payées" value={data?.quittances?.filter((q: any) => q.status === "paid").length || 0} icon="✅" color={T.green} bg={T.greenPale} />
                <StatCard label="En attente" value={data?.quittances?.filter((q: any) => q.status !== "paid").length || 0} icon="⏳" color={T.orange} bg={T.orangePale} />
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#EEF2F7]">
                  <SectionTitle label="Historique des paiements" />
                </div>
                {data?.quittances?.length > 0 ? (
                  <div className="divide-y divide-[#EEF2F7]">
                    {data.quittances.map((q: any) => (
                      <div key={q.id} onClick={() => setQSel(q)}
                        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#F2F5FA] transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${q.status === "paid" ? "bg-emerald-50" : "bg-red-50"}`}>
                          {q.status === "paid" ? "🧾" : "⚠️"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-[#0D2B6E] uppercase">{q.periodMonth}</p>
                          <p className="text-[10px] font-mono text-[#6A7D9E]">{q.receiptRef}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#0D2B6E]">{fmt(q.totalAmount)} F</p>
                          <Badge label={q.status === "paid" ? "Payé" : "En attente"} color={q.status === "paid" ? T.green : T.red} bg={q.status === "paid" ? T.greenPale : T.redPale} size={8} />
                        </div>
                        <ChevronRight size={14} className="text-[#8FA0BC]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#6A7D9E]">
                    <p className="text-3xl mb-2">🧾</p>
                    <p className="text-sm font-medium">Aucune quittance générée pour le moment.</p>
                  </div>
                )}
              </div>
              <button onClick={() => op("export")} className="w-full py-3 bg-white border border-[#0D2B6E]/20 text-[#0D2B6E] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#EEF2FA] transition-colors">
                Exporter historique 36 mois certifié
              </button>
            </div>
          )}

          {/* Quittance detail */}
          {tab === "quitt" && qSel && (
            <div className="max-w-xl">
              <button onClick={() => setQSel(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] mb-6 hover:text-[#0D2B6E] transition-colors uppercase tracking-widest">
                ← Retour historique
              </button>
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-black text-[#0D2B6E] uppercase">{qSel.periodMonth}</h2>
                    <p className="text-xs font-mono text-[#6A7D9E]">{qSel.receiptRef}</p>
                  </div>
                  <Badge label={qSel.status === "paid" ? "PAYÉ" : "IMPAYÉ"} color="white" bg={qSel.status === "paid" ? T.green : T.red} />
                </div>
                <div className="text-center py-6 bg-[#F2F5FA] rounded-xl">
                  <p className="text-xs font-black text-[#6A7D9E] uppercase mb-1">Montant</p>
                  <p className="text-4xl font-black text-[#0D2B6E]">{fmt(qSel.totalAmount)} <span className="text-base text-[#8FA0BC]">FCFA</span></p>
                </div>
                <InfoRow label="Date paiement" value={qSel?.paidAt ? new Date(qSel.paidAt).toLocaleDateString("fr-FR") : "—"} />
                <InfoRow label="Mode" value={qSel?.paymentMethod || "Non renseigné"} />
                {qSel.status === "paid" && (
                  <div className="space-y-2 pt-2">
                    <ModuleCard icon="📄" label="Télécharger PDF certifié" color={T.navy} bg={T.navyPale} />
                    <ModuleCard icon="💬" label="Partager via WhatsApp" color={T.green} bg={T.greenPale} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === CIE / SODECI === */}
          {tab === "util" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#FFF3E0] border border-orange-200 rounded-2xl p-5">
                <p className="text-sm text-[#2D3F5E] leading-relaxed">
                  🔎 Suivez votre consommation <strong>CIE (Électricité)</strong> et <strong>SODECI (Eau)</strong> liée directement à votre logement certifié.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#EEF2F7]">
                  <SectionTitle label="Mes factures utility" />
                </div>
                {data?.facturesUtilities?.length > 0 ? (
                  <div className="divide-y divide-[#EEF2F7]">
                    {data.facturesUtilities.map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${f.typeUtility === "CIE" ? "bg-orange-50" : "bg-cyan-50"}`}>
                          {f.typeUtility === "CIE" ? "⚡" : "💧"}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase" style={{ color: f.typeUtility === "CIE" ? "#F97316" : T.teal }}>{f.typeUtility}</p>
                          <p className="text-sm font-bold text-[#0D2B6E]">{f.moisFacture ? new Date(f.moisFacture).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-[#0D2B6E]">{fmt(f.montantTotal)} F</p>
                          <Badge label={f.statut} color={T.green} bg={T.greenPale} size={8} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#6A7D9E]">
                    <p className="text-3xl mb-2">⚡</p>
                    <p className="text-sm font-medium">Aucune facture utility détectée.</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <ModuleCard icon="📑" label="Télécharger dernière facture" color={T.navy} bg={T.navyPale} />
                <ModuleCard icon="📲" label="Payer utility en ligne" sub="Orange · MTN · Wave" color={T.green} bg={T.greenPale} />
              </div>
            </div>
          )}

          {/* === MES DROITS === */}
          {tab === "droits" && !dsec && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#EDE9FE] border border-purple-200 rounded-2xl p-5">
                <h4 className="text-sm font-black text-[#5B21B6] mb-1">⚖️ Protection Locataire QAPRIL</h4>
                <p className="text-sm text-[#5B21B6]/70 leading-relaxed">Réclamations, consentement loyer, préavis certifié. Vos droits sont garantis par le cadre QAPRIL 2026.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm p-6 space-y-3">
                <SectionTitle label="Actions disponibles" />
                <ModuleCard icon="📋" label="Soumettre une réclamation" sub="Quittance, Désaccord, Travaux requis" color={T.purple} bg={T.purplePale} onClick={() => setDsec("rcl")} />
                <ModuleCard icon="✏️" label="Consentement modification loyer" sub="Règle MRL-01 — Votre accord requis" color={T.orange} bg={T.orangePale} onClick={() => setDsec("mrl")} />
                <ModuleCard icon="🚪" label="Initier un préavis de sortie" sub="Délai légal 1 mois minimum (CI)" color={T.navy} bg={T.navyPale} onClick={() => setDsec("preavis")} />
              </div>
            </div>
          )}

          {dsec === "rcl" && tab === "droits" && !rclSent && (
            <div className="max-w-xl space-y-4">
              <button onClick={() => setDsec(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] hover:text-[#0D2B6E] uppercase tracking-widest">← Mes droits</button>
              <h2 className="text-lg font-black text-[#5B21B6]">Nouvelle réclamation</h2>
              {!rclCode ? (
                <div className="space-y-3">
                  {[
                    { code: "RCL-01", label: "Quittance incorrecte", sub: "Montant, période ou nom erroné", icon: "🧾" },
                    { code: "RCL-02", label: "Paiement sans quittance", sub: "Preuve Mobile Money ignorée", icon: "💸" },
                    { code: "RCL-03", label: "Charges suspectes", sub: "Montant hors contrat de bail", icon: "💰" },
                    { code: "RCL-05", label: "Demande de travaux", sub: "Plomberie, Elec, Humidité...", icon: "🔧" },
                  ].map((r, i) => (
                    <div key={i} onClick={() => setRclCode(r.code)}
                      className="bg-white border border-[#5B21B6]/20 p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-[#EDE9FE] transition-colors shadow-sm">
                      <span className="text-3xl">{r.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#5B21B6]">{r.label}</p>
                        <p className="text-xs text-[#6A7D9E] mt-0.5">{r.sub}</p>
                      </div>
                      <ChevronRight size={16} className="text-[#5B21B6]/40" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm space-y-4">
                  <div className="bg-[#EDE9FE] p-3 rounded-xl">
                    <p className="text-xs font-black text-[#5B21B6] uppercase">Type : {rclCode}</p>
                  </div>
                  <textarea placeholder="Décrivez la situation..." className="w-full h-32 bg-[#F2F5FA] border border-[#D6DCE8] rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5B21B6]/20" />
                  <div className="border-2 border-dashed border-[#5B21B6]/30 rounded-xl p-6 text-center cursor-pointer hover:bg-[#EDE9FE]/30 transition-colors">
                    <p className="text-sm font-black text-[#5B21B6]">📎 Joindre un justificatif</p>
                  </div>
                  <button onClick={() => setRclSent(true)} className="w-full bg-[#5B21B6] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#4C1D95] transition-colors">
                    Soumettre la réclamation →
                  </button>
                </div>
              )}
            </div>
          )}

          {rclSent && tab === "droits" && (
            <div className="max-w-xl text-center space-y-6">
              <div className="w-24 h-24 bg-[#E8F5EE] rounded-full flex items-center justify-center text-5xl mx-auto animate-bounce">✅</div>
              <h2 className="text-2xl font-black text-[#0D2B6E]">Ticket Enregistré !</h2>
              <p className="text-sm text-[#6A7D9E] leading-relaxed">Votre réclamation a été transmise au bailleur par <strong>SMS + WhatsApp + Notification QAPRIL</strong>.</p>
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm text-left space-y-2">
                <InfoRow label="Référence Ticket" value="TX-004277" color={T.navy} />
                <InfoRow label="Délai Bailleur" value="144 Heures" />
                <InfoRow label="Résolution automatique" value="Si silence bailleur" color={T.orange} />
              </div>
              <button onClick={() => { setRclSent(false); setDsec(null); setRclCode(null); }}
                className="w-full bg-[#0D2B6E] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                Retour à mes droits
              </button>
            </div>
          )}

          {dsec === "mrl" && tab === "droits" && (
            <div className="max-w-xl space-y-4">
              <button onClick={() => setDsec(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] hover:text-[#0D2B6E] uppercase tracking-widest">← Mes droits</button>
              <div className="bg-[#FFF3E0] border border-orange-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-black text-[#C05B00]">Modification loyer (MRL-01)</h4>
                <p className="text-sm text-[#C05B00]/70 leading-relaxed">Le bailleur souhaite modifier le montant du loyer. Votre consentement explicite est requis.</p>
                <div className="bg-white rounded-xl p-4 space-y-2">
                  <InfoRow label="Loyer actuel" value={`${fmt(mainBail?.rentAmount)} F`} />
                  <InfoRow label="Nouveau loyer proposé" value={`${fmt((mainBail?.rentAmount || 0) * 1.1)} F`} color={T.red} />
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-[#1A7A3C] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#145f2f] transition-colors">Accepter la modification</button>
                <button className="w-full bg-white border border-[#A00000] text-[#A00000] py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-50 transition-colors">Refuser (Ouvrir Litige)</button>
              </div>
            </div>
          )}

          {dsec === "preavis" && tab === "droits" && (
            <div className="max-w-xl space-y-4">
              <button onClick={() => setDsec(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] hover:text-[#0D2B6E] uppercase tracking-widest">← Mes droits</button>
              <div className="bg-[#EEF2FA] border border-[#0D2B6E]/20 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-black text-[#0D2B6E]">Initier un préavis de sortie</h4>
                <p className="text-sm text-[#0D2B6E]/70 leading-relaxed">Le cadre légal ivoirien impose un préavis minimum de 1 à 3 mois selon le bail.</p>
                <div className="space-y-2">
                  {[
                    { t: "Date prévisionnelle de sortie", v: "30 Juin 2026", i: "📅" },
                    { t: "Motif", v: "Déménagement / Fin de bail", i: "🏠" },
                    { t: "EDL de sortie", v: "Requis (M-EDL)", i: "📸" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white border border-[#D6DCE8] p-3 rounded-xl flex items-center gap-3">
                      <span className="text-xl">{s.i}</span>
                      <span className="flex-1 text-sm font-bold text-[#2D3F5E]">{s.t}</span>
                      <span className="text-xs font-black text-[#0D2B6E]">{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed"><strong>Attention :</strong> Une fois soumis, le préavis ne peut être annulé qu'avec l'accord écrit du bailleur.</p>
              </div>
              <button className="w-full bg-[#0D2B6E] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                Envoyer le préavis certifié
              </button>
            </div>
          )}

          {/* === MON PROFIL === */}
          {tab === "profil" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-gradient-to-br from-[#0D2B6E] to-[#2D3F5E] rounded-2xl p-8 text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl mx-auto mb-4">👤</div>
                  <h3 className="text-xl font-black text-white uppercase mb-1">{session?.user?.name || "Locataire QAPRIL"}</h3>
                  <p className="text-sm text-white/60 mb-4">{session?.user?.email}</p>
                  <div className="flex justify-center gap-2">
                    <Badge label="KYC CERTIFIÉ" bg="#1A7A3C" color="white" size={9} />
                    <Badge label={`GRADE ${profile?.scoreBadge || "B"}`} bg="#C9A84C" color="white" size={9} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm p-6 space-y-3">
                <SectionTitle label="Mon espace" />
                <ModuleCard icon="🎫" label="Mon Passeport Locatif" sub="Identité, ICL, Historique certifié" color={T.teal} bg={T.tealPale} />
                <ModuleCard icon="⚙️" label="Paramètres de notifications" sub="SMS, WhatsApp, Fréquence" color={T.navy} bg={T.navyPale} onClick={() => op("notifs")} />
                <ModuleCard icon="🔒" label="Authentification & Sécurité" sub="Double facteur, Mot de passe" color={T.grey4} bg={T.grey1} />
              </div>
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                <Link href="/api/auth/signout" className="flex items-center gap-3 text-[#A00000] font-bold text-sm">
                  <LogOut size={16} />Se déconnecter de l'espace locataire
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── SHEETS ── */}
      <Sheet open={sheets.score} onClose={() => cl("score")} title="DÉTAIL DU SCORE ICL" tc={T.teal}>
        <div className="text-center">
          <div className="text-6xl font-black mb-2" style={{ color: scColor }}>{sc}</div>
          <p className="text-xs text-[#6A7D9E] uppercase tracking-widest mb-6">Sur 1000 points</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-[#F2F5FA] rounded-xl">
              <p className="text-xs text-[#6A7D9E] uppercase mb-1">Grade</p>
              <p className="text-lg font-black" style={{ color: scColor }}>CONFIRMÉ {profile?.scoreBadge || "B"}</p>
            </div>
            <div className="p-3 bg-[#F2F5FA] rounded-xl">
              <p className="text-xs text-[#6A7D9E] uppercase mb-1">Fiabilité</p>
              <p className="text-lg font-black text-[#0D2B6E]">{profile?.tauxPaiement12m || 98}%</p>
            </div>
          </div>
          <button onClick={() => cl("score")} className="w-full bg-[#0D2B6E] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest">J'ai compris</button>
        </div>
      </Sheet>

      <Sheet open={sheets.notifs} onClose={() => cl("notifs")} title="NOTIFICATIONS" tc={T.navy}>
        <div className="space-y-3">
          {[["SMS", "Alertes loyer & quittances"], ["WhatsApp", "Notifications importantes"], ["Email", "Rapports mensuels"]].map(([l, s], i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F2F5FA] rounded-xl">
              <div>
                <p className="text-sm font-bold text-[#0D2B6E]">{l}</p>
                <p className="text-xs text-[#6A7D9E]">{s}</p>
              </div>
              <div className="w-10 h-6 bg-[#0D2B6E] rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheets.export} onClose={() => cl("export")} title="EXPORT CERTIFIÉ" tc={T.navy}>
        <div className="space-y-4">
          <p className="text-sm text-[#6A7D9E]">Générez un relevé certifié de vos 36 derniers mois de paiement, valable pour les banques et institutions.</p>
          <ModuleCard icon="📊" label="Export PDF — 12 mois" color={T.navy} bg={T.navyPale} />
          <ModuleCard icon="📊" label="Export PDF — 24 mois" color={T.teal} bg={T.tealPale} />
          <ModuleCard icon="📊" label="Export PDF — 36 mois" color={T.green} bg={T.greenPale} />
        </div>
      </Sheet>

      <Sheet open={sheets.caution} onClose={() => cl("caution")} title="MA CAUTION" tc={T.teal}>
        {data?.caution ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-[#E8F5EE] rounded-xl">
              <p className="text-3xl font-black text-[#1A7A3C]">{fmt(data.caution.montant)} F</p>
              <p className="text-xs text-[#1A7A3C] uppercase tracking-widest mt-1">Séquestrée CDC-CI</p>
            </div>
            <InfoRow label="Date dépôt" value={data.caution.dateDepot ? new Date(data.caution.dateDepot).toLocaleDateString("fr-FR") : "—"} />
            <InfoRow label="Statut" value={data.caution.statut || "Séquestrée"} color={T.green} />
          </div>
        ) : (
          <div className="text-center py-8 text-[#6A7D9E]">
            <p className="text-3xl mb-2">🔒</p>
            <p className="text-sm font-medium">Aucune caution enregistrée pour ce bail.</p>
          </div>
        )}
      </Sheet>

    </div>
  );
}
