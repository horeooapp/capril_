"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { requestPrepayment, getPrepaymentRequests } from "@/actions/prepayment-actions"
import { getTenantLeases as getLocataireLeases } from "@/actions/lease.actions"
import { toast } from "sonner"
import { CalendarDays, CheckCircle2, ChevronLeft, Loader2, CreditCard, Clock } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function TenantAdvancesPage() {
    const { data: session } = useSession()
    const [leases, setLeases] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    
    // Form state
    const [selectedLeaseId, setSelectedLeaseId] = useState("")
    const [monthsCount, setMonthsCount] = useState(3)
    const [reason, setReason] = useState("")

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [leasesData, requestsData] = await Promise.all([
                getLocataireLeases(),
                getPrepaymentRequests()
            ])
            setLeases(leasesData || [])
            if (leasesData?.length > 0) setSelectedLeaseId(leasesData[0].id)
            setHistory(requestsData || [])
        } catch (error) {
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedLeaseId) return toast.error("Veuillez sélectionner un bail")
        
        setSubmitting(true)
        try {
            const res = await requestPrepayment({
                leaseId: selectedLeaseId,
                monthsCount,
                reason
            })
            if (res.success) {
                toast.success("Demande d'avance envoyée au propriétaire")
                setMonthsCount(3)
                setReason("")
                loadData()
            } else {
                toast.error(res.error || "Erreur d'envoi")
            }
        } catch (error) {
            toast.error("Une erreur système est survenue")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qorange" size={40} /></div>

    const selectedLease = leases.find(l => l.id === selectedLeaseId)
    const projectedAmount = selectedLease ? selectedLease.rentAmount * monthsCount : 0

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/mon-espace-locataire/payment" className="p-2 hover:bg-qgrey-1 rounded-xl transition-colors">
                    <ChevronLeft className="text-qtext-light" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Avance sur Loyers</h1>
                    <p className="text-sm font-bold text-qtext-mid">Paiement anticipé de plusieurs mois certifié par QAPRIL</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Formulaire de Demande */}
                <div className="bg-white rounded-[2rem] border border-qgrey-2 p-8 shadow-xl">
                    <div className="w-12 h-12 bg-qorange-pale text-qorange rounded-2xl flex items-center justify-center mb-6">
                        <CreditCard size={24} />
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-qtext-light tracking-widest">Bail concerné</label>
                            <select 
                                value={selectedLeaseId}
                                onChange={(e) => setSelectedLeaseId(e.target.value)}
                                className="w-full bg-qgrey-1 border-none focus:ring-2 focus:ring-qorange rounded-xl px-4 py-3 text-sm font-bold text-qnavy"
                            >
                                {leases.map(l => (
                                    <option key={l.id} value={l.id}>{l.property.name || l.property.address}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-qtext-light tracking-widest flex justify-between">
                                <span>Nombre de mois d'avance</span>
                                <span className="text-qorange">{monthsCount} Mois</span>
                            </label>
                            <input 
                                type="range" 
                                min="2" 
                                max="12" 
                                value={monthsCount}
                                onChange={(e) => setMonthsCount(parseInt(e.target.value))}
                                className="w-full h-2 bg-qgrey-2 rounded-lg appearance-none cursor-pointer accent-qorange"
                            />
                            <div className="flex justify-between text-[9px] text-qtext-mid font-bold">
                                <span>2 Mois</span>
                                <span>12 Mois (Max légal)</span>
                            </div>
                        </div>

                        <div className="p-4 bg-qnavy-pale rounded-xl border border-qnavy/10 flex flex-col items-center justify-center text-center">
                            <p className="text-[10px] font-black uppercase text-qnavy tracking-widest mb-1">Montant Projeté</p>
                            <p className="text-3xl font-black text-qnavy-dark">{projectedAmount.toLocaleString()} <span className="text-sm">FCFA</span></p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-qtext-light tracking-widest">Message pour le propriétaire (Optionnel)</label>
                            <textarea 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Précisez un arrangement spécifique..."
                                className="w-full bg-qgrey-1 border-none focus:ring-2 focus:ring-qorange rounded-xl px-4 py-3 text-sm font-medium resize-none h-24"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting || !selectedLeaseId}
                            className="w-full bg-qorange hover:bg-[#E67500] disabled:bg-qgrey-2 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                            Soumettre la Proposition
                        </button>
                    </form>
                </div>

                {/* Tracking Historique */}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-qnavy-dark flex items-center gap-2">
                        <Clock className="text-qnavy" size={20} /> Vos soumissions
                    </h2>
                    
                    {history.length === 0 ? (
                        <div className="p-6 bg-white border border-qgrey-2 rounded-2xl text-center">
                            <p className="text-sm font-bold text-qtext-light">Aucune avance demandée pour le moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map(req => (
                                <div key={req.id} className="p-5 bg-white border border-qgrey-2 rounded-2xl shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-qgray-2" style={{ backgroundColor: req.status === 'APPROVED' ? '#10C26F' : req.status === 'REJECTED' ? '#FF2E56' : '#FF8200' }}></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-sm text-qnavy-dark">{req.monthsCount} Mois d'Avance</p>
                                        <span className={`text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest ${
                                            req.status === 'APPROVED' ? 'bg-qgreen/10 text-qgreen' : 
                                            req.status === 'REJECTED' ? 'bg-qred/10 text-qred' : 'bg-qorange/10 text-qorange'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-lg font-black text-qnavy">{req.totalAmount.toLocaleString()} FCFA</p>
                                    {req.status === 'REJECTED' && req.rejectionReason && (
                                        <p className="mt-2 text-xs text-qred bg-qred-pale p-2 rounded-md italic">"{req.rejectionReason}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
