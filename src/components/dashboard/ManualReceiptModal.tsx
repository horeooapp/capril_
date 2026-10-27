"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createReceipt, updateReceipt, getActiveLeasesForSelect } from "@/actions/receipt.actions"
import { toast } from "sonner"
import { X, Calculator, Calendar, CreditCard, FileText, CheckCircle2, Building2, User, Phone, Wallet, Info } from "lucide-react"

interface ManualReceiptModalProps {
    isOpen: boolean
    onClose: () => void
    initialReceipt?: any // If provided, we are in Edit mode
    activeLeases?: any[]
    onSuccess?: () => void
}

export default function ManualReceiptModal({ 
    isOpen, 
    onClose, 
    initialReceipt,
    activeLeases = [],
    onSuccess
}: ManualReceiptModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [leases, setLeases] = useState<any[]>(activeLeases)
    
    // Form state
    const [leaseId, setLeaseId] = useState(initialReceipt?.leaseId || "")
    const [rentAmount, setRentAmount] = useState<number>(initialReceipt?.rentAmount || 0)
    const [chargesAmount, setChargesAmount] = useState<number>(initialReceipt?.chargesAmount || 0)
    const [receiptType, setReceiptType] = useState<string>(initialReceipt?.receiptType || "RENT")
    
    // Période (Mois au format YYYY-MM)
    const [periodStr, setPeriodStr] = useState<string>(initialReceipt?.periodMonth || (() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })())

    // Mode de règlement
    const [paymentChannel, setPaymentChannel] = useState<string>(initialReceipt?.paymentMethod || "WAVE")
    const [paymentReference, setPaymentReference] = useState<string>(initialReceipt?.paymentRef || "")
    
    // Statut : PAID ou PENDING
    const [status, setStatus] = useState<string>(initialReceipt?.status || "PAID")
    
    // Date effective de paiement
    const [paidAtDate, setPaidAtDate] = useState<string>(() => {
        if (initialReceipt?.paidAt) {
            try {
                return new Date(initialReceipt.paidAt).toISOString().split('T')[0]
            } catch {
                return new Date().toISOString().split('T')[0]
            }
        }
        return new Date().toISOString().split('T')[0]
    })

    // Note / Commentaire interne
    const [internalNotes, setInternalNotes] = useState<string>(initialReceipt?.commentaireInterne || "")

    // Charger les baux si non fournis dans les props
    useEffect(() => {
        if (isOpen && (!leases || leases.length === 0) && !initialReceipt) {
            getActiveLeasesForSelect().then(data => {
                if (Array.isArray(data)) setLeases(data)
            }).catch(console.error)
        }
    }, [isOpen, leases, initialReceipt])

    // Met à jour les valeurs lors de l'édition d'une quittance existante
    useEffect(() => {
        if (initialReceipt) {
            setLeaseId(initialReceipt.leaseId || "")
            setRentAmount(Number(initialReceipt.rentAmount || 0))
            setChargesAmount(Number(initialReceipt.chargesAmount || 0))
            setPeriodStr(initialReceipt.periodMonth || "")
            setPaymentChannel(initialReceipt.paymentMethod || "WAVE")
            setPaymentReference(initialReceipt.paymentRef || "")
            setStatus(initialReceipt.status || "PAID")
            setInternalNotes(initialReceipt.commentaireInterne || "")
        }
    }, [initialReceipt])

    if (!isOpen) return null

    // Détail du bail sélectionné
    const selectedLease = leases.find(l => l.id === leaseId)

    const handleLeaseChange = (id: string) => {
        setLeaseId(id)
        const selected = leases.find(l => l.id === id)
        if (selected) {
            setRentAmount(Number(selected.rentAmount || 0))
            setChargesAmount(Number(selected.chargesAmount || 0))
        }
    }

    const totalAmount = rentAmount + chargesAmount

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!leaseId) {
            toast.error("Veuillez sélectionner un bail de location.")
            return
        }

        if (totalAmount <= 0) {
            toast.error("Le montant total doit être supérieur à 0 XOF.")
            return
        }

        startTransition(async () => {
            let result
            if (initialReceipt) {
                result = await updateReceipt(initialReceipt.id, {
                    periodMonth: periodStr,
                    rentAmount,
                    chargesAmount,
                    paymentChannel,
                    paymentReference,
                    status
                })
            } else {
                result = await createReceipt({
                    leaseId,
                    periodMonth: periodStr,
                    rentAmount,
                    chargesAmount,
                    paymentMethod: paymentChannel,
                    paymentRef: paymentReference,
                    isDeposit: receiptType === "DEPOSIT",
                    paidAt: status === "PAID" ? new Date(paidAtDate) : undefined,
                    status,
                    notes: internalNotes
                })
            }

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(initialReceipt ? "Quittance mise à jour avec succès !" : "Reçu de loyer créé et enregistré avec succès !")
                onClose()
                onSuccess?.()
                router.refresh()
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-emerald-600">
                            <FileText size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                {initialReceipt ? "Modifier le Reçu de Loyer" : "Nouveau Reçu / Quittance de Loyer"}
                            </h2>
                            <p className="text-xs font-medium text-slate-500">
                                {initialReceipt 
                                    ? `Réf : ${initialReceipt.receiptRef || initialReceipt.id.slice(0, 12)}` 
                                    : "Enregistrement manuel d'un règlement et délivrance de quittance certifiée"}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isPending}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
                    
                    {/* 1. Sélection du bail (si création) */}
                    {!initialReceipt ? (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                1. Logement & Contrat de bail <span className="text-rose-500">*</span>
                            </label>
                            <select 
                                required
                                value={leaseId}
                                onChange={(e) => handleLeaseChange(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            >
                                <option value="">--- Cliquez pour choisir un logement loué ---</option>
                                {leases.map(l => {
                                    const tenantName = l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : (l.label || "Locataire")
                                    const propName = l.property?.name || l.property?.address || ""
                                    const commune = l.property?.commune ? `(${l.property.commune})` : ""
                                    const rent = Number(l.rentAmount || 0)

                                    return (
                                        <option key={l.id} value={l.id}>
                                            {l.leaseReference || l.id.slice(0, 8)} — {tenantName} — {propName} {commune} — {rent.toLocaleString()} XOF
                                        </option>
                                    )
                                })}
                            </select>

                            {/* Recap visuel du bail choisi */}
                            {selectedLease && (
                                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-slate-700 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center mt-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                            <Building2 size={14} className="text-emerald-600" />
                                            <span>{selectedLease.property?.name || selectedLease.property?.address || "Logement"}</span>
                                            {selectedLease.property?.commune && (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                                                    {selectedLease.property.commune}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User size={13} className="text-slate-400" />
                                            <span>{selectedLease.tenant ? `${selectedLease.tenant.firstName || ''} ${selectedLease.tenant.lastName || ''}`.trim() : "Locataire"}</span>
                                            {selectedLease.tenant?.phone && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <Phone size={12} /> {selectedLease.tenant.phone}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[11px] text-slate-500 block">Loyer contractuel :</span>
                                        <span className="font-black text-emerald-700 text-sm">{Number(selectedLease.rentAmount || 0).toLocaleString()} XOF</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <span className="text-slate-500 font-medium">Bail associé :</span>
                            <span className="ml-2 font-bold text-slate-900">{initialReceipt.lease?.leaseReference || initialReceipt.leaseId}</span>
                        </div>
                    )}

                    {/* 2. Période & Nature */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                2. Mois concerné <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="month" 
                                required
                                value={periodStr}
                                onChange={(e) => setPeriodStr(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            <span className="text-[11px] text-slate-400 block">Période calendaire de facturation</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                3. Nature du règlement
                            </label>
                            <select 
                                value={receiptType}
                                onChange={(e) => setReceiptType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            >
                                <option value="RENT">Loyer d'habitation ordinaire</option>
                                <option value="DEPOSIT">Dépôt de garantie (Caution)</option>
                                <option value="ADVANCE">Avance sur loyers futurs</option>
                            </select>
                            <span className="text-[11px] text-slate-400 block">Type d'écriture comptable</span>
                        </div>
                    </div>

                    {/* 4. Montants en XOF */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Loyer net (XOF) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    required
                                    min="0"
                                    value={rentAmount || ""}
                                    onChange={(e) => setRentAmount(Number(e.target.value))}
                                    placeholder="Ex: 150000"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Charges locatives (XOF)
                                </label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={chargesAmount || ""}
                                    onChange={(e) => setChargesAmount(Number(e.target.value))}
                                    placeholder="Ex: 15000"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Total en direct */}
                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Total global du reçu :</span>
                            <span className="text-xl font-black text-emerald-700">{totalAmount.toLocaleString()} XOF</span>
                        </div>
                    </div>

                    {/* 5. Statut du reçu */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            5. Statut de ce document
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus("PAID")}
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                    status === "PAID" 
                                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900" 
                                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                    status === "PAID" ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
                                }`}>
                                    {status === "PAID" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-xs">Payé et encaissé</p>
                                    <p className="text-[11px] opacity-80">Quittance libératoire certifiée délivrée au locataire</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStatus("PENDING")}
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                                    status === "PENDING" 
                                        ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900" 
                                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                                    status === "PENDING" ? "border-amber-600 bg-amber-600" : "border-slate-300"
                                }`}>
                                    {status === "PENDING" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-xs">En attente de paiement</p>
                                    <p className="text-[11px] opacity-80">Avis d'échéance à régler par le locataire</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 6. Mode de paiement & Référence */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                6. Canal ou moyen de règlement
                            </label>
                            <select 
                                value={paymentChannel}
                                onChange={(e) => setPaymentChannel(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            >
                                <option value="WAVE">Wave Côte d'Ivoire</option>
                                <option value="ORANGE_MONEY">Orange Money</option>
                                <option value="MTN_MOMO">MTN Mobile Money</option>
                                <option value="MOOV_MONEY">Moov Money</option>
                                <option value="BANK_TRANSFER">Virement bancaire</option>
                                <option value="CHEQUE">Chèque bancaire</option>
                                <option value="CASH">Espèces (remise en main propre)</option>
                            </select>
                        </div>

                        {status === "PAID" && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Date effective de paiement
                                </label>
                                <input 
                                    type="date"
                                    value={paidAtDate}
                                    onChange={(e) => setPaidAtDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* 7. Référence / N° de transaction & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Référence ou N° de reçu (optionnel)
                            </label>
                            <input 
                                type="text"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="Ex: ID Wave, N° Chèque..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Note interne (optionnelle)
                            </label>
                            <input 
                                type="text"
                                value={internalNotes}
                                onChange={(e) => setInternalNotes(e.target.value)}
                                placeholder="Ex: Paiement en agence..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isPending}
                            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors uppercase tracking-wider"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            disabled={isPending || (!leaseId)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Enregistrement...</span>
                                </>
                            ) : (
                                <span>{initialReceipt ? "Enregistrer les modifications" : "Émettre et Certifier le Reçu"}</span>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    )
}
