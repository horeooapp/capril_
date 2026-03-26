"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
    className={`border-none cursor-pointer px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${active ? "bg-[#0D2B6E] text-white" : "bg-[#EEF2F7] text-[#6A7D9E]"}`}
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlTab = searchParams.get("tab") || "dashboard";
    
    const [tab, setTab] = useState(urlTab);
    const [selectedEntite, setSelectedEntite] = useState<any>(null)
    const [selectedUnite, setSelectedUnite] = useState<any>(null)
    const [filterBiens, setFilterBiens] = useState("tous")
    const [unitTab, setUnitTab] = useState("info")

    // Update tab when URL changes
    useEffect(() => {
        if (urlTab && urlTab !== tab) {
            setTab(urlTab);
        }
    }, [urlTab, tab]);
    
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
                    type: p.propertyType === "building" ? "immeuble" : "standalone",
                    unites: []
                };
            }
            acc[key].unites.push(p);
            return acc;
        }, {});

        return Object.values(grouped).map((e: any) => {
            if (e.unites.length > 1) e.type = "immeuble";
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
            const activeLease = p.leases?.find((l: any) => l.status === "ACTIVE");
            if (activeLease) {
                totalVal += activeLease.rentAmount || 0;
                const hasRecentReceipt = activeLease.receipts?.some((r: any) => {
                    const d = new Date(r.paidAt || r.createdAt);
                    return d.getMonth() === new Date().getMonth();
                });
                if (hasRecentReceipt) collectedVal += activeLease.rentAmount || 0;
                if (activeLease.statutFiscal === "EN_RETARD" || p.status === "arrears") arrearsCount++;
            } else {
                vacantCount++;
            }
        });

        return {
            totalRent: totalVal,
            collected: collectedVal,
            occupancyRate: Math.round(((initialProperties.length - vacantCount) / Math.max(initialProperties.length, 1)) * 100),
            arrears: arrearsCount,
            vacants: vacantCount
        };
    }, [initialProperties]);

    const resetNav = (t: string) => {
        router.push(`/dashboard?tab=${t}`);
        setTab(t); 
        setSelectedEntite(null); 
        setSelectedUnite(null);
        setUnitTab("info");
    };

    const getEntiteStats = (e: any) => {
        const unites = e.unites || [];
        const occupes = unites.filter((u: any) => u.leases?.some((l: any) => l.status === "ACTIVE")).length;
        const totalLoyers = unites.reduce((sum: number, u: any) => {
            const activeLease = u.leases?.find((l: any) => l.status === "ACTIVE");
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
            case "immeuble": return <Building2 />;
            default: return <Home />;
        }
    }

    const pColor = (u: any) => {
        const activeLease = u.leases?.find((l: any) => l.status === "ACTIVE");
        if (!activeLease) return T.orange; 
        return T.green; 
    }

    return (
        <div className="w-full h-full flex flex-col bg-[#F2F5FA]">
            
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

                {/* KPI CARDS */}
                <div className="grid grid-cols-4 gap-2 mt-5">
                    {[
                        { label: "Entités", val: entities.length, icon: <Building2 size={16}/>, nav: () => resetNav("biens") },
                        { label: "Taux occ.", val: stats.occupancyRate + "%", icon: <BarChart3 size={16}/> },
                        { label: "Impayés", val: stats.arrears, icon: <AlertCircle size={16}/>, nav: () => { resetNav("biens"); setFilterBiens("impayés"); } },
                        { label: "Vacants", val: stats.vacants, icon: <ShieldCheck size={16}/>, nav: () => { resetNav("biens"); setFilterBiens("vacants"); } },
                    ].map((k, i) => (
                        <div key={i} onClick={k.nav} className={`bg-white/12 border border-white/15 rounded-xl p-2 text-center transition-all ${k.nav ? "cursor-pointer active:scale-95" : "cursor-default"}`}>
                            <div className="text-white/80 mb-1 flex justify-center">{k.icon}</div>
                            <div className="text-white font-extrabold text-sm leading-none">{k.val}</div>
                            <div className="text-white/50 text-[8px] mt-1.5 uppercase font-bold tracking-wider">{k.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BODY SECTION (Scrollable) */}
            <div className="flex-1 overflow-y-auto pb-24">
                
                {/* --- TAB: DASHBOARD --- */}
                {tab === "dashboard" && (
                    <div className="p-4 space-y-5">
                        <div className="bg-[#0D2B6E]/5 border border-[#0D2B6E]/15 rounded-2xl p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <SecTitle label="Loyers théoriques — Avril" />
                                    <div className="text-2xl font-black text-[#0D2B6E] font-mono">{fmt(stats.totalRent)} <span className="text-xs text-[#6A7D9E] font-sans">FCFA</span></div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-[#6A7D9E] uppercase">Encaissé</div>
                                    <div className="text-lg font-black text-[#1A7A3C]">{fmt(stats.collected)}</div>
                                    <div className="text-[10px] text-[#6A7D9E]">{Math.round((stats.collected / Math.max(stats.totalRent, 1)) * 100)}%</div>
                                </div>
                            </div>
                            <div className="mt-3 h-1.5 bg-[#EEF2F7] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#1A7A3C] to-[#22A050]" 
                                    style={{ width: `${(stats.collected / Math.max(stats.totalRent, 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {stats.arrears > 0 && (
                            <div>
                                <SecTitle label="Alertes actives" />
                                <div className="bg-[#A00000]/10 border border-[#A00000]/30 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#A00000]/15 transition-all">
                                    <div>
                                        <div className="text-[11px] font-bold text-[#0A1930]">Loyers en retard détectés</div>
                                        <div className="text-[10px] text-[#2D3F5E] mt-0.5">{stats.arrears} dossier(s) nécessite(nt) une relance.</div>
                                    </div>
                                    <ChevronRight size={18} className="text-[#A00000]" />
                                </div>
                            </div>
                        )}

                        <div>
                            <SecTitle label="Accès rapides" />
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: <Building2 color={T.navy} />, label: "Ajouter un bien", sub: "Immeuble · Cour", color: T.navy, bg: T.navyPale },
                                    { icon: <Receipt color={T.green} />, label: "Mes quittances", sub: "Historique certifié", color: T.green, bg: T.greenPale, tab: "quittances" },
                                    { icon: <ShieldCheck color={T.purple} />, label: "Cautions CDC", sub: "Consignation", color: T.purple, bg: T.purplePale, tab: "cautions" },
                                    { icon: <BarChart3 color={T.teal} />, label: "Rapport PDF", sub: "Export mensuel", color: T.teal, bg: T.tealPale },
                                ].map((a, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => a.tab && resetNav(a.tab)}
                                        style={{ background: a.bg, border: `1px solid ${a.color}18` }} 
                                        className="rounded-2xl p-3 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <div className="mb-2">{a.icon}</div>
                                        <div style={{ color: a.color }} className="text-[12px] font-extrabold">{a.label}</div>
                                        <div className="text-[9px] text-[#6A7D9E] mt-0.5">{a.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SecTitle label="Mon patrimoine" />
                            <div className="space-y-2">
                                {entities.slice(0, 3).map((e: any) => {
                                    const s = getEntiteStats(e);
                                    return (
                                        <div 
                                            key={e.id} 
                                            onClick={() => { setSelectedEntite(e); setTab("biens"); }}
                                            className="bg-white border border-[#D6DCE8] border-l-4 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#F2F5FA] group transition-all"
                                            style={{ borderLeftColor: s.vacants > 0 ? T.orange : T.green }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl text-[#0D2B6E] group-hover:scale-110 transition-transform">{getEntiteIcon(e.type)}</div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-[#0A1930]">{e.nom}</div>
                                                    <div className="text-[10px] text-[#6A7D9E]">{e.commune} · {e.unites.length} unité(s)</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-[#0D2B6E] font-mono">{fmt(s.loyers)}</div>
                                                <div className="text-[8px] text-[#6A7D9E] uppercase font-bold">FCFA / Mois</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <button 
                                onClick={() => resetNav("biens")} 
                                className="w-full mt-3 bg-[#EEF2FA] border border-[#0D2B6E]/20 rounded-xl py-2.5 text-[11px] font-bold text-[#0D2B6E] hover:bg-[#E0E7FF] transition-colors"
                            >
                                Voir tout le patrimoine <ArrowRight size={14} className="inline ml-1" />
                            </button>
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
                                                <div style={{ background: borderC + "15" }} className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0D2B6E]">{getEntiteIcon(e.type)}</div>
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
                    </div>
                )}

                {/* --- TAB: ENTITE DETAILS --- */}
                {tab === "biens" && selectedEntite && !selectedUnite && (
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <BackBtn label="Patrimoine" onClick={() => setSelectedEntite(null)} />
                        </div>

                        <div className="bg-[#EEF2F7] rounded-3xl p-4 border border-[#D6DCE8]">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-[#0D2B6E] text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    {getEntiteIcon(selectedEntite.type)}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-black text-[#0A1930]">{selectedEntite.nom}</h2>
                                    <p className="text-[11px] text-[#6A7D9E] mt-1 line-clamp-1">{selectedEntite.adresse}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {selectedEntite.unites.map((u: any) => {
                                const activeLease = u.leases?.find((l: any) => l.status === "ACTIVE");
                                return (
                                    <div 
                                        key={u.id} 
                                        onClick={() => { setSelectedUnite(u); setUnitTab("info"); }}
                                        className="bg-white border border-[#D6DCE8] border-l-4 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#F2F5FA] group transition-all"
                                        style={{ borderLeftColor: pColor(u) }}
                                    >
                                        <div className="flex-1">
                                            <div className="text-[11px] font-bold text-[#0A1930]">{u.name || "Unité"}</div>
                                            <div className="text-[10px] text-[#6A7D9E]">{activeLease ? (activeLease.tenant?.fullName || "Locataire actif") : "Unité vacante"}</div>
                                        </div>
                                        <ChevronRight size={16} className="text-[#D6DCE8]" />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* --- TAB: UNIT DETAILS --- */}
                {tab === "biens" && selectedEntite && selectedUnite && (
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <BackBtn label={selectedEntite.nom} onClick={() => setSelectedUnite(null)} />
                        </div>

                        <div className="bg-[#EEF2F7] rounded-3xl p-5 border border-[#D6DCE8]">
                            <h2 className="text-base font-black text-[#0A1930]">{selectedUnite.name || "Unité Locative"}</h2>
                        </div>

                        <div className="flex border-b border-[#D6DCE8]">
                            {["info", "bail", "locataire"].map(tid => (
                                <button 
                                    key={tid} 
                                    onClick={() => setUnitTab(tid)}
                                    className={`flex-1 py-3 text-[11px] font-black uppercase transition-all ${unitTab === tid ? "text-[#0D2B6E] border-b-2 border-[#0D2B6E]" : "text-[#6A7D9E]"}`}
                                >
                                    {tid}
                                </button>
                            ))}
                        </div>

                        <div className="py-2">
                            {unitTab === "info" && (
                                <div className="space-y-1">
                                    <Row label="Code QAPRIL" value={selectedUnite.propertyCode} />
                                    <Row label="Loyer mensuel" value={fmt(selectedUnite.leases?.[0]?.rentAmount || 0) + " FCFA"} />
                                </div>
                            )}
                            {unitTab === "bail" && (
                                <div className="py-4 text-center text-[#6A7D9E] text-xs">Informations du bail</div>
                            )}
                            {unitTab === "locataire" && (
                                <div className="py-4 text-center text-[#6A7D9E] text-xs">Détails locataire</div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: QUITTANCES --- */}
                {tab === "quittances" && (
                    <div className="p-4 space-y-6">
                        <SecTitle label="Gestion des Quittances" />
                        <div className="bg-white border border-[#D6DCE8] rounded-2xl p-6 text-center">
                            <Receipt size={48} className="mx-auto text-[#0D2B6E] opacity-20 mb-4" />
                            <h3 className="text-sm font-black text-[#0A1930]">Aucune quittance générée ce mois-ci</h3>
                        </div>
                    </div>
                )}

                {/* --- TAB: CAUTIONS --- */}
                {tab === "cautions" && (
                    <div className="p-4 space-y-6">
                        <SecTitle label="Système de Consignation" />
                        <div className="bg-[#5B21B6]/5 border border-[#5B21B6]/15 rounded-[2rem] p-6 text-center">
                            <ShieldCheck size={32} className="mx-auto text-[#5B21B6] mb-4" />
                            <h2 className="text-lg font-black text-[#5B21B6]">Cautions CDC</h2>
                        </div>
                    </div>
                )}

                {/* --- TAB: PROFIL --- */}
                {tab === "profil" && (
                    <div className="p-4 space-y-6">
                        <SecTitle label="Paramètres du Profil" />
                        <div className="bg-[#EEF2F7] rounded-[2rem] p-6 text-center border border-[#D6DCE8]">
                            <User size={40} className="mx-auto text-[#0D2B6E] mb-4" />
                            <h2 className="text-lg font-black text-[#0A1930] uppercase">{user?.name || "ADAMA K."}</h2>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
