"use client"

import { useState, useMemo } from "react"
import {
  Home, Building2, Receipt, Lock, User,
  ChevronRight, AlertTriangle, Bell, LogOut,
  Menu, X, TrendingUp, CheckCircle
} from "lucide-react"

// ── THEME ──────────────────────────────────────────────────────────────────
const T = {
  navy: "#0D2B6E", navyDark: "#071A45", navyPale: "#EEF2FA",
  green: "#1A7A3C", greenLight: "#22A050", greenPale: "#E8F5EE",
  orange: "#C05B00", orangePale: "#FFF3E0",
  red: "#A00000", redPale: "#FEECEC",
  teal: "#0E7490", tealPale: "#E0F4F9",
  gold: "#C9A84C", goldPale: "#FDF6E3",
  grey1: "#F2F5FA", grey2: "#D6DCE8", grey3: "#8FA0BC", grey4: "#4A5B7A",
  textMid: "#2D3F5E", textLight: "#6A7D9E",
};

const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

// ── NAV MODULES ──────────────────────────────────────────────────────────────
const MODULES = [
  { id: "dashboard", icon: <Home size={18} />,     label: "Vue d'ensemble",  desc: "KPIs & alertes",        color: T.navy },
  { id: "biens",     icon: <Building2 size={18} />, label: "Mon Patrimoine",  desc: "Biens & unités",         color: T.teal },
  { id: "quittances",icon: <Receipt size={18} />,   label: "Quittances",      desc: "Encaissements",          color: T.green },
  { id: "cautions",  icon: <Lock size={18} />,      label: "Cautions",        desc: "Séquestre CDC-CI",       color: T.gold },
  { id: "profil",    icon: <User size={18} />,      label: "Mon Profil",      desc: "Compte & paramètres",    color: T.grey4 },
];

// ── MICRO COMPONENTS ────────────────────────────────────────────────────────
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

const StatCard = ({ label, value, icon, color, bg, onClick }: any) => (
  <div onClick={onClick}
    className={`rounded-2xl p-4 border flex flex-col gap-1 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
    style={{ background: bg || T.grey1, borderColor: (color || T.grey2) + "40" }}>
    <div className="text-2xl">{icon}</div>
    <div className="text-xl font-black" style={{ color: color || T.navy }}>{value}</div>
    <div className="text-[10px] font-bold text-[#6A7D9E] uppercase tracking-wider">{label}</div>
  </div>
);

const ModuleCard = ({ icon, label, sub, color, bg, onClick }: any) => (
  <div onClick={onClick}
    className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-md" : ""} shadow-sm`}
    style={{ background: bg, borderColor: color + "20" }}>
    <span className="text-2xl">{icon}</span>
    <div className="flex-1">
      <div className="text-sm font-bold" style={{ color }}>{label}</div>
      {sub && <div className="text-[11px] text-[#6A7D9E] mt-0.5">{sub}</div>}
    </div>
    {onClick && <ChevronRight size={16} style={{ color, opacity: 0.4 }} />}
  </div>
);

const SectionTitle = ({ label, action }: any) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xs font-black text-[#6A7D9E] uppercase tracking-[0.15em]">{label}</h3>
    {action}
  </div>
);

// ── SHEET (MODAL) ─────────────────────────────────────────────────────────────
const Sheet = ({ open, onClose, title, tc, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 z-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: tc || T.navy }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export function OwnerPortalDashboard({ user, properties: initialProperties }: { user: any, properties: any[] }) {
  const [tab, setTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEntite, setSelectedEntite] = useState<any>(null);
  const [selectedUnite, setSelectedUnite] = useState<any>(null);
  const [unitTab, setUnitTab] = useState("info");
  const [filterBiens, setFilterBiens] = useState("tous");
  const [sheets, setSheets] = useState<Record<string, boolean>>({});

  const op = (k: string) => setSheets(s => ({ ...s, [k]: true }));
  const cl = (k: string) => setSheets(s => ({ ...s, [k]: false }));

  const go = (t: string) => {
    setTab(t); setSidebarOpen(false);
    setSelectedEntite(null); setSelectedUnite(null); setUnitTab("info");
  };

  // Data Processing
  const entities = useMemo(() => {
    const grouped = initialProperties.reduce((acc: any, p: any) => {
      const key = p.address;
      if (!acc[key]) {
        acc[key] = {
          id: `E-${p.id}`, code: p.propertyCode || `IMM-${p.id}`,
          nom: p.name || p.address, adresse: p.address, commune: p.commune,
          type: p.propertyType === "building" ? "immeuble" : p.propertyType === "court" ? "cour" : "standalone",
          unites: []
        };
      }
      acc[key].unites.push({
        ...p,
        label: p.name || "Unité",
        statut: p.status === "active" ? "occupé" : "vacant",
        paiement: p.leases?.[0]?.statutFiscal === "A_JOUR" ? "À jour" : p.leases?.[0]?.statutFiscal === "EN_RETARD" ? "Impayé" : "—",
        loyer: p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0,
        locataire: p.leases?.[0]?.tenant?.fullName || p.leases?.[0]?.tenant?.name
      });
      return acc;
    }, {});
    return Object.values(grouped).map((e: any) => {
      if (e.unites.length > 1 && e.type === "standalone") e.type = "immeuble";
      return e;
    });
  }, [initialProperties]);

  const stats = useMemo(() => {
    const all = entities.flatMap((e: any) => e.unites);
    const totalLoyers = all.filter((u: any) => u.statut === "occupé").reduce((s: number, u: any) => s + u.loyer, 0);
    const encaisse = all.filter((u: any) => u.paiement === "À jour").reduce((s: number, u: any) => s + u.loyer, 0);
    const impayesN = all.filter((u: any) => u.paiement === "Impayé").length;
    const vacants = all.filter((u: any) => u.statut === "vacant").length;
    return { totalLoyers, encaisse, impayesN, vacants, total: all.length };
  }, [entities]);

  const entiteStats = (e: any) => {
    const us = e.unites || [];
    return {
      total: us.length,
      occupes: us.filter((u: any) => u.statut === "occupé").length,
      vacants: us.filter((u: any) => u.statut === "vacant").length,
      impayes: us.filter((u: any) => u.paiement === "Impayé").length,
      loyers: us.reduce((s: number, u: any) => s + u.loyer, 0)
    };
  };

  const entiteIcon = (type: string) => type === "immeuble" ? "🏢" : type === "cour" ? "🏡" : "🏠";
  const pColor = (u: any) => u.paiement === "Impayé" ? T.red : u.statut === "vacant" ? T.grey3 : T.green;
  const activeModule = MODULES.find(m => m.id === tab) || MODULES[0];
  const tauxEncaissement = stats.totalLoyers > 0 ? Math.round((stats.encaisse / stats.totalLoyers) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex">

      {/* ── SIDEBAR ── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-[#D6DCE8] z-50
        flex flex-col transition-transform duration-300 shadow-xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Sidebar header */}
        <div className="p-6 border-b border-[#EEF2F7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#071A45] to-[#1A7A3C] flex items-center justify-center text-white font-black text-lg">
              {user?.name?.[0] || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#0D2B6E] truncate">{user?.name || "Propriétaire"}</p>
              <p className="text-[10px] text-[#6A7D9E] font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#E8F5EE]">
            <TrendingUp size={12} style={{ color: T.green }} />
            <span className="text-[11px] font-black text-[#1A7A3C]">Taux encaissement : {tauxEncaissement}%</span>
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
          <button onClick={() => op("notifs")} className="w-full flex items-center gap-3 px-3 py-2 text-[#6A7D9E] hover:bg-gray-50 rounded-xl transition-colors mb-1">
            <Bell size={16} /> <span className="text-sm font-bold">Notifications</span>
          </button>
          <a href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-[#A00000] hover:bg-red-50 rounded-xl transition-colors w-full">
            <LogOut size={16} /> <span className="text-sm font-bold">Se déconnecter</span>
          </a>
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
              <span>Espace Propriétaire</span>
              <ChevronRight size={10} />
              <span style={{ color: activeModule.color }}>{activeModule.label}</span>
            </div>
            <h1 className="text-lg font-black text-[#0D2B6E]">{activeModule.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            {stats.impayesN > 0 && (
              <Badge label={`${stats.impayesN} impayé(s)`} color="white" bg={T.red} size={9} />
            )}
            <button onClick={() => op("notifs")} className="w-9 h-9 rounded-xl bg-[#EEF2FA] flex items-center justify-center text-[#0D2B6E] hover:bg-[#D6DCE8] transition-colors relative">
              <Bell size={18} />
              {stats.impayesN > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* === VUE D'ENSEMBLE === */}
          {tab === "dashboard" && (
            <div className="space-y-8 max-w-5xl">

              {/* Alert impayés */}
              {stats.impayesN > 0 && (
                <div className="bg-[#FEECEC] border border-red-200 rounded-2xl p-5 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-[#A00000] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-black text-[#A00000] text-sm mb-1">{stats.impayesN} LOYER(S) EN RETARD</h4>
                    <p className="text-sm text-[#2D3F5E] leading-relaxed">Des locataires n'ont pas encore réglé leur loyer ce mois-ci. Consultez votre patrimoine pour relancer.</p>
                  </div>
                  <button onClick={() => go("biens")} className="flex-shrink-0 bg-[#A00000] text-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                    Voir →
                  </button>
                </div>
              )}

              {/* KPI Grid */}
              <section>
                <SectionTitle label="Indicateurs financiers" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="Loyers / mois" value={`${fmt(stats.totalLoyers)} F`} icon="💰" color={T.navy} bg={T.navyPale} />
                  <StatCard label="Encaissé" value={`${fmt(stats.encaisse)} F`} icon="✅" color={T.green} bg={T.greenPale} />
                  <StatCard label="Unités vacantes" value={stats.vacants} icon="🏚" color={stats.vacants > 0 ? T.orange : T.green} bg={stats.vacants > 0 ? T.orangePale : T.greenPale} onClick={() => go("biens")} />
                  <StatCard label="Impayés" value={stats.impayesN} icon="⚠️" color={stats.impayesN > 0 ? T.red : T.green} bg={stats.impayesN > 0 ? T.redPale : T.greenPale} onClick={() => go("biens")} />
                </div>
              </section>

              {/* Taux d'encaissement */}
              <section>
                <SectionTitle label="Performance du mois" />
                <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-xs text-[#6A7D9E] font-bold uppercase tracking-wider">Taux d'encaissement</p>
                      <p className="text-3xl font-black text-[#0D2B6E]">{tauxEncaissement}<span className="text-base text-[#6A7D9E]">%</span></p>
                    </div>
                    <Badge label={tauxEncaissement === 100 ? "PARFAIT ✓" : tauxEncaissement >= 80 ? "BON" : "À AMÉLIORER"} color="white" bg={tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange} />
                  </div>
                  <div className="h-3 bg-[#F2F5FA] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${tauxEncaissement}%`, background: tauxEncaissement === 100 ? T.green : tauxEncaissement >= 80 ? T.teal : T.orange }} />
                  </div>
                  <p className="text-xs text-[#6A7D9E] mt-2">{fmt(stats.encaisse)} FCFA encaissés sur {fmt(stats.totalLoyers)} FCFA attendus</p>
                </div>
              </section>

              {/* Patrimoine preview */}
              <section>
                <SectionTitle label="Mon patrimoine (aperçu)"
                  action={<button onClick={() => go("biens")} className="text-xs font-black text-[#0D2B6E] uppercase tracking-widest">Tout voir →</button>} />
                <div className="space-y-3">
                  {entities.slice(0, 4).map((e: any) => {
                    const s = entiteStats(e);
                    return (
                      <div key={e.id} onClick={() => { setSelectedEntite(e); go("biens"); }}
                        className="bg-white rounded-2xl p-4 border border-[#D6DCE8] shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center gap-4"
                        style={{ borderLeftWidth: 4, borderLeftColor: s.impayes > 0 ? T.red : T.green }}>
                        <div className="w-10 h-10 rounded-xl bg-[#EEF2FA] flex items-center justify-center text-xl flex-shrink-0">{entiteIcon(e.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#0D2B6E] truncate">{e.nom}</p>
                          <p className="text-xs text-[#6A7D9E]">{e.unites.length} unité(s) · {e.commune}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge label={`${s.occupes} occupés`} color={T.green} bg={T.greenPale} size={8} />
                            {s.vacants > 0 && <Badge label={`${s.vacants} vacant(s)`} color={T.orange} bg={T.orangePale} size={8} />}
                            {s.impayes > 0 && <Badge label={`${s.impayes} impayé(s)`} color={T.red} bg={T.redPale} size={8} />}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-[#0D2B6E]">{fmt(s.loyers)}</p>
                          <p className="text-[9px] text-[#6A7D9E]">FCFA/mois</p>
                        </div>
                        <ChevronRight size={14} className="text-[#8FA0BC] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Modules rapides */}
              <section>
                <SectionTitle label="Accès rapides" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "biens", icon: "🏘️", label: "Patrimoine", color: T.teal },
                    { id: "quittances", icon: "🧾", label: "Quittances", color: T.green },
                    { id: "cautions", icon: "🔒", label: "Cautions", color: T.gold },
                    { id: "profil", icon: "👤", label: "Profil", color: T.grey4 },
                  ].map(m => (
                    <button key={m.id} onClick={() => go(m.id)}
                      className="bg-white border border-[#D6DCE8] rounded-2xl p-4 text-center hover:shadow-md transition-all group"
                      style={{ borderTopWidth: 3, borderTopColor: m.color }}>
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</div>
                      <p className="text-xs font-black" style={{ color: m.color }}>{m.label}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* === MON PATRIMOINE === */}
          {tab === "biens" && !selectedEntite && (
            <div className="space-y-6 max-w-4xl">
              {/* Filter chips */}
              <div className="flex gap-2 flex-wrap">
                {["tous", "occupés", "vacants", "impayés"].map(f => (
                  <button key={f} onClick={() => setFilterBiens(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filterBiens === f ? "bg-[#0D2B6E] text-white" : "bg-white border border-[#D6DCE8] text-[#6A7D9E] hover:bg-[#EEF2FA]"}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {entities.map((e: any) => {
                  const s = entiteStats(e);
                  if (filterBiens === "occupés" && s.occupes === 0) return null;
                  if (filterBiens === "vacants" && s.vacants === 0) return null;
                  if (filterBiens === "impayés" && s.impayes === 0) return null;
                  return (
                    <div key={e.id} onClick={() => setSelectedEntite(e)}
                      className="bg-white rounded-2xl p-5 border border-[#D6DCE8] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderLeftWidth: 4, borderLeftColor: s.impayes > 0 ? T.red : T.green }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#EEF2FA] flex items-center justify-center text-2xl flex-shrink-0">{entiteIcon(e.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-[#0D2B6E]">{e.nom}</p>
                          <p className="text-xs text-[#6A7D9E] mb-3">{e.adresse} · {e.commune}</p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge label={e.type} color={T.navy} bg={T.navyPale} />
                            <Badge label={`${s.total} unités`} color={T.grey4} bg={T.grey1} />
                            <Badge label={`${s.occupes} occupés`} color={T.green} bg={T.greenPale} />
                            {s.vacants > 0 && <Badge label={`${s.vacants} vacant(s)`} color={T.orange} bg={T.orangePale} />}
                            {s.impayes > 0 && <Badge label={`${s.impayes} impayé(s)`} color={T.red} bg={T.redPale} />}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-[#0D2B6E]">{fmt(s.loyers)}</p>
                          <p className="text-[9px] text-[#6A7D9E]">FCFA / mois</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === FICHE ENTITÉ === */}
          {tab === "biens" && selectedEntite && !selectedUnite && (
            <div className="space-y-6 max-w-3xl">
              <button onClick={() => setSelectedEntite(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] hover:text-[#0D2B6E] uppercase tracking-widest">
                ← Mon Patrimoine
              </button>
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#EEF2FA] flex items-center justify-center text-3xl">{entiteIcon(selectedEntite.type)}</div>
                  <div>
                    <h2 className="text-xl font-black text-[#0D2B6E]">{selectedEntite.nom}</h2>
                    <p className="text-sm text-[#6A7D9E]">{selectedEntite.adresse} · {selectedEntite.commune}</p>
                  </div>
                </div>
                <SectionTitle label="Unités locatives" />
                <div className="space-y-3">
                  {selectedEntite.unites.map((u: any) => (
                    <div key={u.id} onClick={() => { setSelectedUnite(u); setUnitTab("info"); }}
                      className="flex items-center gap-4 p-4 bg-[#F2F5FA] rounded-xl cursor-pointer hover:bg-[#EEF2FA] transition-colors border"
                      style={{ borderLeftWidth: 3, borderLeftColor: pColor(u), borderColor: "#EEF2F7" }}>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0D2B6E]">{u.name || u.label}</p>
                        <p className="text-xs text-[#6A7D9E]">{u.locataire || "Vacant"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#0D2B6E]">{fmt(u.loyer)} F</p>
                        <Badge label={u.paiement === "Impayé" ? "Impayé" : u.statut === "vacant" ? "Vacant" : "À jour"}
                          color={u.paiement === "Impayé" ? T.red : u.statut === "vacant" ? T.grey4 : T.green}
                          bg={u.paiement === "Impayé" ? T.redPale : u.statut === "vacant" ? T.grey1 : T.greenPale} size={8} />
                      </div>
                      <ChevronRight size={14} className="text-[#8FA0BC]" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[#EEF2F7]">
                  <button onClick={() => op("retirer")} className="w-full bg-[#FEECEC] text-[#A00000] border border-red-100 rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors">
                    🗑 Retirer cette entité du portefeuille
                  </button>
                  <p className="text-[9px] text-center text-[#6A7D9E] mt-2">Action irréversible · Archivage légal 10 ans</p>
                </div>
              </div>
            </div>
          )}

          {/* === FICHE UNITÉ === */}
          {tab === "biens" && selectedEntite && selectedUnite && (
            <div className="space-y-6 max-w-2xl">
              <button onClick={() => setSelectedUnite(null)} className="flex items-center gap-2 text-xs font-black text-[#6A7D9E] hover:text-[#0D2B6E] uppercase tracking-widest">
                ← {selectedEntite.nom}
              </button>
              <div className="bg-white rounded-2xl p-6 border border-[#D6DCE8] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#0D2B6E]">{selectedUnite.name || selectedUnite.label}</h2>
                    <p className="text-sm text-[#6A7D9E]">{selectedEntite.nom} · {selectedEntite.commune}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge label={selectedUnite.statut === "occupé" ? "Occupé" : "Vacant"}
                      color={selectedUnite.statut === "occupé" ? T.green : T.grey4}
                      bg={selectedUnite.statut === "occupé" ? T.greenPale : T.grey1} />
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-b border-[#EEF2F7] mb-4">
                  {["info", "bail", "locataire", "actions"].map(t => (
                    <button key={t} onClick={() => setUnitTab(t)}
                      className={`flex-1 py-2 text-xs font-bold capitalize ${unitTab === t ? "text-[#0D2B6E] border-b-2 border-[#0D2B6E]" : "text-[#6A7D9E]"}`}>
                      {t}
                    </button>
                  ))}
                </div>

                {unitTab === "info" && (
                  <div>
                    <InfoRow label="Code" value={selectedUnite.propertyCode || "—"} />
                    <InfoRow label="Loyer" value={`${fmt(selectedUnite.loyer)} FCFA`} color={T.navy} />
                    <InfoRow label="Type" value={selectedUnite.propertyType || "—"} />
                    <InfoRow label="Commune" value={selectedEntite.commune} />
                  </div>
                )}
                {unitTab === "bail" && (
                  <div>
                    {selectedUnite.leases?.[0] ? (
                      <>
                        <InfoRow label="Référence" value={selectedUnite.leases[0].leaseReference || "—"} color={T.navy} />
                        <InfoRow label="Statut" value={selectedUnite.leases[0].status || "—"} />
                        <InfoRow label="Loyer" value={`${fmt(selectedUnite.loyer)} FCFA`} />
                      </>
                    ) : <p className="text-sm text-[#6A7D9E] text-center py-4">Aucun bail actif.</p>}
                  </div>
                )}
                {unitTab === "locataire" && (
                  <div>
                    {selectedUnite.locataire ? (
                      <>
                        <InfoRow label="Nom" value={selectedUnite.locataire} />
                        <InfoRow label="Paiement" value={selectedUnite.paiement} color={selectedUnite.paiement === "À jour" ? T.green : T.red} />
                        {selectedUnite.paiement === "Impayé" && (
                          <div className="flex gap-3 mt-4">
                            <button onClick={() => op("relance")} className="flex-1 bg-[#FEECEC] text-[#A00000] border border-red-100 rounded-xl py-3 text-xs font-black uppercase">Relancer</button>
                            <button onClick={() => op("clemence")} className="flex-1 bg-[#FFF3E0] text-[#C05B00] border border-orange-100 rounded-xl py-3 text-xs font-black uppercase">Clémence</button>
                          </div>
                        )}
                      </>
                    ) : <p className="text-sm text-[#6A7D9E] text-center py-4">Unité vacante.</p>}
                  </div>
                )}
                {unitTab === "actions" && (
                  <div className="space-y-3">
                    <ModuleCard icon="🧾" label="Émettre une quittance" sub="Confirmer l'encaissement du mois" color={T.green} bg={T.greenPale} onClick={() => op("emitQuit")} />
                    <ModuleCard icon="📄" label="Voir le bail PDF" sub="Version certifiée" color={T.navy} bg={T.navyPale} />
                    <ModuleCard icon="🗑" label="Résilier le bail" sub="Procédure QAPRIL" color={T.red} bg={T.redPale} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === QUITTANCES === */}
          {tab === "quittances" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#E8F5EE] border border-green-200 rounded-2xl p-5">
                <p className="text-sm text-[#1A7A3C] leading-relaxed">🧾 Retrouvez l'ensemble des <strong>quittances certifiées</strong> émises pour vos biens. Chaque quittance est horodatée et signée SHA-256.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm p-6 text-center py-16 text-[#6A7D9E]">
                <p className="text-3xl mb-2">🧾</p>
                <p className="text-sm font-medium">Historique des quittances disponible depuis les fiches unités.</p>
                <button onClick={() => go("biens")} className="mt-4 bg-[#0D2B6E] text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#071A45] transition-colors">
                  Voir mon patrimoine →
                </button>
              </div>
            </div>
          )}

          {/* === CAUTIONS === */}
          {tab === "cautions" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-[#FDF6E3] border border-yellow-200 rounded-2xl p-5">
                <p className="text-sm text-[#C9A84C] leading-relaxed">🔒 Les <strong>cautions de vos locataires</strong> sont séquestrées sur le compte CDC-CI. La restitution est conditionnée à l'EDL de sortie.</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm p-6 text-center py-16 text-[#6A7D9E]">
                <p className="text-3xl mb-2">🔒</p>
                <p className="text-sm font-medium">Module cautions — Accès depuis les fiches de bail de chaque unité.</p>
              </div>
            </div>
          )}

          {/* === MON PROFIL === */}
          {tab === "profil" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-gradient-to-br from-[#071A45] to-[#1A7A3C] rounded-2xl p-8 text-center relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-3xl mx-auto mb-4">🏠</div>
                  <h3 className="text-xl font-black text-white uppercase mb-1">{user?.name || "Propriétaire QAPRIL"}</h3>
                  <p className="text-sm text-white/60 mb-4">{user?.email}</p>
                  <div className="flex justify-center gap-2">
                    <Badge label="KYC CERTIFIÉ" bg="#1A7A3C" color="white" size={9} />
                    <Badge label={`${entities.length} BIEN(S)`} bg="#C9A84C" color="white" size={9} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#D6DCE8] shadow-sm p-6 space-y-3">
                <SectionTitle label="Mon espace" />
                <ModuleCard icon="📊" label="Rapport financier mensuel" sub="Export PDF certifié" color={T.navy} bg={T.navyPale} />
                <ModuleCard icon="⚙️" label="Paramètres de notifications" sub="SMS, WhatsApp, Email" color={T.teal} bg={T.tealPale} onClick={() => op("notifs")} />
                <ModuleCard icon="🔒" label="Authentification & Sécurité" sub="2FA, Mot de passe" color={T.grey4} bg={T.grey1} />
              </div>
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
                <a href="/api/auth/signout" className="flex items-center gap-3 text-[#A00000] font-bold text-sm">
                  <LogOut size={16} /> Se déconnecter de l'espace propriétaire
                </a>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── SHEETS ── */}
      <Sheet open={sheets.relance} onClose={() => cl("relance")} title="RELANCER LE LOCATAIRE" tc={T.red}>
        <p className="text-sm text-[#2D3F5E] mb-4">Une relance SMS + WhatsApp sera envoyée immédiatement au locataire de <strong>{selectedUnite?.label}</strong>.</p>
        <button className="w-full bg-[#A00000] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-900 transition-colors">
          Envoyer la relance
        </button>
      </Sheet>

      <Sheet open={sheets.clemence} onClose={() => cl("clemence")} title="ACCORDER UNE CLÉMENCE (M07)" tc={T.orange}>
        <p className="text-sm text-[#2D3F5E] mb-4">Accordez un délai supplémentaire ou définissez un plan de paiement pour <strong>{selectedUnite?.locataire}</strong>.</p>
        <div className="space-y-3 mb-4">
          {["Délai 7 jours", "Délai 15 jours", "Plan paiement 2 fois"].map((opt, i) => (
            <div key={i} className="p-3 bg-[#FFF3E0] border border-orange-100 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors">
              <p className="text-sm font-bold text-[#C05B00]">{opt}</p>
            </div>
          ))}
        </div>
        <button className="w-full bg-[#C05B00] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-800 transition-colors">
          Valider la clémence
        </button>
      </Sheet>

      <Sheet open={sheets.emitQuit} onClose={() => cl("emitQuit")} title="ÉMETTRE UNE QUITTANCE" tc={T.green}>
        <p className="text-sm text-[#2D3F5E] mb-4">Confirmez l'encaissement du loyer pour <strong>{selectedUnite?.label}</strong> — <strong>{fmt(selectedUnite?.loyer)} FCFA</strong>.</p>
        <div className="bg-[#E8F5EE] rounded-xl p-4 mb-4">
          <p className="text-xs font-black text-[#1A7A3C] flex items-center gap-2"><CheckCircle size={14} /> CERTIFICATION SHA-256 AUTOMATIQUE</p>
          <p className="text-xs text-[#1A7A3C]/70 mt-1">La quittance sera horodatée et envoyée au locataire.</p>
        </div>
        <button className="w-full bg-[#1A7A3C] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition-colors">
          Confirmer & Certifier
        </button>
      </Sheet>

      <Sheet open={sheets.retirer} onClose={() => cl("retirer")} title="RETRAIT DE BIEN" tc={T.red}>
        <div className="bg-[#FEECEC] p-4 rounded-xl mb-4 space-y-1">
          <p className="text-sm font-black text-[#A00000]">⚠️ AVERTISSEMENT CRITIQUE</p>
          <p className="text-xs text-[#A00000] leading-relaxed">1. Le bien sera archivé 10 ans (DGI).<br />2. SMS + WhatsApp seront envoyés aux locataires.<br />3. Le mandat d'agence (si présent) sera résilié.</p>
        </div>
        <button className="w-full bg-[#A00000] text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-900 transition-colors mb-2">
          Confirmer le retrait
        </button>
        <button onClick={() => cl("retirer")} className="w-full bg-gray-100 text-[#6A7D9E] py-3 rounded-xl text-sm font-bold">
          Annuler
        </button>
      </Sheet>

      <Sheet open={sheets.notifs} onClose={() => cl("notifs")} title="NOTIFICATIONS" tc={T.navy}>
        <div className="space-y-3">
          {[["SMS", "Alertes loyer & impayés"], ["WhatsApp", "Notifications urgentes"], ["Email", "Rapports hebdomadaires"]].map(([l, s], i) => (
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

    </div>
  );
}
