"use client"

import React, { useState, useTransition } from "react"
import { ShieldAlert, Lock, CheckCircle2, ArrowRightLeft, FileCheck, CircleDollarSign, Fingerprint, Banknote } from "lucide-react"
import { toast } from "sonner";
import { transferToVault, generateTrustAudit } from "@/actions/trust-actions"

export default function TrustVaultDashboardClient({ initialCautions }: { initialCautions: any[] }) {
    const [cautions, setCautions] = useState(initialCautions)
    const [isPending, startTransition] = useTransition()

    const totalConsigne = cautions.filter((c: any) => c.status === "CONSIGNEE").reduce((acc: number, c: any) => acc + c.amount, 0)
    const totalRisque = cautions.filter((c: any) => c.status === "A_TRANSFERER").reduce((acc: number, c: any) => acc + c.amount, 0)

    const handleTransfer = (id: string) => {
        startTransition(async () => {
            const res = await transferToVault(id)
            if (res.error) toast.error(res.error)
            else {
                toast.success("Consignation CDC-CI effectuée avec succès.")
                setCautions(prev => prev.map(c => c.id === id ? { ...c, status: "CONSIGNEE", dateConsignation: new Date().toLocaleDateString('fr-FR'), hash: Math.random().toString(36).substring(2, 10).toUpperCase() + "-CDC" } : c))
            }
        })
    }

    const handleMassTransfer = () => {
        const toTransfer = cautions.filter((c: any) => c.status === "A_TRANSFERER")
        if (toTransfer.length === 0) return toast.info("Aucune caution en attente.")
        
        toast.promise(
            Promise.all(toTransfer.map((c: any) => transferToVault(c.id))),
            {
                loading: 'Consignation en masse...',
                success: () => {
                    setCautions(prev => prev.map(c => c.status === "A_TRANSFERER" ? { ...c, status: "CONSIGNEE", dateConsignation: new Date().toLocaleDateString('fr-FR'), hash: "MASS-CDC-OK" } : c))
                    return `${toTransfer.length} cautions transférées à la CDC-CI.`
                },
                error: 'Erreur lors du transfert en bloc.'
            }
        )
    }

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[6px] inline-flex items-center gap-2 shadow-sm">
                        <ShieldAlert size={12} /> Conformité Légale (Loi n°2019-576)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                         Coffre-Fort CDC-CI
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Consignation étatique des dépôts de garantie (Cautions) à la Caisse des Dépôts et Consignations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { startTransition(async () => { toast.loading("Audit en cours...", {id:"audit"}); const res = await generateTrustAudit(); if(res.success) toast.success(res.message, {id:"audit"}); else toast.error(res.error, {id:"audit"}); }) }} disabled={isPending} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                        <FileCheck size={16} /> Audit Conformité
                    </button>
                    <button 
                        onClick={handleMassTransfer}
                        disabled={isPending || totalRisque === 0}
                        className="bg-amber-500 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                        {isPending ? 'Transfert...' : 'Transférer au Trésor'} <ArrowRightLeft size={16} />
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-8 rounded-[24px] shadow-sm flex items-center gap-4 relative overflow-hidden text-white">
                    <Lock className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
                    <div className="bg-amber-500/20 p-4 rounded-[12px] backdrop-blur-sm relative z-10 border border-amber-500/30">
                        <CircleDollarSign className="text-amber-400" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1 shadow-sm">Bloqué à la CDC-CI (Sécurisé)</p>
                        <p className="text-4xl font-black">{totalConsigne.toLocaleString()} <span className="text-[13px] text-slate-400 font-bold">FCFA</span></p>
                    </div>
                </div>

                <div className={`bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4`}>
                    <div className={`${totalRisque > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'} p-4 rounded-[12px] border`}>
                        <ShieldAlert className={`${totalRisque > 0 ? 'text-rose-500' : 'text-slate-400'} transition-colors`} size={24} />
                    </div>
                    <div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${totalRisque > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Cautions en Risque Judiciaire</p>
                        <p className={`text-4xl font-black ${totalRisque > 0 ? 'text-rose-500' : 'text-slate-900'}`}>{totalRisque.toLocaleString()} <span className={`text-[13px] ${totalRisque > 0 ? 'text-rose-400' : 'text-slate-500'} font-bold`}>FCFA</span></p>
                    </div>
                </div>

                 <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-50 p-4 rounded-[12px] border border-emerald-200">
                        <ArrowRightLeft className="text-emerald-500" size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cautions Restituées (Fin de Bail)</p>
                        <p className="text-4xl font-black text-slate-900">{cautions.filter(c => c.status === "RESTITUEE").reduce((acc, c) => acc + c.amount, 0).toLocaleString()} <span className="text-[13px] text-slate-500 font-bold">FCFA</span></p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[16px] shadow-sm flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                    <strong className="font-bold uppercase tracking-widest text-amber-900 mr-2">Note Légale :</strong> Conformément à la législation ivoirienne, le dépôt de garantie ne doit plus être conservé par le bailleur ni l'agence. Une fois encaissé via QAPRIL, il doit être conféré au compte séquestre CDC-CI de l'État sous 48h.
                </p>
            </div>

            {/* Cautions Table */}
             <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Lock size={18} className="text-amber-500"/> Registre des Consignations
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Contrat (Bail)</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Locataire</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Valeur Caut.</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500">Code Hachage (CDC)</th>
                                <th className="p-5 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Statut Légal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cautions.map((c: any) => (
                                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-[13px] text-slate-900">{c.propertyInfo}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{c.id.substring(0,8)}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-500">
                                                {c.tenantName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-[13px] text-slate-700">{c.tenantName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-black text-[14px] text-slate-900">
                                        {c.amount.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                    </td>
                                    <td className="p-5">
                                        {c.status === 'A_TRANSFERER' ? (
                                            <span className="text-[11px] font-medium text-slate-400 italic">En attente...</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Fingerprint size={14} className="text-amber-500" />
                                                <code className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-[6px] text-[11px] text-slate-700 font-mono font-bold tracking-wider">{c.hash}</code>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right flex justify-end items-center h-full gap-2 mt-2">
                                        {c.status === 'CONSIGNEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-[8px] shadow-sm">
                                                <Lock size={12} /> Consignée ({c.dateConsignation})
                                            </span>
                                        )}
                                        {c.status === 'RESTITUEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-[8px]">
                                                <CheckCircle2 size={12} /> Restituée
                                            </span>
                                        )}
                                        {c.status === 'A_TRANSFERER' && (
                                            <button 
                                                onClick={() => handleTransfer(c.id)}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-[8px] border border-rose-200 shadow-sm transition-colors hover:bg-rose-100 disabled:opacity-50">
                                                <ShieldAlert size={12} /> Consigner au Trésor
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
