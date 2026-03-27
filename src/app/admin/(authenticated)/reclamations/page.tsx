import React from "react"
import { AlertCircle, Search, Filter, MessageSquare, Clock, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function AdminReclamationsPage() {
    const reclamations = await (prisma as any).ticketMaintenance.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            logement: { select: { propertyCode: true } },
            locataire: { select: { fullName: true } }
        }
    }).catch(() => [])

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-rose-600 text-[12px] font-black uppercase tracking-[0.3em] mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>M-RCL • Réclamations</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Suivi SAV & Incidents.</h1>
                    <p className="text-[14px] text-gray-500 font-medium">Contrôle des délais d&apos;intervention et auto-clôture 144h.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        Monitoring Actif
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tickets Ouverts</p>
                    <p className="text-3xl font-black text-gray-900">{reclamations.length}</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Délai Moyen</p>
                    <p className="text-3xl font-black text-indigo-600">48h</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Auto-clôtures (144h)</p>
                    <p className="text-3xl font-black text-rose-600">0</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Satisfaction</p>
                    <p className="text-3xl font-black text-emerald-600">--%</p>
                </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un incident..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-6 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">Urgents Only</button>
                        <button className="flex items-center gap-2 px-6 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                            <Filter size={14} />
                            Filtres
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident / Ref</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Locataire / Bien</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Urgence</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Âge du Ticket</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reclamations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic text-sm">
                                        Aucun incident signalé actuellement.
                                    </td>
                                </tr>
                            ) : (
                                reclamations.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{r.categorie || "Maintenance"}</span>
                                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{r.ticketRef}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700">{r.locataire?.fullName}</span>
                                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">{r.logement?.propertyCode}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                r.urgence === "URGENTE" ? "bg-red-50 text-red-600 border border-red-100" :
                                                "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}>
                                                {r.urgence}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-300" />
                                                {Math.floor((new Date().getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600))}H
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                r.statut === "RESOLU" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                r.statut === "EN_COURS" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                "bg-amber-50 text-amber-600 border border-amber-100"
                                            }`}>
                                                {r.statut}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all transform group-hover:scale-110">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
