"use client"

import React, { useState } from "react"
import { Search, MapPin, ArrowLeft, Wrench, PackagePlus } from "lucide-react"
import Link from "next/link"
import MaintenanceTicketForm from "@/components/dashboard/maintenance/MaintenanceTicketForm"

export default function NewTicketClient({ properties, userId }: { properties: any[], userId: string }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProperty, setSelectedProperty] = useState<any>(null)

    const filteredProperties = properties.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/maintenance" className="w-10 h-10 bg-white rounded-[12px] border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowLeft size={16} className="text-slate-500" />
                </Link>
                <div className="flex flex-col gap-1">
                     <div className="mb-2 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm max-w-max">
                        <PackagePlus size={12} /> Gestion des incidents
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        Nouveau Ticket Technique
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        Étape 1 : Sélectionnez le logement concerné
                    </p>
                </div>
            </div>

            <div className="relative w-full max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Filtrer par nom, adresse ou code bien..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[16px] text-[13px] font-bold text-slate-900 shadow-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProperties.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => setSelectedProperty(p)}
                        className="bg-white border border-slate-200 p-6 rounded-[24px] hover:border-slate-400 hover:shadow-sm transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-[12px] border border-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <MapPin size={20} />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-[6px]">{p.propertyCode}</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-[16px] line-clamp-1">{p.name || "Logement sans nom"}</h3>
                        <p className="text-[13px] font-medium text-slate-500 mb-6">{p.address}, {p.commune}</p>
                        
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-[10px] uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                            <span>Sélectionner ce bien</span>
                            <Wrench size={12} />
                        </div>
                    </div>
                ))}

                {filteredProperties.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-300">
                        <p className="text-[13px] text-slate-500 font-medium">Aucun logement trouvé.</p>
                    </div>
                )}
            </div>

            {selectedProperty && (
                <MaintenanceTicketForm 
                    logementId={selectedProperty.id}
                    leaseId={selectedProperty.leases?.[0]?.id} // On prend le premier bail actif par défaut
                    declarantId={userId}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
        </div>
    )
}
