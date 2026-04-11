"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getAllCharges } from "@/actions/charges-actions"
import { Calculator, CheckCircle2, DollarSign, Loader2, Search } from "lucide-react"

export default function ChargesDashboardPage() {
    const [charges, setCharges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getAllCharges()
            if (res.success) setCharges(res.charges || [])
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qnavy" size={40} /></div>

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <Calculator className="text-qblue" size={32} /> Régularisation Charges
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Gestion centralisée de vos provisions et imputations réelles.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md">
                    + Nouveau Paramétrage
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 flex flex-col justify-center items-center shadow-sm">
                    <span className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-2">Total Paramétrages</span>
                    <span className="text-4xl font-black text-qnavy-dark">{charges.length}</span>
                </div>
                <div className="bg-qblue-pale p-6 rounded-3xl border border-qblue/20 flex flex-col justify-center items-center shadow-sm">
                    <span className="text-[10px] font-black text-qblue uppercase tracking-widest mb-2">Provisions Mensuelles</span>
                    <span className="text-4xl font-black text-qblue">
                        {charges.filter(c => c.mode !== 'FORFAIT').reduce((acc, c) => acc + (c.montantMensuel || 0), 0).toLocaleString()} <span className="text-lg">FCFA</span>
                    </span>
                </div>
                <div className="bg-qorange-pale p-6 rounded-3xl border border-qorange/20 flex flex-col justify-center items-center shadow-sm">
                    <span className="text-[10px] font-black text-qorange uppercase tracking-widest mb-2">Forfaits Fixes</span>
                    <span className="text-4xl font-black text-qorange">
                        {charges.filter(c => c.mode === 'FORFAIT').reduce((acc, c) => acc + (c.montantMensuel || 0), 0).toLocaleString()} <span className="text-lg">FCFA</span>
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-qnavy-pale/50 border-b border-qgrey-2">
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qnavy">Logement</th>
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qnavy">Type Charge</th>
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qnavy">Mode</th>
                                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qnavy text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map(c => (
                                <tr key={c.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors">
                                    <td className="p-5 font-bold text-sm text-qnavy-dark">{c.logement?.name || c.logement?.address}</td>
                                    <td className="p-5">
                                        <span className="bg-qgrey-1 text-qtext-mid px-3 py-1 rounded-lg text-xs font-bold uppercase">{c.typeCharge}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.mode === 'FORFAIT' ? 'bg-qorange-pale text-qorange border border-qorange/20' : 'bg-qblue-pale text-qblue border border-qblue/20'}`}>
                                            {c.mode}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right font-black text-qnavy text-lg">{c.montantMensuel.toLocaleString()} FCFA</td>
                                </tr>
                            ))}
                            {charges.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-sm font-bold text-qtext-light">
                                        Aucun paramétrage de charge configuré.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
