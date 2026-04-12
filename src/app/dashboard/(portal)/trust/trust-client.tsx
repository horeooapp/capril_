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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ShieldAlert size={12} /> Conformité Légale (Loi n°2019-576)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                         Coffre-Fort CDC-CI
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Consignation étatique des dépôts de garantie (Cautions) à la Caisse des Dépôts et Consignations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => { startTransition(async () => { toast.loading("Audit en cours...", {id:"audit"}); const res = await generateTrustAudit(); if(res.success) toast.success(res.message, {id:"audit"}); else toast.error(res.error, {id:"audit"}); }) }} disabled={isPending} className="bg-amber-100/50 border border-amber-200 text-amber-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm flex items-center gap-2">
                        <FileCheck size={16} /> Audit Conformité
                    </button>
                    <button 
                        onClick={handleMassTransfer}
                        disabled={isPending || totalRisque === 0}
                        className="bg-gradient-to-br from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
                        {isPending ? 'Transfert...' : 'Transférer au Trésor'} <ArrowRightLeft size={16} />
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-[linear-gradient(135deg,#B45309_0%,#78350F_100%)] p-6 rounded-[2rem] shadow-lg flex items-center gap-4 relative overflow-hidden">
                    <Lock className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm relative z-10 border border-amber-500/30">
                        <CircleDollarSign className="text-amber-300" size={24} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1 shadow-sm">Bloqué à la CDC-CI (Sécurisé)</p>
                        <p className="text-3xl font-black text-white">{totalConsigne.toLocaleString()} <span className="text-sm opacity-80">FCFA</span></p>
                    </div>
                </div>

                <div className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm flex items-center gap-4 ${totalRisque > 0 ? 'border-red-100' : 'border-qgrey-2'}`}>
                    <div className={`${totalRisque > 0 ? 'bg-red-50 border-red-100' : 'bg-qgrey-1 border-qgrey-2'} p-4 rounded-2xl border`}>
                        <ShieldAlert className={`${totalRisque > 0 ? 'text-red-500' : 'text-qgrey-3'} transition-colors`} size={24} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${totalRisque > 0 ? 'text-red-500' : 'text-qtext-light'}`}>Cautions en Risque Judiciaire</p>
                        <p className="text-3xl font-black text-qnavy-dark">{totalRisque.toLocaleString()} <span className="text-sm text-qtext-mid">FCFA</span></p>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-[2rem] border border-qgrey-2 shadow-sm flex items-center gap-4">
                    <div className="bg-qgreen-pale p-4 rounded-2xl border border-qgreen/20">
                        <ArrowRightLeft className="text-qgreen" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Cautions Restituées (Fin de Bail)</p>
                        <p className="text-3xl font-black text-qnavy-dark">{cautions.filter(c => c.status === "RESTITUEE").reduce((acc, c) => acc + c.amount, 0).toLocaleString()} <span className="text-sm text-qtext-mid">FCFA</span></p>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <p className="text-sm text-amber-800 font-medium">
                    <strong className="font-black uppercase tracking-widest text-amber-900 border-b border-amber-200 border-dashed pb-0.5">Note Légale :</strong> Conformément à la législation ivoirienne, le dépôt de garantie ne doit plus être conservé par le bailleur ni l'agence. Une fois encaissé via QAPRIL, il doit être conféré au compte séquestre CDC-CI de l'État sous 48h.
                </p>
            </div>

            {/* Cautions Table */}
             <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                    <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                        <Lock size={18} className="text-amber-600"/> Registre des Consignations
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-white border-b border-qgrey-2">
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Contrat (Bail)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Locataire</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Valeur Caut.</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light">Code Hachage (CDC)</th>
                                <th className="p-5 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right">Statut Légal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cautions.map((c: any) => (
                                <tr key={c.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/50 transition-colors">
                                    <td className="p-5">
                                        <p className="font-bold text-xs text-qnavy">{c.propertyInfo}</p>
                                        <p className="text-[10px] font-black uppercase text-qtext-mid mt-0.5">{c.id.substring(0,8)}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-qgrey-2 flex items-center justify-center font-bold text-[10px] text-qnavy">
                                                {c.tenantName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-sm text-qnavy-dark">{c.tenantName}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-black text-sm text-qnavy-dark">
                                        {c.amount.toLocaleString()} <span className="text-[10px] text-qtext-light opacity-60">FCFA</span>
                                    </td>
                                    <td className="p-5">
                                        {c.status === 'A_TRANSFERER' ? (
                                            <span className="text-xs font-medium text-qtext-light italic">En attente...</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Fingerprint size={14} className="text-amber-600" />
                                                <code className="bg-qgrey-1 px-2 py-1 rounded text-[10px] text-qnavy font-mono font-bold tracking-wider">{c.hash}</code>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-5 text-right flex justify-end items-center h-full gap-2 mt-2">
                                        {c.status === 'CONSIGNEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                                <Lock size={10} /> Consignée ({c.dateConsignation})
                                            </span>
                                        )}
                                        {c.status === 'RESTITUEE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-qgreen-pale text-qgreen text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                <CheckCircle2 size={10} /> Restituée
                                            </span>
                                        )}
                                        {c.status === 'A_TRANSFERER' && (
                                            <button 
                                                onClick={() => handleTransfer(c.id)}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-red-100 shadow-sm transition-all hover:bg-red-500 hover:text-white disabled:opacity-50">
                                                <ShieldAlert size={10} /> Consigner au Trésor
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
