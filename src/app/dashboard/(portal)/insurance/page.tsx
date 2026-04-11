"use client"

import React, { useEffect, useState } from "react"
import { getAllInsurances } from "@/actions/insurance"
import { Shield, AlertTriangle, FileText, Loader2, Plus } from "lucide-react"

export default function InsuranceDashboardPage() {
    const [insurances, setInsurances] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getAllInsurances()
            if (res.success) setInsurances(res.insurances || [])
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qgreen" size={40} /></div>

    const totalClaims = insurances.reduce((acc, ins) => acc + (ins.claims?.length || 0), 0)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-qgreen" size={32} /> Assurances & Sinistres
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Couvertures Loyers Impayés et dommages, gérées au sein de QAPRIL.
                    </p>
                </div>
                <button className="bg-qgreen text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgreen-dark transition-all shadow-md flex items-center gap-2">
                    <Plus size={16} /> Déclarer Sinistre
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-qgreen-pale p-8 rounded-[2rem] border border-qgreen/20">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-qgreen flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-widest text-qgreen-dark mb-1">Polices Actives</p>
                    <p className="text-5xl font-black text-qgreen">{insurances.filter(i => i.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-qred-pale p-8 rounded-[2rem] border border-qred/20 relative overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm text-qred flex items-center justify-center mb-4 relative z-10">
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-widest text-qred mb-1 relative z-10">Sinistres Déclarés</p>
                    <p className="text-5xl font-black text-qred relative z-10">{totalClaims}</p>
                    <AlertTriangle size={150} className="absolute -bottom-10 -right-10 text-qred opacity-10" />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-qgrey-1/50 border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Police N°</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Assureur</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid">Bien & Locataire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid text-center">Sinistres</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-mid text-right">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {insurances.map(ins => (
                            <tr key={ins.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30">
                                <td className="p-5">
                                    <div className="flex items-center gap-2 text-qnavy-dark font-black text-sm">
                                        <FileText size={16} className="text-gray-400" /> {ins.policyNo}
                                    </div>
                                </td>
                                <td className="p-5 font-bold text-sm text-qnavy">{ins.provider}</td>
                                <td className="p-5">
                                    <p className="text-xs font-black text-qnavy">{ins.lease?.property?.name || ins.lease?.property?.address}</p>
                                    <p className="text-[10px] font-bold text-qtext-light uppercase tracking-widest mt-1">Preneur: {ins.lease?.tenant?.firstName} {ins.lease?.tenant?.lastName}</p>
                                </td>
                                <td className="p-5 text-center">
                                    <span className="bg-qgrey-2 text-qnavy font-black px-3 py-1 rounded-full text-xs">{ins.claims?.length || 0}</span>
                                </td>
                                <td className="p-5 text-right">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ins.status === 'ACTIVE' ? 'bg-qgreen-pale text-qgreen border border-qgreen/20' : 'bg-qred-pale text-qred border border-qred/20'}`}>
                                        {ins.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {insurances.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-sm font-bold text-qtext-light">Aucune police d'assurance attachée à vos baux.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
