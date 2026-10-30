'use client'

import { useState } from 'react'
import { requestSignatureOTP, signLease } from '@/actions/lease.actions'
import { ShieldCheck, Send, CheckCircle2, Printer, Key, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import PrintableLeaseContract from './PrintableLeaseContract'
import React from 'react'

interface BaseProps {
    children?: React.ReactNode
    className?: string
}

const Button = ({ children, className, ...props }: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={`px-4 py-2 rounded font-bold transition-all ${className}`} {...props}>
        {children}
    </button>
)

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className={`border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 ${className}`} {...props} />
)

const Card = ({ children, className }: BaseProps) => (
    <div className={`bg-white rounded-2xl border ${className}`}>{children}</div>
)

const CardHeader = ({ children, className }: BaseProps) => (
    <div className={`p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className }: BaseProps) => (
    <h2 className={`font-black uppercase tracking-tight ${className}`}>{children}</h2>
)

const CardContent = ({ children, className }: BaseProps) => (
    <div className={`p-6 ${className}`}>{children}</div>
)

const CardFooter = ({ children, className }: BaseProps) => (
    <div className={`p-6 border-t ${className}`}>{children}</div>
)

export default function LeaseSignatureUI({ leaseId, leaseRef, fullLease }: { leaseId: string, leaseRef: string, fullLease?: any }) {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)

    const handleRequestOTP = async () => {
        setResending(true)
        setError(null)
        setResendSuccess(false)
        try {
            const res = await requestSignatureOTP(leaseId)
            if (res.success) {
                setResendSuccess(true)
            } else {
                setError(res.error || "Échec de l'envoi du code.")
            }
        } catch (_err) {
            setError("Une erreur est survenue lors de l'envoi du code.")
        } finally {
            setResending(false)
        }
    }

    const handleSign = async () => {
        const cleanOtp = otp.trim().replace(/\D/g, '')
        if (cleanOtp.length !== 6) {
            setError("Veuillez saisir les 6 chiffres du code reçu.")
            return
        }

        setLoading(true)
        setError(null)
        try {
            const res = await signLease(leaseId, cleanOtp)
            if (res.success) {
                setSuccess(true)
            } else {
                setError(res.error || "Code invalide ou expiré.")
            }
        } catch (_err) {
            setError("Une erreur est survenue lors de la signature.")
        } finally {
            setLoading(false)
        }
    }

    const isLocatairePath = typeof window !== 'undefined' && window.location.pathname.includes('locataire')
    const redirectUrl = isLocatairePath ? '/mon-espace-locataire' : '/dashboard/leases'

    if (success) {
        return (
            <Card className="max-w-md mx-auto border-emerald-300 bg-emerald-50/90 shadow-xl animate-in fade-in zoom-in-95 duration-300">
                <CardContent className="pt-8 text-center space-y-3">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
                    <CardTitle className="text-2xl font-black text-emerald-900">Signature Validée !</CardTitle>
                    <p className="text-emerald-800 text-sm font-medium">
                        Le contrat de bail <strong>{leaseRef}</strong> est désormais certifié et scellé par empreinte SHA-256 (Loi 2019-576).
                    </p>
                </CardContent>
                <CardFooter className="pt-2">
                    <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md"
                        onClick={() => window.location.href = redirectUrl}
                    >
                        {isLocatairePath ? "Accéder à mon Espace Locataire" : "Retour aux baux"}
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
        
        {/* CONTRAT COMPLET VIEW */}
        {fullLease && (
            <div className="bg-slate-50 border rounded-2xl overflow-hidden shadow-inner relative">
                <div className="bg-slate-200 p-3 flex justify-between items-center border-b">
                    <span className="font-bold text-sm text-slate-700 flex items-center gap-2">
                        <span>📜</span> Contrat Officiel (Loi 2019-576 CCH)
                    </span>
                    <Button 
                        className="bg-white text-slate-700 border hover:bg-slate-50 flex items-center gap-2 text-xs py-1"
                        onClick={() => window.print()}
                    >
                        <Printer size={14} /> Imprimer / PDF
                    </Button>
                </div>
                <div className="max-h-[55vh] overflow-y-auto print:max-h-none print:overflow-visible relative">
                    <PrintableLeaseContract lease={fullLease} />
                </div>
            </div>
        )}

        <Card className="max-w-lg mx-auto shadow-2xl border-2 border-amber-300 rounded-3xl overflow-hidden print:hidden bg-gradient-to-b from-white to-amber-50/20">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-100 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <CardTitle className="text-lg sm:text-xl text-slate-900">Espace de Signature Électronique</CardTitle>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Bail Réf : <span className="font-bold text-amber-800">{leaseRef}</span></p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                        <Key size={16} className="text-amber-700 shrink-0" />
                        <span>Saisissez votre code de signature à 6 chiffres</span>
                    </p>
                    <p className="text-amber-800/90 text-xs leading-relaxed">
                        Ce code vous a été transmis par WhatsApp, SMS ou Email lors de la création de votre contrat de bail. Saisissez-le pour signer légalement votre engagement.
                    </p>
                </div>

                <div className="space-y-4">
                    <Input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="• • • • • •" 
                        className="w-full text-center text-3xl sm:text-4xl tracking-[0.4em] font-mono h-16 font-black border-2 border-slate-300 focus:border-amber-500 focus:bg-white rounded-2xl bg-slate-50 text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                        maxLength={6}
                        value={otp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setOtp(e.target.value.replace(/\D/g, ''))
                            setError(null)
                        }}
                        autoFocus
                    />

                    <Button 
                        className="w-full h-13 text-sm sm:text-base font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]" 
                        onClick={handleSign}
                        disabled={loading || otp.trim().length !== 6}
                    >
                        {loading ? "Validation & Signature en cours..." : "Valider & Signer le Bail ✍️"}
                    </Button>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-shake">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {resendSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                        <span>Nouveau code envoyé avec succès par WhatsApp et SMS !</span>
                    </div>
                )}

                <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                        Vous n'avez pas reçu votre code ou il est expiré ?
                    </p>
                    <button 
                        type="button"
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mx-auto"
                        onClick={handleRequestOTP}
                        disabled={resending || loading}
                    >
                        <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
                        <span>{resending ? "Envoi du code en cours..." : "Renvoyer mon code par WhatsApp / SMS"}</span>
                    </button>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
                <p className="text-[11px] text-center w-full text-slate-400 font-medium">
                    🔒 Signature conforme Loi N° 2019-576 & scellée par empreinte cryptographique SHA-256.
                </p>
            </CardFooter>
        </Card>
        </div>
    )
}