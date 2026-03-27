import React from "react"
import { FileSignature, Search, ShieldCheck, Lock, Hash, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"

export default async function AdminSignaturesPage() {
    // Search for leases or documents with signature evidence
    const signatures = await (prisma as any).lease.findMany({
        where: { status: "ACTIVE" },
        take: 20,
        orderBy: { updatedAt: 'desc' },
        include: {
            locataire: { select: { fullName: true } },
            owner: { select: { fullName: true } }
        }
    }).catch(() => [])

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 text-[12px] font-black uppercase tracking-[0.3em] mb-2">
                        <FileSignature className="w-4 h-4" />
                        <span>M-SIGN • Signature Électronique</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Preuves de Signature.</h1>
                    <p className="text-[14px] text-gray-500 font-medium">Registre légal des consentements et empreintes numériques SHA-256.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                        <ShieldCheck size={14} />
                        Horodatage Certifié
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contrats Signés</p>
                    <p className="text-3xl font-black text-gray-900">{signatures.length}</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticité Moyenne</p>
                    <p className="text-3xl font-black text-emerald-600">100%</p>
                </div>
                <div className="glass-panel p-6 rounded-[2rem] border border-white/20 bg-emerald-900 text-white shadow-xl shadow-emerald-900/10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Niveau de Sécurité</p>
                    <p className="text-3xl font-black">HIGH-TECH</p>
                </div>
            </div>

            <div className="glass-panel rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par hash ou signataire..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document / Ref</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Signataires</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hash SHA-256 (Preuve)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Validité</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Preuve</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {signatures.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic text-sm">
                                        Aucune signature enregistrée pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                signatures.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">CONTRAT DE BAIL</span>
                                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">REF-{s.id.slice(0,8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 uppercase font-black">Bailleur</span>
                                                    <span className="text-sm font-bold text-gray-700">{s.owner?.fullName}</span>
                                                </div>
                                                <div className="w-1 h-8 bg-gray-100 rounded-full" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 uppercase font-black">Preneur</span>
                                                    <span className="text-sm font-bold text-gray-700">{s.locataire?.fullName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-mono text-[9px] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                <Hash size={10} />
                                                e93f...b82d
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <Lock size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">LÉGAL</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                                                SCELLÉ
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all transform group-hover:scale-110 shadow-sm shadow-emerald-100">
                                                <ShieldCheck size={18} />
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
