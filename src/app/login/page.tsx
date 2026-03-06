"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { loginWithMagicLink } from "@/actions/auth"

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
                            Accédez à votre espace sécurisé via un lien magique.
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
                        <MagicLinkForm role={selectedRole} />
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

function MagicLinkForm({ role }: { role: string }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setError(null)
        console.log("Form submitted. Starting transition...");
        startTransition(async () => {
            console.log("Inside transition, calling loginWithMagicLink...");
            try {
                const result = await loginWithMagicLink(formData)
                console.log("Received result from loginWithMagicLink:", result);
                if (result?.error) {
                    setError(result.error)
                } else if (result?.success) {
                    // Si succès, rediriger via le routeur Next.js
                    console.log("Success! Redirecting...");
                    router.push("/verify-request")
                } else {
                    console.log("No error or success in result:", result);
                }
            } catch (e) {
                console.error("Login unexpected error:", e)
                setError("Une erreur technique est survenue. Veuillez vérifier votre connexion.")
            }
        })
    }

    return (
        <form className="space-y-6" action={handleSubmit}>
            <input type="hidden" name="role" value={role} />
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
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                        placeholder="nom@exemple.net"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Envoi...' : 'Recevoir le lien (Connexion / Inscription)'}
                </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-xs text-blue-700">
                    <strong>Nouveau sur QAPRIL ?</strong> Saisissez votre adresse e-mail pour créer votre compte instantanément. Un lien de vérification vous sera envoyé.
                </p>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
                Un lien de connexion sécurisé vous sera envoyé par e-mail.
                <br />
                <span className="italic mt-1 block">Le système détectera automatiquement si vous êtes Locataire, Propriétaire ou Administrateur et vous dirigera vers le bon portail.</span>
            </p>
        </form>
    )
}
