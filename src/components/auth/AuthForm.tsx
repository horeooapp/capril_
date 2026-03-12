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
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 mb-6">
                {subtitle}
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}

            {step === 'PHONE' ? (
                <form className="space-y-6" onSubmit={handleRequestOTP}>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
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
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                placeholder="+225 00 00 00 00 00"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Envoi...' : 'Recevoir le code par SMS'}
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                        <p className="text-xs text-blue-700">
                            Votre compte sera créé automatiquement si nécessaire.
                        </p>
                    </div>
                </form>
            ) : (
                <form className="space-y-6" onSubmit={handleVerifyOTP}>
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
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
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm text-center tracking-[1em] font-bold"
                                placeholder="000000"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Vérification...' : 'Se connecter'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                        >
                            Modifier le numéro
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
