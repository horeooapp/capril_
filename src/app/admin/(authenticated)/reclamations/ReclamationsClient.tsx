"use client"

import { useState } from "react"
import { Search, Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react"
import { resolveSignalement } from "@/actions/signalement-admin-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ReclamationsClient({ tickets, signalements }: { tickets: any[], signalements: any[] }) {
    const [tab, setTab] = useState<"MAINTENANCE" | "SIGNALEMENT">("MAINTENANCE")
    const [selectedSignalement, setSelectedSignalement] = useState<any>(null)
    const [isResolving, setIsResolving] = useState(false)
    const router = useRouter()

    const handleResolve = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedSignalement) return
        setIsResolving(true)
        const fd = new FormData(e.currentTarget)
        const note = fd.get("resolution") as string

        try {
            await resolveSignalement(selectedSignalement.id, note)
            toast.success("Signalement marqué comme traité")
            setSelectedSignalement(null)
            router.refresh()
        } catch (err: any) {
            toast.error(err.message)
        }
        setIsResolving(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-4">
                <button 
                    onClick={() => setTab("MAINTENANCE")}
                    className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${tab === 'MAINTENANCE' ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    Maintenance Techniques ({tickets.length})
                </button>
                <button 
                    onClick={() => setTab("SIGNALEMENT")}
                    className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${tab === 'SIGNALEMENT' ? 'bg-[#1F4E79] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    Signalements Voisinage ({signalements.length})
                </button>
            </div>

            <div className="glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder={`Rechercher un ${tab === 'MAINTENANCE' ? 'ticket' : 'signalement'}...`} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                {tab === 'MAINTENANCE' ? (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident / Ref</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Locataire / Bien</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Urgence</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Âge du Ticket</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type / Sujet</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Locataire Origine</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bien Concerne</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Statut / Action</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tab === 'MAINTENANCE' && (
                                tickets.length === 0 ? (
                                    <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic text-sm">Aucun ticket technique.</td></tr>
                                ) : tickets.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{r.categorie || "Maintenance"}</span>
                                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{r.ticketRef}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700">{(r.locataire?.firstName ? r.locataire.firstName + " " : "") + (r.locataire?.lastName || "")}</span>
                                                <span className="text-[10px] text-[#1F4E79] font-black uppercase tracking-widest">{r.logement?.propertyCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${r.urgence === "URGENTE" ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>{r.urgence}</span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-500">
                                            <div className="flex items-center gap-2"><Clock size={14} className="text-gray-300" />{Math.floor((new Date().getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600))}H</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${r.statut === "RESOLU" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : r.statut === "EN_COURS" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>{r.statut}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase hover:bg-gray-200 transition-colors">Consulter</button>
                                        </td>
                                    </tr>
                                ))
                            )}

                            {tab === 'SIGNALEMENT' && (
                                signalements.length === 0 ? (
                                    <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">Aucun signalement de voisinage.</td></tr>
                                ) : signalements.map((s: any) => (
                                    <tr key={s.id} className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${s.statut === 'RESOLU' ? 'opacity-50' : 'bg-red-50/20'}`} onClick={() => setSelectedSignalement(s)}>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                {s.statut === 'ENVOYE' ? <AlertTriangle size={16} className="text-red-500"/> : <CheckCircle2 size={16} className="text-green-500"/>}
                                                <span className="text-sm font-black text-gray-900">{s.categorie}</span>
                                            </div>
                                            <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{s.description}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-gray-700">{(s.locataire?.firstName || "") + " " + (s.locataire?.lastName || "")}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-[#1F4E79] font-black uppercase tracking-widest">{s.bail?.property?.propertyCode}</span>
                                                <span className="text-xs text-gray-500 truncate w-32">{s.bail?.property?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-500">
                                            {new Date(s.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {s.statut === 'RESOLU' ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">Clos</span>
                                            ) : (
                                                <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-colors shadow-sm shadow-red-500/20">À traiter</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedSignalement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-8 shadow-2xl relative">
                        <button onClick={() => setSelectedSignalement(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold">X</button>
                        
                        <div className="flex items-center gap-3 mb-6 text-rose-600">
                            <AlertCircle size={32} />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Dossier Signalement</h2>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-4">
                            <div>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Motif déclaré</p>
                                <p className="font-black text-gray-900 text-lg uppercase">{selectedSignalement.categorie}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Description locataire</p>
                                <p className="text-sm font-medium text-gray-700">{selectedSignalement.description}</p>
                            </div>
                            {selectedSignalement.photos && selectedSignalement.photos.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Preuve jointe</p>
                                    <a href={selectedSignalement.photos[0]} target="_blank" className="text-blue-500 text-xs font-bold hover:underline">Voir le fichier joint</a>
                                </div>
                            )}
                        </div>

                        {selectedSignalement.statut !== "RESOLU" ? (
                            <form onSubmit={handleResolve}>
                                <div className="mb-8">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note de résolution de modération</label>
                                    <textarea name="resolution" rows={3} className="w-full p-4 border border-gray-200 rounded-xl font-medium outline-none focus:border-rose-500 text-sm" placeholder="Ex: Mise en demeure envoyée au voisin..." required></textarea>
                                </div>
                                <button type="submit" disabled={isResolving} className="w-full py-4 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50">Clôturer le signalement</button>
                            </form>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                <p className="text-green-700 font-bold uppercase text-xs mb-1">Dossier clos (Résolution)</p>
                                <p className="text-green-900/80 text-sm">{selectedSignalement.noteResolution}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
