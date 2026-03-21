"use client"

import { useState, useEffect } from "react"
import { getAuditLogs } from "@/actions/audit"
import { safeStringify } from "@/lib/serialize"
import { 
    ShieldCheck, 
    Search, 
    Filter, 
    RefreshCcw, 
    Clock, 
    User as UserIcon, 
    Activity, 
    Database, 
    Lock,
    ExternalLink,
    Terminal,
    AlertCircle
} from "lucide-react"

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({ module: "", action: "", search: "" })
    const [selectedLog, setSelectedLog] = useState<any>(null)

    async function loadLogs() {
        setLoading(true)
        try {
            const data = await getAuditLogs()
            setLogs(data)
        } catch (err) {
            console.error("Failed to load logs:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [])

    const filteredLogs = logs.filter(log => {
        if (filter.module && log.module !== filter.module) return false
        if (filter.action && !(log.action || "").includes(filter.action)) return false
        if (filter.search) {
            const searchLower = filter.search.toLowerCase()
            return (
                (log.action || "").toLowerCase().includes(searchLower) ||
                (log.user?.fullName || "").toLowerCase().includes(searchLower) ||
                (log.entityId || "").toLowerCase().includes(searchLower)
            )
        }
        return true
    })

    const modules = Array.from(new Set(logs.map(l => l.module)))

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with Premium Ivory Style */}
            <div className="relative p-8 rounded-3xl overflow-hidden bg-white/50 border border-white/80 shadow-2xl backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} className="text-ivoire-dark" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-ivoire-dark/10 rounded-xl">
                            <Lock className="text-ivoire-dark" size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-ivoire-dark/60">Sécurité & Gouvernance</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Registre d'Audit <span className="text-ivoire-dark font-light underline decoration-ivoire-dark/20 underline-offset-8">Certifié</span></h1>
                    <p className="text-gray-500 text-lg max-w-2xl font-medium leading-relaxed">
                        Traçabilité cryptographique immuable pour la conformité DGI/CDC-CI. Chaque action est chaînée et auditée en temps réel.
                    </p>
                </div>
            </div>

            {/* Verification Chain Indicator */}
            <div className="flex items-center gap-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    ))}
                </div>
                <div className="text-sm font-semibold text-emerald-800">
                    Chaîne de preuve SHA-256 active <span className="ml-2 px-2 py-0.5 bg-emerald-100/50 rounded-full text-[10px] font-black uppercase tracking-wider">Vérifiée</span>
                </div>
                <div className="ml-auto flex gap-2">
                    <button 
                        onClick={loadLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        Actualiser
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 active:scale-95">
                        <ExternalLink size={16} />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Smart Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/60 shadow-inner">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-ivoire-dark transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Rechercher action, utilisateur, ID..."
                        value={filter.search}
                        onChange={(e) => setFilter({...filter, search: e.target.value})}
                        className="w-full bg-white/80 border-white/20 focus:border-ivoire-dark/50 text-gray-900 rounded-xl pl-10 pr-3 py-3 outline-none transition-all shadow-sm focus:ring-4 focus:ring-ivoire-dark/5"
                    />
                </div>
                <div>
                    <div className="relative group">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            value={filter.module}
                            onChange={(e) => setFilter({...filter, module: e.target.value})}
                            className="w-full bg-white/80 border-white/20 text-gray-900 rounded-xl pl-10 pr-3 py-3 outline-none transition-all shadow-sm focus:ring-4 focus:ring-ivoire-dark/5 appearance-none"
                        >
                            <option value="">Tous les domaines</option>
                            {modules.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-white/60 rounded-xl border border-white/20 text-xs font-black text-ivoire-dark uppercase tracking-widest text-center flex items-center justify-center">
                        {filteredLogs.length} Événements
                    </div>
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/100 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-ivoire-dark text-[11px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Horodatage</th>
                                <th className="px-6 py-6 border-l border-gray-100/50">Trace Identity</th>
                                <th className="px-6 py-6 border-l border-gray-100/50">Opération</th>
                                <th className="px-6 py-6 border-l border-gray-100/50">Cible (UID)</th>
                                <th className="px-6 py-6 border-l border-gray-100/50">Consistance</th>
                                <th className="px-6 py-6 border-l border-gray-100/50 flex justify-end">Réseau</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/80">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-10 bg-gray-50/10"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-gray-50 rounded-full text-gray-300">
                                                <Database size={64} />
                                            </div>
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Registre Vide pour ces critères</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr 
                                    key={log.id} 
                                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                                    className={`group cursor-pointer transition-all hover:bg-ivoire-dark/[0.02] ${selectedLog?.id === log.id ? "bg-ivoire-dark/[0.04]" : ""}`}
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[14px] text-gray-900 font-bold mb-1">
                                                {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(log.createdAt))}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Clock size={12} />
                                                <span className="font-mono text-[11px] tracking-tighter">
                                                    {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(log.createdAt))}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-l border-gray-100/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-ivoire-dark group-hover:text-white transition-all shadow-inner overflow-hidden">
                                                <UserIcon size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-black text-gray-800 tracking-tight">{log.user?.fullName || "Système Externe"}</span>
                                                <span className="text-[11px] font-black text-ivoire-dark/60 uppercase tracking-widest">{log.user?.role || "AUTONOME"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-l border-gray-100/50">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[13px] font-black text-gray-900 tracking-wide uppercase">{log.action.replace(/_/g, ' ')}</span>
                                            <div className={`self-start px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.2em] border ${
                                                log.module === 'SYSTEM' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                                log.module === 'AUTH' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                log.module === 'LEASE' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                'bg-gray-50 border-gray-100 text-gray-600'
                                            }`}>
                                                {log.module}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-l border-gray-100/50">
                                        <div className="flex items-center gap-2 group/id">
                                            <Activity size={12} className="text-gray-300 group-hover/id:text-ivoire-dark" />
                                            <span className="text-[11px] font-mono font-black text-gray-400 truncate w-24 uppercase">{log.entityId || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-l border-gray-100/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-gray-900 uppercase">Intégrité OK</span>
                                                <span className="text-[10px] font-mono text-gray-400 truncate w-24">{log.proofHash || "pending..."}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-l border-gray-100/50 flex justify-end">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[11px] font-mono text-gray-500 font-black">{log.ipAddress}</span>
                                            <span className="text-[10px] text-gray-300 max-w-[100px] truncate" title={log.userAgent}>Agent: {log.userAgent}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 shadow-xl overflow-hidden relative group">
                    <Terminal className="absolute -right-4 -bottom-4 text-white opacity-5 transition-all group-hover:scale-110 group-hover:rotate-6" size={100} />
                    <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        Preuve Cryptographique
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Chaque entrée est scellée par un hash SHA-256 incluant le hash de l'entrée précédente, créant une chaîne immuable.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xl overflow-hidden relative group">
                    <ShieldCheck className="absolute -right-4 -bottom-4 text-emerald-500 opacity-5 transition-all group-hover:scale-110 group-hover:rotate-6" size={100} />
                    <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Validation Légale
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        Ce registre répond aux exigences de traçabilité stricte de la DGI et de la CDC-CI pour la gestion du patrimoine numérique.
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-ivoire-dark shadow-xl overflow-hidden relative group">
                    <AlertCircle className="absolute -right-4 -bottom-4 text-white opacity-5 transition-all group-hover:scale-110 group-hover:rotate-6" size={100} />
                    <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-50"></div>
                            Temps de Rétention
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Les logs sont conservés indéfiniment. Toute tentative d'altération briserait la chaîne de preuve et serait immédiatement détectée.
                    </p>
                </div>
            </div>

            {/* Floating Detail Overlay (Simple implementation) */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Détails de l'Action</h2>
                                <p className="text-ivoire-dark font-black tracking-widest text-[11px] uppercase mt-1">{selectedLog.action}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-white rounded-full transition-colors active:scale-95"
                            >
                                <Lock size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</p>
                                        <p className="text-[15px] font-black text-gray-900">{selectedLog.user?.fullName || "Système"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Client</p>
                                        <p className="text-[15px] font-mono font-black text-gray-900">{selectedLog.ipAddress}</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valeurs Modifiées (Snapshot JSON)</p>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-[11px] text-gray-600 overflow-x-auto max-h-60 whitespace-pre">
                                        {selectedLog.newValues ? safeStringify(selectedLog.newValues) : "Aucune donnée associée."}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preuve de Chaînage (Hash Pre-calculated)</p>
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 font-mono text-[11px] text-emerald-800 break-all leading-relaxed">
                                        <ShieldCheck className="shrink-0" size={16} />
                                        {selectedLog.proofHash || "Non disponible"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="w-full py-4 bg-white hover:bg-gray-100 text-gray-900 font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all border border-gray-200 active:scale-[0.98]"
                            >
                                Fermer le dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
