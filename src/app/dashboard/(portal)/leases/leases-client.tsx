"use client"

import React, { useState, useTransition } from "react"
import { ClipboardList, Search, Plus, Key, Filter } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner";
import { renewLeaseAction } from "@/actions/lease.actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function LeasesDashboardClient({ initialLeases }: { initialLeases: any[] }) {
    const [leases] = useState<any[]>(initialLeases.length > 0 ? initialLeases : [])
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState("");

    const filteredLeases = leases.filter(l => 
        (l.tenant?.firstName || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.tenant?.lastName || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.leaseReference || l.id).toLowerCase().includes(search.toLowerCase())
    );

    const handleRenew = (leaseId: string) => {
        startTransition(async () => {
            const promise = renewLeaseAction(leaseId)
            toast.promise(promise, {
                loading: "Génération de l'avenant de renouvellement et log sécurisé...",
                success: "Bail renouvelé avec succès pour un an supplémentaire.",
                error: (err) => err?.message || "Erreur de renouvellement."
            })
        })
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher (ID Bail, Locataire)..." 
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
                        href="/dashboard/lease-wizard" 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-[8px] text-[12px] font-semibold shadow-sm hover:bg-slate-700 transition-colors"
                    >
                        <Plus size={14} /> Nouveau
                    </Link>
                </div>
            </div>

            <SectionCard title="Registre des Baux Locatifs" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Référence</th>
                                <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Preneur (Locataire)</th>
                                <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Loyer (FCFA)</th>
                                <th className="text-left py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Statut</th>
                                <th className="text-right py-2 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50 uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeases.map(l => (
                                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Key size={14} className="text-slate-400"/>
                                            <span className="font-semibold text-[13px] text-slate-800">{l.leaseReference || l.id.substring(0,8)}</span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-wide">{l.leaseType || 'RÉSIDENTIEL'}</p>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-[12.5px] text-slate-700">
                                        {l.tenant ? `${l.tenant.firstName} ${l.tenant.lastName}` : (l.locataire || "Non assigné")}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-[12.5px] text-slate-800">
                                        {(l.rentAmount || l.loyer || 0).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        {l.status === 'ACTIVE' || l.status === 'ACTIF' ? (
                                            <Badge color="green">ACTIF</Badge>
                                        ) : (
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <Badge color="amber">{l.status}</Badge>
                                                {['DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status) && (
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${l.daysSinceCreation >= 4 ? 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                                                        Expire dans {Math.max(0, 5 - l.daysSinceCreation)} jours
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button 
                                            onClick={() => handleRenew(l.id)} 
                                            disabled={isPending}
                                            className="text-[11px] font-semibold text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-colors border border-slate-200 px-3 py-1.5 rounded-[6px] disabled:opacity-50">
                                            Renouveler 1 An
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLeases.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-[13px] text-slate-500">
                                        Aucun bail trouvé.
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
