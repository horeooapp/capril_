"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getPrepaymentRequests, handlePrepaymentApproval } from "@/actions/prepayment-actions"
import { toast } from "sonner"
import { CalendarDays, CheckCircle2, ChevronLeft, Loader2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LandlordAdvancesPage() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState("")
    const [showRejectInput, setShowRejectInput] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await getPrepaymentRequests()
            // Filter only where the user is the landlord (or just show all if API handles it)
            // The action returns all related ones. We filter out the ones initiated BY us if we are the tenant, 
            // but the action doesn't return role context directly. We'll just show them.
            setRequests(data)
        } catch (error) {
            toast.error("Impossible de charger les demandes d'avance")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (id: string, approved: boolean) => {
        if (!approved && !rejectReason && showRejectInput === id) {
            toast.error("Veuillez indiquer un motif de refus")
            return
        }

        if (!approved && showRejectInput !== id) {
            setShowRejectInput(id)
            return
        }

        setProcessingId(id)
        try {
            const res = await handlePrepaymentApproval(id, approved, rejectReason)
            if (res.success) {
                toast.success(approved ? "Demande approuvée" : "Demande refusée")
                setRejectReason("")
                setShowRejectInput(null)
                loadData()
            } else {
                toast.error(res.error || "Erreur lors de l'opération")
            }
        } catch (error) {
            toast.error("Une erreur est survenue")
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-qorange" size={40} /></div>

    const pendingRequests = requests.filter(r => r.status === 'PENDING')
    const historicalRequests = requests.filter(r => r.status !== 'PENDING')

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/receipts" className="p-2 hover:bg-qgrey-1 rounded-xl transition-colors">
                    <ChevronLeft className="text-qtext-light" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Avances sur Loyer</h1>
                    <p className="text-sm font-bold text-qtext-mid bg-qorange-pale w-fit px-2 rounded-md text-qorange mt-1">
                        Paiements Anticipés Multi-mois
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 p-8 shadow-[0_12px_40px_rgba(13,43,110,0.06)]">
                <h2 className="text-xl font-black text-qnavy-dark mb-6 flex items-center gap-3">
                    <AlertCircle className="text-qorange" /> Demandes en Attente ({pendingRequests.length})
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className="text-center py-10 bg-qgrey-1/30 rounded-2xl border border-dashed border-qgrey-2">
                        <p className="text-sm font-bold text-qtext-light">Aucune demande de paiement anticipé en cours.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={req.id} className="p-6 rounded-2xl border border-qorange/30 bg-qorange/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className="font-black text-qnavy-dark capitalize">{req.tenant.firstName} {req.tenant.lastName}</h3>
                                    <p className="text-sm text-qtext-mid font-bold">Bien: {req.lease.property.name || req.lease.property.address}</p>
                                    <div className="mt-2 text-xs font-black uppercase bg-white px-3 py-1 rounded-lg border border-qorange/20 inline-block text-qorange">
                                        Demande : {req.monthsCount} Mois d'Avance
                                    </div>
                                    <p className="mt-2 text-xl font-black text-qnavy">{req.totalAmount.toLocaleString()} FCFA</p>
                                    {req.reason && <p className="text-sm italic text-qtext-mid mt-2">"{req.reason}"</p>}
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    {showRejectInput !== req.id ? (
                                        <>
                                            <button 
                                                onClick={() => handleAction(req.id, true)} 
                                                disabled={processingId === req.id}
                                                className="w-full bg-qgreen hover:bg-qgreen-dark text-white font-black py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md"
                                            >
                                                {processingId === req.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                                Approuver
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, false)}
                                                className="w-full bg-white hover:bg-qred-pale border-2 border-qred/20 hover:border-qred text-qred font-black py-3 rounded-xl flex justify-center items-center gap-2 transition-all"
                                            >
                                                Refuser
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <input 
                                                type="text" 
                                                placeholder="Motif du refus..." 
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                className="w-full text-xs p-3 border rounded-xl"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowRejectInput(null)} className="flex-1 py-2 bg-qgrey-2 rounded-xl text-xs font-bold">Annuler</button>
                                                <button onClick={() => handleAction(req.id, false)} disabled={processingId === req.id} className="flex-1 py-2 bg-qred text-white rounded-xl text-xs font-bold flex justify-center items-center">
                                                    {processingId === req.id ? <Loader2 className="animate-spin size-4" /> : "Confirmer"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Historique */}
            {historicalRequests.length > 0 && (
                <div className="bg-white rounded-[2rem] border border-qgrey-2 p-8 shadow-sm opacity-80">
                    <h2 className="text-xl font-black text-qnavy-dark mb-6 flex items-center gap-3">
                        <CalendarDays className="text-qnavy" /> Historique
                    </h2>
                    <div className="space-y-3">
                        {historicalRequests.map(req => (
                            <div key={req.id} className="p-4 rounded-xl border border-qgrey-2 bg-qgrey-1/20 flex justify-between items-center">
                                <div>
                                    <p className="font-black text-sm text-qnavy">{req.tenant.firstName} {req.tenant.lastName} - {req.monthsCount} Mois</p>
                                    <p className="text-xs text-qtext-mid">{req.totalAmount.toLocaleString()} FCFA</p>
                                </div>
                                <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                                    req.status === 'APPROVED' ? 'bg-qgreen/10 border-qgreen/20 text-qgreen' : 
                                    req.status === 'REJECTED' ? 'bg-qred/10 border-qred/20 text-qred' : 'bg-qgrey-2 text-qtext-mid'
                                }`}>
                                    {req.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
