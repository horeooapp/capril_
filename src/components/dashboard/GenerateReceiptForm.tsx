"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createReceipt } from "@/actions/receipts"

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
    const [amountFcfa, setAmountFcfa] = useState<number>(Number(monthlyRentFcfa))
    const [receiptType, setReceiptType] = useState<string>("RENT")
    const [periodStr, setPeriodStr] = useState<string>(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })
    const [paymentChannel, setPaymentChannel] = useState<string>("MOBILE_MONEY")
    const [paymentReference, setPaymentReference] = useState<string>("")

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        // Calculate Period Start/End from YYYY-MM
        const [year, month] = periodStr.split('-')
        const periodStart = new Date(parseInt(year), parseInt(month) - 1, 1)
        const periodEnd = new Date(parseInt(year), parseInt(month), 0)

        try {
            const result = await createReceipt({
                leaseId,
                amountFcfa: amountFcfa,
                periodStart,
                periodEnd,
                paymentChannel,
                paymentReference,
                receiptType
            })

            if (result.error) {
                setError(result.error)
                setIsPending(false)
                return
            }

            setIsModalOpen(false)
            router.push(`/dashboard/receipts`)
            router.refresh()
        } catch (err: any) {
            setError("Une erreur est survenue lors de la génération.")
            setIsPending(false)
        }
    }

    if (!isModalOpen) {
        return (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF8200] hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 transition-all active:scale-95"
            >
                Générer Quittance
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                    <form onSubmit={handleGenerate}>
                        <div className="bg-white px-8 pt-10 pb-8">
                            <div className="text-center sm:text-left w-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">
                                        🧾
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">Nouvelle E-Quittance</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Certification de paiement v2.0</p>
                                    </div>
                                </div>
                                
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-bold text-red-600 uppercase tracking-widest text-center">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Type</label>
                                            <select 
                                                value={receiptType}
                                                onChange={(e) => setReceiptType(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-[#FF8200] transition-all"
                                            >
                                                <option value="RENT">Loyer / LMNP</option>
                                                <option value="DEPOSIT">Caution / Garantie</option>
                                                <option value="ADVANCE">Avance / Provision</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mois</label>
                                            <input 
                                                type="month" 
                                                required 
                                                value={periodStr}
                                                onChange={(e) => setPeriodStr(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-[#FF8200] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant perçu (FCFA)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={amountFcfa}
                                            onChange={(e) => setAmountFcfa(parseFloat(e.target.value))}
                                            min="1"
                                            className="w-full bg-gray-50 border-none rounded-[1.25rem] py-4 px-6 text-xl font-black focus:ring-2 focus:ring-[#FF8200] transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Canal</label>
                                            <select 
                                                value={paymentChannel}
                                                onChange={(e) => setPaymentChannel(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-[#FF8200] transition-all"
                                            >
                                                <option value="MOBILE_MONEY">Mobile Money</option>
                                                <option value="CASH">Espèces / Manuel</option>
                                                <option value="BANK_TRANSFER">Virement</option>
                                                <option value="CHEQUE">Chèque</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Réf. Transaction</label>
                                            <input 
                                                type="text" 
                                                placeholder="OPTIONAL"
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-[#FF8200] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50/50 px-8 py-6 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={isPending}
                                className="flex-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {isPending ? 'Certification...' : 'Certifier le Paiement'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Abandonner
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
