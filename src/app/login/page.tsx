/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-unused-vars */
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { requestOTP, loginWithOTP } from "@/actions/auth"

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<'TENANT' | 'LANDLORD'>('TENANT')

    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">

                    <Link href="/" className="flex items-center space-x-4 mb-8 cursor-pointer">
                        <img src="/logo.png" alt="QAPRIL Logo" className="h-12 w-auto" />
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                    </Link>

                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Connexion
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 mb-6">
                            Accédez à votre espace sécurisé via votre numéro de téléphone.
                        </p>

                        <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
                            <button
                                onClick={() => setSelectedRole('TENANT')}
                                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'TENANT' ? 'bg-white text-[#FF8200] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <span className="mr-2">🏠</span> Locataire
                            </button>
                            <button
                                onClick={() => setSelectedRole('LANDLORD')}
                                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${selectedRole === 'LANDLORD' ? 'bg-white text-[#FF8200] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <span className="mr-2">🔑</span> Propriétaire
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <PhoneOTPForm role={selectedRole} />
                    </div>
                </div>
            </div>

            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Façade bâtiment moderne"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-30 mix-blend-multiply"></div>
            </div>
        </div>
    )

}

function PhoneOTPForm({ role }: { role: string }) {
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
                router.push("/dashboard")
                router.refresh()
            } else {
                setError(result.error || "Code incorrect.")
            }
        })
    }

    if (step === 'PHONE') {
        return (
            <form className="space-y-6" onSubmit={handleRequestOTP}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                        {error}
                    </div>
                )}
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
                        <strong>Nouveau sur QAPRIL ?</strong> Votre compte sera créé automatiquement après vérification de votre numéro.
                    </p>
                </div>
            </form>
        )
    }

    return (
        <form className="space-y-6" onSubmit={handleVerifyOTP}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
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
    )
}
