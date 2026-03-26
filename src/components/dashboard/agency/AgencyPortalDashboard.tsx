"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
    LayoutDashboard, 
    Building2, 
    Users, 
    Settings2, 
    Plus, 
    TrendingUp, 
    ShieldCheck, 
    Bot,
    Zap,
    FileText,
    Camera,
    Signature,
    ClipboardList,
    AlertCircle,
    ChevronRight,
    ArrowRight
} from "lucide-react"
import { AgencyKpiCards } from "./AgencyKpiCards"
import { AgencyPropertyList } from "./AgencyPropertyList"
import { AgencyCandidateList } from "./AgencyCandidateList"
import { AgencyToolsGrid } from "./AgencyToolsGrid"

// Theme Colors (matched with mockup)
const T = {
  navy: "#0D2B6E",
  navyDark: "#071A45",
  green: "#1A7A3C",
  greenLight: "#22A050",
  orange: "#C05B00",
  red: "#A00000",
  white: "#FFFFFF",
  bg: "#F2F5FA",
  text: "#0A1930",
}

export function AgencyPortalDashboard({ user, properties }: { user: any, properties: any[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlTab = searchParams.get("tab") || "dashboard";
    
    const [tab, setTab] = useState(urlTab);

    // Sync tab with URL
    useEffect(() => {
        if (urlTab && urlTab !== tab) {
            setTab(urlTab);
        }
    }, [urlTab, tab]);

    const resetNav = (t: string) => {
        router.push(`/dashboard?tab=${t}`);
        setTab(t);
    };

    return (
        <div className="w-full min-h-screen bg-[#F2F5FA] pb-24">
            
            {/* HEADER SECTION (Mockup Style) */}
            <div style={{ background: `linear-gradient(145deg, ${T.navyDark} 0%, ${T.navy} 55%, ${T.navy} 100%)` }} className="p-6 pb-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#C9A84C] text-[#071A45] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Agence Agréée</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#22A050]" />
                        </div>
                        <h1 className="text-white text-xl font-extrabold uppercase tracking-tight">{user?.fullName || user?.name || "IMMOBILIÈRE DU GOLFE"}</h1>
                        <p className="text-white/60 text-[11px] mt-1">CIMA-CI N°AG-2024-0387 · Abidjan</p>
                    </div>
                </div>

                {/* KPI STRIP */}
                <div className="grid grid-cols-4 gap-2 mt-6">
                    {[
                        { label: "Biens gérés", val: properties.length, icon: <Building2 size={16}/> },
                        { label: "Taux occup.", val: "92%", icon: <TrendingUp size={16}/> },
                        { label: "Impayés", val: "3", icon: <AlertCircle size={16} /> },
                        { label: "Vacants", val: "2", icon: <ShieldCheck size={16}/> },
                    ].map((k, i) => (
                        <div key={i} className="bg-white/12 border border-white/15 rounded-xl p-2 text-center">
                            <div className="text-white/80 mb-1 flex justify-center">{k.icon}</div>
                            <div className="text-white font-extrabold text-sm leading-none">{k.val}</div>
                            <div className="text-white/50 text-[8px] mt-1.5 uppercase font-bold tracking-wider leading-none">{k.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA (No internal tabs, driven by global nav) */}
            <main className="p-4 space-y-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {tab === "dashboard" && (
                            <div className="space-y-6">
                                <AgencyKpiCards properties={properties} />
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-4 space-y-6">
                                        <section className="bg-[#071A45] text-white p-8 rounded-[2.5rem] relative overflow-hidden group">
                                            <div className="relative z-10 space-y-8">
                                                <div>
                                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">Actions.<br/>Flash</h2>
                                                    <p className="text-[10px] text-blue-200/60 font-medium">Commandes prioritaires pour votre agence.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    {[
                                                        { icon: <Plus size={18} />, label: "Nouveau Bail", sub: "Générer un contrat" },
                                                        { icon: <Camera size={18} />, label: "Nouvel EDL", sub: "Photos certifiées" },
                                                        { icon: <Signature size={18} />, label: "Signatures", sub: "Envoyer via M-SIGN" },
                                                    ].map((a, i) => (
                                                        <button key={i} className="w-full flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-left">
                                                            <div className="p-2 bg-white/10 rounded-xl">{a.icon}</div>
                                                            <div>
                                                                <div className="text-[11px] font-black uppercase tracking-widest">{a.label}</div>
                                                                <div className="text-[9px] text-white/40">{a.sub}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="lg:col-span-8">
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                                            <div className="p-3 bg-slate-50 border-b border-slate-100 text-center">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aperçu du Portefeuille</span>
                                            </div>
                                            <AgencyPropertyList properties={properties} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "portefeuille" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-[#1F4E79] uppercase px-2">Gestion du Portefeuille</h2>
                                <AgencyPropertyList properties={properties} />
                            </div>
                        )}

                        {tab === "mandats" && (
                            <div className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
                                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-black text-[#1F4E79] uppercase">Gestion des Mandats</h3>
                                <p className="text-sm text-slate-500 mt-2">Section de suivi des mandats exclusifs et simples.</p>
                            </div>
                        )}

                        {tab === "candidats" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-[#1F4E79] uppercase px-2">M-CAND : Candidatures</h2>
                                <AgencyCandidateList />
                            </div>
                        )}

                        {tab === "outils" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-black text-[#1F4E79] uppercase px-2">Outils Agence</h2>
                                <AgencyToolsGrid />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    )
}
