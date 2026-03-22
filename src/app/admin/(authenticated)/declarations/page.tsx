import { prisma } from "@/lib/prisma"
import { ShieldAlert, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react"

export default async function AdminDeclarationsPage() {
    const declarations = await (prisma as any).smsDeclaration.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            tenant: { select: { fullName: true, phone: true } },
            lease: { 
                include: { 
                    property: { select: { address: true, propertyCode: true } }
                }
            }
        }
    }).catch(() => [])

    return (
        <div className="space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Déclarations SMS & WA.</h1>
                <p className="text-gray-500 font-medium">Supervision en temps réel des flux déclaratifs ADD-11.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card-premium p-6 rounded-2xl bg-white border border-gray-100 italic">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-gray-900">{declarations.length}</p>
                </div>
                <div className="glass-card-premium p-6 rounded-2xl bg-white border border-gray-100 italic text-green-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirmées</p>
                    <p className="text-2xl font-black">{declarations.filter((d: any) => d.statut === 'CONFIRME').length}</p>
                </div>
                <div className="glass-card-premium p-6 rounded-2xl bg-white border border-gray-100 italic text-orange-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">En attente</p>
                    <p className="text-2xl font-black">{declarations.filter((d: any) => d.statut === 'EN_ATTENTE').length}</p>
                </div>
                <div className="glass-card-premium p-6 rounded-2xl bg-white border border-gray-100 italic text-red-600">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contestées</p>
                    <p className="text-2xl font-black">{declarations.filter((d: any) => d.statut === 'CONTESTE').length}</p>
                </div>
            </div>

            <div className="glass-card-premium rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Rechercher un locataire..." 
                                className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium w-80 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Filter size={14} />
                        Filtrer
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] first:pl-10">Locataire</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bien</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montant</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Canal</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] last:pr-10 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {declarations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">
                                        Aucune déclaration enregistrée.
                                    </td>
                                </tr>
                            ) : (
                                declarations.map((dec: any) => (
                                    <tr key={dec.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6 first:pl-10">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 uppercase italic tracking-tighter">{dec.tenant.fullName}</span>
                                                <span className="text-[10px] font-bold text-gray-400 tracking-widest">{dec.tenant.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary text-[11px] uppercase tracking-tighter italic">{dec.lease?.property?.propertyCode}</span>
                                                <span className="text-[10px] font-medium text-gray-400 truncate max-w-[200px]">{dec.lease?.property?.address}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 font-black text-gray-900">
                                            {Number(dec.montantDeclare).toLocaleString()} <span className="text-[10px] text-gray-400">FCFA</span>
                                        </td>
                                        <td className="p-6 text-xs font-bold uppercase text-gray-500 tracking-widest">
                                            {dec.canal}
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                dec.statut === 'CONFIRME' ? 'bg-green-50 text-green-600' :
                                                dec.statut === 'CONTESTE' ? 'bg-red-50 text-red-600' :
                                                dec.statut === 'EN_ATTENTE' ? 'bg-orange-50 text-orange-600' :
                                                'bg-gray-50 text-gray-400'
                                            }`}>
                                                {dec.statut === 'CONFIRME' ? <CheckCircle2 size={12} /> : 
                                                 dec.statut === 'CONTESTE' ? <XCircle size={12} /> : 
                                                 dec.statut === 'EN_ATTENTE' ? <Clock size={12} /> : <Clock size={12} />}
                                                {dec.statut}
                                            </div>
                                        </td>
                                        <td className="p-6 text-right last:pr-10 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(dec.createdAt).toLocaleDateString()}
                                            <br />
                                            {new Date(dec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
