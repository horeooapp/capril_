"use client"

import React, { useState, useTransition } from "react"
import { Store, Globe, Eye, ArrowUpRight, Plus, MapPin, CheckCircle, Search, Rocket } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { publishAnnonce } from "@/actions/marketplace-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { Badge } from "@/components/dashboard/ui/Badge";

export default function MarketplaceDashboardClient({ initialAnnonces, agencyId }: { initialAnnonces: any[], agencyId: string }) {
    const [listings, setListings] = useState<any[]>(initialAnnonces)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const activesCount = listings.filter(l => l.statut === "ACTIVE").length
    const totalViews = listings.reduce((acc, l) => acc + (l.nbVisites || 0), 0)

    const handlePublish = (id: string, currentStatus: string) => {
        if (currentStatus === "ACTIVE") return toast.info("Cette annonce est déjà en ligne.");

        startTransition(async () => {
             const res = await publishAnnonce(id)
             if (res.error) toast.error(res.error)
             else {
                 toast.success("Annonce publiée sur QAPRIL Store avec succès.")
                 setListings(prev => prev.map(l => l.id === id ? { ...l, statut: "ACTIVE" } : l))
             }
        })
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Store className="text-indigo-600" size={32} /> Marketplace
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Publiez vos biens vacants sur le store public pour attirer de nouveaux locataires certifiés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push("/dashboard/marketplace/new")} className="bg-indigo-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Créer une Annonce
                    </button>
                    <button onClick={() => window.open(`/store/${agencyId}`, "_blank")} className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <Globe size={16} /> Voir Ma Vitrine
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard label="Annonces Actives" value={activesCount.toString()} sub="En ligne sur le store" trend="up" />
                 <StatCard 
                    label="Vues (30j)" 
                    value={
                        <div className="flex items-center gap-2">
                            {totalViews.toLocaleString()} <ArrowUpRight className="text-emerald-500" size={20}/>
                        </div>
                    } 
                    sub="Trafic organique généré" 
                    trend="up" 
                 />
                 <StatCard label="Candidatures Reçues" value="14" sub="Sur l'ensemble des annonces" />
                 <StatCard label="Taux de Conversion" value="8.5%" sub="Visiteurs vers candidats" trend="up" />
            </div>

            <SectionCard title="Vos Publications" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center justify-end bg-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input type="text" placeholder="Chercher une annonce..." className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Propriété</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Loyer (Mensuel)</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Trafic</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Statut</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listings.map(l => (
                                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                                    <td className="p-4">
                                        <p className="font-bold text-[13.5px] text-slate-900">{l.titre}</p>
                                        <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-1"><MapPin size={12} className="text-slate-400"/> {l.logement?.city || l.logement?.address || "Adresse Non Spécifiée"}</p>
                                    </td>
                                    <td className="p-4 font-black text-[13px] text-slate-700">{l.loyerDemande.toLocaleString()} XOF</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                                            <Eye size={14} className="text-indigo-500"/> {l.nbVisites || 0} Vues
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {l.statut === 'ACTIVE' ? (
                                            <Badge color="emerald">En Ligne</Badge>
                                        ) : (
                                            <Badge color="gray">Brouillon</Badge>
                                        )}
                                    </td>
                                    <td className="p-4 text-right w-[150px]">
                                        {l.statut !== 'ACTIVE' ? (
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); handlePublish(l.id, l.statut); }}
                                                disabled={isPending}
                                                className="text-[10px] font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2.5 rounded-[8px] flex items-center justify-center gap-2 w-full shadow-sm disabled:opacity-60">
                                                <Rocket size={14}/> Publier
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); router.push(l.propertyId ? `/dashboard/properties/${l.propertyId}` : "/dashboard/marketplace/new"); }}
                                                className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 px-4 py-2.5 rounded-[8px] flex items-center justify-center w-full bg-white shadow-sm">
                                                Gérer le Bien
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {listings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500 text-[13px] font-medium">
                                        Aucune annonce pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}
