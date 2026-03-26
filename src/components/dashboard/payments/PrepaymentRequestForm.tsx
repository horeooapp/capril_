"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, CreditCard, ClipboardList, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { requestPrepayment } from "@/actions/prepayment-actions"
import { getTenantLeases } from "@/actions/leases"

export default function PrepaymentRequestForm() {
    const [leases, setLeases] = useState<any[]>([])
    const [selectedLeaseId, setSelectedLeaseId] = useState("")
    const [monthsCount, setMonthsCount] = useState(3)
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadLeases() {
            const data = await getTenantLeases()
            setLeases(data)
            if (data.length > 0) setSelectedLeaseId(data[0].id)
        }
        loadLeases()
    }, [])

    const selectedLease = leases.find(l => l.id === selectedLeaseId)
    const totalAmount = selectedLease ? selectedLease.rentAmount * monthsCount : 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedLeaseId) return

        setLoading(true)
        setError(null)

        try {
            const res = await requestPrepayment({
                leaseId: selectedLeaseId,
                monthsCount,
                reason
            })

            if (res.success) {
                setSuccess(true)
            } else {
                setError(res.error || "Une erreur est survenue")
            }
        } catch (err) {
            setError("Erreur de connexion au serveur")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 text-center rounded-[3rem] border border-green-100 shadow-2xl shadow-green-500/5"
            >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">Demande Envoyée !</h3>
                <p className="text-gray-500 mb-10 font-medium">Votre demande de paiement anticipé a été transmise au bailleur. Vous recevrez une notification dès qu&apos;elle sera traitée.</p>
                <button 
                    onClick={() => setSuccess(false)}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
                >
                    Nouvelle Demande
                </button>
            </motion.div>
        )
    }

    return (
        <div className="glass-panel p-10 md:p-16 rounded-[3.5rem] border border-white/60 shadow-2xl shadow-gray-200/50">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <CreditCard size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Paiement Anticipé</h2>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Solliciter une approbation de multi-paiement</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Lease Selection */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Choisir le contrat concerné</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leases.length === 0 ? (
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 italic text-gray-400 text-sm">
                                Aucun contrat actif trouvé.
                            </div>
                        ) : (
                            leases.map(lease => (
                                <div 
                                    key={lease.id}
                                    onClick={() => setSelectedLeaseId(lease.id)}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${
                                        selectedLeaseId === lease.id 
                                            ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" 
                                            : "border-gray-100 hover:border-gray-200 bg-white"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            {lease.leaseReference}
                                        </div>
                                        {selectedLeaseId === lease.id && <CheckCircle2 className="text-primary" size={18} />}
                                    </div>
                                    <div className="font-black text-gray-900 uppercase tracking-tight mb-1 truncate">{lease.property?.name || lease.property?.propertyCode}</div>
                                    <div className="text-[12px] font-bold text-gray-400">{lease.rentAmount.toLocaleString()} FCFA / mois</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Months Count & Calculation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre de mois à payer</label>
                        <div className="flex items-center gap-6">
                            <input 
                                type="range" 
                                min="2" 
                                max="12" 
                                value={monthsCount}
                                onChange={(e) => setMonthsCount(parseInt(e.target.value))}
                                className="flex-1 accent-primary h-2 bg-gray-100 rounded-full appearance-none cursor-pointer"
                            />
                            <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl">
                                {monthsCount}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 italic">Glissez pour sélectionner entre 2 et 12 mois.</p>
                    </div>

                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-gray-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/40 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 opacity-80">Total Estimation</div>
                            <div className="text-4xl font-black tracking-tighter mb-2">{totalAmount.toLocaleString()} <span className="text-sm">FCFA</span></div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {monthsCount} mois × {selectedLease?.rentAmount?.toLocaleString() || 0} FCFA
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Motif de la demande (Facultatif)</label>
                    <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Prime annuelle, voyage prolongé, etc."
                        className="w-full h-32 bg-gray-50 border border-gray-100 rounded-3xl p-6 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium outline-none resize-none"
                    />
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl flex items-center gap-4"
                    >
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold uppercase tracking-tight">{error}</span>
                    </motion.div>
                )}

                <button 
                    type="submit"
                    disabled={loading || !selectedLeaseId}
                    className="w-full group relative overflow-hidden bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-black transition-all disabled:opacity-50 shadow-2xl shadow-gray-900/10 active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div className="relative z-10 flex items-center justify-center gap-4">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Envoyer la demande d&apos;approbation</span>
                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>
            </form>
        </div>
    )
}
