"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateUserRole } from "@/actions/user"

export default function OnboardingPage() {
    const [selectedRole, setSelectedRole] = useState<'LANDLORD' | 'TENANT' | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = () => {
        if (!selectedRole) return

        startTransition(async () => {
            setError(null)
            const result = await updateUserRole(selectedRole)
            
            if (result.error) {
                setError(result.error)
            } else {
                // Redirection via le navigateur pour forcer le rechargement de session
                if (selectedRole === 'LANDLORD') {
                    window.location.href = '/dashboard'
                } else {
                    window.location.href = '/locataire'
                }
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Bienvenue sur QAPRIL !
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Pour personnaliser votre expérience, veuillez choisir votre profil.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div 
                            onClick={() => setSelectedRole('LANDLORD')}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedRole === 'LANDLORD' ? 'border-[#FF8200] bg-orange-50' : 'border-gray-200 hover:border-[#FF8200]'}`}
                        >
                            <h3 className="text-lg font-bold text-gray-900">Propriétaire ou Agence</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Je gère des biens immobiliers, je souhaite suivre mes locations et mes encaissements.
                            </p>
                        </div>

                        <div 
                            onClick={() => setSelectedRole('TENANT')}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedRole === 'TENANT' ? 'border-[#FF8200] bg-orange-50' : 'border-gray-200 hover:border-[#FF8200]'}`}
                        >
                            <h3 className="text-lg font-bold text-gray-900">Locataire</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Je loue un bien, je souhaite payer mes loyers et consulter mes quittances.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedRole || isPending}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] transition-colors ${(!selectedRole || isPending) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? 'Enregistrement...' : 'Continuer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
