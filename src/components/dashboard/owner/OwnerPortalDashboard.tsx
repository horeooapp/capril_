"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    BarChart3, 
    Building2, 
    Receipt, 
    ShieldCheck, 
    User, 
    Zap,
    Plus, 
    ArrowRight,
    Search,
    ChevronRight,
    Home,
    MapPin,
    Calendar,
    Phone,
    FileText,
    RefreshCw,
    Download,
    AlertCircle,
    CheckCircle2,
    X,
    Users,
    Settings2
} from "lucide-react"

import { AgencyCandidateList } from "../agency/AgencyCandidateList"
import { AgencyToolsGrid } from "../agency/AgencyToolsGrid"

// Theme Colors from Mockup
const T = {
  navy: "#0D2B6E",
  navyDark: "#071A45",
  navyLight: "#1A3D8C",
  navyPale: "#EEF2FA",
  green: "#1A7A3C",
  greenLight: "#22A050",
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
}

const fmt = (n: number) => n.toLocaleString("fr-FR")

// --- REUSABLE MINI COMPONENTS ---

const Badge = ({ label, color, bg, size = 10 }: { label: string, color: string, bg: string, size?: number }) => (
  <span style={{ 
    display: "inline-flex", 
    alignItems: "center", 
    background: bg, 
    color, 
    borderRadius: 6, 
    padding: "2px 7px", 
    fontSize: size, 
    fontWeight: 700, 
    whiteSpace: "nowrap" 
  }}>{label}</span>
)

const Chip = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`border-none cursor-pointer px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${active ? 'bg-[#1F4E79] text-white' : 'bg-[#F2F5FA] text-[#6A7D9E]'}`}
  >
    {label}
  </button>
)

const Row = ({ label, value, color }: { label: string, value: string | number, color?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#F2F5FA]">
    <span className="text-[10px] text-[#6A7D9E] uppercase tracking-wider">{label}</span>
    <span style={{ color: color || "#2D3F5E" }} className="text-[11px] font-bold">{value}</span>
  </div>
)

const SecTitle = ({ label }: { label: string }) => (
  <div className="text-[10px] font-extrabold text-[#6A7D9E] tracking-widest uppercase mb-2 mt-1">{label}</div>
)

const BackBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="bg-[#F2F5FA] border-none rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#2D3F5E] cursor-pointer flex items-center gap-2"
  >
    <ArrowRight size={14} className="rotate-180" /> {label}
  </button>
)

// --- MAIN PORTAL COMPONENT ---

export function OwnerPortalDashboard({ user, properties: initialProperties }: { user: any, properties: any[] }) {
    const [tab, setTab] = useState("dashboard")
    const [selectedEntite, setSelectedEntite] = useState<any>(null)
    const [selectedUnite, setSelectedUnite] = useState<any>(null)
    const [filterBiens, setFilterBiens] = useState("tous")
    const [unitTab, setUnitTab] = useState("info")
    
    // Group properties by address to simulate "Entities"
    const entities = useMemo(() => {
        const grouped = initialProperties.reduce((acc: any, p: any) => {
            const key = p.address;
            if (!acc[key]) {
                acc[key] = {
                    id: `E-${p.id}`,
                    nom: p.name || p.address,
                    adresse: p.address,
                    commune: p.commune,
                    type: p.propertyType === 'building' ? 'immeuble' : 'standalone',
                    unites: []
                };
            }
            acc[key].unites.push(p);
            return acc;
        }, {});

        return Object.values(grouped).map((e: any) => {
            // If an address has multiple units, treat it as an immeuble for better UI
            if (e.unites.length > 1) e.type = 'immeuble';
            return e;
        });
    }, [initialProperties]);

    // Aggregate Stats
    const stats = useMemo(() => {
        let totalVal = 0;
        let collectedVal = 0;
        let arrearsCount = 0;
        let vacantCount = 0;

        initialProperties.forEach(p => {
            const activeLease = p.leases?.find((l: any) => l.status === 'ACTIVE');
            if (activeLease) {
                totalVal += activeLease.rentAmount || 0;
                // Simple logic: if has a receipt this month, consider as collected (mock for now)
                const hasRecentReceipt = activeLease.receipts?.some((r: any) => {
                    const d = new Date(r.paidAt || r.createdAt);
                    return d.getMonth() === new Date().getMonth();
                });
                if (hasRecentReceipt) collectedVal += activeLease.rentAmount || 0;
                if (activeLease.statutFiscal === 'EN_RETARD' || p.status === 'arrears') arrearsCount++;
            } else {
                vacantCount++;
            }
        });

        return {
            totalRent: totalVal,
            collected: collectedVal,
            occupancyRate: Math.round(((initialProperties.length - vacantCount) / Math.max(initialProperties.length, 1)) * 100),
            arrears: arrearsCount,
            vacants: vacantCount,
            totalCautionCases: 0 
        };
    }, [initialProperties]);

    const resetNav = (t: string) => {
        setTab(t); 
        setSelectedEntite(null); 
        setSelectedUnite(null);
        setUnitTab("info");
    };

    const getEntiteStats = (e: any) => {
        const unites = e.unites || [];
        const occupes = unites.filter((u: any) => u.leases?.some((l: any) => l.status === 'ACTIVE')).length;
        const totalLoyers = unites.reduce((sum: number, u: any) => {
            const activeLease = u.leases?.find((l: any) => l.status === 'ACTIVE');
            return sum + (activeLease?.rentAmount || 0);
        }, 0);
        return {
            total: unites.length,
            occupes,
            vacants: unites.length - occupes,
            loyers: totalLoyers
        };
    }

    const getEntiteIcon = (type: string) => {
        switch(type) {
            case 'immeuble': return <Building2 />;
            case 'cour': return <Home />;
            default: return <Home />;
        }
    }

    const pColor = (u: any) => {
        const activeLease = u.leases?.find((l: any) => l.status === 'ACTIVE');
        if (!activeLease) return T.orange; // Vacant
        return T.green; // Active
    }

    return (
        <div className="min-h-screen bg-[#F2F5FA] p-0 md:p-8 font-sans text-[#0A1930]">
            {/* Main Responsive Container */}
            <div className="max-w-5xl mx-auto bg-white min-h-[90vh] md:rounded-[2.5rem] shadow-xl border border-[#D6DCE8] overflow-hidden flex flex-col relative">
                
                {/* CLEAN WELCOME HEADER */}
                <div className="p-8 pt-12 pb-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tableau de Bord Certifié</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter leading-none uppercase italic">👋 Hello, <br/> {user?.name || "Propriétaire"}</h1>
                    </div>
                </div>

                {/* BODY SECTION (Scrollable) */}
                <div className="flex-1 overflow-y-auto pb-24">
                    
                    {/* --- TAB: DASHBOARD (ACCUEIL) --- */}
                    {tab === "dashboard" && (
                        <div className="p-8 space-y-12">
                            {/* Action Requise Alert - RCL/MRL */}
                            {(initialProperties.some(p => p.leases?.some((l:any) => l.reclamations?.length > 0)) || 
                              initialProperties.some(p => p.leases?.some((l:any) => l.dossiersLitige?.length > 0))) && (
                                <div className="mb-10">
                                    <div className="bg-white border-2 border-[#C55A11]/20 rounded-[2.5rem] p-8 shadow-sm">
                                        <h3 className="text-[11px] font-black text-[#C55A11] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <AlertCircle size={14} />
                                            Action Immédiate Requise
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {initialProperties.flatMap(p => p.leases || []).flatMap((l:any) => l.reclamations || []).map((ticket: any, idx: number) => (
                                                <div 
                                                    key={idx} 
                                                    className="bg-orange-50 border border-orange-100/50 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-orange-100 transition-all font-bold"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                            ⚖️
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-[#1F4E79] uppercase tracking-tight">
                                                                Révision de Loyer (RCL)
                                                            </div>
                                                            <div className="text-[11px] font-bold text-orange-600 italic mt-0.5">
                                                                Réponse attendue sous 72h
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-orange-300 group-hover:translate-x-1" />
                                                </div>
                                            ))}
                                            {initialProperties.flatMap(p => p.leases || []).flatMap((l:any) => l.dossiersLitige || []).map((mrl: any, idx: number) => (
                                                <div 
                                                    key={idx} 
                                                    className="bg-blue-50 border border-blue-100/50 rounded-2xl p-5 flex justify-between items-center group cursor-pointer hover:bg-blue-100 transition-all font-bold"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                                            🤝
                                                        </div>
                                                        <div>
                                                            <div className="text-[13px] font-black text-[#1F4E79] uppercase tracking-tight">
                                                                Médiation (MRL-01)
                                                            </div>
                                                            <div className="text-[11px] font-bold text-blue-600 italic mt-0.5">
                                                                Consentement requis
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={20} className="text-blue-300 group-hover:translate-x-1" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Premium Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Logements gérés", value: initialProperties.length, unit: "Unités", icon: Building2, color: "text-orange-600 bg-orange-50", glow: "shadow-orange-200/40" },
                                    { label: "Sécurisé (CDC)", value: stats.totalRent * 2.5, unit: "FCFA", icon: ShieldCheck, color: "text-blue-600 bg-blue-50", glow: "shadow-blue-200/40", isCurrency: true },
                                    { label: "Conformité Fiscale", value: 100, unit: "% DGI", icon: FileText, color: "text-amber-600 bg-amber-50", glow: "shadow-amber-200/40" },
                                    { label: "Performance / Mois", value: stats.occupancyRate, unit: "%", icon: Zap, color: "text-violet-600 bg-violet-50", glow: "shadow-violet-200/40" },
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`glass-card-premium p-8 rounded-[2.5rem] border border-white/40 shadow-xl ${stat.glow} flex flex-col justify-between min-h-[180px] relative group hover:scale-[1.02] transition-all`}
                                    >
                                        <div className="flex justify-between items-start relative z-10 font-bold">
                                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1 leading-none">{stat.label}</span>
                                            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                                                <stat.icon size={20} />
                                            </div>
                                        </div>
                                        <div className="relative z-10 mt-6">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-[#1F4E79] tracking-tighter leading-none">
                                                    {stat.isCurrency ? fmt(stat.value) : stat.value}
                                                </span>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">{stat.unit}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Command Panel */}
                                <div className="lg:col-span-4 glass-card-premium p-8 rounded-[2.5rem] bg-gray-900 text-white overflow-hidden relative group border-none shadow-2xl">
                                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-600 blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="relative z-10 flex flex-col h-full space-y-8">
                                        <div>
                                            <h2 className="text-3xl font-black mb-3 leading-none uppercase tracking-tighter italic text-white">Actions.<br/>Directes</h2>
                                            <p className="text-[10px] font-medium text-gray-400 leading-relaxed max-w-[180px]">Commandes ultra-rapides pour la gestion de votre parc immobilier.</p>
                                        </div>
                                        <div className="space-y-3 mt-auto">
                                            <button onClick={() => resetNav("biens")} className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group/link border border-white/5 hover:border-white/20 active:scale-95">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/10 rounded-lg"><Plus size={18} /></div>
                                                    <span className="font-black tracking-[0.1em] text-[12px] uppercase">Nouveau Logement</span>
                                                </div>
                                                <ArrowRight size={16} className="opacity-40 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                                            </button>
                                            <button onClick={() => resetNav("quittances")} className="w-full flex items-center justify-between p-5 bg-[#C55A11] hover:bg-[#A54A0D] rounded-2xl transition-all group/link active:scale-95">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/20 rounded-lg"><Zap size={18} /></div>
                                                    <span className="font-black tracking-[0.1em] text-[12px] uppercase">Générer Quittance</span>
                                                </div>
                                                <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Patrimoine List */}
                                <div className="lg:col-span-8 glass-panel p-8 rounded-[2.5rem] border border-white/50 shadow-xl font-bold">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Patrimoine Actif.</h3>
                                        <button onClick={() => resetNav("biens")} className="text-[10px] font-black text-[#1F4E79] uppercase tracking-widest hover:underline">Voir tout le parc →</button>
                                    </div>
                                    <div className="space-y-4">
                                        {entities.slice(0, 3).map((e: any) => {
                                            const s = getEntiteStats(e);
                                            return (
                                                <div 
                                                    key={e.id} 
                                                    onClick={() => { setSelectedEntite(e); setTab("biens"); }}
                                                    className="p-6 bg-gray-50/50 hover:bg-white rounded-3xl flex items-center justify-between group hover:shadow-lg transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl text-[#1F4E79] shadow-sm border border-gray-50 group-hover:bg-[#1F4E79] group-hover:text-white transition-colors">
                                                            {getEntiteIcon(e.type)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[15px] font-black text-gray-900 uppercase tracking-tighter">{e.nom}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.commune}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[16px] font-black text-[#1F4E79] font-mono leading-none">{fmt(s.loyers)}</p>
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">FCFA/Mois</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: PATRIMOINE (List) --- */}
                    {tab === "biens" && !selectedEntite && (
                        <div className="p-4">
                            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                                {["tous", "occupés", "vacants", "impayés"].map(f => (
                                    <Chip key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filterBiens === f} onClick={() => setFilterBiens(f)} />
                                ))}
                            </div>
                            
                            <div className="mt-2 space-y-3">
                                {entities.map((e: any) => {
                                    const s = getEntiteStats(e);
                                    const borderC = s.vacants > 0 ? T.orange : T.green;
                                    return (
                                        <div 
                                            key={e.id} 
                                            onClick={() => setSelectedEntite(e)}
                                            className="bg-white border border-[#D6DCE8] border-l-4 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all"
                                            style={{ borderLeftColor: borderC }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3">
                                                    <div style={{ background: borderC + '15' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0D2B6E]">{getEntiteIcon(e.type)}</div>
                                                    <div>
                                                        <div className="text-sm font-black text-[#0A1930]">{e.nom}</div>
                                                        <div className="text-[10px] text-[#6A7D9E] mt-0.5">{e.adresse}</div>
                                                        <div className="flex gap-2 mt-2">
                                                            <Badge label={e.type} color="#0D2B6E" bg="#EEF2FA" />
                                                            <Badge label={e.commune} color="#0E7490" bg="#E0F4F9" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} className="text-[#D6DCE8]" />
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-[#EEF2F7] flex justify-between items-end">
                                                <div className="flex gap-2">
                                                    <div className="bg-[#E8F5EE] px-2 py-1 rounded-md text-[9px] font-bold text-[#1A7A3C]">{s.occupes} Occupés</div>
                                                    {s.vacants > 0 && <div className="bg-[#EEF2F7] px-2 py-1 rounded-md text-[9px] font-bold text-[#6A7D9E]">{s.vacants} Vacants</div>}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-[#0D2B6E] font-mono">{fmt(s.loyers)}</div>
                                                    <div className="text-[9px] text-[#6A7D9E] uppercase font-bold tracking-tight">FCFA / Mois</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <button className="w-full mt-6 border-2 border-dashed border-[#0D2B6E]/30 rounded-2xl py-4 text-[13px] font-extrabold text-[#0D2B6E] flex items-center justify-center gap-2 hover:bg-[#EEF2FA] transition-all">
                                <Plus size={18} /> Ajouter un bien au portefeuille
                            </button>
                        </div>
                    )}

                    {/* --- TAB: ENTITE DETAILS --- */}
                    {tab === "biens" && selectedEntite && !selectedUnite && (
                        <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center">
                                <BackBtn label="Patrimoine" onClick={() => setSelectedEntite(null)} />
                                <button className="text-[10px] font-bold text-[#A00000] bg-[#FEECEC] px-3 py-1.5 rounded-lg border border-[#A00000]/10 flex items-center gap-1">
                                    <X size={12} /> Retirer
                                </button>
                            </div>

                            <div className="bg-[#EEF2F7] rounded-3xl p-4 border border-[#D6DCE8]">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-[#0D2B6E] text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                        {getEntiteIcon(selectedEntite.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-base font-black text-[#0A1930]">{selectedEntite.nom}</h2>
                                        <p className="text-[11px] text-[#6A7D9E] mt-1 line-clamp-1">{selectedEntite.adresse}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge label={selectedEntite.type} color="#0D2B6E" bg="#EEF2FA" />
                                            <Badge label="Gestion Directe" color="#1A7A3C" bg="#E8F5EE" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                     {[
                                         { label: "Unités", val: selectedEntite.unites.length },
                                         { label: "Occupés", val: getEntiteStats(selectedEntite).occupes },
                                         { label: "Vacants", val: getEntiteStats(selectedEntite).vacants },
                                         { label: "Loyers", val: Math.round(getEntiteStats(selectedEntite).loyers / 1000) + "K" },
                                     ].map((k, i) => (
                                         <div key={i} className="bg-white rounded-xl p-2 text-center border border-[#D6DCE8]/50 shadow-sm">
                                             <div className="text-[8px] text-[#6A7D9E] uppercase font-bold mb-1">{k.label}</div>
                                             <div className="text-[11px] font-black text-[#0D2B6E]">{k.val}</div>
                                         </div>
                                     ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <SecTitle label="Unités locatives" />
                                    <button className="text-[10px] font-bold text-white bg-[#0D2B6E] px-2 py-1 rounded flex items-center gap-1 active:scale-95 transition-transform">
                                        <Plus size={12} /> Unité
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedEntite.unites.map((u: any) => {
                                        const activeLease = u.leases?.find((l: any) => l.status === 'ACTIVE');
                                        return (
                                            <div 
                                                key={u.id} 
                                                onClick={() => { setSelectedUnite(u); setUnitTab("info"); }}
                                                className="bg-white border border-[#D6DCE8] border-l-4 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#F2F5FA] group transition-all"
                                                style={{ borderLeftColor: pColor(u) }}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-[#0A1930]">{u.name || "Porte / Appt"}</span>
                                                        <Badge label={u.propertyType} color="#0D2B6E" bg="#EEF2FA" size={8} />
                                                    </div>
                                                    <div className="text-[10px] text-[#6A7D9E] mt-1">
                                                        {activeLease ? (activeLease.tenant?.fullName || activeLease.tenant?.name || "Locataire actif") : "Unité vacante"}
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-3">
                                                    <div>
                                                        <div className="text-xs font-black text-[#0D2B6E] font-mono">{fmt(activeLease?.rentAmount || u.declaredRentFcfa || 0)}</div>
                                                        <div className="text-[8px] text-[#6A7D9E] uppercase">FCFA/mois</div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-[#D6DCE8] group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: UNIT DETAILS --- */}
                    {tab === "biens" && selectedEntite && selectedUnite && (
                        <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
                             <div className="flex justify-between items-center">
                                <BackBtn label={selectedEntite.nom} onClick={() => setSelectedUnite(null)} />
                            </div>

                            <div className="bg-[#EEF2F7] rounded-3xl p-5 border border-[#D6DCE8]">
                                <h2 className="text-base font-black text-[#0A1930]">{selectedUnite.name || "Unité Locative"}</h2>
                                <p className="text-[11px] text-[#6A7D9E] mt-1">{selectedEntite.nom} · {selectedEntite.commune}</p>
                                <div className="flex gap-2 mt-3">
                                    <Badge label={selectedUnite.propertyType} color="#0D2B6E" bg="#EEF2FA" />
                                    <Badge label={selectedUnite.propertyCode} color="#6A7D9E" bg="#FFF" size={8} />
                                    {selectedUnite.leases?.some((l:any) => l.status === 'ACTIVE') ? <Badge label="Occupé" color="#1A7A3C" bg="#E8F5EE" /> : <Badge label="Vacant" color="#6A7D9E" bg="#FFF" />}
                                </div>
                            </div>

                            {/* Sub-tabs for Unit */}
                            <div className="flex border-b border-[#D6DCE8]">
                                {["info", "bail", "locataire"].map(tid => (
                                    <button 
                                        key={tid} 
                                        onClick={() => setUnitTab(tid)}
                                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${unitTab === tid ? 'text-[#0D2B6E] border-b-2 border-[#0D2B6E]' : 'text-[#6A7D9E]'}`}
                                    >
                                        {tid}
                                    </button>
                                ))}
                            </div>

                            <div className="py-2">
                                {unitTab === "info" && (
                                    <div className="space-y-1">
                                        <Row label="Code QAPRIL" value={selectedUnite.propertyCode} />
                                        <Row label="Type" value={selectedUnite.propertyType} />
                                        <Row label="Loyer mensuel" value={fmt(selectedUnite.leases?.[0]?.rentAmount || selectedUnite.declaredRentFcfa || 0) + " FCFA"} color={T.navy} />
                                        <Row label="Statut" value={selectedUnite.status} color={selectedUnite.status === 'active' ? T.green : T.orange} />
                                        <Row label="Commune" value={selectedUnite.commune} />
                                    </div>
                                )}
                                {unitTab === "bail" && (
                                    <div className="space-y-4">
                                        {selectedUnite.leases?.length > 0 ? (
                                            <>
                                                <Row label="Référence" value={selectedUnite.leases[0].leaseReference} />
                                                <Row label="Signature" value={new Date(selectedUnite.leases[0].startDate).toLocaleDateString()} />
                                                <Row label="Type" value={selectedUnite.leases[0].typeBail || "Standard"} color={T.green} />
                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <button className="bg-[#EEF2FA] border border-[#0D2B6E]/20 rounded-xl py-3 text-[11px] font-bold text-[#0D2B6E] flex items-center justify-center gap-2">
                                                        <FileText size={16} /> PDF
                                                    </button>
                                                    <button className="bg-[#E0F4F9] border border-[#0E7490]/20 rounded-xl py-3 text-[11px] font-bold text-[#0E7490] flex items-center justify-center gap-2">
                                                        <RefreshCw size={16} /> Renouv.
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-12 text-[#6A7D9E]">
                                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-xs font-bold">Aucun bail actif pour cette unité</p>
                                                <button className="mt-4 bg-[#0D2B6E] text-white px-6 py-2 rounded-xl text-[11px] font-bold">Enregistrer un bail</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {unitTab === "locataire" && (
                                    <div className="space-y-4">
                                        {selectedUnite.leases?.find((l:any) => l.status === 'ACTIVE')?.tenant ? (
                                            (() => {
                                                const tenant = selectedUnite.leases.find((l:any) => l.status === 'ACTIVE').tenant;
                                                return (
                                                    <>
                                                        <div className="flex items-center gap-4 bg-[#EEF2F7] p-4 rounded-2xl border border-[#D6DCE8]/50">
                                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0D2B6E] text-xl shadow-sm border border-[#D6DCE8]">
                                                                <User />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-[#0A1930]">{tenant.fullName || tenant.name}</h4>
                                                                <p className="text-[11px] text-[#6A7D9E]">{tenant.phone || "Non renseigné"}</p>
                                                            </div>
                                                        </div>
                                                        <Row label="Loyer Principal" value={fmt(selectedUnite.leases[0].rentAmount) + " FCFA"} color={T.navy} />
                                                        <Row label="Date Paiement" value={"Le " + selectedUnite.leases[0].paymentDay + " du mois"} />
                                                        <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                                                            <div className="bg-[#E8F5EE] border border-[#1A7A3C]/20 rounded-xl p-3">
                                                                <div className="text-[8px] font-bold text-[#1A7A3C] uppercase mb-1">Paiement</div>
                                                                <div className="text-[11px] font-black text-[#1A7A3C]">À JOUR</div>
                                                            </div>
                                                            <div className="bg-[#EDE9FE] border border-[#5B21B6]/20 rounded-xl p-3">
                                                                <div className="text-[8px] font-bold text-[#5B21B6] uppercase mb-1">Caution</div>
                                                                <div className="text-[11px] font-black text-[#5B21B6]">SÉCURISÉE</div>
                                                            </div>
                                                        </div>
                                                        <button className="w-full bg-[#E8F5EE] border border-[#1A7A3C]/20 py-3 rounded-2xl text-[11px] font-bold text-[#1A7A3C] flex items-center justify-center gap-2 active:scale-95 transition-all">
                                                            <Phone size={14} /> Contacter le locataire
                                                        </button>
                                                    </>
                                                )
                                            })()
                                        ) : (
                                            <div className="text-center py-12 text-[#6A7D9E]">
                                                <User size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-xs font-bold">Unité vacante — Aucun locataire</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB: CANDIDATS (Agency Feature) --- */}
                    {tab === "candidats" && (
                        <div className="pb-10">
                            <div className="p-8 pb-4">
                                <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Candidats.</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Flux de dossiers qualifiés M-CAND</p>
                            </div>
                            <AgencyCandidateList />
                        </div>
                    )}

                    {/* --- TAB: OUTILS (Agency Feature) --- */}
                    {tab === "outils" && (
                        <div className="pb-10">
                            <div className="p-8 pb-4">
                                <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Outils métier.</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Écosystème de gestion professionnelle certifiée</p>
                            </div>
                            <AgencyToolsGrid />
                        </div>
                    )}
                </div>

                {/* BOTTOM NAVIGATION (Fixed) */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-[#D6DCE8] px-6 flex justify-between items-center z-50 rounded-b-[36px]">
                    {[
                        { id: "dashboard", icon: <BarChart3 size={18} />, label: "Tableau" },
                        { id: "biens", icon: <Building2 size={18} />, label: "Biens" },
                        { id: "candidats", icon: <Users size={18} />, label: "Candidats" },
                        { id: "quittances", icon: <Receipt size={18} />, label: "Quittances" },
                        { id: "outils", icon: <Settings2 size={18} />, label: "Outils" },
                        { id: "cautions", icon: <ShieldCheck size={18} />, label: "Securité" },
                        { id: "profil", icon: <User size={18} />, label: "Profil" },
                    ].map(btn => {
                        const active = tab === btn.id;
                        return (
                            <button 
                                key={btn.id}
                                onClick={() => resetNav(btn.id)}
                                className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#0D2B6E] scale-110' : 'text-[#6A7D9E] opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`${active ? 'bg-[#EEF2FA]' : ''} p-2 rounded-xl`}>{btn.icon}</div>
                                <span className="text-[8px] font-bold uppercase tracking-widest">{btn.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
