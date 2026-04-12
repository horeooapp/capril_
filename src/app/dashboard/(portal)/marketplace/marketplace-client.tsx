"use client"

import React, { useState, useTransition } from "react"
import { Store, Globe, Eye, ArrowUpRight, Plus, MapPin, CheckCircle, Search, Rocket } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { publishAnnonce } from "@/actions/marketplace-actions"

// Fallback statique si DB vide
const FALLBACK = [
    { id: "MKT-01", titre: "Studio Haut Standing", logement: { city: "Riviera Palmeraie" }, loyerDemande: 250000, statut: "ACTIVE", nbVisites: 1240 },
    { id: "MKT-02", titre: "Bureau Open Space", logement: { city: "Plateau" }, loyerDemande: 1500000, statut: "ACTIVE", nbVisites: 342 },
    { id: "MKT-03", titre: "Villa Triplex", logement: { city: "Riviera 3" }, loyerDemande: 2000000, statut: "BROUILLON", nbVisites: 0 }
]

export default function MarketplaceDashboardClient({ initialAnnonces }: { initialAnnonces: any[] }) {
    const defaultData = initialAnnonces.length > 0 ? initialAnnonces : FALLBACK
    const [listings, setListings] = useState<any[]>(defaultData)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const activesCount = listings.filter(l => l.statut === "ACTIVE").length
    const totalViews = listings.reduce((acc, l) => acc + (l.nbVisites || 0), 0)

    const handlePublish = (id: string, currentStatus: string) => {
        if (currentStatus === "ACTIVE") return toast.info("Cette annonce est déjà en ligne.");

        startTransition(async () => {
             // Si c'est un mock (id MKT-xxx), on fait juste une fausse maj :
             if (id.startsWith('MKT-')) {
                 toast.success("Annonce publiée sur QAPRIL Store avec succès.")
                 setListings(prev => prev.map(l => l.id === id ? { ...l, statut: "ACTIVE" } : l))
                 return
             }
             
             const res = await publishAnnonce(id)
             if (res.error) toast.error(res.error)
             else {
                 toast.success("Annonce publiée sur QAPRIL Store avec succès.")
                 setListings(prev => prev.map(l => l.id === id ? { ...l, statut: "ACTIVE" } : l))
             }
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Store className="text-qorange" size={32} /> Marketplace
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Publiez vos biens vacants sur le store public QAPRIL pour attirer de nouveaux locataires certifiés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push("/dashboard/marketplace/new")} className="bg-qorange text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Créer une Annonce
                    </button>
                    <button onClick={() => window.open("https://qapril.ci/store/my-agency", "_blank")} className="bg-white text-qnavy border border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Globe size={16} /> Voir Ma Vitrine
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] border border-qnavy rounded-3xl p-6 shadow-lg text-white">
                     <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Annonces Actives</p>
                     <p className="text-3xl font-black text-white mt-1">{activesCount}</p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Vues (30j)</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1 flex items-center gap-2">{totalViews.toLocaleString()} <ArrowUpRight className="text-qgreen" size={20}/></p>
                 </div>
                 <div className="bg-white border border-qgrey-2 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qtext-light">Candidatures Reçues</p>
                     <p className="text-3xl font-black text-qnavy-dark mt-1">14</p>
                 </div>
                 <div className="bg-qgreen-pale border border-qgreen/20 rounded-3xl p-6 shadow-sm">
                     <p className="text-[10px] uppercase tracking-widest font-black text-qgreen-dark">Taux de Conversion</p>
                     <p className="text-3xl font-black text-qgreen mt-1">8.5%</p>
                 </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex items-center justify-between bg-qgrey-1/30">
                    <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest">Vos Publications</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Chercher une annonce..." className="w-64 pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-qorange focus:ring-1 focus:ring-qorange transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Propriété</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Loyer (Mensuel)</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Trafic</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map(l => (
                            <tr key={l.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer">
                                <td className="p-5">
                                    <p className="font-bold text-sm text-qnavy-dark">{l.titre}</p>
                                    <p className="text-[10px] font-bold text-qtext-light flex items-center gap-1 mt-1"><MapPin size={10}/> {l.logement?.city || l.logement?.address || "Adresse Non Spécifiée"}</p>
                                </td>
                                <td className="p-5 font-black text-sm text-qnavy">{l.loyerDemande.toLocaleString()} ₣</td>
                                <td className="p-5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-qtext-mid">
                                        <Eye size={14} className="text-qblue"/> {l.nbVisites || 0} Vues
                                    </div>
                                </td>
                                <td className="p-5">
                                    {l.statut === 'ACTIVE' ? (
                                        <span className="text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            <CheckCircle size={10} /> En Ligne
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            Brouillon
                                        </span>
                                    )}
                                </td>
                                <td className="p-5 text-right w-[150px]">
                                    {l.statut !== 'ACTIVE' ? (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handlePublish(l.id, l.statut); }}
                                            disabled={isPending}
                                            className="text-[10px] font-black uppercase tracking-widest text-white bg-qorange hover:bg-orange-600 transition-colors px-3 py-2 rounded-lg flex items-center gap-2 w-full justify-center shadow-md disabled:opacity-50">
                                            <Rocket size={12}/> Publier
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toast.success("Ouverture de l'éditeur d'annonce..."); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qorange transition-colors border border-qgrey-2 px-3 py-2 rounded-lg w-full justify-center flex">
                                            Gérer
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
