"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getGlobalFinancialReport } from "@/actions/report-actions"
import { FileText, Download, BarChart2, TrendingUp, PieChart, Loader2 } from "lucide-react"

export default function ReportsDashboardPage() {
    const [reportData, setReportData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getGlobalFinancialReport()
            if (res.success) setReportData(res.data)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qnavy" size={40} /></div>
    if (!reportData) return <div className="p-10 text-center font-bold text-red-500">Accès Refusé. Droits administrateurs requis.</div>

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <FileText className="text-qblue" size={32} /> Centre de Rapports
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Hub analytique et financier en temps réel.
                    </p>
                </div>
                <button className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md flex items-center gap-2">
                    <Download size={16} /> Exporter PDF
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm">
                    <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Volume des Loyers</p>
                    <p className="text-3xl font-black text-qnavy-dark">{reportData.financials?.rentReceived.toLocaleString()} <span className="text-sm">FCFA</span></p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-qgrey-2 shadow-sm">
                    <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Provisions Charges</p>
                    <p className="text-3xl font-black text-qnavy-dark">{reportData.financials?.chargesReceived.toLocaleString()} <span className="text-sm">FCFA</span></p>
                </div>
                <div className="bg-qgreen-pale p-6 rounded-3xl border border-qgreen/20 shadow-sm">
                    <p className="text-[10px] font-black text-qgreen-dark uppercase tracking-widest mb-1">Honoraires Agence</p>
                    <p className="text-3xl font-black text-qgreen">{reportData.financials?.agencyFees.toLocaleString()} <span className="text-sm">FCFA</span></p>
                </div>
                <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] p-6 rounded-3xl shadow-lg text-white">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Bailleurs (Reversé)</p>
                    <p className="text-3xl font-black text-white">{reportData.financials?.netToLandlords.toLocaleString()} <span className="text-sm">FCFA</span></p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-qgrey-2 p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-qblue/5 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-lg font-black uppercase tracking-widest text-qnavy-dark mb-6 flex items-center gap-2">
                    <BarChart2 className="text-qblue" /> Tendances & CA
                </h3>
                
                <div className="flex flex-col md:flex-row gap-8 items-end h-[250px] pt-10">
                    {reportData.performance?.map((p: any, i: number) => {
                        const maxAmount = Math.max(...reportData.performance.map((x: any) => x.amount)) || 1
                        const heightPct = Math.max((p.amount / maxAmount) * 100, 5)
                        
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-3 group relative">
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-qnavy text-white text-xs font-black px-2 py-1 rounded">
                                    {p.amount.toLocaleString()} ₣
                                </div>
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPct}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="w-full max-w-[60px] bg-qnavy rounded-t-xl group-hover:bg-qblue transition-colors relative overflow-hidden"
                                >
                                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </motion.div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-qtext-light">{p.month}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="flex justify-center p-4">
               <p className="text-xs font-bold text-qtext-mid bg-qgrey-1 px-4 py-2 rounded-full flex items-center gap-2">
                 <PieChart size={14}/> Les rapports de TVA et Taxes Foncières sont générés automatiquement au format Excel Q4.
               </p>
            </div>
        </div>
    )
}
