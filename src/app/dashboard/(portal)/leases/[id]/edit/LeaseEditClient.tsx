"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert, AlertTriangle, ArrowLeft, Save, Plus, X } from "lucide-react"
import { updateLeaseDraft } from "@/actions/lease.actions"
import { getProperties } from "@/actions/property.actions"

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
                <div className="bg-rose-50 border border-rose-200 p-8 rounded-[20px]">
                    <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
                    <h2 className="text-xl font-black text-rose-600 uppercase">Modification Interdite</h2>
                    <p className="mt-4 font-medium text-rose-800">Ce bail est au statut {initialLease.status}. Il est sécurisé et transmis numériquement. Un avenant est désormais requis pour le modifier.</p>
                    <button onClick={() => router.back()} className="mt-6 px-6 py-3 bg-slate-900 border border-slate-700 text-white font-bold rounded-[10px] shadow-sm uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-colors">Retour au Contrat</button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative">
            <div className="flex justify-between items-center mb-4">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Édition Intégrale</h1>
                  <p className="text-amber-500 font-bold text-[12px] tracking-widest uppercase mt-2">{initialLease.leaseReference}</p>
               </div>
               <button onClick={() => router.back()} className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-4 py-2.5 rounded-[10px] bg-white shadow-sm transition-colors uppercase tracking-widest"><ArrowLeft size={14}/> Annuler</button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex justify-center items-center gap-3">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step >= s ? 'bg-amber-500 w-12' : 'bg-slate-200 w-8'}`} />
                ))}
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-[12px] text-[13px] font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={18}/>
                    {error}
                </div>
            )}

            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span>1.</span> Type & Parties</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type de Contrat</label>
                                        <div className="flex bg-slate-50 p-1.5 rounded-[12px] border border-slate-200 gap-1.5">
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.ECRIT)}
                                                className={`flex-1 py-2.5 px-4 rounded-[8px] text-[11px] font-bold transition-all uppercase tracking-wider ${typeBail === TypeBail.ECRIT ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                ✍️ Écrit
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setTypeBail(TypeBail.DECLARATIF_BDQ)}
                                                className={`flex-1 py-2.5 px-4 rounded-[8px] text-[11px] font-bold transition-all uppercase tracking-wider ${typeBail === TypeBail.DECLARATIF_BDQ ? 'bg-amber-50 border border-amber-200 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                🗣️ Verbal
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Propriété</label>
                                        <select 
                                            required 
                                            value={propertyId} 
                                            onChange={(e) => setPropertyId(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[10px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-[13px] font-bold text-slate-900 shadow-sm cursor-pointer"
                                        >
                                            <option value="">Sélectionner le bien</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.propertyCode} - {p.commune}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Locataire (Nom complet)</label>
                                        <input 
                                            required 
                                            value={tenantName}
                                            onChange={(e) => setTenantName(e.target.value)}
                                            placeholder="Nom complet" 
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-[13px] font-bold text-slate-900 shadow-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Locataire (Mobile)</label>
                                        <input 
                                            required type="tel" 
                                            value={tenantPhone}
                                            onChange={(e) => setTenantPhone(e.target.value)}
                                            placeholder="+225 00 00 00 00" 
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-[13px] font-bold text-slate-900 shadow-sm font-mono" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span>2.</span> Conditions Financières</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50 border border-slate-200 rounded-[20px]">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loyer mensuel (FCFA)</label>
                                        <input required type="number" value={rentAmount || ''} onChange={(e) => setRentAmount(parseInt(e.target.value) || 0)} className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[12px] text-2xl font-black text-slate-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] focus:ring-1 focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Charges Incluses (FCFA)</label>
                                        <input type="number" value={chargesAmount || ''} onChange={(e) => setChargesAmount(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] font-bold text-[14px] text-slate-900 focus:ring-1 focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Caution Fixée (Mois)</label>
                                        <input required type="number" min={0} max={2} value={depositMonths || ''} onChange={(e) => setDepositMonths(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] font-bold text-[14px] text-slate-900 focus:ring-1 focus:ring-amber-500 outline-none" placeholder="Max 2 mois" />
                                        <p className="text-[10px] font-bold text-slate-500 text-right mt-1 font-mono">{(depositMonths * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avance (Mois)</label>
                                        <input required type="number" min={0} max={2} value={advanceMonths || ''} onChange={(e) => setAdvanceMonths(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[10px] font-bold text-[14px] text-slate-900 focus:ring-1 focus:ring-amber-500 outline-none" placeholder="Max 2 mois" />
                                        <p className="text-[10px] font-bold text-slate-500 text-right mt-1 font-mono">{(advanceMonths * rentAmount).toLocaleString("fr-FR")} FCFA</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Frais d'agence estimés</label>
                                        <input readOnly type="number" value={agencyFees || 0} className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-[10px] text-slate-500 cursor-not-allowed font-bold text-[14px]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span>3.</span> Date d'effet</h3>
                                <div className="space-y-3 max-w-sm">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Début effectif du contrat</label>
                                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-[12px] focus:ring-1 focus:ring-amber-500 outline-none font-bold text-[16px] text-slate-900 shadow-sm" />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span>4.</span> Clauses Personnalisées</h3>
                                    <button type="button" onClick={addClause} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-[8px] text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
                                        <Plus size={14}/> Ajouter clause
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {clauses.length === 0 ? (
                                        <p className="text-slate-500 text-[13px] italic py-8 text-center bg-slate-50 rounded-[16px] border border-dashed border-slate-200 font-medium">Aucune clause spéciale rattachée. Le bail utilisera le modèle standard.</p>
                                    ) : (
                                        clauses.map((clause, index) => (
                                            <div key={clause.id} className="p-6 bg-slate-50 rounded-[16px] border border-slate-200 space-y-4 relative group">
                                                <button type="button" onClick={() => removeClause(clause.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white border border-slate-200 w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors shadow-sm"><X size={14}/></button>
                                                <div className="flex flex-col gap-1.5 w-11/12">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre de la clause {index + 1}</label>
                                                    <input 
                                                        value={clause.title} 
                                                        onChange={(e) => updateClause(clause.id, 'title', e.target.value)}
                                                        className="font-bold text-[13px] text-slate-900 bg-white border border-slate-200 px-4 py-2.5 rounded-[8px] focus:ring-1 focus:ring-amber-500 outline-none" 
                                                        placeholder="Ex: Conditions Animalières" 
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contenu légal</label>
                                                    <textarea 
                                                        value={clause.content} 
                                                        onChange={(e) => updateClause(clause.id, 'content', e.target.value)}
                                                        className="font-medium text-[13px] text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-[8px] focus:ring-1 focus:ring-amber-500 outline-none min-h-[120px] resize-y leading-relaxed"
                                                        placeholder="Veuillez décrire expressément l'accord..."
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="bg-amber-50 p-6 rounded-[16px] border border-amber-200 mt-8">
                                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14}/> Mise en garde juridique
                                    </p>
                                    <p className="text-[12px] text-amber-800 font-medium mt-2 leading-relaxed">
                                        La validation de ces modifications écrasera le brouillon précédent. Toutes les clauses spéciales mentionnées ici prévaudront sur les clauses génériques du bail conforme proposé par QAPRIL. Assurez-vous de leur légalité locale.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between rounded-b-[24px] items-center">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3.5 text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-900 border border-slate-200 rounded-[10px] bg-white shadow-sm transition-all hover:-translate-x-1 flex items-center gap-2"><ArrowLeft size={14}/> Rétro</button>
                        ) : (
                            <button type="button" onClick={() => router.back()} className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-[10px] transition-all">Annuler</button>
                        )}

                        {step < 4 ? (
                            <button type="button" onClick={handleNext} className="px-8 py-3.5 bg-slate-900 text-white font-bold uppercase tracking-widest rounded-[10px] shadow-sm transform transition-all hover:-translate-y-0.5 text-[11px]">Suivant</button>
                        ) : (
                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest rounded-[10px] shadow-md disabled:opacity-50 transition-all transform flex items-center gap-2 text-[11px]"
                            >
                                {isPending ? "SAUVEGARDE EST EN COURS..." : <><Save size={14} /> VALIDER LE CONTRAT</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
