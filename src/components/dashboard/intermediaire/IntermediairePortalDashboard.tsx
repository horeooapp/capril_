"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Building2, 
  FileText, 
  Receipt, 
  ShieldCheck, 
  User, 
  ChevronRight, 
  ArrowLeft, 
  Bell, 
  AlertTriangle, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  Plus, 
  TrendingUp,
  Search,
  MoreVertical,
  Briefcase,
  History,
  Wallet,
  MessageSquare
} from 'lucide-react'
import { emettreQuittanceIntermediaire, activerClemenceM07 } from '@/actions/intermediaire-actions'

// Tokens from qapril-intermediaire.jsx
const T = {
  navy: "#0D2B6E", navyDark: "#071A45", navyLight: "#1A3D8C", navyPale: "#EEF2FA",
  green: "#1A7A3C", greenPale: "#E8F5EE",
  orange: "#C05B00", orangePale: "#FFF3E0",
  red: "#A00000", redPale: "#FEECEC",
  gold: "#C9A84C", goldPale: "#FDF6E3",
  teal: "#0E7490", tealPale: "#E0F4F9",
  purple: "#5B21B6", purplePale: "#EDE9FE",
  white: "#FFFFFF", bg: "transparent",
  grey1: "#EEF2F7", grey2: "#D6DCE8", grey3: "#8FA0BC", grey4: "#4A5B7A",
  text: "#0A1930", textMid: "#2D3F5E", textLight: "#6A7D9E",
};

interface IntermediaireDashboardProps {
    data: any,
    session: any
}

const fmt = (v: number) => v?.toLocaleString("fr-FR") || "0"

const TabBtn = ({ id, active, icon: Icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 flex-1 py-3 transition-all ${active === id ? 'text-[#0D2B6E] scale-105' : 'text-slate-400 opacity-60'}`}
  >
    <div className={`p-2 rounded-xl ${active === id ? 'bg-[#0D2B6E]/10' : ''}`}>
      <Icon size={20} strokeWidth={active === id ? 2.5 : 2} />
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
)

const KpiCard = ({ label, value, unit, icon: Icon, color, bg, sub }: any) => (
  <div className="p-4 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[130px]" style={{ background: bg }}>
    <div className="flex justify-between items-start">
      <div className="p-2 rounded-xl bg-white/80 shadow-sm">
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{sub}</div>
    </div>
    <div className="mt-3">
      <div className="flex items-baseline gap-1">
        <div className="text-lg font-black text-slate-900 leading-none">{value}</div>
        <div className="text-[9px] font-black text-slate-400 uppercase">{unit}</div>
      </div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 truncate">{label}</div>
    </div>
  </div>
)

const SectionTitle = ({ title, sub }: { title: string, sub: string }) => (
    <div className="mb-6">
        <h2 className="text-xl font-black text-[#0D2B6E] uppercase tracking-tighter italic">{title}.</h2>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sub}</p>
    </div>
)

const Sheet = ({ open, onClose, title, children }: any) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
        />
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] p-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-lg font-black text-[#0D2B6E] uppercase tracking-tight italic">{title}</h3>
             <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><Plus className="rotate-45" size={18} /></button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default function IntermediairePortalDashboard({ data: dashboardData, session }: IntermediaireDashboardProps) {
    const [tab, setTab] = useState('dashboard')
    const [sheet, setSheet] = useState<string | null>(null)
    const [selectedProperty, setSelectedProperty] = useState<any>(null)
    const [selectedMandat, setSelectedMandat] = useState<any>(null)

    const data = dashboardData?.success ? dashboardData.data : { stats: {}, mandates: [], properties: [] }
    const stats = data.stats || {}
    const properties = data.properties || []
    const mandates = data.mandates || []

    const impayes = properties.filter((p: any) => p.leases?.some((l: any) => l.receipts?.length === 0 || l.receipts[0]?.status !== 'paid'))

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Mesh Background (Admin Style) */}
            <div className="fixed inset-0 bg-mesh -z-20 opacity-70"></div>
            <div className="fixed inset-0 bg-ivory-pattern opacity-30 -z-10 animate-pulse-slow"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12 relative z-10">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div>
                        <p className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.3em] mb-2">Module de Supervision • Intermédiaire</p>
                        <h1 className="text-4xl md:text-5xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">
                            Bonjour, {session?.user?.name || "Gérant"}.
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-3 border-l-2 border-primary pl-4 uppercase tracking-widest flex items-center gap-2">
                            {session?.user?.isCertified ? "Gestionnaire Agréé" : "Gestionnaire Mandaté"}
                        </p>
                    </div>
                    <button onClick={() => setTab('notifs')} 
                        className="w-12 h-12 rounded-[1.25rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-900 hover:bg-gray-50 transition-all relative group">
                        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>

                {/* NAVIGATION MODULES */}
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-2">Console & Outils</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        <button onClick={() => setTab('dashboard')} className={`glass-card-premium p-6 text-center group border-t-4 ${tab === 'dashboard' ? 'border-[#0D2B6E]' : 'border-transparent'}`} style={{ borderTopColor: tab === 'dashboard' ? '#0D2B6E' : '' }}>
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D2B6E]">Accueil</p>
                        </button>
                        <button onClick={() => setTab('biens')} className={`glass-card-premium p-6 text-center group border-t-4 ${tab === 'biens' ? 'border-[#0D2B6E]' : 'border-transparent'}`}>
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🏘️</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D2B6E]">Biens</p>
                        </button>
                        <button onClick={() => setSheet('quittanceForm')} className="glass-card-premium p-6 text-center group border-t-4 border-[#1A7A3C]">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">🧾</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#1A7A3C]">Q-Cert</p>
                        </button>
                        <button onClick={() => setTab('quittances')} className={`glass-card-premium p-6 text-center group border-t-4 ${tab === 'quittances' ? 'border-[#0D2B6E]' : 'border-transparent'}`}>
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📜</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D2B6E]">Histo</p>
                        </button>
                        <button onClick={() => setTab('compte')} className={`glass-card-premium p-6 text-center group border-t-4 ${tab === 'compte' ? 'border-[#0D2B6E]' : 'border-transparent'}`}>
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">💼</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#0D2B6E]">Compte</p>
                        </button>
                        <a href="/dashboard/manual" className="glass-card-premium p-6 text-center group border-t-4 border-[#5B21B6]">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📖</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#5B21B6]">Manuel</p>
                        </a>
                    </div>
                </section>

                <main className="pt-6">
                    <AnimatePresence mode="wait">
                        {tab === 'dashboard' && (
                            <motion.div key="dashboard" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                {/* KPI Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    <KpiCard label="Encaissement" value={fmt(stats.encaisse)} unit="F" icon={TrendingUp} color={T.green} bg="white" sub="Collecte Mensuelle" />
                                    <KpiCard label="Commissions" value={fmt(Math.round(stats.totalCommissions))} unit="F" icon={Briefcase} color={T.gold} bg="white" sub="Droit perçu" />
                                    <KpiCard label="Impayés" value={impayes.length} unit="Log." icon={AlertTriangle} color={T.red} bg="white" sub="Alerte J+5" />
                                    <KpiCard label="Mandats" value={mandates.length} unit="Actifs" icon={ShieldCheck} color={T.navy} bg="white" sub="Contrats Gérés" />
                                </div>

                                {/* Urgent Actions */}
                                {impayes.length > 0 && (
                                    <div className="bg-[#A00000] rounded-[28px] p-5 text-white shadow-xl shadow-red-900/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic">Priorité Recouvrement</h3>
                                            <div className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase">{impayes.length} Dossiers</div>
                                        </div>
                                        <div className="space-y-3">
                                            {impayes.slice(0, 2).map((p: any) => (
                                                <div key={p.id} className="bg-white/10 rounded-2xl px-4 py-3 border border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[11px] font-black uppercase tracking-tight">{p.name || "Logement"}</div>
                                                        <div className="text-[9px] font-medium text-red-200 uppercase tracking-widest mt-0.5">Retard J+8</div>
                                                    </div>
                                                    <button onClick={() => { setSelectedProperty(p); setSheet('impaye'); }} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setTab('impayes')} className="w-full mt-4 py-3 bg-white text-[#A00000] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Voir tous les impayés →</button>
                                    </div>
                                )}

                                {/* Profile Score */}
                                <div className="bg-white border-2 border-slate-100 rounded-[28px] p-5 flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-full border-[6px] border-[#0D2B6E] flex flex-col items-center justify-center">
                                        <span className="text-xl font-black text-[#0D2B6E] leading-none">98</span>
                                        <span className="text-[6px] font-black uppercase text-slate-400">Score</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[12px] font-black text-[#0D2B6E] uppercase italic">Excellence SLA (144h)</div>
                                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight mt-1 leading-relaxed">Votre réactivité moyenne est de 24h. Aucun malus actif.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {tab === 'biens' && (
                            <motion.div key="biens" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <SectionTitle title="Biens Gérés" sub="Parc immobilier sous mandat" />
                                {properties.map((p: any) => (
                                    <div key={p.id} className="bg-white border border-slate-100 rounded-[28px] p-5 shadow-sm hover:border-[#0D2B6E]/30 transition-all cursor-pointer" onClick={() => { setSelectedProperty(p); setSheet('propertyDetail'); }}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-slate-50 text-[#0D2B6E] rounded-2xl flex items-center justify-center text-xl">🏘️</div>
                                            <div className="text-right">
                                                <div className="text-[15px] font-black text-slate-900">{fmt(p.leases?.[0]?.rentAmount)} F</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Loyer HC</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-black text-[#0D2B6E] uppercase tracking-tight line-clamp-1">{p.name || "LOGEMENT QAPRIL"}</h4>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                <Search size={10} /> <span>{p.city} · {p.neighborhood}</span>
                                            </div>
                                        </div>
                                        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.leases?.[0]?.receipts?.[0]?.status === 'paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-[9px] font-black uppercase text-slate-500">{p.leases?.[0]?.receipts?.[0]?.status === 'paid' ? 'À JOUR' : 'IMPAYÉ'}</span>
                                            </div>
                                            <button className="text-[9px] font-black uppercase text-[#0D2B6E] flex items-center gap-1 hover:underline">
                                                Gérer <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {tab === 'impayes' && (
                            <motion.div key="impayes" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <SectionTitle title="Recouvrement" sub="Gestion des retards M07" />
                                {impayes.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase italic">Aucun retard détecté</h3>
                                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Félicitations, votre parc est à 100% collecté.</p>
                                    </div>
                                ) : (
                                    impayes.map((p: any) => (
                                        <div key={p.id} className="bg-white border-2 border-red-50 rounded-[28px] p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-[14px] font-black text-red-700 uppercase italic tracking-tight">{p.name || "LOGEMENT"}</h4>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.city} · {p.neighborhood}</div>
                                                </div>
                                                <div className="px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">J+8</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-5">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Dû par</div>
                                                    <div className="text-[11px] font-black text-slate-800 line-clamp-1">{p.leases?.[0]?.tenant?.fullName || "Inconnu"}</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Montant</div>
                                                    <div className="text-[11px] font-black text-red-600 italic">{fmt(p.leases?.[0]?.rentAmount)} F</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setSelectedProperty(p); setSheet('relance'); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                                                    <Smartphone size={14} /> Relancer
                                                </button>
                                                <button onClick={() => { setSelectedProperty(p); setSheet('clemence'); }} className="flex-1 bg-orange-50 text-[#C05B00] border border-[#C05B00]/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                                                    <Clock size={14} /> Clémence
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {tab === 'quittances' && (
                            <motion.div key="quittances" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <SectionTitle title="Historique" sub="Quittances certifiées SHA-256" />
                                {properties.flatMap((p: any) => p.leases?.[0]?.receipts || []).slice(0, 10).map((q: any) => (
                                    <div key={q.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-[#0D2B6E]/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🧾</div>
                                        <div className="flex-1">
                                            <div className="text-[12px] font-black text-[#0D2B6E] uppercase italic truncate">Ref: {q.receiptRef}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{q.periodMonth} · {fmt(q.totalAmount)} F</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${q.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {q.status === 'paid' ? 'Certifiée' : 'Impayée'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {tab === 'mandats' && (
                            <motion.div key="mandats" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                <SectionTitle title="Mes Mandats" sub="Contrats de gestion actifs" />
                                {mandates.map((m: any) => (
                                    <div key={m.id} className="bg-white border-2 border-slate-100 rounded-[28px] p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex gap-2 mb-2">
                                                    <span className="text-[8px] font-black px-2 py-1 bg-[#0D2B6E] text-white rounded-md uppercase tracking-widest">{m.id.slice(0, 5)}</span>
                                                    <span className="text-[8px] font-black px-2 py-1 bg-green-100 text-green-700 rounded-md uppercase tracking-widest">{m.statut}</span>
                                                </div>
                                                <h4 className="text-[14px] font-black text-[#0D2B6E] uppercase italic">Propriétaire {m.proprietaire?.fullName || "Individuel"}</h4>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Type: Gestion Totale</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[18px] font-black text-[#C9A84C] leading-none">5%</div>
                                                <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Comm.</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {JSON.parse(m.biensConcernes || "[]").map((id: string, i: number) => {
                                                const p = properties.find((pp: any) => pp.id === id)
                                                return p ? (
                                                    <div key={i} className="bg-slate-50 px-3 py-2 rounded-xl flex items-center justify-between border border-slate-100">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight truncate">{p.name || "Logement"}</span>
                                                        <span className="text-[10px] font-black text-slate-400">{fmt(p.leases?.[0]?.rentAmount)} F</span>
                                                    </div>
                                                ) : null
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {tab === 'compte' && (
                            <motion.div key="compte" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                <SectionTitle title="Mon Compte" sub="Commissions & Portefeuille MM" />
                                <div className="bg-[#C9A84C] rounded-[32px] p-6 text-white shadow-xl shadow-yellow-900/10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-white/20 rounded-2xl"><Wallet size={24} /></div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Solde commissions</div>
                                            <div className="text-3xl font-black italic">{fmt(Math.round(stats.totalCommissions))} F</div>
                                        </div>
                                    </div>
                                    <button className="w-full py-4 bg-white text-[#C9A84C] rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Relais de virement →</button>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 leading-none">Canaux Mobile Money</h3>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">🟠</div>
                                            <div>
                                                <div className="text-[11px] font-black text-slate-800 uppercase">Orange Money</div>
                                                <div className="text-[12px] font-black text-[#0D2B6E] italic tracking-wider">07 33 44 55 01</div>
                                            </div>
                                        </div>
                                        <ShieldCheck size={18} className="text-teal-600" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">🌊</div>
                                            <div>
                                                <div className="text-[11px] font-black text-slate-800 uppercase">Wave CI</div>
                                                <div className="text-[12px] font-black text-[#0D2B6E] italic tracking-wider">05 44 55 66 02</div>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-black uppercase text-slate-400">Défini par proprio</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>



                {/* Sheets */}
                <Sheet open={sheet === 'quittanceForm'} onClose={() => setSheet(null)} title="Certification Quittance">
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-start gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-2xl shadow-sm">🏘️</div>
                            <div>
                                <h4 className="text-[14px] font-black text-[#0D2B6E] uppercase tracking-tight italic">{selectedProperty?.name || "Sélectionnez un logement"}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">{selectedProperty?.city || "Ville"} · {selectedProperty?.neighborhood || "Quartier"}</p>
                            </div>
                        </div>

                        {!selectedProperty ? (
                           <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sélectionner un bien mandaté</label>
                                {properties.map((p: any) => (
                                    <button key={p.id} onClick={() => setSelectedProperty(p)} className="w-full bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-[#0D2B6E] transition-all group">
                                         <div className="flex items-center gap-3">
                                            <span className="text-xl">🏘️</span>
                                            <div className="text-left font-black text-[11px] text-[#0D2B6E] uppercase italic">{p.name || "Logement"}</div>
                                         </div>
                                         <ChevronRight size={14} className="text-slate-300 group-hover:text-[#0D2B6E]" />
                                    </button>
                                ))}
                           </div>
                        ) : (
                          <div className="space-y-5">
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block italic">Période du loyer</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-4 bg-[#0D2B6E] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/10 italic">Avril 2026</button>
                                    <button className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-[12px] font-black uppercase tracking-widest italic opacity-50">Mai 2026</button>
                                </div>
                             </div>

                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block italic">Mode de versement (Mobile Money)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { l: "Orange", i: "🟠" },
                                        { l: "Wave", i: "🌊" },
                                        { l: "MoMo", i: "🟡" },
                                        { l: "Transfert", i: "🏦" },
                                    ].map((m, i) => (
                                        <button key={i} className="p-4 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:border-[#0D2B6E] transition-all group active:scale-95 shadow-sm">
                                            <span className="text-2xl">{m.i}</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#0D2B6E]">{m.l}</span>
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <button 
                                className="w-full bg-[#1A7A3C] text-white py-5 rounded-[26px] text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 active:scale-95 transition-all mt-4 italic"
                                onClick={async () => {
                                    if (selectedProperty) {
                                        await emettreQuittanceIntermediaire({
                                            leaseId: selectedProperty.leases?.[0]?.id,
                                            periodMonth: "2026-04",
                                            rentAmount: selectedProperty.leases?.[0]?.rentAmount,
                                            chargesAmount: 0,
                                            paymentChannel: "MOBILE_MONEY"
                                        });
                                        setSheet(null);
                                        setSelectedProperty(null);
                                    }
                                }}
                            >
                                Certifier & Signer →
                            </button>
                            <p className="text-[9px] text-center text-slate-400 font-bold italic uppercase tracking-widest leading-none">
                                🔐 SHA-256 + Notification instantanée WhatsApp/SMS.
                            </p>
                          </div>
                        )}
                    </div>
                </Sheet>

                <Sheet open={sheet === 'relance'} onClose={() => setSheet(null)} title="Relance Recouvrement">
                    <div className="space-y-6">
                        <div className="text-center p-6 bg-red-50 rounded-[32px] border border-red-100">
                            <div className="text-3xl mb-3">📲</div>
                            <h4 className="text-[14px] font-black text-red-700 uppercase italic">Canal Digitale Instantanée</h4>
                            <p className="text-[9px] text-slate-500 font-bold mt-2 uppercase tracking-wide px-4">Relance automatique SMS + WhatsApp pour le locataire de {selectedProperty?.name}</p>
                        </div>
                        <div className="space-y-3">
                             {[
                                { l: "WhatsApp Direct", i: "💬", c: "#25D366" },
                                { l: "SMS Premium", i: "📱", c: "#000000" },
                                { l: "Appel Vocal", i: "📞", c: "#0D2B6E" }
                             ].map((c, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-5 border border-slate-100 rounded-3xl hover:border-slate-800 transition-all">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: c.c }}>{c.i}</div>
                                        <div className="text-[12px] font-black uppercase italic" style={{ color: c.c }}>{c.l}</div>
                                     </div>
                                     <ChevronRight size={16} />
                                </button>
                             ))}
                        </div>
                    </div>
                </Sheet>

                <Sheet open={sheet === 'clemence'} onClose={() => setSheet(null)} title="Clemence M07 (Phase 5)">
                    <div className="space-y-6">
                         <div className="p-5 bg-orange-50 rounded-[28px] border border-orange-100 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-2xl shadow-sm">🤝</div>
                            <div>
                                <h4 className="text-[13px] font-black text-orange-700 uppercase italic leading-none">Accord de clémence M07</h4>
                                <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tight leading-relaxed">Suspendre temporairement les relances en proposant une solution amiable au locataire.</p>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <button onClick={() => { setSheet(null); activerClemenceM07(selectedProperty?.id, { type: 'delai', delaiJours: 7 }); }} className="w-full p-5 border border-slate-100 rounded-3xl text-left hover:border-orange-500 transition-all">
                                <div className="text-[12px] font-black text-[#0D2B6E] uppercase italic">Option A: Délai de grâce (7 jours)</div>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Zéro relance pendant 1 semaine</p>
                            </button>
                            <button onClick={() => { setSheet(null); activerClemenceM07(selectedProperty?.id, { type: 'delai', delaiJours: 15 }); }} className="w-full p-5 border border-slate-100 rounded-3xl text-left hover:border-orange-500 transition-all">
                                <div className="text-[12px] font-black text-[#0D2B6E] uppercase italic">Option B: Délai étendu (15 jours)</div>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Approbation mandataire nécessaire</p>
                            </button>
                            <button className="w-full p-5 border border-slate-100 rounded-3xl text-left hover:border-orange-500 transition-all opacity-50">
                                <div className="text-[12px] font-black text-[#0D2B6E] uppercase italic">Option C: Échéancier (CACI)</div>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Plan de paiement en 3 fois</p>
                            </button>
                         </div>
                         <div className="p-4 bg-navy-50 rounded-2xl flex items-center gap-3">
                             <ShieldCheck className="text-[#0D2B6E]" size={20} />
                             <p className="text-[8px] font-bold text-[#0D2B6E] uppercase tracking-wide">Toute clémence est tracée et opposable juridiquement en cas de litige.</p>
                         </div>
                    </div>
                </Sheet>

            </div>
        </div>
    )
}
