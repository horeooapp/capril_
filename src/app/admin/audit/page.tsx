"use client"

import { useState, useEffect } from "react"
import { getAuditLogs } from "@/actions/audit"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({ module: "", action: "" })

    useEffect(() => {
        loadLogs()
    }, [])

    async function loadLogs() {
        setLoading(true)
        const data = await getAuditLogs()
        setLogs(data)
        setLoading(false)
    }

    const filteredLogs = logs.filter(log => {
        if (filter.module && log.module !== filter.module) return false
        if (filter.action && !log.action.includes(filter.action)) return false
        return true
    })

    const modules = Array.from(new Set(logs.map(l => l.module)))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Journal d'Audit & Traçabilité</h1>
                    <p className="text-gray-400 text-lg">Suivi en temps réel de toutes les opérations système.</p>
                </div>
                <button 
                    onClick={loadLogs}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors border border-gray-700"
                    title="Actualiser"
                >
                    🔄 Rafraîchir
                </button>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 italic">Module</label>
                    <select 
                        value={filter.module}
                        onChange={(e) => setFilter({...filter, module: e.target.value})}
                        className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Tous les modules</option>
                        {modules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1 italic">Rechercher une action</label>
                    <input 
                        type="text"
                        placeholder="Ex: ENABLE_FEATURE..."
                        value={filter.action}
                        onChange={(e) => setFilter({...filter, action: e.target.value})}
                        className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-800/50 text-gray-300 text-sm border-b border-gray-800">
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date & Heure</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Module</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Détails</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">IP / Client</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4 bg-gray-800/20 h-16"></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Aucun log trouvé pour ces critères.</td>
                                </tr>
                            ) : filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                                            log.module === 'SYSTEM' ? 'bg-indigo-900/30 border-indigo-700 text-indigo-300' :
                                            log.module === 'AUTH' ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300' :
                                            'bg-gray-700/30 border-gray-600 text-gray-400'
                                        }`}>
                                            {log.module}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-300 font-medium">{log.user?.fullName || "Système"}</div>
                                        <div className="text-xs text-gray-500">{log.user?.email || "internal@qapril.com"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                        {log.newValues ? JSON.stringify(log.newValues) : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                                        <div>{log.ipAddress}</div>
                                        <div className="truncate w-32" title={log.userAgent}>{log.userAgent}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proof Hash Security Info */}
            <div className="flex items-center space-x-2 text-xs text-gray-600">
                <span className="text-emerald-900/50 font-bold">SHA-256 Proof-Chain</span>
                <span>•</span>
                <span>L'intégrité de ce journal est garantie par chaînage cryptographique.</span>
            </div>
        </div>
    )
}
