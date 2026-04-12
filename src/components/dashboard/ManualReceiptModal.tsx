"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createReceipt, updateReceipt, getActiveLeasesForSelect } from "@/actions/receipts"
import { toast } from "sonner"
import { X, Calculator, Calendar, CreditCard, FileText } from "lucide-react"

interface ManualReceiptModalProps {
    isOpen: boolean
    onClose: () => void
    initialReceipt?: any // If provided, we are in Edit mode
}

export default function ManualReceiptModal({ 
    isOpen, 
    onClose, 
    initialReceipt 
}: ManualReceiptModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [leases, setLeases] = useState<any[]>([])
    
    // Form state
    const [leaseId, setLeaseId] = useState(initialReceipt?.leaseId || "")
    const [amountFcfa, setAmountFcfa] = useState<number>(initialReceipt?.rentAmount || 0)
    const [chargesAmount, setChargesAmount] = useState<number>(initialReceipt?.chargesAmount || 0)
    const [receiptType, setReceiptType] = useState<string>(initialReceipt?.receiptType || "RENT")
    const [periodStr, setPeriodStr] = useState<string>(initialReceipt?.periodMonth || (() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })())
    const [paymentChannel, setPaymentChannel] = useState<string>(initialReceipt?.paymentMethod || "CASH")
    const [paymentReference, setPaymentReference] = useState<string>(initialReceipt?.paymentRef || "")
    const [status, setStatus] = useState<string>(initialReceipt?.status || "PENDING")

    useEffect(() => {
        if (isOpen && !initialReceipt) {
            getActiveLeasesForSelect().then(setLeases).catch(console.error)
        }
    }, [isOpen, initialReceipt])

    const handleLeaseChange = (id: string) => {
        setLeaseId(id)
        const selected = leases.find(l => l.id === id)
        if (selected) {
            setAmountFcfa(selected.rentAmount)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        startTransition(async () => {
            let result
            if (initialReceipt) {
                result = await updateReceipt(initialReceipt.id, {
                    periodMonth: periodStr,
                    rentAmount: amountFcfa,
                    chargesAmount,
                    paymentChannel,
                    paymentReference,
                    receiptType,
                    status
                })
            } else {
                result = await createReceipt({
                    leaseId,
                    periodMonth: periodStr,
                    rentAmount: amountFcfa,
                    chargesAmount,
                    paymentChannel,
                    paymentReference,
                    receiptType
                })
            }

            if (result.error) {
                toast.error(result.message || result.error)
            } else {
                toast.success(initialReceipt ? "Quittance mise à jour !" : "Quittance générée avec succès !")
                onClose()
                router.refresh()
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-qnavy/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-qgrey-2 animate-in zoom-in-95 duration-300">
                <div className="p-8 pb-4 flex justify-between items-center bg-qgrey-1/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-qgrey-2">
                            <FileText className="text-qorange" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-qnavy-dark tracking-tighter uppercase">
                                {initialReceipt ? "Édition Quittance" : "Nouvelle Quittance"}
                            </h2>
                            <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">
                                {initialReceipt ? `Réf: ${initialReceipt.id}` : "Génération manuelle certifiée"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-qgrey-1 rounded-full transition-colors text-qtext-light">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {!initialReceipt && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Sélectionner le Bail</label>
                            <select 
                                required
                                value={leaseId}
                                onChange={(e) => handleLeaseChange(e.target.value)}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-qnavy transition-all"
                            >
                                <option value="">--- Choisir un bail actif ---</option>
                                {leases.map(l => (
                                    <option key={l.id} value={l.id}>{l.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Période (Mois)</label>
                            <input 
                                type="month" 
                                required
                                value={periodStr}
                                onChange={(e) => setPeriodStr(e.target.value)}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-qnavy transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Type</label>
                            <select 
                                value={receiptType}
                                onChange={(e) => setReceiptType(e.target.value)}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-qnavy transition-all"
                            >
                                <option value="RENT">Loyer / LMNP</option>
                                <option value="DEPOSIT">Caution / Garantie</option>
                                <option value="ADVANCE">Avance / Provision</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Loyer Net (FCFA)</label>
                            <input 
                                type="number" 
                                required
                                value={amountFcfa}
                                onChange={(e) => setAmountFcfa(Number(e.target.value))}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-base font-black text-qnavy-dark focus:ring-2 focus:ring-qnavy transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Charges (FCFA)</label>
                            <input 
                                type="number" 
                                value={chargesAmount}
                                onChange={(e) => setChargesAmount(Number(e.target.value))}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-base font-black text-qtext-mid focus:ring-2 focus:ring-qnavy transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Canal de Paiement</label>
                            <select 
                                value={paymentChannel}
                                onChange={(e) => setPaymentChannel(e.target.value)}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-xs font-bold focus:ring-2 focus:ring-qnavy transition-all"
                            >
                                <option value="CASH">Espèces / Manuel</option>
                                <option value="MOBILE_MONEY">Mobile Money</option>
                                <option value="BANK_TRANSFER">Virement</option>
                                <option value="CHEQUE">Chèque</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-qtext-light uppercase tracking-widest">Statut Final</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-14 bg-qgrey-1/50 border-none rounded-2xl px-5 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-qnavy transition-all"
                            >
                                <option value="PAID">Payée (Certifiée)</option>
                                <option value="PENDING">Émise (En attente)</option>
                                <option value="OVERDUE">Impayée (Arriéré)</option>
                                <option value="CANCELLED">Annulée</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-qgrey-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 h-14 bg-white border border-qgrey-2 text-qtext-light font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-qgrey-1 transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending || (!leaseId)}
                            className="flex-[2] h-14 bg-qnavy text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-qnavy/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending ? "Traitement..." : initialReceipt ? "Sauvegarder les modifications" : "Certifier la Quittance"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
