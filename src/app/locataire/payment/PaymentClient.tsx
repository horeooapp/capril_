"use client"

import React, { useState } from "react"
import { createMMIntent } from "@/actions/payment-actions"
import { Loader2, ShieldCheck, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentClientProps {
    leaseId: string
    amount: number
    defaultPhone: string
}

type Operator = "wave" | "orange" | "mtn"

export default function PaymentClient({ leaseId, amount, defaultPhone }: PaymentClientProps) {
    const router = useRouter()
    
    const [operator, setOperator] = useState<Operator | null>(null)
    const [phone, setPhone] = useState(defaultPhone)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePayment = async () => {
        if (!operator) {
            setError("Veuillez sélectionner un opérateur Mobile Money.")
            return
        }
        if (!phone || phone.length < 8) {
            setError("Veuillez saisir un numéro de téléphone valide.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await createMMIntent({
                leaseId,
                amount,
                monthsCount: 1, // Par défaut, on paie les arriérés en bloc (1 itération)
                operator,
                payerPhone: phone
            })

            if (res.error) {
                setError(res.error)
                setLoading(false)
                return
            }

            if (res.paymentUrl) {
                // Redirect to CinetPay Secure Gateway
                window.location.href = res.paymentUrl
            }
        } catch (err: any) {
            setError("Une erreur inattendue est survenue.")
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-3">
                    1. Choisissez votre moyen de paiement
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {/* WAVE */}
                    <button
                        onClick={() => setOperator("wave")}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            operator === "wave" ? "border-blue-500 bg-blue-50" : "border-qgrey-2 hover:border-blue-200"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs tracking-tighter">W</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${operator === "wave" ? "text-blue-600" : "text-qtext-light"}`}>
                            Wave
                        </span>
                    </button>

                    {/* ORANGE */}
                    <button
                        onClick={() => setOperator("orange")}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            operator === "orange" ? "border-orange-500 bg-orange-50" : "border-qgrey-2 hover:border-orange-200"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs tracking-tighter">O</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${operator === "orange" ? "text-orange-600" : "text-qtext-light"}`}>
                            Orange
                        </span>
                    </button>

                    {/* MTN */}
                    <button
                        onClick={() => setOperator("mtn")}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            operator === "mtn" ? "border-yellow-400 bg-yellow-50" : "border-qgrey-2 hover:border-yellow-200"
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-yellow-400 text-qnavy-dark font-black flex items-center justify-center text-xs tracking-tighter">M</div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${operator === "mtn" ? "text-yellow-600" : "text-qtext-light"}`}>
                            MTN
                        </span>
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-qtext-light uppercase tracking-widest mb-3">
                    2. Numéro de l'expéditeur
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Smartphone size={18} className="text-qtext-light" />
                    </div>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 0707070707"
                        className="w-full pl-12 pr-4 py-4 bg-background border border-qgrey-2 rounded-xl text-sm font-bold text-qnavy-dark focus:outline-none focus:ring-2 focus:ring-qnavy/20 focus:border-qnavy transition-all"
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-qred-pale border border-qred/20 rounded-xl text-xs font-bold text-qred text-center">
                    {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-qnavy hover:bg-qnavy-dark text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-qnavy/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Connexion CinetPay...</>
                ) : (
                    <><ShieldCheck size={18} /> Procéder au paiement sécurisé</>
                )}
            </button>
            <p className="text-center text-[9px] font-bold text-qtext-light uppercase tracking-widest mt-4">
                Redirection automatique vers la passerelle chiffrée SSL
            </p>
        </div>
    )
}
