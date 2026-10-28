"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getPrepaymentRequests, handlePrepaymentApproval } from "@/actions/prepayment-actions"
import { toast } from "sonner"
import { CalendarDays, CheckCircle2, ChevronLeft, Loader2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

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

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>

    const pendingRequests = requests.filter(r => r.status === 'PENDING')
    const historicalRequests = requests.filter(r => r.status !== 'PENDING')

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/receipts" className="p-2 hover:bg-slate-100 rounded-[10px] transition-colors">
                    <ChevronLeft className="text-slate-500" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Avances sur Loyer</h1>
                    <p className="text-[12px] font-bold text-amber-700 bg-amber-50 w-fit px-2.5 py-0.5 rounded-[6px] border border-amber-200 mt-1">
                        Paiements Anticipés Multi-mois
                    </p>
                </div>
            </div>

            <SectionCard title={`Demandes en Attente (${pendingRequests.length})`} icon={<AlertCircle className="text-amber-500" />}>
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-[12px] border border-dashed border-slate-200">
                        <p className="text-[13px] font-bold text-slate-500">Aucune demande de paiement anticipé en cours.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={req.id} className="p-6 rounded-[16px] border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
                                <div>
                                    <h3 className="font-bold text-[15px] text-slate-900 capitalize">{req.tenant.firstName} {req.tenant.lastName}</h3>
                                    <p className="text-[13px] text-slate-600 font-medium mt-1">Bien: {req.lease.property.name || req.lease.property.address}</p>
                                    <div className="mt-3 text-[11px] font-bold uppercase bg-white px-3 py-1.5 rounded-[8px] border border-amber-200 inline-block text-amber-700 shadow-sm">
                                        Demande : {req.monthsCount} Mois d'Avance
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-slate-900">{req.totalAmount.toLocaleString()} <span className="text-[14px] text-slate-500 font-bold">XOF</span></p>
                                    {req.reason && <p className="text-[13px] italic text-slate-500 mt-2 bg-white/50 p-2 rounded-[8px] border border-amber-100">"{req.reason}"</p>}
                                </div>

                                <div className="flex flex-col gap-3 min-w-[220px]">
                                    {showRejectInput !== req.id ? (
                                        <>
                                            <button 
                                                onClick={() => handleAction(req.id, true)} 
                                                disabled={processingId === req.id}
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-[10px] flex justify-center items-center gap-2 transition-all shadow-md text-[13px]"
                                            >
                                                {processingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                                Approuver
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, false)}
                                                className="w-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold py-2.5 px-4 rounded-[10px] flex justify-center items-center gap-2 transition-all text-[13px]"
                                            >
                                                Refuser
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <input 
                                                type="text" 
                                                placeholder="Motif du refus..." 
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                className="w-full text-[13px] p-3 bg-white border border-rose-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-sm"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowRejectInput(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-[8px] text-[12px] font-bold text-slate-600 transition-colors">Annuler</button>
                                                <button onClick={() => handleAction(req.id, false)} disabled={processingId === req.id} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[8px] text-[12px] font-bold flex justify-center items-center transition-colors shadow-sm">
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
            </SectionCard>

            {/* Historique */}
            {historicalRequests.length > 0 && (
                <SectionCard title="Historique" icon={<CalendarDays className="text-slate-500" />}>
                    <div className="space-y-3">
                        {historicalRequests.map(req => (
                            <div key={req.id} className="p-4 rounded-[12px] border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-[14px] text-slate-800">{req.tenant.firstName} {req.tenant.lastName} <span className="text-slate-400 font-medium">- {req.monthsCount} Mois</span></p>
                                    <p className="text-[13px] text-slate-600 font-medium mt-1">{req.totalAmount.toLocaleString()} XOF</p>
                                </div>
                                <div>
                                    {req.status === 'APPROVED' && <Badge color="green">Approuvé</Badge>}
                                    {req.status === 'REJECTED' && <Badge color="red">Refusé</Badge>}
                                    {req.status !== 'APPROVED' && req.status !== 'REJECTED' && <Badge color="gray">{req.status}</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}
        </div>
    )
}
