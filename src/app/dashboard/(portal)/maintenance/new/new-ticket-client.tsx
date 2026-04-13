"use client"

import React, { useState } from "react"
import { Search, MapPin, ArrowLeft, Wrench } from "lucide-react"
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
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/maintenance" className="w-10 h-10 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all">
                    <ArrowLeft size={20} className="text-qnavy" />
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-qnavy-dark uppercase tracking-tighter">
                        Nouveau Ticket Technique
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">
                        Étape 1 : Sélectionnez le logement concerné
                    </p>
                </div>
            </div>

            <div className="relative w-full max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Filtrer par nom, adresse ou code bien..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-qgrey-2 rounded-2xl text-sm font-bold shadow-sm focus:outline-none focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProperties.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => setSelectedProperty(p)}
                        className="bg-white border border-qgrey-2 p-6 rounded-[1.5rem] hover:border-qnavy hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-qgrey-1 rounded-xl flex items-center justify-center text-qnavy group-hover:bg-qnavy group-hover:text-white transition-colors">
                                <MapPin size={20} />
                            </div>
                            <span className="text-[10px] font-mono text-qtext-light uppercase tracking-widest">{p.propertyCode}</span>
                        </div>
                        <h3 className="font-black text-qnavy-dark text-lg line-clamp-1">{p.name || "Logement sans nom"}</h3>
                        <p className="text-sm font-medium text-qtext-mid mb-4">{p.address}, {p.commune}</p>
                        
                        <div className="flex items-center gap-2 text-qnavy font-black text-[10px] uppercase tracking-widest">
                            <span>Sélectionner ce bien</span>
                            <Wrench size={14} />
                        </div>
                    </div>
                ))}

                {filteredProperties.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-qgrey-1/30 rounded-[2rem] border-2 border-dashed border-qgrey-2">
                        <p className="text-qtext-light font-bold">Aucun logement trouvé.</p>
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
