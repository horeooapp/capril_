"use client"

import { useState } from "react"
import { Users, Activity, ShieldOff, ShieldCheck } from "lucide-react"
import { banUser, clearFraudScore } from "@/actions/compliance-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ComplianceClient({ initialProfiles, logs }: { initialProfiles: any[], logs: any[] }) {
    const [profiles, setProfiles] = useState(initialProfiles)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [selectedProfile, setSelectedProfile] = useState<any>(null)
    const router = useRouter()

    const handleClearScore = async (id: string) => {
        setLoadingId(id)
        const res = await clearFraudScore(id)
        if (res.success) {
            toast.success("Dossier validé, score réinitialisé.")
            setProfiles(profiles.filter(p => p.id !== id))
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoadingId(null)
    }

    const handleBan = async (id: string, reason: string) => {
        setLoadingId(id)
        const res = await banUser(id, reason)
        if (res.success) {
            toast.success("Utilisateur banni définitivement.")
            setProfiles(profiles.filter(p => p.id !== id))
            setSelectedProfile(null)
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoadingId(null)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risky Profiles */}
            <div className="rounded-[3rem] bg-white/40 border border-white/60 backdrop-blur-2xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-wider mb-8 flex items-center gap-3">
                    <Users size={24} className="opacity-50" />
                    Profils Suspects
                </h3>
                
                <div className="space-y-4">
                    {profiles.length === 0 ? (
                        <p className="text-gray-400 italic font-medium bg-gray-50 p-6 rounded-2xl text-center">Aucun profil suspect détecté.</p>
                    ) : profiles.map((user: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-3xl bg-white/60 border border-red-100 hover:border-red-300 transition-all group gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 font-black text-xl shrink-0">
                                    {user.score}
                                </div>
                                <div className="flex-1">
                                    <div className="font-black text-gray-900 leading-tight">{user.name}</div>
                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 inline-block px-2 py-0.5 rounded-md mt-1">{user.reason}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button 
                                    onClick={() => handleClearScore(user.id)}
                                    disabled={loadingId === user.id}
                                    className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
                                    title="Dédouaner (Score à 0)"
                                >
                                    <ShieldCheck size={18} />
                                </button>
                                <button 
                                    onClick={() => setSelectedProfile(user)}
                                    disabled={loadingId === user.id}
                                    className="p-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                                >
                                    Traiter
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Log / Activity */}
            <div className="rounded-[3rem] bg-white/40 border border-white/60 backdrop-blur-2xl p-8 shadow-sm">
                <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-wider mb-8 flex items-center gap-3">
                    <Activity size={24} className="opacity-50" />
                    Journal de Surveillance
                </h3>
                
                <div className="space-y-6">
                    {!logs || logs.length === 0 ? (
                        <p className="text-gray-400 italic text-center p-6 bg-gray-50 rounded-2xl">Aucune activité récente.</p>
                    ) : logs.map((log: any, i: number) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="w-16 text-right pt-1 font-black text-[10px] text-gray-400 uppercase tracking-widest">{log.time}</div>
                            <div className="relative pt-1">
                                <div className={`w-3 h-3 rounded-full ${log.type === 'alert' ? 'bg-red-500 animate-pulse ring-4 ring-red-100' : 'bg-[#1F4E79]/30'}`}></div>
                                {logs && i !== logs.length - 1 && <div className="absolute top-4 left-[5.5px] bottom-[-24px] w-[1px] bg-[#1F4E79]/10"></div>}
                            </div>
                            <div className="flex-1 pb-6">
                                <div className="text-sm font-bold text-gray-600 group-hover:text-[#1F4E79] transition-colors bg-white/50 p-3 rounded-xl border border-white">{log.msg}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-8 shadow-2xl relative">
                        <button onClick={() => setSelectedProfile(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold">X</button>
                        
                        <div className="flex items-center gap-3 mb-6 text-red-600">
                            <ShieldOff size={32} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Sanction KYC</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                            <p className="font-black text-gray-900">{selectedProfile.name}</p>
                            <p className="text-xs text-red-500 font-bold uppercase mt-1">Score Actuel : {selectedProfile.score}</p>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            handleBan(selectedProfile.id, fd.get('reason') as string);
                        }}>
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Motif du Bannissement</label>
                                <textarea name="reason" rows={3} className="w-full p-4 border border-gray-200 rounded-xl font-medium outline-none focus:border-red-500 text-sm" placeholder="Ex: Falsification CNI constatée..." required></textarea>
                            </div>
                            <button type="submit" className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all">Confirmer Bannissement Définitif</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
