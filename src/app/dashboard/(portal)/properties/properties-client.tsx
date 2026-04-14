"use client"

import React, { useState } from "react"
import { Building2, Search, Plus, CheckCircle, Clock, Home, Filter, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

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

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedIds(next);
    };

    const topLevelProps = filteredProps.filter(p => !p.parentPropertyId);

    const PropertyRow = ({ p, isChild = false }: { p: any, isChild?: boolean }) => (
        <React.Fragment key={p.id}>
            <tr 
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${isChild ? 'bg-slate-50/50' : ''}`} 
                onClick={() => router.push(`/dashboard/properties/${p.id}`)}
            >
                <td className={`py-3 px-4 ${isChild ? 'pl-12' : ''}`}>
                    <div className="flex items-center gap-3">
                        {!isChild && (p.units?.length > 0) ? (
                            <button 
                                onClick={(e) => toggleExpand(p.id, e)}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${expandedIds.has(p.id) ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {expandedIds.has(p.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            !isChild && <div className="w-6 h-6" />
                        )}
                        {isChild && <div className="w-4 h-px bg-slate-300"></div>}
                        <div>
                            <p className="font-semibold text-[13px] text-slate-800">{p.name || p.propertyCode || "Bien sans nom"}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
                                {isChild ? `Unité de : ${p.parentProperty?.name || p.parentPropertyId.substring(0,8)}` : `ID: ${p.id.substring(0,8)}`}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-[12.5px] text-slate-700">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase">{p.propertyType}</span>
                        <span className="font-medium">
                            {(!isChild && p.units?.length > 0) ? `${p.units.length} Unité(s)` : (p.rooms || 1) + " Pièce(s)"}
                        </span>
                    </div>
                </td>
                <td className="py-3 px-4">
                    <div className="flex gap-2">
                        {p.status === 'active' || p.status === 'rented' ? (
                            <Badge color="green">ACTIF</Badge>
                        ) : (
                            <Badge color="amber">EN ATTENTE</Badge>
                        )}
                        {p.isOccupied || p.leases?.some((l:any) => l.status === 'ACTIVE') ? (
                            <Badge color="sky">LOUÉ</Badge>
                        ) : (
                            <Badge color="gray">DISPONIBLE</Badge>
                        )}
                    </div>
                </td>
            </tr>
            {expandedIds.has(p.id) && p.units?.map((unit: any) => (
                <PropertyRow key={unit.id} p={unit} isChild={true} />
            ))}
        </React.Fragment>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        placeholder="Rechercher (nom, ID)..." 
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400" 
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => toast.info('Menu des filtres avancés en cours...')} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-[8px] text-[12px] font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <Filter size={14} /> Filtres
                    </button>
                    <Link 
                        href="/dashboard/properties/new" 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-[8px] text-[12px] font-semibold shadow-sm hover:bg-slate-700 transition-colors"
                    >
                        <Plus size={14} /> Nouveau
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <SectionCard title="Portefeuille Immobilier" noPadding>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Propriété</th>
                                        <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Unité / Type</th>
                                        <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">État Locatif</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topLevelProps.map(p => (
                                        <PropertyRow key={p.id} p={p} />
                                    ))}
                                    {topLevelProps.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-slate-500 text-[13px]">
                                                Aucun bien immobilier trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>

                <div className="space-y-4">
                    <div className="p-6 bg-slate-800 rounded-[12px] text-white relative shadow-sm overflow-hidden">
                        <Building2 size={120} className="absolute -right-6 -bottom-6 text-white opacity-5" />
                        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Valeur Parc (Est.)</h3>
                        <p className="text-3xl font-black tracking-tight mt-1">1.2B <span className="text-sm font-medium text-slate-300">FCFA</span></p>
                        
                        <div className="mt-8">
                            <p className="text-[11px] font-medium text-slate-300 flex justify-between">
                                Occupation globale
                                <span className="text-emerald-400 font-bold">92%</span>
                            </p>
                            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div className="bg-emerald-400 h-full rounded-full" style={{width: `92%`}}></div>
                            </div>
                        </div>
                    </div>

                    <SectionCard title="Interventions requises">
                        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-[8px] mb-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0"></div>
                            <div>
                                <p className="text-[12.5px] font-semibold text-rose-900">Ascenseur - Tour Ivoire</p>
                                <p className="text-[11px] text-rose-700 mt-0.5">Certificat de sécurité manquant.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-[8px]">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <div>
                                <p className="text-[12.5px] font-semibold text-amber-900">Toiture - Villa Riviera</p>
                                <p className="text-[11px] text-amber-700 mt-0.5">Inspection prévue ce mois.</p>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    )
}
