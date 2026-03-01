"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { loginWithMagicLink, loginWithPassword } from "@/actions/auth"

export default function LoginPage() {
    const [loginMode, setLoginMode] = useState<'magic-link' | 'password'>('magic-link')

    return (
        <div className="min-h-screen bg-white flex">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">

                    <Link href="/" className="flex items-center space-x-2 mb-8 cursor-pointer">
                        <div className="flex space-x-1 h-8">
                            <div className="w-3 bg-[#FF8200] rounded-sm" />
                            <div className="w-3 bg-gray-100 rounded-sm border border-gray-200" />
                            <div className="w-3 bg-[#009E60] rounded-sm" />
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900">QAPRIL</span>
                    </Link>

                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Connexion
                        </h2>
                        <div className="mt-4 flex space-x-4 border-b">
                            <button
                                onClick={() => setLoginMode('magic-link')}
                                className={`pb-2 text-sm font-medium ${loginMode === 'magic-link' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                            >
                                Lien Magique
                            </button>
                            <button
                                onClick={() => setLoginMode('password')}
                                className={`pb-2 text-sm font-medium ${loginMode === 'password' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                            >
                                Mot de passe (Admin)
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        {loginMode === 'magic-link' ? (
                            <MagicLinkForm />
                        ) : (
                            <PasswordLoginForm />
                        )}
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

function MagicLinkForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await loginWithMagicLink(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form className="space-y-6" action={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Adresse e-mail
                </label>
                <div className="mt-1">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="nom@exemple.ci"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Envoi...' : 'Recevoir le lien'}
                </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
                Un lien de connexion sécurisé vous sera envoyé par e-mail.
            </p>
        </form>
    )
}

function PasswordLoginForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await loginWithPassword(formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <form className="space-y-6" action={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="email-pwd" className="block text-sm font-medium text-gray-700">
                    Adresse e-mail
                </label>
                <div className="mt-1">
                    <input
                        id="email-pwd"
                        name="email"
                        type="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="password" title="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Connexion...' : 'Se connecter'}
                </button>
            </div>
        </form>
    )
}
