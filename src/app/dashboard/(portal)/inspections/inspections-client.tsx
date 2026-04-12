"use client"

import React, { useState, useTransition } from "react"
import { Search, MapPin, CheckSquare, Plus, FileSignature } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { triggerEdlComparison } from "@/actions/edl-actions";

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <CheckSquare className="text-qgreen" size={32} /> États des Lieux
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Répertoire central des inspections entrantes et sortantes.
                    </p>
                </div>
                <button onClick={() => router.push('/dashboard/inspections/new')} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Planifier Inspection
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par adresse ou locataire..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qgreen focus:ring-1 focus:ring-qgreen transition-all" />
                    </div>
                </div>

                <div className="p-10 space-y-4">
                     {filteredEdls.map(e => (
                         <div key={e.id} className={`bg-white border ${e.typeEdl === 'SORTIE' ? 'border-qgreen border-dashed' : 'border-qgrey-2'} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-6`}>
                             <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 ${e.typeEdl === 'SORTIE' ? 'bg-qgrey-1 text-qtext-mid' : 'bg-qgreen-pale text-qgreen'} rounded-xl flex items-center justify-center font-black text-xl`}>
                                    {e.typeEdl === 'SORTIE' ? 'OUT' : 'IN'}
                                 </div>
                                 <div>
                                     <h3 className="text-lg font-black text-qnavy-dark">{e.lease?.property?.address || 'Adresse Inconnue'}</h3>
                                     <p className="text-xs font-bold text-qtext-mid mt-1 flex items-center gap-1">
                                         <MapPin size={12}/> Locataire: {e.lease?.tenant ? `${e.lease.tenant.firstName} ${e.lease.tenant.lastName}` : 'Non assigné'}
                                     </p>
                                     <p className="text-[10px] text-qtext-light font-bold mt-1 uppercase tracking-widest">{e.refEdl}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-8">
                                 {e.typeEdl === 'SORTIE' ? (
                                     <button 
                                         onClick={() => handleCompare(e.id)} 
                                         disabled={isPending}
                                         className="bg-qgreen text-white font-black text-xs uppercase px-6 py-3 rounded-xl hover:bg-qgreen-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                                         <FileSignature size={14}/> Démarrer Comparatif
                                     </button>
                                 ) : (
                                     <>
                                         <div className="text-center">
                                             <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Photos</p>
                                             <p className="text-lg font-black text-qnavy">{e.sections?.length || 0}</p>
                                         </div>
                                         <button onClick={() => router.push(`/admin/edl/${e.id}`)} className="bg-transparent border border-qgrey-2 text-qnavy font-black text-xs uppercase px-4 py-2 rounded-lg hover:bg-qgrey-1 transition-colors">
                                             Voir Document
                                         </button>
                                     </>
                                 )}
                             </div>
                         </div>
                     ))}
                     
                     {filteredEdls.length === 0 && (
                         <div className="text-center p-10 font-bold text-qtext-light">
                             Aucun état des lieux existant ou ne correspond à la recherche.
                         </div>
                     )}
                </div>
            </div>
            
            <div className="flex justify-center p-4">
               <p className="text-xs font-bold text-qtext-mid bg-qgrey-1 px-4 py-2 rounded-full">
                 L'outil "Comparateur d'Usure IA" est interconnecté avec la base photographique de QAPRIL Storage.
               </p>
            </div>
        </div>
    )
}
