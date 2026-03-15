"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

function SimulatorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tid = searchParams.get("tid")
    const amount = searchParams.get("amount")
    
    const [status, setStatus] = useState<"pending" | "processing" | "success">("pending")

    const handleSimulateSuccess = async () => {
        setStatus("processing")
        
        try {
            // Simulate calling the webhook
            const formData = new FormData()
            formData.append("cpm_trans_id", tid || "")
            formData.append("cpm_site_id", "test_site")
            formData.append("cpm_status", "ACCEPTED")

            const res = await fetch("/api/webhooks/cinetpay", {
                method: "POST",
                body: formData
            })

            if (res.ok) {
                setStatus("success")
                setTimeout(() => {
                    router.push("/dashboard/receipts")
                }, 2000)
            } else {
                alert("Erreur lors de la simulation du webhook")
                setStatus("pending")
            }
        } catch (err) {
            console.error(err)
            setStatus("pending")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-orange-100">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                    🛠️
                </div>
                
                <h1 className="text-2xl font-black text-gray-900 mb-2">Simulateur de Paiement</h1>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-8">Environnement de Test QAPRIL</p>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                        <span className="text-gray-400">Transaction ID</span>
                        <span className="text-gray-900">{tid}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                        <span className="text-gray-400">Montant</span>
                        <span className="text-gray-900 font-black">{amount} FCFA</span>
                    </div>
                </div>

                {status === "pending" && (
                    <button 
                        onClick={handleSimulateSuccess}
                        className="w-full bg-gray-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        Simuler Réussite (Paiement OK)
                    </button>
                )}

                {status === "processing" && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Traitement du Webhook...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl animate-bounce">
                            check
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Paiement Validé ! Redirection...</p>
                    </div>
                )}

                <button 
                    onClick={() => router.back()}
                    className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                >
                    Abandonner
                </button>
            </div>
        </div>
    )
}

export default function SimulatePaymentPage() {
    return (
        <Suspense fallback={<div>Chargement du simulateur...</div>}>
            <SimulatorContent />
        </Suspense>
    )
}
