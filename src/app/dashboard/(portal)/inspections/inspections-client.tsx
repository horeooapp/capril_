"use client"

import React, { useState, useTransition } from "react"
import { Search, MapPin, CheckSquare, Plus, FileSignature, Info } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { triggerEdlComparison } from "@/actions/edl-actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function InspectionsDashboardClient({ initialEdls }: { initialEdls: any[] }) {
    const [edls] = useState<any[]>(initialEdls.length > 0 ? initialEdls : [])
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition()
    const router = useRouter();

    const filteredEdls = edls.filter(e => 
        (e.refEdl || '').toLowerCase().includes(search.toLowerCase()) || 
        (e.lease?.property?.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.lease?.tenant?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.lease?.tenant?.lastName || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCompare = (edlId: string) => {
        startTransition(async () => {
             const promise = triggerEdlComparison(edlId)
             toast.promise(promise, {
                 loading: "Lancement de l'analyse comparative IA...",
                 success: "Comparaison déclenchée. Le rapport sera généré sous peu.",
                 error: "Erreur lors du déclenchement."
             })
        })
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <CheckSquare className="text-emerald-500" size={32} /> États des Lieux
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Répertoire central des inspections entrantes et sortantes.
                    </p>
                </div>
                <button onClick={() => router.push('/dashboard/inspections/new')} className="bg-slate-800 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                    <Plus size={16} /> Planifier Inspection
                </button>
            </div>

            <SectionCard title="États des Lieux Actifs" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par adresse ou locataire..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" />
                    </div>
                </div>

                <div className="p-6 space-y-4 bg-white">
                     {filteredEdls.map(e => (
                         <div key={e.id} className={`bg-white border ${e.typeEdl === 'SORTIE' ? 'border-sky-300 border-dashed bg-sky-50/30' : 'border-slate-200'} rounded-[12px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6`}>
                             <div className="flex items-center gap-5">
                                 <div className={`w-12 h-12 ${e.typeEdl === 'SORTIE' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-600'} rounded-[10px] flex items-center justify-center font-black text-lg shadow-sm border ${e.typeEdl === 'SORTIE' ? 'border-sky-200' : 'border-emerald-200'}`}>
                                    {e.typeEdl === 'SORTIE' ? 'OUT' : 'IN'}
                                 </div>
                                 <div>
                                     <h3 className="text-[15px] font-bold text-slate-900">{e.lease?.property?.address || 'Adresse Inconnue'}</h3>
                                     <p className="text-[12px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                                         <MapPin size={12} className="text-slate-400"/> Locataire: {e.lease?.tenant ? `${e.lease.tenant.firstName} ${e.lease.tenant.lastName}` : 'Non assigné'}
                                     </p>
                                     <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{e.refEdl}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                 {e.typeEdl === 'SORTIE' ? (
                                     <button 
                                         onClick={() => handleCompare(e.id)} 
                                         disabled={isPending}
                                         className="w-full md:w-auto bg-sky-600 text-white font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-[8px] hover:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                                         <FileSignature size={16}/> Comprarer via IA
                                     </button>
                                 ) : (
                                     <>
                                         <div className="text-center hidden md:block">
                                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Photos</p>
                                             <p className="text-base font-black text-slate-700">{e.sections?.length || 0}</p>
                                         </div>
                                         <button onClick={() => router.push(`/admin/edl/${e.id}`)} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-[8px] hover:bg-slate-50 transition-colors shadow-sm text-center">
                                             Voir Document
                                         </button>
                                     </>
                                 )}
                             </div>
                         </div>
                     ))}
                     
                     {filteredEdls.length === 0 && (
                         <div className="text-center py-12">
                             <CheckSquare className="text-slate-200 mx-auto mb-3" size={32} />
                             <p className="text-[13px] font-medium text-slate-500">Aucun état des lieux existant ou ne correspond à la recherche.</p>
                         </div>
                     )}
                </div>
            </SectionCard>
            
            <div className="flex justify-center p-2">
               <p className="text-[11px] font-bold text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full uppercase tracking-wider border border-slate-200 flex items-center gap-2">
                 <Info size={14} className="text-slate-400"/> L'outil "Comparateur d'Usure IA" est interconnecté avec la base photographique de QAPRIL Storage
               </p>
            </div>
        </div>
    )
}
