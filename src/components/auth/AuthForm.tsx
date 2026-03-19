"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { requestOTP, loginWithOTP } from "@/actions/auth"

interface AuthFormProps {
    role: 'TENANT' | 'LANDLORD'
    redirectPath: string
    title: string
    subtitle: string
}

export default function AuthForm({ role, redirectPath, title, subtitle }: AuthFormProps) {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleRequestOTP(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = await requestOTP(phone)
            if (result.success) {
                setStep('OTP')
            } else {
                setError(result.error || "Échec de l'envoi du code.")
            }
        })
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        startTransition(async () => {
            const result = await loginWithOTP(phone, otp)
            if (result.success) {
                router.push(redirectPath)
                router.refresh()
            } else {
                setError(result.error || "Code incorrect.")
            }
        })
    }

    return (
        <div className="w-full max-w-sm">
            <h2 className="mt-6 text-3xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">
                {title}
            </h2>
            <p className="mt-4 text-[16px] text-gray-500 font-medium">
                {subtitle}
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-[14px] font-bold mb-6">
                    {error}
                </div>
            )}

            {step === 'PHONE' ? (
                <form className="space-y-6" onSubmit={handleRequestOTP}>
                    <div>
                        <label htmlFor="phone" className="block text-[14px] font-black text-[#1F4E79] uppercase tracking-widest mb-2">
                            Numéro de téléphone
                        </label>
                        <div className="mt-1">
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="appearance-none block w-full px-5 py-4 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C55A11] focus:border-[#C55A11] text-[16px] font-bold"
                                placeholder="+225 00 00 00 00 00"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-xl text-[14px] font-black uppercase tracking-widest text-white bg-[#C55A11] hover:bg-[#A54A0D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C55A11] transition-all active:scale-95 disabled:opacity-50 min-h-[48px]"
                        >
                            {isPending ? 'Envoi...' : 'Recevoir le code par SMS'}
                        </button>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <p className="text-[12px] font-bold text-[#1F4E79] leading-relaxed">
                            Votre compte sera créé automatiquement si nécessaire. <br />
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Protocole QAPRIL Verify activé</span>
                        </p>
                    </div>
                </form>
            ) : (
                <form className="space-y-6" onSubmit={handleVerifyOTP}>
                    <div>
                        <label htmlFor="otp" className="block text-[14px] font-black text-[#1F4E79] uppercase tracking-widest mb-2">
                            Code de vérification (6 chiffres)
                        </label>
                        <div className="mt-1">
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength={6}
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="appearance-none block w-full px-5 py-5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C55A11] focus:border-[#C55A11] text-2xl text-center tracking-[0.5em] font-black text-[#1F4E79]"
                                placeholder="000000"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-xl text-[14px] font-black uppercase tracking-widest text-white bg-[#C55A11] hover:bg-[#A54A0D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C55A11] transition-all active:scale-95 disabled:opacity-50 min-h-[48px]"
                        >
                            {isPending ? 'Vérification...' : 'Se connecter'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="w-full mt-6 text-[14px] font-bold text-gray-400 hover:text-[#1F4E79] uppercase tracking-widest transition-colors"
                        >
                            Modifier le numéro
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
