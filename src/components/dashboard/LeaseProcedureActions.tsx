"use client"

import { useState } from "react"
// LeaseStatus is a plain string field in this schema (no Prisma enum generated)
type LeaseStatus = string
import { declareUnpaidRent, sendFormalNotice, initiateTermination, proposeClemency } from "@/actions/lease-procedures"
import { useRouter } from "next/navigation"

interface LeaseProcedureActionsProps {
    leaseId: string
    currentStatus: LeaseStatus
    userId: string
}

export default function LeaseProcedureActions({ leaseId, currentStatus, userId }: LeaseProcedureActionsProps) {
    const [loading, setLoading] = useState(false)
    const [showClemencyModal, setShowClemencyModal] = useState(false)
    const [clemencyDetails, setClemencyDetails] = useState("")
    const router = useRouter()

    const handleAction = async (actionFn: (id: string, uid: string) => Promise<any>) => {
        if (!confirm("Êtes-vous sûr de vouloir engager cette phase de procédure ? Cette action sera journalisée avec une valeur probante.")) return
        
        setLoading(true)
        try {
            const result = await actionFn(leaseId, userId)
            if (result.success) {
                router.refresh()
            } else {
                alert("Erreur: " + result.error)
            }
        } catch (_error) {
            alert("Une erreur inattendue est survenue.")
        } finally {
            setLoading(false)
        }
    }

    const handleClemency = async () => {
        if (!clemencyDetails.trim()) return
        setLoading(true)
        try {
            const result = await proposeClemency(leaseId, clemencyDetails, userId)
            if (result.success) {
                setShowClemencyModal(false)
                router.refresh()
            } else {
                alert("Erreur: " + result.error)
            }
        } catch (_error) {
            alert("Une erreur inattendue est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Actions de Procédure (RCI)</h3>
            
            <div className="grid grid-cols-1 gap-2">
                {currentStatus === "ACTIVE" && (
                    <button
                        onClick={() => handleAction(declareUnpaidRent)}
                        disabled={loading}
                        className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-700 border border-red-100 rounded-xl hover:bg-red-100 transition-colors font-medium group"
                    >
                        <span>🚨 Signaler un Impayé (Phase 1)</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                )}

                {currentStatus === "LOYER_IMPAYE" && (
                    <button
                        onClick={() => handleAction(sendFormalNotice)}
                        disabled={loading}
                        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors font-medium group"
                    >
                        <span>✉️ Mise en Demeure (Phase 3)</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                )}

                {(currentStatus === "LOYER_IMPAYE" || currentStatus === "MISE_EN_DEMEURE") && (
                    <button
                        onClick={() => setShowClemencyModal(true)}
                        disabled={loading}
                        className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors font-medium group"
                    >
                        <span>🤝 Proposer une Clémence (Phase 5)</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                )}

                {(currentStatus === "MISE_EN_DEMEURE" || currentStatus === "REPRISE_PROCEDURE") && (
                    <button
                        onClick={() => handleAction(initiateTermination)}
                        disabled={loading}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors font-medium group"
                    >
                        <span>⚖️ Demander Résiliation (Phase 7)</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                )}
            </div>

            {showClemencyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Proposition d&apos;Échéancier</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Décrivez les modalités de paiement proposées au locataire (Ex: Paiement du reliquat en 3 fois).
                        </p>
                        <textarea
                            value={clemencyDetails}
                            onChange={(e) => setClemencyDetails(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[120px]"
                            placeholder="Ex: Le locataire s&apos;engage à payer 50.000 FCFA supplémentaire chaque mois pendant 4 mois..."
                        />
                        <div className="mt-6 flex space-x-3">
                            <button
                                onClick={() => setShowClemencyModal(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleClemency}
                                disabled={loading || !clemencyDetails.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Envoi..." : "Envoyer la Proposition"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
