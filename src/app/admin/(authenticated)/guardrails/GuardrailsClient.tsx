"use client"

import { useState, useEffect } from "react"
import { getGuardLogs, resolveGuardLog } from "@/actions/guard-admin-actions"
import { ShieldAlert, CheckCircle2, AlertTriangle, UserX, UserCheck, ShieldOff } from "lucide-react"
import { toast } from "sonner"

export default function GuardrailsClient() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLog, setSelectedLog] = useState<any>(null)

    async function fetchLogs() {
        setLoading(true)
        try {
            const data = await getGuardLogs()
            setLogs(data)
        } catch(err) {
            toast.error("Erreur chargement des alertes Garde-fous")
        }
        setLoading(false)
    }

    useEffect(() => { fetchLogs() }, [])

    const handleResolve = async (action: string, note: string) => {
        try {
            await resolveGuardLog(selectedLog.id, action, note)
            toast.success("Alerte traitée avec succès")
            setSelectedLog(null)
            fetchLogs()
        } catch(err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                            <ShieldAlert size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-[#1F4E79] tracking-tight uppercase">M-GUARD</h1>
                    </div>
                    <p className="text-gray-500 font-medium px-1">Monitoring des limites de mandats et blocages d'intermédiaires frauduleux.</p>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Chargement des registres...</div>
            ) : logs.length === 0 ? (
                <div className="py-20 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                    <p className="text-emerald-700 font-bold">Aucune alerte de sécurité. Le système est stable.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {logs.map(log => (
                        <div key={log.id} className={`p-6 rounded-[2rem] border-2 transition-all ${log.traite ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-red-100 hover:border-red-300 shadow-xl shadow-red-500/5 cursor-pointer'}`} onClick={() => !log.traite && setSelectedLog(log)}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`mt-1 ${log.traite ? 'text-gray-400' : 'text-red-500'}`}>
                                        {log.traite ? <CheckCircle2 size={24}/> : <UserX size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-black text-gray-900 uppercase">{(log.user?.firstName || "") + " " + (log.user?.lastName || "")}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{log.user?.role}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${log.user?.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{log.user?.status}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-500">{log.typeSignal} - {new Date(log.createdAt).toLocaleString()}</p>
                                        <p className="text-xs mt-2 p-3 bg-red-50/50 rounded-xl text-red-900/80 font-medium max-w-2xl whitespace-pre-wrap">{log.detail}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {log.traite ? (
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Traité par {log.traitePar?.firstName} ({log.actionPrise})
                                        </div>
                                    ) : (
                                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Action Requise
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-2xl w-full rounded-[2.5rem] p-8 shadow-2xl relative">
                        <button onClick={() => setSelectedLog(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-full w-8 h-8 flex justify-center items-center font-bold">X</button>
                        
                        <div className="flex items-center gap-3 mb-6 text-red-600">
                            <ShieldOff size={32} />
                            <h2 className="text-2xl font-black uppercase">Traitement de l'alerte</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                            <p className="text-sm font-bold text-gray-500 mb-2">Utilisateur Impacté</p>
                            <p className="text-lg font-black text-gray-900">{(selectedLog.user?.firstName || "") + " " + (selectedLog.user?.lastName || "")} ({selectedLog.user?.phone})</p>
                            <p className="text-sm text-gray-600 mt-2">{selectedLog.detail}</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget)
                            handleResolve(fd.get('action') as string, fd.get('note') as string)
                        }}>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Décision</label>
                                <select name="action" className="w-full p-4 border border-gray-200 rounded-xl font-bold bg-white outline-none focus:border-red-500" required>
                                    <option value="PARDONNER">Pardonner (Réactiver le compte en ACTIF)</option>
                                    <option value="MAINTENIR_BLOCAGE">Maintenir Banni (Avertissement manuel envoyé)</option>
                                    <option value="BANNISSEMENT_DEFINITIF">Bannissement Définitif</option>
                                </select>
                            </div>
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note Administrative de résolution</label>
                                <textarea name="note" rows={3} className="w-full p-4 border border-gray-200 rounded-xl font-medium outline-none focus:border-red-500" placeholder="Raison de la grâce ou du bannissement, ticket d'appel client..." required></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all">Valider la décision</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
