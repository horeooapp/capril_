'use client'

import { useState } from 'react'
import { requestSignatureOTP, signLease } from '@/actions/leases'
import { Button } from '@/components/ui/button' // Assuming these exist or using standard buttons
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { ShieldCheck, Send, CheckCircle2 } from 'lucide-react'

export function LeaseSignatureUI({ leaseId, leaseRef }: { leaseId: string, leaseRef: string }) {
    const [step, setStep] = useState<'initial' | 'otp' | 'success'>('initial')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRequestOTP = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await requestSignatureOTP(leaseId)
            if (res.success) {
                setStep('otp')
            } else {
                setError(res.error || "Échec de l'envoi du code.")
            }
        } catch (err) {
            setError("Une erreur est survenue.")
        } finally {
            setLoading(false)
        }
    }

    const handleSign = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await signLease(leaseId, otp)
            if (res.success) {
                setStep('success')
            } else {
                setError(res.error || "Code invalide.")
            }
        } catch (err) {
            setError("Une erreur est survenue lors de la signature.")
        } finally {
            setLoading(false)
        }
    }

    if (step === 'success') {
        return (
            <Card className="max-w-md mx-auto border-green-200 bg-green-50 shadow-lg animate-in fade-in zoom-in duration-300">
                <CardContent className="pt-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold text-green-800 mb-2">Signature Réussie !</CardTitle>
                    <p className="text-green-700">Le bail <strong>{leaseRef}</strong> est désormais actif et certifié v3.0.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => window.location.href = '/dashboard/leases'}>
                        Retour aux baux
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="max-w-md mx-auto shadow-xl border-t-4 border-t-primary overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Signature Digitale 2FA</CardTitle>
                        <p className="text-sm text-muted-foreground">Bail: {leaseRef}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {step === 'initial' ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800">
                            <p className="font-semibold mb-1">Processus de certification v3.0</p>
                            <p>Un code de validation sera envoyé au numéro de téléphone du locataire pour confirmer la signature.</p>
                        </div>
                        <Button 
                            className="w-full h-12 text-lg font-semibold flex gap-2" 
                            onClick={handleRequestOTP}
                            disabled={loading}
                        >
                            {loading ? "Envoi en cours..." : "Demander le Code (2FA)"}
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <p className="text-sm text-center text-muted-foreground">
                            Entrez le code à 6 chiffres reçu par SMS.
                        </p>
                        <Input 
                            type="text" 
                            placeholder="000000" 
                            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button 
                            className="w-full h-12 text-lg font-semibold" 
                            onClick={handleSign}
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? "Validation..." : "Signer le Bail"}
                        </Button>
                        <button 
                            className="text-sm text-primary underline w-full text-center"
                            onClick={() => setStep('initial')}
                            disabled={loading}
                        >
                            Renvoyer le code
                        </button>
                    </div>
                )}
                {error && (
                    <p className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-100 animate-shake">
                        {error}
                    </p>
                )}
            </CardContent>
            <CardFooter className="bg-slate-50 border-t py-4">
                <p className="text-xs text-center w-full text-muted-foreground">
                    Signature sécurisée par cryptographie asymétrique (SHA-256).
                </p>
            </CardFooter>
        </Card>
    )
}
