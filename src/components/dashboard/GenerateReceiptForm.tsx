"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createReceipt } from "@/actions/receipt.actions"
import { toast } from "sonner"
import {
    FileCheck,
    X,
    Loader2,
    CheckCircle2,
    Receipt,
    Calendar,
    Wallet,
    CreditCard,
    AlertCircle
} from "lucide-react"

export default function GenerateReceiptForm({ 
    leaseId, 
    monthlyRentFcfa 
}: { 
    leaseId: string, 
    monthlyRentFcfa: string | number 
}) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form inputs state
    const [amountFcfa, setAmountFcfa] = useState<number>(Number(monthlyRentFcfa) || 0)
    const [receiptType, setReceiptType] = useState<string>("RENT")
    const [periodStr, setPeriodStr] = useState<string>(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })
    const [paymentChannel, setPaymentChannel] = useState<string>("WAVE")
    const [paymentReference, setPaymentReference] = useState<string>("")
    const [notes, setNotes] = useState<string>("")

    const handleOpen = () => {
        setError(null)
        setAmountFcfa(Number(monthlyRentFcfa) || 0)
        setIsModalOpen(true)
    }

    const handleClose = () => {
        if (isPending) return
        setIsModalOpen(false)
        setError(null)
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!periodStr) {
            setError("Veuillez sélectionner le mois concerné par la quittance.")
            return
        }
        if (!amountFcfa || amountFcfa <= 0) {
            setError("Veuillez saisir un montant de loyer valide supérieur à 0.")
            return
        }

        setIsPending(true)

        try {
            const result = await createReceipt({
                leaseId,
                periodMonth: periodStr,
                rentAmount: Number(amountFcfa),
                chargesAmount: 0,
                paymentMethod: paymentChannel,
                paymentRef: paymentReference.trim() || undefined,
                isDeposit: receiptType === "DEPOSIT",
                status: "PAID",
                paidAt: new Date(),
                notes: notes.trim() || undefined
            })

            if (result.error) {
                setError(result.error)
                toast.error(result.error)
                setIsPending(false)
                return
            }

            toast.success(`Quittance certifiée avec succès pour le mois ${periodStr} !`)
            setIsModalOpen(false)
            router.push(`/dashboard/receipts`)
            router.refresh()
        } catch (err: any) {
            console.error("[RECEIPT_GEN_ERROR]", err)
            const msg = err?.message || "Une erreur inconnue est survenue au niveau du réseau ou du serveur."
            setError(msg)
            toast.error(msg)
            setIsPending(false)
        }
    }

    return (
        <>
            {/* Bouton déclencheur toujours visible et stable */}
            <button 
                type="button"
                onClick={handleOpen}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF8200] hover:bg-orange-600 text-white rounded-[10px] font-black text-[11px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                title="Générer une quittance de loyer pour ce bail"
            >
                <FileCheck size={15} />
                <span>Générer Quittance</span>
            </button>

            {/* Modale plein écran sécurisée avec backdrop cliquable et propagation bloquée */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-slate-950 animate-in fade-in duration-200"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div 
                        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 relative z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* En-tête de la modale */}
                        <div className="bg-[#D97706] p-6 text-white relative shrink-0">
                            <button 
                                type="button"
                                onClick={handleClose}
                                disabled={isPending}
                                className="absolute top-5 right-5 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50"
                                title="Fermer la fenêtre"
                            >
                                <X size={18} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-200 block mb-1">
                                Certification CCH • Loi 2019-576
                            </span>
                            <h3 id="modal-title" className="text-xl font-black flex items-center gap-2">
                                <Receipt size={22} className="text-orange-200" />
                                Émettre une Quittance de Loyer
                            </h3>
                            <p className="text-xs text-orange-100/90 mt-1 font-medium">
                                Certifiez l&apos;encaissement du loyer pour générer la quittance officielle numérique avec QR code sécurisé.
                            </p>
                        </div>

                        {/* Corps du formulaire défilable */}
                        <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {error && (
                                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-start gap-2">
                                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Type de quittance & Période */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                        Type de versement *
                                    </label>
                                    <select 
                                        value={receiptType}
                                        onChange={(e) => setReceiptType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all cursor-pointer"
                                    >
                                        <option value="RENT">Loyer Mensuel</option>
                                        <option value="DEPOSIT">Caution / Dépôt de garantie</option>
                                        <option value="ADVANCE">Avance / Provision</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                        Mois concerné *
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="month" 
                                            required 
                                            value={periodStr}
                                            onChange={(e) => setPeriodStr(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Montant perçu */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                    Montant perçu (XOF / FCFA) *
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        required 
                                        value={amountFcfa || ""}
                                        onChange={(e) => setAmountFcfa(parseFloat(e.target.value) || 0)}
                                        min="1"
                                        step="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all"
                                        placeholder="Ex : 150000"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                        XOF
                                    </span>
                                </div>
                            </div>

                            {/* Canal d'encaissement & Réf transaction */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                        Mode de règlement *
                                    </label>
                                    <select 
                                        value={paymentChannel}
                                        onChange={(e) => setPaymentChannel(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all cursor-pointer"
                                    >
                                        <option value="WAVE">Wave</option>
                                        <option value="ORANGE_MONEY">Orange Money</option>
                                        <option value="MTN_MOMO">MTN MoMo</option>
                                        <option value="MOOV_MONEY">Moov Money</option>
                                        <option value="BANK_TRANSFER">Virement Bancaire</option>
                                        <option value="CASH">Espèces (Reçu direct)</option>
                                        <option value="CHEQUE">Chèque</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                        Réf. transaction (optionnel)
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex : WAV-98124 ou N° Chèque"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Note interne optionnelle */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                                    Commentaire ou précision (optionnel)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Ex : Paiement reçu en agence le 05 du mois"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[12px] font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#FF8200] outline-none transition-all"
                                />
                            </div>

                            {/* Bandeau d'information légale */}
                            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                                <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-medium text-amber-800 leading-snug">
                                    La quittance portera une empreinte cryptographique SHA-256 et un QR code officiel consultable par le locataire dans son espace.
                                </p>
                            </div>

                            {/* Boutons d'action */}
                            <div className="pt-2 flex items-center gap-2.5">
                                <button 
                                    type="button" 
                                    onClick={handleClose}
                                    disabled={isPending}
                                    className="px-4 py-3 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isPending}
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Certification en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck size={15} className="text-orange-400" />
                                            <span>Valider et Émettre la Quittance</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
