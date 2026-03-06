"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerLease } from "@/actions/leases"

export default function LeaseRegistrationPage() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Form states
    const [propertyId, setPropertyId] = useState("NEW")
    
    // Rent calculation states for hints
    const [rentAmount, setRentAmount] = useState<number>(0)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        
        // Client-side validation of ceilings (though server does it too)
        const deposit = parseFloat(formData.get("deposit") as string || "0")
        const advance = parseFloat(formData.get("advancePayment") as string || "0")
        const agency = parseFloat(formData.get("agencyFee") as string || "0")
        
        if (deposit > rentAmount * 2) {
            setError("La caution ne peut excéder 2 mois de loyer.")
            setIsPending(false)
            return
        }
        if (advance > rentAmount * 2) {
            setError("L'avance sur loyer ne peut excéder 2 mois.")
            setIsPending(false)
            return
        }
        if (agency > rentAmount * 1) {
            setError("Les frais d'agence ne peuvent excéder 1 mois de loyer.")
            setIsPending(false)
            return
        }

        try {
            const result = await registerLease(formData)
            
            if (result.error) {
                setError(result.error)
            } else {
                setSuccessMessage("Bail enregistré avec succès dans le registre numérique ! Redirection...")
                setTimeout(() => {
                    router.push("/dashboard/leases")
                }, 2000)
            }
        } catch (err: any) {
            setError("Une erreur inattendue est survenue.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Enregistrement d'un Bail Normalisé
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Saisissez les informations exactes de votre contrat de bail physique pour l'intégrer au Registre Numérique QAPRIL.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Erreur lors de l'enregistrement</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="rounded-md bg-green-50 p-4 mb-6 border border-green-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
                
                {/* 1. Numéro Officiel */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">V. Références du Contrât</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Le numéro d'identification unique imprimé sur le formulaire physique acheté en librairie.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-4">
                                    <label htmlFor="officialLeaseNumber" className="block text-sm font-medium text-gray-700">
                                        N° du Bail Officiel
                                    </label>
                                    <input
                                        type="text"
                                        name="officialLeaseNumber"
                                        id="officialLeaseNumber"
                                        className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                        placeholder="Ex: BCH-2023-84729"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Identification des parties (Locataire) */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">I. Identification du Locataire</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Renseignez les informations d'identité figurant sur le contrat.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="tenantType" className="block text-sm font-medium text-gray-700">Type de locataire</label>
                                    <select
                                        id="tenantType"
                                        name="tenantType"
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                    >
                                        <option value="PERSON">Personne Physique</option>
                                        <option value="COMPANY">Personne Morale (Société)</option>
                                    </select>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">Nom et Prénoms (ou Raison Sociale)</label>
                                    <input type="text" name="tenantName" id="tenantName" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="tenantEmail" className="block text-sm font-medium text-gray-700">Adresse Email *</label>
                                    <input type="email" name="tenantEmail" id="tenantEmail" required placeholder="Sert d'identifiant" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="tenantPhone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                                    <input type="tel" name="tenantPhone" id="tenantPhone" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="tenantCni" className="block text-sm font-medium text-gray-700">N° CNI / Passeport</label>
                                    <input type="text" name="tenantCni" id="tenantCni" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="tenantNationality" className="block text-sm font-medium text-gray-700">Nationalité</label>
                                    <input type="text" name="tenantNationality" id="tenantNationality" defaultValue="Ivoirienne" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="tenantProfession" className="block text-sm font-medium text-gray-700">Profession</label>
                                    <input type="text" name="tenantProfession" id="tenantProfession" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Désignation du Logement */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">II. Désignation du Logement</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Saisissez un nouveau logement ou sélectionnez-en un existant.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                             <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6">
                                    <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">Bien immobilier concerné</label>
                                    <select
                                        id="propertyId"
                                        name="propertyId"
                                        value={propertyId}
                                        onChange={(e) => setPropertyId(e.target.value)}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm"
                                    >
                                        <option value="NEW">+ Créer un nouveau logement</option>
                                        {/* In a real scenario, map active properties owned by user here */}
                                    </select>
                                </div>

                                {propertyId === "NEW" && (
                                    <>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Type de logement</label>
                                            <select name="propertyType" id="propertyType" className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm">
                                                <option value="APARTMENT">Appartement</option>
                                                <option value="HOUSE">Maison / Villa</option>
                                                <option value="STUDIO">Studio</option>
                                                <option value="COMMERCIAL">Local Commercial</option>
                                            </select>
                                        </div>
                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">Adresse / Rue</label>
                                            <input type="text" name="propertyAddress" id="propertyAddress" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label htmlFor="propertyCity" className="block text-sm font-medium text-gray-700">Ville</label>
                                            <input type="text" name="propertyCity" id="propertyCity" defaultValue="Abidjan" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label htmlFor="propertyCommune" className="block text-sm font-medium text-gray-700">Commune / Quartier</label>
                                            <input type="text" name="propertyCommune" id="propertyCommune" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label htmlFor="propertyLot" className="block text-sm font-medium text-gray-700">Numéro de Lot</label>
                                            <input type="text" name="propertyLot" id="propertyLot" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                        </div>
                                        <div className="col-span-6 sm:col-span-2">
                                            <label htmlFor="propertyRooms" className="block text-sm font-medium text-gray-700">Nombre de pièces</label>
                                            <input type="number" name="propertyRooms" id="propertyRooms" min="1" defaultValue="1" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                        </div>
                                    </>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* 4. Durée du bail */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">III. Durée du Bail</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Précisez la prise d'effet et la durée.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Date d'entrée en jouissance</label>
                                    <input type="date" name="startDate" id="startDate" required className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Date de fin (Optionnel)</label>
                                    <input type="date" name="endDate" id="endDate" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>
                                <div className="col-span-6">
                                    <label htmlFor="renewalMode" className="block text-sm font-medium text-gray-700">Mode de renouvellement</label>
                                    <input type="text" name="renewalMode" id="renewalMode" defaultValue="Tacite reconduction" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Loyer & Plafonds Légaux */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mt-6 border-l-4 border-[#FF8200]">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">IV. Loyers & Garanties</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Selon la loi, les limites sont strictes :<br className="my-2"/>
                                <b>Caution : max 2 mois</b><br/>
                                <b>Avance : max 2 mois</b><br/>
                                <b>Agence : max 1 mois</b>
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">Loyer mensuel principal (FCFA) *</label>
                                    <input 
                                        type="number" 
                                        name="rentAmount" 
                                        id="rentAmount" 
                                        required 
                                        min="0"
                                        onChange={(e) => setRentAmount(parseFloat(e.target.value) || 0)}
                                        className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border font-bold text-lg text-primary"
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="charges" className="block text-sm font-medium text-gray-700">Charges annexes (FCFA)</label>
                                    <input type="number" name="charges" id="charges" defaultValue="0" min="0" className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                </div>

                                <div className="col-span-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-2 text-sm text-gray-500">Limites Légales de Paiement à l'Entrée</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">
                                        Dépôt de garantie (Caution)
                                    </label>
                                    <input type="number" name="deposit" id="deposit" defaultValue="0" min="0" max={rentAmount > 0 ? rentAmount * 2 : undefined} className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                    <p className="text-xs text-gray-500 mt-1">Maximum: {(rentAmount * 2).toLocaleString()} FCFA</p>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="advancePayment" className="block text-sm font-medium text-gray-700">
                                        Avance sur loyer
                                    </label>
                                    <input type="number" name="advancePayment" id="advancePayment" defaultValue="0" min="0" max={rentAmount > 0 ? rentAmount * 2 : undefined} className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                    <p className="text-xs text-gray-500 mt-1">Maximum: {(rentAmount * 2).toLocaleString()} FCFA</p>
                                </div>

                                <div className="col-span-6 sm:col-span-2">
                                    <label htmlFor="agencyFee" className="block text-sm font-medium text-gray-700">
                                        Frais d'agence
                                    </label>
                                    <input type="number" name="agencyFee" id="agencyFee" defaultValue="0" min="0" max={rentAmount > 0 ? rentAmount : undefined} className="mt-1 focus:ring-[#FF8200] focus:border-[#FF8200] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"/>
                                    <p className="text-xs text-gray-500 mt-1">Maximum: {(rentAmount).toLocaleString()} FCFA</p>
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-700">Jour d'exigibilité du loyer</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            Le
                                        </span>
                                        <input type="number" name="paymentDueDate" id="paymentDueDate" min="1" max="31" defaultValue="5" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-[#FF8200] focus:border-[#FF8200] sm:text-sm border-gray-300 border" />
                                        <span className="inline-flex items-center px-3 text-gray-500 sm:text-sm">
                                            du mois
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={`ml-3 inline-flex justify-center flex-row items-center py-2 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF8200] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8200] ${isPending ? 'opacity-75 cursor-wait' : ''}`}
                        >
                            {isPending ? 'Enregistrement...' : 'Enregistrer le Bail au Registre'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
