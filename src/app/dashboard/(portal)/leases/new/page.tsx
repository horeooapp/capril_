"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { createLease } from "@/actions/leases"
import { createBDQ } from "@/actions/bdq"
import { getProperties } from "@/actions/properties"
import AgentBailDeclaratif from "@/components/AgentBailDeclaratif"

// Define TypeBail locally to avoid @prisma/client bundling issues in Client Components
enum TypeBail {
    ECRIT = "ECRIT",
    DECLARATIF_BDQ = "DECLARATIF_BDQ"
}

function LeaseRegistrationForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [step, setStep] = useState(1)
    
    const searchParams = useSearchParams()
    
    // Form State
    const [typeBail, setTypeBail] = useState<TypeBail>(TypeBail.ECRIT)
    const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') || "")
    const [tenantPhone, setTenantPhone] = useState("")
    const [tenantName, setTenantName] = useState("")
    const [propertyDescription, setPropertyDescription] = useState("")
    const [rentAmount, setRentAmount] = useState<number>(0)
    const [chargesAmount, setChargesAmount] = useState<number>(0)
    const [depositAmount, setDepositAmount] = useState<number>(0)
    const [advanceMonths, setAdvanceMonths] = useState<number>(0)
    const [agencyFees, setAgencyFees] = useState<number>(0)
    const [isPending, startTransition] = useTransition()
    const [startDate, setStartDate] = useState("")

    useEffect(() => {
        getProperties().then(setProperties).catch(console.error)
    }, [])

    useEffect(() => {
        if (rentAmount >= 0) {
            setAgencyFees(Math.round(rentAmount * 0.06))
        }
    }, [rentAmount])

    const handleNext = () => {
        if (step === 1 && (!propertyId || !tenantPhone)) {
            return setError("Veuillez remplir tous les champs de cette étape.")
        }
        if (step === 2) {
            if (depositAmount > rentAmount * 2) {
                return setError("Oups ! La loi limite la caution à 2 mois de loyer maximum.")
            }
            if (advanceMonths > 2) {
                return setError("Oups ! L'avance sur loyer est strictement limitée à 2 mois.")
            }
            if (agencyFees > rentAmount) {
                return setError("Les frais d'agence ne peuvent excéder 1 mois de loyer.")
            }
        }
        setError(null)
        setStep(step + 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // v2.0 Financial Ceilings (Part 7.1)
        if (depositAmount > 2) return setError("La caution ne peut excéder 2 mois de loyer.")
        if (advanceMonths > 2) return setError("L'avance ne peut excéder 2 mois.")
        if (agencyFees > rentAmount) return setError("Les frais d'agence ne peuvent excéder 1 mois.")

        const data = {
            propertyId,
            leaseType: 'residential' as const,
            typeBail,
            tenantPhone,
            startDate: new Date(startDate),
            rentAmount,
            durationMonths: 12,
            chargesAmount,
            depositAmount: depositAmount * rentAmount,
            avanceLoyer: advanceMonths * rentAmount,
            preavisRequisMois: 3,
        }

        startTransition(async () => {
            let result
            if (typeBail === TypeBail.DECLARATIF_BDQ) {
                result = await createBDQ({
                    propertyId: propertyId || undefined,
                    nomLocataire: tenantName,
                    telephoneLocataire: tenantPhone,
                    descriptionLogement: propertyDescription || properties.find(p => p.id === propertyId)?.address || "Logement non spécifié",
                    loyerMensuel: rentAmount,
                    dateEntree: new Date(startDate)
                })
            } else {
                result = await createLease(data)
            }

            if (result.error) {
                setError(result.error)
            } else {
                router.push("/dashboard/leases")
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    {typeBail === TypeBail.DECLARATIF_BDQ ? "Déclaration Bail Verbal (BDQ)" : "Nouveau Bail Normalisé"}
                </h1>
                <p className="text-gray-500 text-lg">ADD-05 Compliance — Étape {step} sur 3</p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex justify-center items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= s ? 'bg-[#FF8200] w-10' : 'bg-gray-200'}`} />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium animate-shake">
                    ⚠️ {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Étape 1 : Type & Parties</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Type de Contrat</label>
                                        <div className="flex bg-gray-50 p-1 rounded-2xl">
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.ECRIT)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${typeBail === TypeBail.ECRIT ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                                            >
                                                ✍️ ÉCRIT
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.DECLARATIF_BDQ)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${typeBail === TypeBail.DECLARATIF_BDQ ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
                                            >
                                                🗣️ VERBAL (BDQ)
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Propriété</label>
                                        <select 
                                            required 
                                            value={propertyId} 
                                            onChange={(e) => setPropertyId(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none"
                                        >
                                            <option value="">Sélectionnez un bien</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.propertyCode} - {p.commune}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Locataire (Nom)</label>
                                        <input 
                                            required 
                                            value={tenantName}
                                            onChange={(e) => setTenantName(e.target.value)}
                                            placeholder="Nom complet" 
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Locataire (Mobile)</label>
                                        <input 
                                            required type="tel" 
                                            value={tenantPhone}
                                            onChange={(e) => setTenantPhone(e.target.value)}
                                            placeholder="+225 00 00 00 00" 
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none" 
                                        />
                                    </div>
                                    {typeBail === TypeBail.DECLARATIF_BDQ && !propertyId && (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description du Logement</label>
                                            <textarea 
                                                required 
                                                value={propertyDescription}
                                                onChange={(e) => setPropertyDescription(e.target.value)}
                                                placeholder="Ex: Chambre 3, Cour Bamba, Niangon..." 
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none h-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Étape 2 : Conditions (Max 5 champs)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-600">Loyer mensuel (FCFA)</label>
                                        <input required type="number" value={rentAmount || ''} onChange={(e) => setRentAmount(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xl font-black text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600">Charges (FCFA)</label>
                                        <input type="number" value={chargesAmount || ''} onChange={(e) => setChargesAmount(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600">Caution (Mois)</label>
                                        <select required value={depositAmount || ''} onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF8200]">
                                            <option value="" disabled>Sélectionnez...</option>
                                            <option value={1}>1 mois</option>
                                            <option value={2}>2 mois</option>
                                        </select>
                                        <p className="text-[10px] font-bold text-[#1F4E79] text-right mt-1">Soit {(depositAmount * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600">Avance (Mois)</label>
                                        <select required value={advanceMonths || ''} onChange={(e) => setAdvanceMonths(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#FF8200]">
                                            <option value="" disabled>Sélectionnez...</option>
                                            <option value={1}>1 mois</option>
                                            <option value={2}>2 mois</option>
                                        </select>
                                        <p className="text-[10px] font-bold text-[#1F4E79] text-right mt-1">Soit {(advanceMonths * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600">Frais d&apos;agence (6% du Loyer)</label>
                                        <input readOnly type="number" value={agencyFees || 0} className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed font-medium" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Étape 3 : Finalisation</h3>
                                <div className="space-y-2 max-w-sm">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date d&apos;Éffet</label>
                                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none" />
                                </div>
                                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-800 leading-relaxed uppercase tracking-tighter">
                                        {typeBail === TypeBail.DECLARATIF_BDQ 
                                          ? "En déclarant ce bail verbal (BDQ), un SMS de confirmation sera envoyé au locataire. Le bail ne deviendra ACTIF_DECLARATIF qu'après sa validation."
                                          : "Un contrat de bail digital standard sera généré pour signature électronique (Part 14)."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-700">Retour</button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-700">Annuler</button>
                        )}

                        {step < 3 ? (
                            <button type="button" onClick={handleNext} className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl transform transition-all hover:scale-105 active:scale-95">Suivant</button>
                        ) : (
                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="px-12 py-4 bg-[#FF8200] hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 disabled:opacity-50 transition-all transform hover:-translate-y-1"
                            >
                                {isPending ? "Traitement..." : typeBail === TypeBail.DECLARATIF_BDQ ? "Déclarer" : "Générer le Bail"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function LeaseRegistrationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F4E79]"></div></div>}>
            <LeaseModeSelector />
        </Suspense>
    )
}

function LeaseModeSelector() {
    const [mode, setMode] = useState<"choix" | "agent" | "formulaire">("choix");
    const router = useRouter();

    if (mode === "agent") {
        return (
            <div className="h-[calc(100vh-140px)]">
                <AgentBailDeclaratif
                  onSuccess={({ bail }) => {
                    router.push(`/dashboard/leases`);
                    router.refresh();
                  }}
                  onCancel={() => setMode("choix")}
                />
            </div>
        )
    }

    if (mode === "formulaire") {
        return <LeaseRegistrationForm />
    }

    return (
        <div className="p-4 max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-xl font-bold text-[#1B3A6B] mb-2 text-center md:text-left">
                Nouveau bail déclaratif
            </div>
            <div className="text-sm text-[#4A6A8A] mb-6 text-center md:text-left">
                Choisissez comment enregistrer votre locataire
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Mode IA — recommandé */}
                <div
                    onClick={() => setMode("agent")}
                    className="bg-[#1B3A6B] rounded-2xl p-5 cursor-pointer active:opacity-90 hover:bg-blue-900 transition-all shadow-xl transform hover:-translate-y-1"
                >
                    <div className="text-2xl mb-3">🤖</div>
                    <div className="text-white font-bold text-base mb-1">
                        Créer avec l'assistant IA
                    </div>
                    <div className="text-white/60 text-xs leading-relaxed">
                        L'assistant vous pose les questions une par une.
                        Répondez naturellement — il s'occupe du reste.
                    </div>
                    <div className="mt-3 bg-[#F5A800] text-[#1B2A3B] text-xs font-bold px-3 py-1.5 rounded-lg inline-block">
                        Recommandé — 2 minutes
                    </div>
                </div>

                {/* Mode formulaire classique */}
                <div
                    onClick={() => setMode("formulaire")}
                    className="bg-white border border-[#D0DFF5] rounded-2xl p-5 cursor-pointer active:opacity-90 hover:border-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    <div className="text-4xl mb-3">📝</div>
                    <div className="text-[#1B3A6B] font-bold text-base mb-1">
                        Formulaire classique
                    </div>
                    <div className="text-[#4A6A8A] text-xs leading-relaxed">
                        Remplissez manuellement le formulaire standard en 3 étapes.
                    </div>
                </div>
            </div>
        </div>
    )
}

