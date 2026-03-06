"use client"

import { useState } from "react"
import { signLease } from "@/actions/leases"
import LeaseAgreement from "@/components/dashboard/LeaseAgreement"
import { useRouter } from "next/navigation"

interface LeaseSignatureUIProps {
    lease: any
    userId: string
}

export default function LeaseSignatureUI({ lease, userId }: LeaseSignatureUIProps) {
    const [agree, setAgree] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const isTenant = lease.tenantId === userId
    const isOwner = lease.property.ownerId === userId
    const alreadySigned = (isTenant && lease.tenantSignature) || (isOwner && lease.ownerSignature)

    const handleSign = async () => {
        if (!agree) return
        setIsPending(true)
        try {
            // Dans une version réelle, on pourrait générer un code de validation SMS
            const signatureHash = `SIGN-${userId}-${Date.now()}`
            const result = await signLease(lease.id, signatureHash)
            if (result.success) {
                router.refresh()
            }
        } catch (error) {
            alert("Erreur lors de la signature.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-4xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Validation du Contrat</h1>
                    <p className="text-sm text-gray-500 font-medium">Veuillez relire attentivement les clauses avant de signer numériquement.</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    lease.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-orange-100 text-orange-700 border border-orange-200 animate-pulse'
                }`}>
                    Statut : {lease.status === 'ACTIVE' ? 'Contrat Actif' : 'En attente de signature'}
                </div>
            </div>

            <LeaseAgreement lease={lease} />

            <div className="max-w-4xl mx-auto bg-gray-900 text-white p-8 rounded-3xl shadow-2xl border border-gray-800">
                {alreadySigned ? (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-4">✅</div>
                        <h2 className="text-xl font-bold uppercase tracking-tight">Vous avez déjà signé ce contrat</h2>
                        <p className="text-gray-400 mt-2 text-sm">Le contrat deviendra actif dès que {isTenant ? 'le propriétaire' : 'le locataire'} aura également apposé sa signature.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tight flex items-center">
                            <span className="mr-3 text-orange-500">✍️</span> Signature Numérique
                        </h2>
                        
                        <div className="space-y-4">
                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500 transition-all"
                                />
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                                    Je reconnais avoir pris connaissance de l'intégralité des clauses du présent contrat de bail et j'accepte d'y apposer ma signature numérique. 
                                    Je comprends que cette signature a <strong>valeur légale et probante</strong> au sens de la législation ivoirienne.
                                </span>
                            </label>

                            <div className="pt-6 flex justify-center">
                                <button
                                    onClick={handleSign}
                                    disabled={!agree || isPending}
                                    className={`px-12 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                                        agree 
                                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-95' 
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                    }`}
                                >
                                    {isPending ? 'Signature en cours...' : 'Apposer ma Signature Numérique'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
