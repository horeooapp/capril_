"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    BarChart3, 
    Building2, 
    Receipt, 
    ShieldCheck, 
    User, 
    Bell, 
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
    X
} from "lucide-react"

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
    className={`border-none cursor-pointer px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${active ? 'bg-[#0D2B6E] text-white' : 'bg-[#EEF2F7] text-[#6A7D9E]'}`}
  >
    {label}
  </button>
)

const Row = ({ label, value, color }: { label: string, value: string | number, color?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-[#EEF2F7]">
    <span className="text-[10px] text-[#6A7D9E] uppercase tracking-wider">{label}</span>
    <span style={{ color: color || T.textMid }} className="text-[11px] font-bold">{value}</span>
  </div>
)

const SecTitle = ({ label }: { label: string }) => (
  <div className="text-[10px] font-extrabold text-[#6A7D9E] tracking-widest uppercase mb-2 mt-1">{label}</div>
)

const BackBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="bg-[#EEF2F7] border-none rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#2D3F5E] cursor-pointer flex items-center gap-2"
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
            totalCautionCases: 0 // Mock for now or calculate if needed
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
        <div className="min-h-screen bg-[#F2F5FA] flex justify-center items-start p-4 font-sans text-[#0A1930]">
            {/* Mobile-style Frame */}
            <div className="w-[390px] min-h-[844px] bg-white rounded-[36px] shadow-2xl relative border border-[#D6DCE8] overflow-hidden flex flex-col">
                
                {/* HEADER SECTION */}
                <div style={{ background: `linear-gradient(145deg, ${T.navyDark} 0%, ${T.green} 100%)` }} className="p-6 pb-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-[#1A7A3C] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Propriétaire</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#22A050]" />
                            </div>
                            <h1 className="text-white text-lg font-extrabold uppercase tracking-tight">{user?.name || "KOUASSI ADAMA"}</h1>
                            <p className="text-white/60 text-[11px] mt-1">{user?.email || "+225 07 44 55 66"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition-colors">
                                <Bell size={20} />
                             </div>
                             {stats.arrears > 0 && <Badge label={`${stats.arrears} alertes`} color="#FFF" bg={T.red} size={8} />}
                        </div>
                    </div>

                </div>

                {/* BODY SECTION (Scrollable) */}
                <div className="flex-1 overflow-y-auto pb-24">
                    
                    {/* --- TAB: DASHBOARD (ACCUEIL) --- */}
                    {tab === "dashboard" && (
                        <div className="p-4 space-y-6">
                            {/* Original Welcome Info */}
                            <div className="flex flex-col gap-1 mb-2 px-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status de votre Portefeuille</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-black text-[#1F4E79] uppercase">Compte Certifié</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>

                            {/* Original KPI Strip */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Loyers Encaissés", val: fmt(stats.collected) + " FCFA", icon: <Receipt size={18}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
                                    { label: "Taux Occupation", val: stats.occupancyRate + "%", icon: <Building2 size={18}/>, color: "text-blue-600", bg: "bg-blue-50" },
                                    { label: "Cautions Gérées", val: stats.totalCautionCases || "0", icon: <ShieldCheck size={18}/>, color: "text-orange-600", bg: "bg-orange-50" },
                                    { label: "Indice Confiance", val: "98/100", icon: <ShieldCheck size={18}/>, color: "text-purple-600", bg: "bg-purple-50" },
                                ].map((k, i) => (
                                    <div key={i} className={`p-4 rounded-2xl ${k.bg} border border-transparent hover:border-white transition-all shadow-sm`}>
                                        <div className={`mb-3 ${k.color}`}>{k.icon}</div>
                                        <div className="text-[14px] font-black text-gray-900 leading-none">{k.val}</div>
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">{k.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Original Financial Overview Card */}
                            <div className="glass-panel p-6 rounded-3xl border border-white/50 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Loyer Mensuel Global.</h4>
                                        <div className="text-2xl font-black text-[#1F4E79] font-mono leading-none">{fmt(stats.totalRent)} <span className="text-[12px] text-gray-400">FCFA</span></div>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Avril 2024</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">Encaissé à ce jour</span>
                                        <span className="text-[16px] font-black text-emerald-600">{fmt(stats.collected)} FCFA</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                                            style={{ width: `${Math.round((stats.collected / Math.max(stats.totalRent, 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Original Flash Actions */}
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { icon: <Plus size={18} />, label: "Bien", tab: "biens" },
                                    { icon: <Receipt size={18} />, label: "Quittance", tab: "quittances" },
                                    { icon: <FileText size={18} />, label: "Rapports" },
                                    { icon: <BarChart3 size={18} />, label: "Stats" },
                                ].map((a, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => a.tab && resetNav(a.tab)}
                                        className="flex flex-col items-center gap-2 p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all shadow-sm group"
                                    >
                                        <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-xl text-[#1F4E79] group-hover:scale-110 transition-transform">{a.icon}</div>
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{a.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Original Performance / Patrimoine List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Patrimoine Actif.</h4>
                                    <button onClick={() => resetNav("biens")} className="text-[10px] font-black text-[#1F4E79] uppercase tracking-widest hover:underline">Voir tout →</button>
                                </div>
                                <div className="space-y-2">
                                    {entities.slice(0, 3).map((e: any) => {
                                        const s = getEntiteStats(e);
                                        return (
                                            <div 
                                                key={e.id} 
                                                onClick={() => { setSelectedEntite(e); setTab("biens"); }}
                                                className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-xl text-[#1F4E79] shadow-sm">{getEntiteIcon(e.type)}</div>
                                                    <div>
                                                        <p className="text-[13px] font-black text-gray-900 uppercase tracking-tighter">{e.nom}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.commune}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[14px] font-black text-[#1F4E79] font-mono">{fmt(s.loyers)}</p>
                                                    <p className="text-[8px] font-black text-gray-300 uppercase">FCFA/Mois</p>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                </div>

                {/* BOTTOM NAVIGATION (Fixed) */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-[#D6DCE8] px-6 flex justify-between items-center z-50 rounded-b-[36px]">
                    {[
                        { id: "dashboard", icon: <BarChart3 size={20} />, label: "Tableau" },
                        { id: "biens", icon: <Building2 size={20} />, label: "Patrimoine" },
                        { id: "quittances", icon: <Receipt size={20} />, label: "Quittances" },
                        { id: "cautions", icon: <ShieldCheck size={20} />, label: "Cautions" },
                        { id: "profil", icon: <User size={20} />, label: "Profil" },
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
