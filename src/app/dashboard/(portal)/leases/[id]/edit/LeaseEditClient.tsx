"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"

import { updateLeaseDraft } from "@/actions/leases-edit"
import { getProperties } from "@/actions/properties"

enum TypeBail {
    ECRIT = "ECRIT",
    DECLARATIF_BDQ = "DECLARATIF_BDQ"
}

export default function LeaseEditClient({ initialLease }: { initialLease: any }) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [step, setStep] = useState(1)
    
    // Check if editing is allowed
    const allowedStatuses = ["DRAFT", "PENDING_SIGNATURE", "PENDING_CONFIRMATION"]
    const isEditable = allowedStatuses.includes(initialLease.status)

    // Form State (Pre-filled)
    const [typeBail, setTypeBail] = useState<TypeBail>((initialLease.typeBail as TypeBail) || TypeBail.ECRIT)
    const [propertyId, setPropertyId] = useState(initialLease.propertyId || "")
    const [tenantPhone, setTenantPhone] = useState(initialLease.tenant?.phone || "")
    const [tenantName, setTenantName] = useState((initialLease.tenant?.firstName ? initialLease.tenant.firstName + " " : "") + (initialLease.tenant?.lastName || "") || "")
    const [rentAmount, setRentAmount] = useState<number>(initialLease.rentAmount || 0)
    const [chargesAmount, setChargesAmount] = useState<number>(initialLease.chargesAmount || 0)
    const [depositMonths, setDepositMonths] = useState<number>(
        initialLease.depositAmount && initialLease.rentAmount ? Math.round(initialLease.depositAmount / initialLease.rentAmount) : 0
    )
    const [advanceMonths, setAdvanceMonths] = useState<number>(0)
    const [agencyFees, setAgencyFees] = useState<number>(0)
    const [isPending, startTransition] = useTransition()
    
    // Clauses Contractuelles
    const parsedData = typeof initialLease.commercialData === 'string' ? JSON.parse(initialLease.commercialData || '{}') : (initialLease.commercialData || {})
    const [clauses, setClauses] = useState<{id: string, title: string, content: string}[]>(
        Array.isArray(parsedData.clauses) ? parsedData.clauses : []
    )
    
    // Formatting the date for the date input (YYYY-MM-DD)
    const formattedStartDate = initialLease.startDate ? new Date(initialLease.startDate).toISOString().split('T')[0] : ""
    const [startDate, setStartDate] = useState(formattedStartDate)

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
            if (depositMonths > 2) {
                return setError("Oups ! La loi limite la caution à 2 mois de loyer maximum.")
            }
            if (advanceMonths > 2) {
                return setError("Oups ! L'avance sur loyer est strictement limitée à 2 mois.")
            }
            if (agencyFees > rentAmount) {
                return setError("Les frais d'agence ne peuvent excéder 1 mois de loyer.")
            }
        }
        if (step === 3 && !startDate) {
            return setError("La date d'effet est obligatoire.")
        }
        setError(null)
        setStep(step + 1)
    }

    const addClause = () => {
        setClauses([...clauses, { id: Math.random().toString(36).substr(2, 9), title: "Nouvelle Clause Spéciale", content: "" }])
    }
    const updateClause = (id: string, field: 'title'|'content', value: string) => {
        setClauses(clauses.map(c => c.id === id ? { ...c, [field]: value } : c))
    }
    const removeClause = (id: string) => {
        setClauses(clauses.filter(c => c.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isEditable) {
            return setError("Ce contrat ne peut plus être modifié.")
        }
        setError(null)

        // v2.0 Financial Ceilings (Part 7.1)
        if (depositMonths > 2) return setError("La caution ne peut excéder 2 mois de loyer.")
        if (advanceMonths > 2) return setError("L'avance ne peut excéder 2 mois.")
        if (agencyFees > rentAmount) return setError("Les frais d'agence ne peuvent excéder 1 mois.")

        const data = {
            propertyId,
            leaseType: initialLease.leaseType || 'residential',
            typeBail,
            tenantPhone,
            startDate: new Date(startDate),
            rentAmount,
            durationMonths: initialLease.durationMonths || 12,
            chargesAmount,
            depositAmount: depositMonths * rentAmount,
            commercialData: {
                ...parsedData,
                clauses
            }
        }

        startTransition(async () => {
            const result = await updateLeaseDraft(initialLease.id, data)

            if (result.error) {
                setError(result.error)
            } else {
                router.push(`/dashboard/leases/${initialLease.id}`)
                router.refresh()
            }
        })
    }

    if (!isEditable) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
                    <h2 className="text-xl font-black text-red-600 uppercase">Modification Interdite</h2>
                    <p className="mt-4 font-medium text-red-800">Ce bail est au statut {initialLease.status}. Il a sécurisé et transmis numériquement. Un avenant est désormais requis pour le modifier.</p>
                    <button onClick={() => router.back()} className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow">Retour au Contrat</button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-4">
               <div>
                  <h1 className="text-4xl font-black text-qnavy-dark tracking-tight uppercase">Édition Intégrale</h1>
                  <p className="text-qorange font-bold text-sm tracking-widest uppercase mt-2">{initialLease.leaseReference}</p>
               </div>
               <button onClick={() => router.back()} className="text-sm font-bold text-qtext-light hover:text-qnavy border border-qgrey-2 px-4 py-2 rounded-xl bg-white shadow-sm transition-colors">Annuler l'édition</button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex justify-center items-center gap-4 mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= s ? 'bg-qorange w-10' : 'bg-qgrey-2'}`} />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium animate-shake shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                    ⚠️ {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-qtext-light uppercase tracking-widest flex items-center gap-2"><span>1.</span> Type & Parties</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-light uppercase tracking-widest">Type de Contrat</label>
                                        <div className="flex bg-background p-1.5 rounded-2xl border border-qgrey-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.ECRIT)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${typeBail === TypeBail.ECRIT ? 'bg-white shadow-[0_4px_16px_rgba(13,43,110,0.06)] text-qnavy border border-qgrey-2' : 'text-qtext-light'}`}
                                            >
                                                ✍️ ÉCRIT
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.DECLARATIF_BDQ)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all ${typeBail === TypeBail.DECLARATIF_BDQ ? 'bg-white shadow-[0_4px_16px_rgba(255,130,0,0.1)] text-qorange border border-qorange/20' : 'text-qtext-light'}`}
                                            >
                                                🗣️ VERBAL
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-light uppercase tracking-widest">Propriété</label>
                                        <select 
                                            required 
                                            value={propertyId} 
                                            onChange={(e) => setPropertyId(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] outline-none text-gray-800 font-medium"
                                        >
                                            <option value="">Sélectionner ou changer le bien</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.propertyCode} - {p.commune}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-light uppercase tracking-widest">Locataire (Nom)</label>
                                        <input 
                                            required 
                                            value={tenantName}
                                            onChange={(e) => setTenantName(e.target.value)}
                                            placeholder="Nom complet" 
                                            className="w-full px-5 py-4 bg-background border border-qgrey-2 rounded-2xl focus:ring-2 focus:ring-qorange outline-none text-qnavy-dark font-medium" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-light uppercase tracking-widest">Locataire (Mobile)</label>
                                        <input 
                                            required type="tel" 
                                            value={tenantPhone}
                                            onChange={(e) => setTenantPhone(e.target.value)}
                                            placeholder="+225 00 00 00 00" 
                                            className="w-full px-5 py-4 bg-background border border-qgrey-2 rounded-2xl focus:ring-2 focus:ring-qorange outline-none text-qnavy-dark font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-qtext-light uppercase tracking-widest flex items-center gap-2"><span>2.</span> Conditions Financières</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-qnavy-pale border border-qnavy/10 rounded-[2.5rem]">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black text-qnavy uppercase tracking-widest">Loyer mensuel (FCFA)</label>
                                        <input required type="number" value={rentAmount || ''} onChange={(e) => setRentAmount(parseInt(e.target.value) || 0)} className="w-full px-6 py-5 bg-white border border-qgrey-2 rounded-[1.5rem] text-3xl font-black text-qnavy-dark shadow-[inset_0_2px_10px_rgba(13,43,110,0.03)] focus:ring-2 focus:ring-qnavy outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-mid uppercase tracking-widest">Charges Incluses (FCFA)</label>
                                        <input type="number" value={chargesAmount || ''} onChange={(e) => setChargesAmount(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-white border border-qgrey-2 rounded-2xl font-bold text-qnavy focus:ring-2 focus:ring-qnavy outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-mid uppercase tracking-widest">Caution Fixée (Mois)</label>
                                        <input required type="number" min={0} max={2} value={depositMonths || ''} onChange={(e) => setDepositMonths(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-white border border-qgrey-2 rounded-2xl font-bold text-qnavy focus:ring-2 focus:ring-qnavy outline-none" placeholder="Max 2 mois" />
                                        <p className="text-[10px] font-bold text-[#1F4E79] text-right mt-1">Soit {(depositMonths * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-mid uppercase tracking-widest">Avance (Mois)</label>
                                        <input required type="number" min={0} max={2} value={advanceMonths || ''} onChange={(e) => setAdvanceMonths(parseInt(e.target.value) || 0)} className="w-full px-5 py-4 bg-white border border-qgrey-2 rounded-2xl font-bold text-qnavy focus:ring-2 focus:ring-qnavy outline-none" placeholder="Max 2 mois" />
                                        <p className="text-[10px] font-bold text-[#1F4E79] text-right mt-1">Soit {(advanceMonths * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-qtext-light uppercase tracking-widest">Frais d'agence estimés</label>
                                        <input readOnly type="number" value={agencyFees || 0} className="w-full px-5 py-4 bg-background border border-qgrey-2 rounded-2xl text-qtext-light cursor-not-allowed font-bold" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-sm font-black text-qtext-light uppercase tracking-widest flex items-center gap-2"><span>3.</span> Date d'effet</h3>
                                <div className="space-y-2 max-w-sm">
                                    <label className="text-xs font-black text-qnavy uppercase tracking-widest">Début effectif du contrat</label>
                                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-6 py-5 bg-background border border-qgrey-2 rounded-[1.5rem] focus:ring-2 focus:ring-qnavy outline-none font-bold text-xl text-qnavy-dark" />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-qtext-light uppercase tracking-widest flex items-center gap-2"><span>4.</span> Clauses Personnalisées</h3>
                                    <button type="button" onClick={addClause} className="bg-qorange-pale text-qorange px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-qorange hover:text-white transition-colors">
                                        + Ajouter clause
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {clauses.length === 0 ? (
                                        <p className="text-qtext-light text-sm italic py-8 text-center bg-background rounded-2xl border border-dashed border-qgrey-2">Aucune clause spéciale rattachée. Le bail utilisera le modèle standard.</p>
                                    ) : (
                                        clauses.map((clause, index) => (
                                            <div key={clause.id} className="p-6 bg-background rounded-3xl border border-qgrey-2 space-y-4 relative group">
                                                <button type="button" onClick={() => removeClause(clause.id)} className="absolute top-4 right-4 text-qtext-light hover:text-qred bg-white border border-qgrey-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors">✕</button>
                                                <div className="flex flex-col gap-1.5 w-11/12">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Titre de la clause {index + 1}</label>
                                                    <input 
                                                        value={clause.title} 
                                                        onChange={(e) => updateClause(clause.id, 'title', e.target.value)}
                                                        className="font-bold text-qnavy-dark bg-white border border-qgrey-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-qnavy outline-none" 
                                                        placeholder="Ex: Conditions Animalières" 
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-qtext-light">Contenu légal</label>
                                                    <textarea 
                                                        value={clause.content} 
                                                        onChange={(e) => updateClause(clause.id, 'content', e.target.value)}
                                                        className="font-medium text-qtext-mid bg-white border border-qgrey-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-qnavy outline-none min-h-[120px] resize-y"
                                                        placeholder="Veuillez décrire expressément l'accord..."
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="bg-qgreen-pale p-8 rounded-3xl border border-qgreen/10 mt-8">
                                    <p className="text-xs font-black text-qgreen uppercase tracking-widest">
                                        Mise en garde juridique
                                    </p>
                                    <p className="text-sm text-qgreen-light font-medium mt-3 leading-relaxed">
                                        La validation de ces modifications écrasera le brouillon précédent. Toutes les clauses spéciales mentionnées ici prévaudront sur les clauses génériques du bail conforme proposé par QAPRIL. Assurez-vous de leur légalité locale.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-background border-t border-qgrey-1 flex justify-between rounded-b-3xl items-center">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 text-[13px] font-black text-qtext-light uppercase tracking-widest hover:text-qnavy border border-qgrey-2 rounded-[1rem] bg-white shadow-sm transition-all hover:-translate-x-1">RÉTRO</button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="px-8 py-4 text-[13px] font-black text-qred uppercase tracking-widest hover:bg-qred-pale rounded-[1rem] transition-all">ANNULER</button>
                        )}

                        {step < 4 ? (
                            <button type="button" onClick={handleNext} className="gap-2 flex items-center px-12 py-4 bg-qnavy text-white font-black uppercase tracking-widest rounded-[1.2rem] shadow-[0_8px_16px_rgba(13,43,110,0.2)] transform transition-all hover:-translate-y-1 active:scale-95">AVANT</button>
                        ) : (
                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="px-12 py-4 bg-qgreen hover:bg-qgreen-light text-white font-black uppercase tracking-widest rounded-[1.2rem] shadow-[0_12px_24px_rgba(26,122,60,0.3)] disabled:opacity-50 transition-all transform hover:-translate-y-1"
                            >
                                {isPending ? "SAUVEGARDE EST EN COURS..." : "VALIDER LE CONTRAT"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
