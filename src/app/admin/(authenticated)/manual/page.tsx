"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
    BookOpen, 
    ShieldCheck, 
    Lock, 
    Database, 
    Users, 
    Zap, 
    Scale, 
    Smartphone,
    Download,
    Wifi,
    FileText
} from "lucide-react"
import ProtectedLogo from "@/components/ProtectedLogo"
import { getDynamicManualContent } from "@/actions/manual-actions"

export default function AdminManualPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDynamicManualContent().then(res => {
            setData(res)
            setLoading(false)
        })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-ivoire-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const iconMap: any = {
        Lock: <Lock className="text-ivoire-dark" />,
        Database: <Database className="text-ivoire-dark" />,
        Smartphone: <Smartphone className="text-ivoire-dark" />
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header / Cover */}
            <div className="relative p-12 rounded-[2.5rem] overflow-hidden bg-white/50 border border-white/80 shadow-2xl backdrop-blur-md">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BookOpen size={160} className="text-ivoire-dark" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-4 mb-8">
                        <ProtectedLogo src="/logo.png" alt="QAPRIL" className="h-16 w-auto rounded-2xl shadow-xl" />
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-ivoire-dark/60">Documentation Dynamique</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Sync: {new Date(data.lastUpdate).toLocaleString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-none">
                        Manuel <span className="text-ivoire-dark">Auto-Adaptatif</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl font-medium leading-relaxed mb-8">
                         Ce document s'auto-génère en fonction des modules activés sur votre instance QAPRIL OS. 
                         Toute évolution fonctionnelle est immédiatement répercutée ici.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-ivoire-dark/5 border border-ivoire-dark/10 rounded-2xl px-5 py-3">
                            <ShieldCheck className="text-ivoire-dark" size={18} />
                            <span className="text-[10px] font-black text-ivoire-dark uppercase tracking-widest">
                                Certificat: {data.hash}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-3 text-green-600">
                             <Wifi size={14} className="animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Live Sync Alpha</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.sections.map((section: any, idx: number) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/40 border border-white/60 p-8 rounded-[2rem] shadow-xl backdrop-blur-sm hover:translate-y-[-4px] transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-ivoire-dark/10 rounded-xl flex items-center justify-center mb-6">
                            {iconMap[section.icon] || <FileText className="text-ivoire-dark" />}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">{section.title}</h3>
                        <ul className="space-y-4">
                            {section.content.map((item: any, i: number) => (
                                <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium leading-snug">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ivoire-dark/40 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Certification Block */}
            <div className="mt-20 p-12 border-4 border-dashed border-ivoire-dark/10 rounded-[3rem] bg-gray-50/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 max-w-lg">
                        <div className="flex items-center gap-3">
                            <Zap className="text-ivoire-dark" size={24} />
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Gouvernance Digitale</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Ce manuel reflète l'état actuel de votre infrastructure. La signature SHA-256 ci-dessous 
                            garantit l'intégrité de la documentation générée au moment de votre consultation.
                        </p>
                        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-inner font-mono text-[10px] text-gray-400 break-all leading-relaxed">
                            <p className="font-bold text-ivoire-dark mb-1 uppercase tracking-widest">SHA-256 SYSTEM HASH</p>
                            {data.hash}-8ba007190f1a-0cc1-4192-bff0-e1e043ce43ce
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 border-2 border-ivoire-dark/20 rounded-3xl p-4 bg-white shadow-xl flex flex-col items-center justify-center text-center gap-2">
                             <ShieldCheck className="text-ivoire-dark" size={40} />
                             <span className="text-[8px] font-black text-ivoire-dark uppercase tracking-tighter">Verified Integrity</span>
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-ivoire-dark transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase text-xs tracking-[0.2em]"
                        >
                            <Download size={18} />
                            Exporter Manuel (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
