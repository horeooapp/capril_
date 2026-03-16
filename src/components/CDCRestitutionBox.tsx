"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Banknote, CheckCircle2, CircleDollarSign, Info, Loader2, Send } from "lucide-react"
import { requestCDCRestitution } from "@/actions/cdc"

interface CDCRestitutionBoxProps {
    leaseId: string
    deposit: {
        id: string
        amount: number
        status: string
        cdcReference: string | null
    }
}

export default function CDCRestitutionBox({ leaseId, deposit }: CDCRestitutionBoxProps) {
    const [loading, setLoading] = useState(false)
    const [amountToReturn, setAmountToReturn] = useState(deposit.amount)
    const [reason, setReason] = useState("")
    const [step, setStep] = useState(deposit.status === "RETURN_REQUESTED" ? "WAITING" : "INIT")

    async function handleRequest() {
        if (amountToReturn > deposit.amount) {
            alert("Le montant ne peut pas être supérieur à la caution initiale.")
            return
        }
        setLoading(true)
        try {
            const res = await requestCDCRestitution(leaseId, amountToReturn, reason)
            if (res.success) {
                setStep("WAITING")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (deposit.status === "RETURNED") {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4 text-green-400">
                <CheckCircle2 size={32} />
                <div>
                    <h3 className="font-bold">Caution Restituée</h3>
                    <p className="text-sm opacity-80">Les fonds ont été libérés par la CDC-CI.</p>
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-xl rounded-2xl border border-[#FF8200]/20 overflow-hidden"
        >
            <div className="bg-[#FF8200] px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <CircleDollarSign size={20} />
                    Gestion de la Caution (M18)
                </h3>
                <span className="text-[10px] bg-white/20 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">
                    Consigné: {deposit.amount.toLocaleString()} FCFA
                </span>
            </div>

            <div className="p-6">
                {step === "INIT" ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
                            <Info className="mt-0.5 shrink-0" size={18} />
                            <p>En tant que bailleur, vous pouvez demander la restitution totale ou partielle. En cas de retenues, vous devrez en préciser le motif.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Montant à restituer</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={amountToReturn}
                                        onChange={(e) => setAmountToReturn(Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#FF8200] outline-none font-bold"
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-bold">FCFA</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Motif des retenues (si applicable)</label>
                                <textarea 
                                    placeholder="Ex: Réparations plomberie, Reliquat facture..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#FF8200] outline-none text-sm min-h-[50px]"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleRequest}
                            disabled={loading}
                            className="w-full bg-[#FF8200] hover:bg-[#E67500] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            Demander la Restitution
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4 space-y-4">
                        <div className="w-16 h-16 bg-orange-100 text-[#FF8200] rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Banknote size={32} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Demande en cours d'arbitrage</h4>
                            <p className="text-sm text-gray-500 mt-1">Le locataire et les services de la CDC-CI examinent votre proposition de restitution de {amountToReturn.toLocaleString()} FCFA.</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            Statut: En attente de validation tierce
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
