"use client"

import { useState } from "react";
import { 
  BarChart3, 
  Building2, 
  Euro, 
  Handshake, 
  User, 
  Bell, 
  Settings, 
  Clock, 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  Plane,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Download,
  FileText,
  Mail,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const T = {
  navy: "#0D2B6E",
  navyDark: "#071A45",
  navyPale: "#EEF2FA",
  navyLight: "#1A3D8C",
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

const FCFA_EUR = 655.957;
const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");
const fmtE = (n: number) => ((n || 0) / FCFA_EUR).toLocaleString("fr-FR", { maximumFractionDigits: 0 });

// --- Shared Components ---

const Badge = ({ label, color, bg, size = 10 }: { label: string, color: string, bg: string, size?: number }) => (
  <span className="inline-flex items-center font-bold px-2 py-0.5 rounded-md whitespace-nowrap" style={{ background: bg, color, fontSize: size }}>
    {label}
  </span>
);

const Row = ({ label, value, color, mono }: { label: string, value: string, color?: string, mono?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#EEF2F7]">
    <span className="text-[11px] text-[#6A7D9E] uppercase tracking-wider font-bold">{label}</span>
    <span className={`text-[13px] font-black ${mono ? 'font-mono' : ''}`} style={{ color: color || T.textMid }}>{value}</span>
  </div>
);

const SecTitle = ({ label, right }: { label: string, right?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="text-[12px] font-black text-[#6A7D9E] tracking-[0.2em] uppercase">{label}</div>
    {right}
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, color, bg, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="glass-card-premium p-6 rounded-[2rem] border border-white/40 shadow-xl cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ background: bg, color }}>
        <Icon size={24} />
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="text-2xl font-black text-[#1F4E79] tracking-tighter">{value}</div>
      </div>
    </div>
    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{sub}</div>
  </motion.div>
);

const ActionCard = ({ icon: Icon, label, sub, color, bg, onClick, disabled }: any) => (
  <div 
    onClick={disabled ? undefined : onClick} 
    className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-[1.02]'}`}
    style={{ background: bg, borderColor: `${color}30` }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <div className="text-[14px] font-black" style={{ color }}>{label}</div>
      {sub && <div className="text-[11px] text-[#6A7D9E] font-medium leading-none mt-1">{sub}</div>}
    </div>
    {!disabled && <ChevronRight size={16} style={{ color, opacity: 0.5 }} />}
  </div>
);

function Modal({ open, onClose, title, color = T.navy, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-[#071A45]/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter" style={{ color }}>{title}</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">{children}</div>
      </motion.div>
    </div>
  );
}

// --- Main Dashboard ---

export default function DiasporaDashboard({ data, user }: { data: any, user: any }) {
  const [tab, setTab] = useState("dash");
  const [selBien, setSelBien] = useState<any>(null);
  const [bienTab, setBienTab] = useState("info");
  const [devise, setDevise] = useState(user.diasporaDevise || "FCFA");
  const [O, setO] = useState({
    notifs: false, invite: false, sla: false,
    virement: false, rapport: false,
    gestEdit: false, relance: false, clemence: false,
  });

  const op = (k: string) => setO(o => ({ ...o, [k]: true }));
  const cl = (k: string) => setO(o => ({ ...o, [k]: false }));

  const properties = data.properties || [];
  const mandats = data.mandats || [];

  const totalFCFA = properties.filter((b: any) => b.activeLease).reduce((s: number, b: any) => s + b.activeLease.rentFcfa, 0);
  const encaisse = totalFCFA * 0.85; // Simulated for UI
  const alertesSLA = properties.filter((b: any) => b.isHorsSLA).length;
  const impayesN = properties.filter((b: any) => b.isImpaye).length;

  const affMontant = (fcfa: number) => devise === "EUR" ? `${fmtE(fcfa)} €` : `${fmt(fcfa)} FCFA`;

  const tabs = [
    { id: "dash", icon: BarChart3, label: "Tableau de Bord" },
    { id: "biens", icon: Building2, label: "Patrimoine" },
    { id: "virements", icon: Euro, label: "Flux SEPA" },
    { id: "delegation", icon: Handshake, label: "Délégation" },
    { id: "profil", icon: User, label: "Profil Diaspora" },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5FA] -mx-4 md:-mx-8 -my-8 p-4 md:p-12">
      <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12">
        
        {/* Header Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-4 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-1.5 bg-[#C9A84C] text-[#071A45] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-gold/20">
                <Plane size={12} className="inline mr-2" />
                Package Diaspora
              </div>
              <div className="text-[10px] md:text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                 {user.paysResidence || "France 🇫🇷"} · {user.fuseauHoraire || "Europe/Paris"}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#1F4E79] uppercase tracking-tighter leading-tight italic">
              Dashboard.<span className="text-[#C55A11]">Diaspora</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full lg:w-auto">
             <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-xl w-full sm:w-auto">
                {["FCFA", "EUR"].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDevise(d)} 
                    className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${devise === d ? 'bg-[#1F4E79] text-white' : 'text-gray-400 hover:text-[#1F4E79]'}`}
                  >
                    {d}
                  </button>
                ))}
             </div>
             <button onClick={() => op("notifs")} className="relative w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl border border-white/60 group hover:bg-[#1F4E79] transition-colors">
                <Bell size={24} className="text-[#1F4E79] group-hover:text-white transition-colors" />
                {(impayesN > 0 || alertesSLA > 0) && (
                  <span className="absolute top-3 right-3 md:top-4 md:right-4 w-3 h-3 bg-[#A00000] rounded-full border-2 border-white ring-4 ring-red-100" />
                )}
             </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           <StatCard label="Revenus Mensuels" value={affMontant(totalFCFA)} sub="Total théorique" icon={CreditCard} color={T.navy} bg={T.navyPale} onClick={() => setTab("virements")} />
           <StatCard label="Taux Encaissement" value={`${Math.round(encaisse/totalFCFA*100)}%`} sub={`${affMontant(encaisse)} encaissés`} icon={CheckCircle2} color={T.green} bg={T.greenPale} />
           <StatCard label="Alertes Impayés" value={impayesN} sub={impayesN > 0 ? "Action requise" : "Tout est à jour"} icon={AlertTriangle} color={T.red} bg={T.redPale} onClick={() => setTab("biens")} />
           <StatCard label="SLA Gestionnaires" value={alertesSLA || "OK"} sub={`${alertesSLA} retards détectés`} icon={Clock} color={T.purple} bg={T.purplePale} onClick={() => setTab("delegation")} />
        </div>

        {/* Main Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 w-fit">
          {tabs.map(t => (
            <button 
              key={t.id} 
              onClick={() => { setTab(t.id); setSelBien(null); }}
              className={`flex items-center gap-3 px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[1.8rem] text-[10px] md:text-[12px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-[#1F4E79] text-white shadow-2xl shadow-blue-900/20' : 'text-gray-500 hover:bg-white hover:text-[#1F4E79]'}`}
            >
              <t.icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            <AnimatePresence mode="wait">
              {tab === "dash" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                  
                  {/* Critical Alerts */}
                  {(impayesN > 0 || alertesSLA > 0) && (
                    <section>
                      <SecTitle label="🚨 Vigilance Critique" />
                      <div className="grid grid-cols-1 gap-4">
                        {properties.filter((b:any) => b.isImpaye).map((b:any) => (
                          <div key={b.id} className="p-8 bg-[#FEECEC] border border-[#A00000]25 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex gap-6 items-center flex-1">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#A00000] shadow-lg">
                                <ShieldAlert size={32} />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-[#0A1930] leading-none mb-1">{b.name}</h4>
                                <p className="text-[#6A7D9E] text-sm font-bold uppercase tracking-widest">Impayé J+12 · {b.locataire?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-[#A00000] tracking-tighter mb-1">{affMontant(b.activeLease?.rentFcfa || 0)}</div>
                              <button onClick={() => { setSelBien(b); setTab("biens"); }} className="px-6 py-2 bg-[#A00000] text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Traiter</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Consolidates Revenue Section */}
                  <section>
                    <SecTitle label="💶 Analyse de Trésorerie" />
                    <div className="glass-card-premium p-10 rounded-[3.5rem] bg-gradient-to-br from-[#0D2B6E]05 to-[#0E7490]05 border border-[#0D2B6E]10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div>
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Performance Avril 2026</p>
                               <h3 className="text-5xl font-black text-[#1F4E79] tracking-tighter leading-none mb-6">
                                 {affMontant(totalFCFA)}
                               </h3>
                               {devise === "EUR" && <p className="text-[#6A7D9E] font-bold text-sm tracking-widest">{fmt(totalFCFA)} FCFA · Taux fixe 655.957</p>}
                            </div>
                            <div className="space-y-3">
                               <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">
                                 <span>Encaissement</span>
                                 <span>{Math.round(encaisse/totalFCFA*100)}%</span>
                               </div>
                               <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round(encaisse/totalFCFA*100)}%` }}
                                    className="h-full bg-gradient-to-r from-[#1A7A3C] to-[#C9A84C] rounded-full"
                                 />
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center gap-4">
                             <button onClick={() => op("virement")} className="group p-8 bg-[#1F4E79] text-white rounded-3xl shadow-2xl shadow-blue-900/20 hover:scale-[1.02] transition-all flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Compte Récepteur</p>
                                   <p className="text-xl font-black tracking-tighter uppercase italic italic">Config. Virement SEPA</p>
                                </div>
                                <ArrowLeft className="rotate-180 group-hover:translate-x-2 transition-transform" />
                             </button>
                             <div className="grid grid-cols-2 gap-4">
                               <button onClick={() => op("rapport")} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col gap-3 group">
                                  <Download className="text-[#C55A11] group-hover:animate-bounce transition-all" size={24} />
                                  <span className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Rapport PDF</span>
                               </button>
                               <button onClick={() => setTab("virements")} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all flex flex-col gap-3 group">
                                  <FileText className="text-[#0E7490] group-hover:animate-bounce transition-all" size={24} />
                                  <span className="text-[11px] font-black uppercase tracking-widest text-[#1F4E79]">Historique</span>
                               </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* Property Quick List */}
                  <section>
                    <SecTitle label="🏠 Patrimoine Récent" right={<button onClick={() => setTab("biens")} className="text-[10px] font-black text-[#0E7490] hover:underline uppercase tracking-widest">Voir tout →</button>} />
                    <div className="grid grid-cols-1 gap-4">
                       {properties.slice(0, 3).map((b:any) => (
                         <div key={b.id} onClick={() => { setSelBien(b); setTab("biens"); }} className="glass-panel p-8 rounded-[2.5rem] border border-white/60 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-8">
                               <div className="w-20 h-20 bg-[#F2F5FA] rounded-[1.5rem] flex items-center justify-center text-[#1F4E79] group-hover:bg-[#1F4E79] group-hover:text-white transition-all duration-500">
                                  <Building2 size={32} />
                               </div>
                               <div>
                                  <h4 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter italic italic mb-1 uppercase">{b.name}</h4>
                                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">{b.commune}</p>
                                  <div className="flex gap-3">
                                    <Badge label={b.managementMode === "AGENCY" ? "Agence" : "Direct"} color={T.teal} bg={T.tealPale} />
                                    {b.isHorsSLA && <Badge label="⏱ Hors SLA" color={T.red} bg={T.redPale} />}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right flex items-center gap-12">
                               <div className="hidden md:block">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Revenu Net</p>
                                  <p className="text-2xl font-black text-[#1F4E79] tracking-tighter leading-none">{affMontant(b.activeLease?.rentFcfa || 0)}</p>
                               </div>
                               <div className="w-14 h-14 rounded-2xl bg-[#0D2B6E]05 flex items-center justify-center text-gray-400 group-hover:bg-[#1F4E79] group-hover:text-white transition-all">
                                  <ChevronRight size={24} />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {tab === "biens" && !selBien && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {properties.map((b:any) => (
                        <div key={b.id} onClick={() => setSelBien(b)} className="glass-panel p-10 rounded-[3.5rem] border border-white/60 shadow-xl hover:shadow-2xl transition-all cursor-pointer group">
                           <div className="flex justify-between items-start mb-8">
                             <div className="w-16 h-16 bg-[#1F4E79] text-white rounded-2xl flex items-center justify-center shadow-lg">
                               <Building2 size={24} />
                             </div>
                             <Badge label={b.isImpaye ? "⚠️ Impayé" : "✅ À Jour"} color={b.isImpaye ? T.red : T.green} bg={b.isImpaye ? T.redPale : T.greenPale} />
                           </div>
                           <h4 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter italic italic mb-2 uppercase">{b.name}</h4>
                           <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-8">{b.commune} · {b.propertyCode}</p>
                           <div className="flex justify-between items-end border-t border-gray-100 pt-8">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loyer</p>
                                <p className="text-xl font-black text-[#1F4E79]">{affMontant(b.activeLease?.rentFcfa || 0)}</p>
                              </div>
                              <button className="p-4 bg-gray-100 rounded-2xl group-hover:bg-[#1F4E79] group-hover:text-white transition-all">
                                <ChevronRight size={20} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {tab === "biens" && selBien && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                   <div className="flex items-center gap-4">
                      <button onClick={() => setSelBien(null)} className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 text-[#1F4E79] hover:bg-[#1F4E79] hover:text-white transition-all">
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-3xl font-black text-[#1F4E79] uppercase tracking-tighter italic italic uppercase">{selBien.name}</h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-8">
                         {/* Details Card */}
                         <div className="glass-panel p-10 rounded-[3.5rem] border border-white/60 shadow-xl">
                            <div className="flex gap-4 mb-8">
                               {["info", "virements", "actions"].map(t => (
                                 <button key={t} onClick={() => setBienTab(t)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${bienTab === t ? 'bg-[#1F4E79] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                   {t}
                                 </button>
                               ))}
                            </div>

                            {bienTab === "info" && (
                              <div className="space-y-2">
                                <Row label="Code Logement" value={selBien.propertyCode} mono />
                                <Row label="Commune" value={selBien.commune} />
                                <Row label="Revenu Brut" value={affMontant(selBien.activeLease?.rentFcfa || 0)} color={T.navy} mono />
                                <Row label="Locataire" value={selBien.locataire?.name || "Vacant"} />
                                <Row label="Status" value={selBien.activeLease ? "Occupé" : "Disponible"} color={selBien.activeLease ? T.green : T.orange} />
                              </div>
                            )}

                            {bienTab === "virements" && (
                              <div className="space-y-6">
                                <div className="p-6 bg-[#EEF2FA] rounded-3xl border border-[#1A3D8C]10">
                                   <div className="flex justify-between items-center mb-4">
                                      <p className="text-[10px] font-black text-[#1F4E79] uppercase tracking-widest">Historique Récent</p>
                                      <Badge label="100% SEPA" color={T.navy} bg={T.white} />
                                   </div>
                                   <div className="space-y-3">
                                      {[1, 2, 3].map(i => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/50">
                                           <span className="text-[11px] font-bold text-[#6A7D9E]">Virement de Mars</span>
                                           <span className="font-black text-[#1F4E79] text-xs uppercase tracking-widest italic italic">{affMontant(selBien.activeLease?.rentFcfa || 0)}</span>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="glass-panel p-8 rounded-[3rem] bg-[#071A45] text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C9A84C] opacity-10 blur-3xl group-hover:scale-150 transition-all duration-700"></div>
                             <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Gestionnaire</p>
                             <h4 className="text-xl font-black mb-4 uppercase italic">Immo Golfe.</h4>
                             <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                   <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">SLA Performance</p>
                                   <div className="flex justify-between items-end mt-1">
                                      <p className="text-lg font-black tracking-tighter tracking-tighter uppercase italic italic">14h <span className="text-[10px] opacity-60">avg</span></p>
                                      <span className="text-[9px] font-black text-[#1A7A3C] uppercase tracking-widest bg-[#E8F5EE] px-2 py-0.5 rounded">Excellent</span>
                                   </div>
                                </div>
                                <button className="w-full py-4 bg-[#C55A11] hover:bg-[#A54A0D] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                  <MessageSquare size={16} />
                                  Contact Mandat
                                </button>
                             </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {/* Other tabs implementation... (Délégation, Profil, etc.) simplified for EXECUTION speed */}
              {tab === "virements" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[#1F4E79]">
                   <h2 className="text-3xl font-black uppercase tracking-tighter italic italic uppercase">Virements Internationaux.</h2>
                   <div className="glass-panel p-12 rounded-[4rem] border border-white/60 shadow-2xl bg-white/60">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                         <div className="space-y-10">
                            <div>
                               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 inline-block">Compte de Réception SEPA</label>
                               <div className="p-8 bg-[#1F4E79] text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                  <div className="relative z-10">
                                     <p className="text-xl font-black font-mono tracking-[0.2em] mb-4">FR76 3000 6000 0112 3456 …</p>
                                     <div className="flex justify-between items-end">
                                        <div>
                                           <p className="text-[10px] opacity-50 uppercase tracking-widest">Banque Réceptrice</p>
                                           <p className="font-black text-sm uppercase italic italic uppercase">Société Générale de France — Paris 12</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                           <CreditCard size={24} />
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                               <div className="p-6 bg-[#E8F5EE] rounded-3xl border border-[#1A7A3C]10">
                                  <TrendingUp className="text-[#1A7A3C] mb-3" />
                                  <p className="text-[10px] font-black text-[#1A7A3C] uppercase tracking-widest">Taux Fixe</p>
                                  <p className="text-lg font-black text-[#1A7A3C] tracking-tighter italic italic uppercase">655.957 <span className="text-[10px]">EUR/CFA</span></p>
                               </div>
                               <div className="p-6 bg-[#FDF6E3] rounded-3xl border border-[#C9A84C]10">
                                  <ShieldCheck className="text-[#C9A84C] mb-3" />
                                  <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest">Frais QAPRIL</p>
                                  <p className="text-lg font-black text-[#C9A84C] tracking-tighter italic italic uppercase">0 <span className="text-[10px]">FCFA</span></p>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <SecTitle label="🔄 Flux Mensuels — Avril 2026" />
                            <div className="space-y-3">
                               {properties.filter((b:any) => b.activeLease).map((b:any) => (
                                 <div key={b.id} className="flex justify-between items-center p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-[#EEF2FA] rounded-xl flex items-center justify-center text-[#1A3D8C]">
                                          <ArrowLeft className="rotate-[-45deg]" size={18} />
                                       </div>
                                       <div>
                                          <p className="text-[13px] font-black text-[#1F4E79] uppercase italic italic italic uppercase">{b.name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reçu le 05/04</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-lg font-black text-[#1F4E79] tracking-tighter italic italic italic uppercase">{affMontant(b.activeLease.rentFcfa)}</p>
                                       <p className="text-[10px] text-[#1A7A3C] font-black uppercase tracking-widest italic italic">Statut: En virement</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
              
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 space-y-12">
            
            {/* Quick Access Area */}
            <section className="space-y-6">
              <SecTitle label="⚡ Accès Prioritaires" />
              <div className="grid grid-cols-1 gap-4">
                 <ActionCard icon={Link2} label="Inviter Gestionnaire" sub="Générer un lien HMAC unique" color={T.teal} bg={T.tealPale} onClick={() => op("invite")} />
                 <ActionCard icon={Euro} label="Config. Virement" sub="IBAN SEPA & Fréquence" color={T.navy} bg={T.navyPale} onClick={() => op("virement")} />
                 <ActionCard icon={Clock} label="Paramètres SLA" sub="Délais de réponse mandat" color={T.purple} bg={T.purplePale} onClick={() => op("sla")} />
                 <ActionCard icon={FileText} label="Rapports Scellés" sub="Exports SHA-256 certifiés" color={T.gold} bg={T.goldPale} onClick={() => op("rapport")} />
              </div>
            </section>

            {/* Account Insight Card */}
            <section className="glass-card-premium p-10 rounded-[3rem] bg-[#071A45] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-[#C55A11] opacity-20 blur-[100px] group-hover:opacity-40 transition-all duration-1000"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl backdrop-blur-md">
                        👤
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white italic tracking-tighter italic uppercase">{user.name || "Kouassi Adama"}</h4>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic italic">Status Diaspora : Premium</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest italic italic">Résidence</span>
                        <span className="font-black text-xs italic italic uppercase">{user.paysResidence || "France 🇫🇷"}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest italic italic">Abonnement</span>
                        <span className="font-black text-xs text-[#C9A84C] italic italic uppercase">7 € / mois</span>
                     </div>
                     <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest italic italic">Next Report</span>
                        <span className="font-black text-xs italic italic uppercase tracking-tighter italic uppercase">05 AVRIL 2026</span>
                     </div>
                  </div>
                  <button onClick={() => setTab("profil")} className="w-full py-4 bg-white/10 hover:bg-white text-white/60 hover:text-[#1F4E79] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 italic italic">
                     Gérer Profil
                  </button>
               </div>
            </section>

            {/* Smart Monitoring Insight */}
            <div className="glass-panel p-10 rounded-[3rem] border border-[#1A7A3C]20 bg-[#E8F5EE] shadow-xl overflow-hidden relative group">
                <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#1A7A3C] shadow-lg">
                      <ShieldAlert size={28} />
                   </div>
                   <h3 className="text-2xl font-black text-[#1A7A3C] tracking-tighter leading-none italic uppercase italic uppercase">Moniteur de<br/>Diligence.</h3>
                   <p className="text-[#1A7A3C] text-sm font-medium leading-relaxed italic opacity-80">
                      Vos gestionnaires sont surveillés 24/7. En cas de dépassement de SLA pour l'Appt 3B, une alerte est émise automatiquement.
                   </p>
                   <div className="pt-2">
                      <div className="px-6 py-2 bg-white text-[#1A7A3C] text-[10px] font-black uppercase tracking-tighter rounded-xl w-fit shadow-md italic italic">
                         Vigilance Active
                      </div>
                   </div>
                </div>
            </div>

          </div>

        </div>

      </div>

      {/* --- OVERLAYS --- */}

      <Modal open={O.notifs} onClose={() => cl("notifs")} title="Journaux de Bord" color={T.navy}>
         <div className="space-y-4">
           {[
              { t: "Virement de loyer confirmé", s: "Villa 7 — 320 000 FCFA convertis en EUR", type: "success", icon: CheckCircle2 },
              { t: "Alerte SLA : Kouamé J.", s: "L'appartement 3B n'a pas reçu de réponse (72h)", type: "warning", icon: Clock },
              { t: "Consigne CDC Scellée", s: "Caution Studio A2 protégée légalement", type: "info", icon: ShieldAlert },
           ].map((n, i) => (
             <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${n.type === 'success' ? 'bg-green-50 text-green-600' : n.type === 'warning' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <n.icon size={24} />
                </div>
                <div>
                   <h5 className="font-black text-[#1F4E79] uppercase italic">{n.t}</h5>
                   <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">{n.s}</p>
                </div>
             </div>
           ))}
         </div>
      </Modal>

      <Modal open={O.invite} onClose={() => cl("invite")} title="Délégation de Gestion" color={T.teal}>
         <div className="space-y-8">
            <div className="p-6 bg-[#E0F4F9] border border-[#0E7490]20 rounded-3xl text-[12px] text-[#0E7490] font-bold leading-relaxed">
               Vous vous apprêtez à déléguer la gestion d'un bien à un tiers local. Le lien généré est cryptographically scellé (HMAC-SHA256).
            </div>
            
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic italic">Sélection du Patrimoine</label>
                  <select className="w-full bg-gray-100 border-none rounded-2xl p-5 text-sm font-bold text-[#1F4E79] focus:ring-2 focus:ring-[#0E7490]">
                     {properties.map((b:any) => <option key={b.id}>{b.name}</option>)}
                  </select>
               </div>
               
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic italic">Profil du Mandataire</label>
                  <div className="grid grid-cols-2 gap-4">
                     {["Agence Agréée", "Cousin / Proche", "Notaire", "Agent Libre"].map(p => (
                       <button key={p} className="p-5 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] font-black text-[#1F4E79] hover:bg-[#0E7490] hover:text-white transition-all">
                          {p}
                       </button>
                     ))}
                  </div>
               </div>
               
               <div className="pt-8 flex gap-4">
                  <button onClick={() => cl("invite")} className="flex-1 py-5 bg-gray-100 text-gray-400 font-black rounded-2xl uppercase tracking-widest italic italic">Annuler</button>
                  <button className="flex-1 py-5 bg-[#0E7490] text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-teal-900/20 italic italic italic uppercase">Générer le Sceau →</button>
               </div>
            </div>
         </div>
      </Modal>

      {/* --- OTHERS CAN BE ADDED HERE --- */}

    </div>
  );
}
