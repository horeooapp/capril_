"use client"

import React, { useTransition } from "react"
import { ShieldAlert, AlertTriangle, Fingerprint, Eye, Lock, Server, Cpu, Clock, History, Ban, ShieldCheck, Database } from "lucide-react"
import { toast } from "sonner";
import { exportCsvAudit, initiateLockdown, closeAuditTicket } from "@/actions/moderation-actions";

export default function AntiFraudSentinelClient({ initialLogs }: { initialLogs: any[] }) {
    const [isPending, startTransition] = useTransition()
    
    // Fallback if logs empty
    const auditLogs = initialLogs

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                     <div className="mb-2 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Cpu size={12} /> Mode Super-Admin (God Mode)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                        Sentinel <span className="text-rose-600">Anti-Fraude</span>
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Surveillance algorithmique des Garde-Fous (Audit Logs) et altérations de la base de données.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { startTransition(async () => { toast.loading("Exportation CSV...", {id:"mod"}); const res = await exportCsvAudit(); if(res.success) toast.success("Audit téléchargé.", {id:"mod"}); else toast.error("Erreur", {id:"mod"}); }) }} disabled={isPending} className="bg-white border text-slate-700 border-slate-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm flex items-center gap-2">
                        <History size={16} /> Exporter Audit
                    </button>
                    <button onClick={() => { startTransition(async () => { toast.loading("Verrouillage en cours...", {id:"lock"}); const res = await initiateLockdown(); if(res.success) toast.success(res.message, {id:"lock"}); }) }} disabled={isPending} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center gap-2">
                        <Lock size={16} /> Verrouiller le Réseau
                    </button>
                </div>
            </div>

            {/* Defense Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Server size={10}/> Requêtes Serveur / 24h</span>
                    <span className="text-2xl font-black text-slate-800">1.4 Millions</span>
                </div>
                
                <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-200 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><AlertTriangle size={10}/> Traces Suspectes (BDD)</span>
                    <span className="text-2xl font-black text-rose-700">{auditLogs.filter(l => l.module === 'MODERATION').length} <span className="text-[10px] font-bold opacity-70">Logs</span></span>
                </div>

                <div className="bg-amber-50 p-5 rounded-[2rem] border border-amber-200 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Fingerprint size={10}/> Entités Journalisées</span>
                    <span className="text-2xl font-black text-amber-700">{auditLogs.length} <span className="text-[10px] font-bold opacity-70">Actes</span></span>
                </div>

                <div className="bg-[linear-gradient(135deg,#0F172A_0%,#000000_100%)] p-5 rounded-[2rem] shadow-lg flex flex-col justify-center relative overflow-hidden">
                     <ShieldAlert className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-1.5"><Database size={10}/> Intégrité Blockchain</span>
                     <span className="text-2xl font-black text-emerald-400 relative z-10">99.98%</span>
                </div>
            </div>

             {/* Live CyberFeed */}
            <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Eye size={18} className="text-indigo-600"/> Registre Immuable des Actions (AuditLog Base de Données)
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Horodatage & ID</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Acteur & IP</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-slate-500">Nature de l'Anomalie / Action</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-center text-slate-500">Module (Gravité)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-right text-slate-500">Outils</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Aucun log en base de données.</td>
                                </tr>
                            )}
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <td className="p-5">
                                        <p className="font-mono text-[10px] font-bold text-slate-800 truncate max-w-[120px]" title={log.id}>{log.id}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={10}/> {new Date(log.createdAt).toLocaleString('fr-FR')}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                                            <p className="font-bold text-sm text-slate-800">{log.user?.firstName || "Système"}</p>
                                        </div>
                                        <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">{log.ipAddress || 'Interne'}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-bold text-[9px] uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block mb-1">
                                            {log.action}
                                        </span>
                                        <p className="text-xs font-medium text-slate-600 truncate max-w-[200px]">{log.entityId ? `Cible ID: ${log.entityId}` : 'Globale'}</p>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`inline-flex content-center justify-center w-24 py-1 text-[9px] font-black uppercase tracking-widest rounded shadow-sm ${['MODERATION','TRUST_VAULT'].includes(log.module) ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                         <button onClick={() => { startTransition(async () => { const res = await closeAuditTicket(log.id); if(res.success) toast.success(res.message); }) }} disabled={isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-widest rounded hover:bg-rose-100 transition-colors">
                                             <Ban size={12} /> Exclure (BAN)
                                         </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
