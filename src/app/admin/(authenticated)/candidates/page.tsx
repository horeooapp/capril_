import React from "react"
import { Users, Search, Filter, Download, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function AdminCandidatesPage() {
    const candidates = await (prisma as any).candidature.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            logement: { select: { propertyCode: true, commune: true } }
        }
    }).catch(() => [])

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary text-[12px] font-black uppercase tracking-[0.3em] mb-2">
                        <Users className="w-4 h-4" />
                        <span>M-CAND • Candidatures</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Registre des Candidats.</h1>
                    <p className="text-[14px] text-gray-500 font-medium">Contrôle centralisé des dossiers M-CAND et scores ICL.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-colors">
                        <Download size={20} />
                    </button>
                    <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                        Exporter CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Dossiers</p>
                    <p className="text-3xl font-black text-gray-900">{candidates.length}</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scores à Valider</p>
                    <p className="text-3xl font-black text-orange-600">0</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Taux de Conversion</p>
                    <p className="text-3xl font-black text-emerald-600">--%</p>
                </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un candidat..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                        <Filter size={14} />
                        Filtres Avancés
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidat</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bien Cible</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenu</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score ICL</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic text-sm">
                                        Aucune candidature enregistrée dans le système central.
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{c.nom} {c.prenom}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{c.telephone}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-600">
                                            {c.logement?.propertyCode} • {c.logement?.commune}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-mono text-indigo-600">
                                            {c.revenuMensuel?.toLocaleString()} FCFA
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black font-mono text-emerald-600">{c.scoreQapril || "---"}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                c.statut === "CONSENT_APPROVED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                c.statut === "CONSENT_REQUESTED" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}>
                                                {c.statut}
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
