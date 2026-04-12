"use client"

import React, { useState, useTransition } from "react"
import { ClipboardList, Search, Plus, Filter, Key, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner";
import { renewLeaseAction } from "@/actions/lease.actions";

export default function LeasesDashboardClient({ initialLeases }: { initialLeases: any[] }) {
    const [leases] = useState<any[]>(initialLeases.length > 0 ? initialLeases : [])
    const [isPending, startTransition] = useTransition()

    const handleRenew = (leaseId: string) => {
        startTransition(async () => {
            const promise = renewLeaseAction(leaseId)
            toast.promise(promise, {
                loading: "Génération de l'avenant de renouvellement et log sécurisé...",
                success: "Lease renouvelé avec succès pour un an supplémentaire.",
                error: (err) => err?.message || "Erreur de renouvellement."
            })
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <ClipboardList className="text-qgreen" size={32} /> Gestion des Baux
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Les contrats actifs, renouvellements et documents juridiques rattachés.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/lease-wizard" className="bg-qgreen text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgreen-dark transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Nouveau Contrat
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex flex-col md:flex-row justify-between items-center gap-4 bg-qgrey-1/30">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="ID Bail ou Nom Locataire..." className="w-full pl-10 pr-4 py-3 bg-white border border-qgrey-2 rounded-xl text-sm font-bold focus:outline-none focus:border-qgreen focus:ring-1 focus:ring-qgreen transition-all" />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Référence</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Preneur (Locataire)</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Loyer (FCFA)</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leases.map(l => (
                            <tr key={l.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <Key size={14} className="text-qtext-light"/>
                                        <span className="font-bold text-xs text-qnavy-dark">{l.leaseReference || l.id.substring(0,8)}</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase text-qtext-light mt-1">{l.leaseType || 'RESIDENTIEL'}</p>
                                </td>
                                <td className="p-5 font-bold text-sm text-qnavy">{l.tenant ? `${l.tenant.firstName} ${l.tenant.lastName}` : (l.locataire || "Non assigné")}</td>
                                <td className="p-5 font-black text-sm text-qnavy-dark">{(l.rentAmount || l.loyer || 0).toLocaleString()}</td>
                                <td className="p-5">
                                    {l.status === 'ACTIVE' || l.status === 'ACTIF' ? (
                                        <span className="text-[10px] font-black uppercase text-qgreen bg-qgreen-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5">
                                            <CheckCircle2 size={10} /> ACTIF
                                        </span>
                                    ) : (
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-black uppercase text-qorange bg-qorange-pale px-3 py-1.5 rounded-lg flex inline-flex items-center gap-1.5 w-fit">
                                                <Clock size={10} /> {l.status}
                                            </span>
                                            {['DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status) && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${l.daysSinceCreation >= 4 ? 'text-qred bg-qred/5 border-qred/20 animate-pulse' : 'text-qorange-dark bg-qorange-pale border-qorange/20'}`}>
                                                    Expire dans {Math.max(0, 5 - l.daysSinceCreation)} jours
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="p-5 text-right">
                                    <button 
                                        onClick={() => handleRenew(l.id)} 
                                        disabled={isPending}
                                        className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-qgreen transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg disabled:opacity-50">
                                        Renouveler 1 An
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {leases.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-sm font-bold text-qtext-light">
                                    Aucun bail enregistré dans la base de données.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
