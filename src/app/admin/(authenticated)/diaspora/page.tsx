import React from "react"
import { Globe, Search, Filter, ShieldCheck, Mail, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function AdminDiasporaPage() {
    // Search for users with Diaspora specific flags or roles if applicable
    const diasporaUsers = await prisma.user.findMany({
        where: { role: "LANDLORD", kycLevel: { gte: 3 } }, // Logic for Diaspora often linked to KYC L3+
        take: 20,
        orderBy: { createdAt: 'desc' }
    }).catch(() => [])

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 text-[12px] font-black uppercase tracking-[0.3em] mb-2">
                        <Globe className="w-4 h-4" />
                        <span>M-DIASPORA • Pack Diaspora</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Gestion Internationale.</h1>
                    <p className="text-[14px] text-gray-500 font-medium">Contrôle des services packagés pour les investisseurs de la Diaspora.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                        <Mail size={14} />
                        Notifier Cohorte
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20 bg-indigo-50/30">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Packs Actifs</p>
                    <p className="text-3xl font-black text-indigo-900">{diasporaUsers.length}</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20 bg-emerald-50/30">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Revenus Diaspora</p>
                    <p className="text-3xl font-black text-emerald-900">-- FCFA</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Taux de Rétention</p>
                    <p className="text-3xl font-black text-gray-900">92%</p>
                </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un investisseur diaspora..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Investisseur</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pays de Résidence</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Propriétés</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">KYC Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dernier Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {diasporaUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic text-sm">
                                        Aucun compte diaspora identifié.
                                    </td>
                                </tr>
                            ) : (
                                diasporaUsers.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-indigo-50/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{u.fullName}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{u.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-gray-600">
                                            France (Abidjan Connection)
                                        </td>
                                        <td className="px-8 py-6 text-sm font-black text-indigo-600">
                                            --
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">NIVEAU {u.kycLevel} CERTIFIÉ</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Aujourd&apos;hui (10:45)
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
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
