"use client"

import React, { useState } from "react"
import { Building2, Search, Plus, MapPin, CheckCircle, Clock, Home, X, Filter, BarChart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner";

const FALLBACK = [
    { id: "PROP-xxx-1", name: "Résidence Le Saphir, Abidjan Sud", propertyType: "IMMEUBLE", rooms: 12, status: "active" },
    { id: "PROP-xxx-2", name: "Villa Triplex Riviera", propertyType: "VILLA", rooms: 1, status: "active" },
    { id: "PROP-xxx-3", name: "Local Commercial Plateau", propertyType: "COMMERCIAL", rooms: 3, status: "pending_verification" }
]

export default function PropertiesDashboardClient({ initialProperties }: { initialProperties: any[] }) {
    const defaultData = initialProperties.length > 0 ? initialProperties : FALLBACK;
    const [properties, setProperties] = useState<any[]>(defaultData)
    const [search, setSearch] = useState("");
    const router = useRouter();

    const filteredProps = properties.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.propertyCode || p.id).toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Building2 className="text-qblue" size={32} /> Foncier & Patrimoine
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        L'inventaire central de tous vos biens immobiliers et de leurs unités.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('Menu des filtres avancés en cours d\'ouverture...')} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <Filter size={16} /> Filtres
                    </button>
                    <Link href="/dashboard/properties/new" className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Nouveau Bien
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Main Table */}
                 <div className="lg:col-span-2 bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                     <div className="p-6 border-b border-qgrey-2 flex items-center bg-qgrey-1/30">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un bien par nom ou ID..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qblue focus:ring-1 focus:ring-qblue transition-all" />
                        </div>
                     </div>
                     <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Propriété</th>
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Type & Unités</th>
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProps.map(p => (
                                <tr key={p.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/properties/${p.id}`)}>
                                    <td className="p-5">
                                        <p className="font-bold text-sm text-qnavy-dark">{p.name || p.propertyCode || "Bien sans nom"}</p>
                                        <p className="text-[10px] text-qtext-light font-bold mt-1">ID: {p.id.substring(0,8)}</p>
                                    </td>
                                    <td className="p-5">
                                        <span className="bg-qgrey-1 text-qtext-mid px-2 py-1 rounded text-[9px] font-black uppercase mr-2">{p.propertyType}</span>
                                        <span className="text-xs font-bold text-qnavy">{p.rooms || p.units || 1} Lot(s)</span>
                                    </td>
                                    <td className="p-5">
                                        {p.status === 'active' || p.status === 'rented' ? (
                                            <span className="text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                                <CheckCircle size={10} /> ACTIF
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-qorange bg-qorange-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                                <Clock size={10} /> EN ATTENTE
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredProps.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-qtext-light text-sm font-medium">
                                        Aucun bien immobilier trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                     </table>
                 </div>

                 {/* Metrics Side Panel */}
                 <div className="space-y-6">
                     <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 text-white relative shadow-lg overflow-hidden flex flex-col justify-between h-[250px]">
                         <Building2 size={120} className="absolute -right-6 -bottom-6 text-white opacity-5" />
                         <div>
                             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Valeur Parc Estimée</h3>
                             <p className="text-4xl font-black tracking-tighter">1.2B <span className="text-lg">FCFA</span></p>
                         </div>
                         <div className="mt-auto">
                              <p className="text-[10px] font-medium text-gray-300">Taux d'occupation global : <span className="text-qgreen font-black">92%</span></p>
                              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                                  <div className="bg-qgreen h-1.5 rounded-full" style={{width: `92%`}}></div>
                              </div>
                         </div>
                     </div>

                     <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm">
                         <h3 className="text-sm font-black text-qnavy-dark border-b border-qgrey-2 pb-4 mb-4">Mises aux normes</h3>
                         <div className="flex items-start gap-3 mb-4">
                              <div className="w-2 h-2 rounded-full bg-qred mt-1.5"></div>
                              <div>
                                  <p className="text-xs font-bold text-qnavy">Ascenseur - Tour Ivoire</p>
                                  <p className="text-[10px] text-qtext-light">Certificat de sécurité manquant.</p>
                              </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    )
}
