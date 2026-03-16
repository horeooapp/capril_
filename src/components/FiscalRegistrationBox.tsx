"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { initiateFiscalPayment } from '@/actions/fiscal-actions'

interface FiscalDossier {
    id: string
    statut: string
    totalBailleur: number
    totalDgi: number
    fraisQapril: number
    dateLimiteLegale: Date
    penaltyAmount: number
    cinetpayPaymentUrl?: string | null
}

interface Props {
    dossier: FiscalDossier
    leaseReference: string
}

export default function FiscalRegistrationBox({ dossier, leaseReference }: Props) {
    const [loading, setLoading] = useState(false)

    const isPending = dossier.statut === "EN_ATTENTE_DECLARATION" || dossier.statut === "NOTIFIE" || dossier.statut === "ECHEC_PAIEMENT"
    const isEnregistre = dossier.statut === "ENREGISTRE"
    const isLate = new Date() > new Date(dossier.dateLimiteLegale)

    async function handlePayment() {
        setLoading(true)
        const res = await initiateFiscalPayment(dossier.id)
        if (res.success && res.paymentUrl) {
            window.location.href = res.paymentUrl
        } else {
            alert(res.error || "Erreur lors de l'initiation du paiement")
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isEnregistre ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Enregistrement Fiscal</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module DGI - M17 · {leaseReference}</p>
                        </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isEnregistre ? 'bg-green-100 text-green-700' : isLate ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {dossier.statut.replace(/_/g, ' ')}
                    </div>
                </div>

                {isPending && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Droits DGI</span>
                                <span className="text-xl font-black text-gray-900">{dossier.totalDgi.toLocaleString()} FCFA</span>
                            </div>
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Service QAPRIL</span>
                                <span className="text-xl font-black text-gray-900">{dossier.fraisQapril.toLocaleString()} FCFA</span>
                            </div>
                        </div>

                        {dossier.penaltyAmount > 0 && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-red-700">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span className="text-xs font-bold uppercase tracking-tight">Pénalité de retard incluse</span>
                                </div>
                                <span className="text-xs font-black text-red-700">+{dossier.penaltyAmount.toLocaleString()} FCFA</span>
                            </div>
                        )}

                        <div className="flex flex-col space-y-4">
                            <button 
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? "Initialisation..." : `Payer ${dossier.totalBailleur.toLocaleString()} FCFA via CinetPay`}
                            </button>
                            <p className="text-[9px] text-gray-400 text-center font-medium leading-relaxed">
                                Conformément à l'Art. 550 du CGI, l'enregistrement doit être effectué avant le <span className="text-gray-900 font-bold">{new Date(dossier.dateLimiteLegale).toLocaleDateString('fr-FR')}</span>.
                            </p>
                        </div>
                    </div>
                )}

                {isEnregistre && (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center space-x-2 text-green-600 mb-6">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-black uppercase tracking-widest text-sm">Bail Enregistré Fiscalement</span>
                        </div>
                        <button className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-[0.98]">
                            Télécharger le Certificat DGI
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
