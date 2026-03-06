"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createReceipt } from "@/actions/receipts"

export default function GenerateReceiptForm({ leaseId, rentAmount }: { leaseId: string, rentAmount: number }) {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Form inputs state
    const [amountPaid, setAmountPaid] = useState<number>(rentAmount)
    const [periodStr, setPeriodStr] = useState<string>(() => {
        // Default to current month
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )
    const [paymentMethod, setPaymentMethod] = useState<string>("MOBILE_MONEY")

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        // Calculate Period Start/End from YYYY-MM
        const [year, month] = periodStr.split('-')
        const periodStart = new Date(parseInt(year), parseInt(month) - 1, 1) // 1st day of month
        const periodEnd = new Date(parseInt(year), parseInt(month), 0) // Last day of month

        try {
            const receipt = await createReceipt({
                leaseId,
                amountPaid: parseFloat(amountPaid.toString()),
                periodStart,
                periodEnd,
                paymentDate: new Date(paymentDate),
                // @ts-ignore Let prisma handle enum mapping
                paymentMethod
            })

            setIsModalOpen(false)
            // Redirect to the new official receipt view
            router.push(`/receipts/${receipt.id}`)
        } catch (err: any) {
            setError(err.message || "Impossible de générer la quittance.")
            setIsPending(false)
        }
    }

    if (!isModalOpen) {
        return (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-all transform hover:scale-105"
            >
                Générer Quittance
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleGenerate}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Générer une Nouvelle E-Quittance
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Remplissez les détails du loyer perçu.
                                    </div>
                                    
                                    {error && <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Période concernée (Mois)</label>
                                            <input 
                                                type="month" 
                                                required 
                                                value={periodStr}
                                                onChange={(e) => setPeriodStr(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Montant Payé (FCFA)</label>
                                            <input 
                                                type="number" 
                                                required 
                                                value={amountPaid}
                                                onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                                                min="1"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mode de paiement</label>
                                            <select 
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                            >
                                                <option value="MOBILE_MONEY">Mobile Money</option>
                                                <option value="CASH">Espèces</option>
                                                <option value="BANK_TRANSFER">Virement Bancaire</option>
                                                <option value="CREDIT_CARD">Carte Bancaire</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button 
                                type="submit" 
                                disabled={isPending}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] sm:ml-3 sm:w-auto sm:text-sm ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isPending ? 'Génération...' : 'Valider & Créer'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                disabled={isPending}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
