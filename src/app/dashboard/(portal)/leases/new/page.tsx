"use client"

import { useState, useEffect, useTransition, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
    FileText, 
    Home, 
    User, 
    Phone, 
    Calendar, 
    Coins, 
    ShieldCheck, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    ArrowRight, 
    ArrowLeft, 
    Building2, 
    CreditCard,
    Info,
    Check
} from "lucide-react"

import { createLease, createBDQ } from "@/actions/lease.actions"
import { getProperties } from "@/actions/property.actions"
import { searchLocataireByPhonePartial } from "@/actions/search-locataire"
import AgentBailDeclaratif from "@/components/AgentBailDeclaratif"

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
    const urlPropertyId = searchParams.get('propertyId') || ""
    const urlCandidatureId = searchParams.get('candidatureId') || ""
    const urlTenantPhone = searchParams.get('tenantPhone') || ""
    const urlTenantName = searchParams.get('tenantName') || ""
    const urlRentAmount = Number(searchParams.get('rentAmount')) || 0
    
    // Form State
    const [typeBail, setTypeBail] = useState<TypeBail>(TypeBail.ECRIT)
    const [propertyId, setPropertyId] = useState(urlPropertyId)
    const [candidatureId, setCandidatureId] = useState(urlCandidatureId)
    const [tenantPhone, setTenantPhone] = useState(urlTenantPhone)
    const [tenantName, setTenantName] = useState(urlTenantName)
    const [propertyDescription, setPropertyDescription] = useState("")
    const [rentAmount, setRentAmount] = useState<number>(urlRentAmount)
    const [chargesAmount, setChargesAmount] = useState<number>(0)
    const [depositMonths, setDepositMonths] = useState<number>(2)
    const [advanceMonths, setAdvanceMonths] = useState<number>(2)
    const [agencyFees, setAgencyFees] = useState<number>(0)
    const [paymentDayLimit, setPaymentDayLimit] = useState<number>(5)
    const [paymentMethod, setPaymentMethod] = useState<string>("WAVE")
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [isPending, startTransition] = useTransition()

    // Autocomplete state for tenant phone lookup
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    useEffect(() => {
        getProperties().then((props) => {
            setProperties(props);
            if (urlPropertyId) {
                const found = props.find((p: any) => p.id === urlPropertyId);
                if (found) {
                    setPropertyDescription(found.address || found.name || "");
                    if (!urlRentAmount && found.declaredRentFcfa) {
                        setRentAmount(found.declaredRentFcfa);
                    }
                }
            }
        }).catch(console.error)
    }, [urlPropertyId, urlRentAmount])

    useEffect(() => {
        if (rentAmount >= 0) {
            setAgencyFees(Math.round(rentAmount * 0.06))
        }
    }, [rentAmount])

    // Calculations
    const depositTotal = depositMonths * rentAmount;
    const advanceTotal = advanceMonths * rentAmount;
    const totalInitialPayable = rentAmount + depositTotal + advanceTotal + chargesAmount + agencyFees;

    const selectedProp = properties.find(p => p.id === propertyId);

    const handleNext = () => {
        setError(null)
        if (step === 1) {
            if (typeBail === TypeBail.ECRIT && !propertyId) {
                return setError("Veuillez sélectionner le logement mis en location.")
            }
            if (typeBail === TypeBail.DECLARATIF_BDQ && !propertyId && !propertyDescription.trim()) {
                return setError("Veuillez décrire le logement occupé.")
            }
            if (!tenantName.trim()) {
                return setError("Veuillez renseigner le nom complet du locataire.")
            }
            if (!tenantPhone.trim() || tenantPhone.trim().length < 8) {
                return setError("Veuillez indiquer un numéro de téléphone mobile valide pour le locataire.")
            }
            if (selectedProp?.isOccupied && selectedProp?.id !== propertyId) {
                return setError("Ce logement est actuellement marqué comme occupé.")
            }
        }
        if (step === 2) {
            if (rentAmount <= 0) {
                return setError("Veuillez indiquer un montant de loyer mensuel supérieur à zéro.")
            }
            if (depositMonths > 2) {
                return setError("La réglementation en vigueur limite le dépôt de garantie (caution) à 2 mois maximum.")
            }
            if (advanceMonths > 2) {
                return setError("L'avance sur loyer est limitée à 2 mois de loyer au maximum.")
            }
        }
        setStep(step + 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (depositMonths > 2) return setError("La caution ne peut excéder 2 mois de loyer.")
        if (advanceMonths > 2) return setError("L'avance ne peut excéder 2 mois de loyer.")

        const data = {
            propertyId,
            candidatureId: candidatureId || undefined,
            leaseType: 'residential' as const,
            typeBail,
            tenantPhone,
            tenantName,
            startDate: new Date(startDate),
            rentAmount,
            durationMonths: 12,
            chargesAmount,
            depositAmount: depositTotal,
            avanceLoyer: advanceTotal,
            preavisRequisMois: 3,
        }

        startTransition(async () => {
            let result
            if (typeBail === TypeBail.DECLARATIF_BDQ) {
                result = await createBDQ({
                    propertyId: propertyId || undefined,
                    nomLocataire: tenantName,
                    telephoneLocataire: tenantPhone,
                    descriptionLogement: propertyDescription || selectedProp?.address || selectedProp?.name || "Logement résidentiel",
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
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
                    <FileText size={14} className="text-orange-500" />
                    Bail de Location Sécurisé
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {typeBail === TypeBail.DECLARATIF_BDQ 
                        ? "Régularisation d'une Location Existante" 
                        : "Établir un Nouveau Contrat de Location"}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Renseignez les informations pas à pas. Tout est rédigé dans des termes simples pour garantir la sérénité du propriétaire et du locataire.
                </p>
            </div>

            {/* Stepper Indicator */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between max-w-xl mx-auto">
                    {[
                        { num: 1, label: "Logement & Locataire" },
                        { num: 2, label: "Loyers & Caution" },
                        { num: 3, label: "Dates & Confirmation" }
                    ].map((s, idx) => (
                        <div key={s.num} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => s.num < step && setStep(s.num)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 ${
                                    step === s.num 
                                        ? 'bg-[#FF8200] text-white ring-4 ring-orange-100 shadow-md' 
                                        : step > s.num 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {step > s.num ? <Check size={18} /> : s.num}
                                </div>
                                <span className={`text-[11px] font-bold text-center hidden sm:block ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < 2 && (
                                <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${step > idx + 1 ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Candidate Pre-fill Alert if applicable */}
            {candidatureId && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl text-sm flex items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                            ✓
                        </div>
                        <div>
                            <span className="font-bold uppercase tracking-wider text-xs text-emerald-700 block">Dossier Candidat Trouvé</span>
                            Contrat préparé pour <strong>{tenantName || "le locataire sélectionné"}</strong> ({tenantPhone}) suite à sa candidature sur votre annonce.
                        </div>
                    </div>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-full shrink-0">
                        Candidature Validée
                    </span>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Card Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 sm:p-10 space-y-8">
                        
                        {/* ================= STEP 1 ================= */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Type of Lease Choice */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                        Quel type de contrat souhaitez-vous mettre en place ?
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setTypeBail(TypeBail.ECRIT)}
                                            className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                                                typeBail === TypeBail.ECRIT 
                                                    ? 'border-[#FF8200] bg-orange-50/40 shadow-sm' 
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl">✍️</span>
                                                {typeBail === TypeBail.ECRIT && (
                                                    <span className="bg-[#FF8200] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Sélectionné</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base mb-1">Nouveau Contrat Écrit</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Pour un nouveau locataire qui emménage. Un contrat officiel complet sera généré et téléchargeable pour signature.
                                            </p>
                                        </button>

                                        <button 
                                            type="button" 
                                            onClick={() => setTypeBail(TypeBail.DECLARATIF_BDQ)}
                                            className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                                                typeBail === TypeBail.DECLARATIF_BDQ 
                                                    ? 'border-[#FF8200] bg-orange-50/40 shadow-sm' 
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl">🤝</span>
                                                {typeBail === TypeBail.DECLARATIF_BDQ && (
                                                    <span className="bg-[#FF8200] text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Sélectionné</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-base mb-1">Régularisation d'une Location Existante</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                Pour un locataire déjà présent sur place sans contrat écrit papier. Permet d'officialiser la location et les reçus sans conflit.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* Property & Tenant Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Property */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Home size={14} className="text-[#FF8200]" />
                                            Sélectionner le logement concerné <span className="text-rose-500">*</span>
                                        </label>
                                        <select 
                                            value={propertyId} 
                                            onChange={(e) => {
                                                const id = e.target.value;
                                                setPropertyId(id);
                                                const prop = properties.find(p => p.id === id);
                                                if (prop) {
                                                    setRentAmount(prop.declaredRentFcfa || 0);
                                                    setPropertyDescription(prop.address || prop.name || "");
                                                }
                                            }}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white text-slate-900 font-medium text-sm outline-none transition-all"
                                        >
                                            <option value="">-- Choisir un logement dans votre compte --</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id} disabled={p.isOccupied && p.id !== propertyId}>
                                                    {p.propertyCode} - {p.name || p.address} ({p.commune || "Abidjan"}) {p.isOccupied ? "— [DÉJÀ LOUÉ]" : `— ${p.declaredRentFcfa?.toLocaleString()} FCFA/mois`}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedProp && (
                                            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                📍 {selectedProp.address || selectedProp.name} • {selectedProp.city || "Abidjan"}, {selectedProp.commune || ""}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tenant Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <User size={14} className="text-[#FF8200]" />
                                            Nom complet du locataire <span className="text-rose-500">*</span>
                                        </label>
                                        <input 
                                            required 
                                            type="text"
                                            value={tenantName}
                                            onChange={(e) => setTenantName(e.target.value)}
                                            placeholder="Ex: Kouamé Jean-Marc" 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white text-slate-900 font-medium text-sm outline-none transition-all" 
                                        />
                                    </div>

                                    {/* Tenant Phone with live search */}
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Phone size={14} className="text-[#FF8200]" />
                                            Numéro de téléphone mobile du locataire <span className="text-rose-500">*</span>
                                        </label>
                                        <input 
                                            required 
                                            type="tel" 
                                            value={tenantPhone}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setTenantPhone(val);
                                                if (val.length >= 3) {
                                                    searchLocataireByPhonePartial(val).then(results => {
                                                        setSuggestions(results);
                                                        setShowSuggestions(true);
                                                    });
                                                } else {
                                                    setShowSuggestions(false);
                                                }
                                            }}
                                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            placeholder="Ex: +225 07 00 00 00 00" 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white text-slate-900 font-medium text-sm outline-none transition-all" 
                                        />
                                        <p className="text-[11px] text-slate-400">
                                            Un SMS de confirmation et les reçus de paiement seront adressés à ce numéro.
                                        </p>
                                        
                                        {/* Suggestions dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul className="absolute z-20 w-full bg-white border border-slate-200 mt-1 rounded-2xl shadow-xl max-h-56 overflow-y-auto">
                                                {suggestions.map((s, idx) => (
                                                    <li 
                                                        key={idx}
                                                        className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                                        onClick={() => {
                                                            setTenantPhone(s.phone);
                                                            if (s.fullName && s.fullName !== "Locataire Inconnu") {
                                                                setTenantName(s.fullName);
                                                            }
                                                            setShowSuggestions(false);
                                                        }}
                                                    >
                                                        <div className="font-bold text-slate-800 text-sm">{s.fullName}</div>
                                                        <div className="text-xs font-bold text-[#FF8200]">{s.phone}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Description if regularizing without predefined property */}
                                    {typeBail === TypeBail.DECLARATIF_BDQ && !propertyId && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-bold text-slate-700">
                                                Description concise du logement occupé <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea 
                                                required 
                                                value={propertyDescription}
                                                onChange={(e) => setPropertyDescription(e.target.value)}
                                                placeholder="Ex: Appartement 3 pièces au 2ème étage, Résidence Les Oliviers, Angré 8ème Tranche" 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white text-slate-900 font-medium text-sm outline-none h-24 resize-none transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 2 ================= */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900">Montants & Conditions Financières</h3>
                                    <p className="text-xs text-slate-500">
                                        Les montants sont automatiquement plafonnés conformément à la loi pour protéger les deux parties.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Rent */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                            <span>Loyer mensuel principal (FCFA) <span className="text-rose-500">*</span></span>
                                            <span className="text-[11px] font-normal text-slate-400">Montant payé chaque mois</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                required 
                                                type="number" 
                                                min="1"
                                                value={rentAmount || ''} 
                                                onChange={(e) => setRentAmount(parseInt(e.target.value) || 0)} 
                                                placeholder="Ex: 250000"
                                                className="w-full px-5 py-4 bg-orange-50/20 border border-orange-200 rounded-2xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-[#FF8200] outline-none" 
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">FCFA / mois</span>
                                        </div>
                                    </div>

                                    {/* Charges */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 block">
                                            Charges mensuelles communes (FCFA)
                                        </label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={chargesAmount || ''} 
                                            onChange={(e) => setChargesAmount(parseInt(e.target.value) || 0)} 
                                            placeholder="0 (eau des communs, gardiennage...)"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base outline-none focus:ring-2 focus:ring-[#FF8200]" 
                                        />
                                        <p className="text-[11px] text-slate-400">Optionnel (laisser 0 si les charges sont incluses dans le loyer).</p>
                                    </div>

                                    {/* Dépôt de garantie / Caution */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                            <span>Dépôt de garantie (Caution)</span>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Max 2 mois</span>
                                        </label>
                                        <select 
                                            value={depositMonths} 
                                            onChange={(e) => setDepositMonths(parseInt(e.target.value) || 0)} 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base outline-none focus:ring-2 focus:ring-[#FF8200]"
                                        >
                                            <option value={1}>1 mois de caution ({rentAmount.toLocaleString()} FCFA)</option>
                                            <option value={2}>2 mois de caution ({(2 * rentAmount).toLocaleString()} FCFA)</option>
                                        </select>
                                        <p className="text-[11px] text-slate-500">
                                            Somme conservée en garantie et restituée au locataire lors de sa sortie s'il n'y a pas de dégâts.
                                        </p>
                                    </div>

                                    {/* Avance sur loyer */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                            <span>Avance sur loyer</span>
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Max 2 mois</span>
                                        </label>
                                        <select 
                                            value={advanceMonths} 
                                            onChange={(e) => setAdvanceMonths(parseInt(e.target.value) || 0)} 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base outline-none focus:ring-2 focus:ring-[#FF8200]"
                                        >
                                            <option value={1}>1 mois d'avance ({rentAmount.toLocaleString()} FCFA)</option>
                                            <option value={2}>2 mois d'avance ({(2 * rentAmount).toLocaleString()} FCFA)</option>
                                        </select>
                                        <p className="text-[11px] text-slate-500">
                                            Paiement anticipé couvrant les tout premiers mois d'occupation du locataire.
                                        </p>
                                    </div>

                                    {/* Frais de gestion / agence */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 block">
                                            Frais de dossier ou d'agence
                                        </label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={agencyFees || 0} 
                                            onChange={(e) => setAgencyFees(parseInt(e.target.value) || 0)}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base outline-none focus:ring-2 focus:ring-[#FF8200]" 
                                        />
                                        <p className="text-[11px] text-slate-400">Par défaut équivalent à 6% du montant du loyer.</p>
                                    </div>
                                </div>

                                {/* TOTAL INITIAL BREAKDOWN CARD */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Coins className="text-[#FF8200]" size={20} />
                                            <span className="font-bold text-sm tracking-wide">Calculateur du Versement Initial</span>
                                        </div>
                                        <span className="text-xs text-slate-400">À régler à la remise des clés</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
                                        <div className="space-y-1">
                                            <span className="text-slate-400">Caution ({depositMonths} mois)</span>
                                            <p className="text-sm font-bold text-white">{depositTotal.toLocaleString()} FCFA</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-slate-400">Avance ({advanceMonths} mois)</span>
                                            <p className="text-sm font-bold text-white">{advanceTotal.toLocaleString()} FCFA</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-slate-400">Charges du 1er mois</span>
                                            <p className="text-sm font-bold text-white">{chargesAmount.toLocaleString()} FCFA</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-slate-400">Frais de dossier</span>
                                            <p className="text-sm font-bold text-white">{agencyFees.toLocaleString()} FCFA</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-700/60 pt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Initial Estimé</p>
                                            <p className="text-[11px] text-slate-400">Caution + Avance + Charges + Frais</p>
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-black text-[#FF8200]">
                                            {totalInitialPayable.toLocaleString()} <span className="text-sm text-white font-normal">FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= STEP 3 ================= */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900">Dates & Modalités de Paiement</h3>
                                    <p className="text-xs text-slate-500">
                                        Fixez la date de prise d'effet et les facilités de paiement convenues avec votre locataire.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Start Date */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <Calendar size={14} className="text-[#FF8200]" />
                                            Date d'effet / Date d'entrée dans les lieux <span className="text-rose-500">*</span>
                                        </label>
                                        <input 
                                            required 
                                            type="date" 
                                            value={startDate} 
                                            onChange={(e) => setStartDate(e.target.value)} 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] text-slate-900 font-medium text-sm outline-none" 
                                        />
                                        <p className="text-[11px] text-slate-400">Date à laquelle le locataire prend possession des lieux.</p>
                                    </div>

                                    {/* Payment Day Limit */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <ClockIcon size={14} className="text-[#FF8200]" />
                                            Jour limite de paiement chaque mois
                                        </label>
                                        <select 
                                            value={paymentDayLimit} 
                                            onChange={(e) => setPaymentDayLimit(parseInt(e.target.value) || 5)} 
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#FF8200] text-slate-900 font-medium text-sm outline-none"
                                        >
                                            <option value={1}>Au plus tard le 1er du mois</option>
                                            <option value={5}>Au plus tard le 5 du mois (Recommandé)</option>
                                            <option value={10}>Au plus tard le 10 du mois</option>
                                        </select>
                                        <p className="text-[11px] text-slate-400">Les rappels automatiques et reçus seront synchronisés sur ce calendrier.</p>
                                    </div>

                                    {/* Preferred Payment Method */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                            <CreditCard size={14} className="text-[#FF8200]" />
                                            Moyen de paiement préconisé
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { id: "WAVE", label: "Wave Mobile Money", icon: "🌊" },
                                                { id: "ORANGE_MONEY", label: "Orange Money", icon: "🍊" },
                                                { id: "MTN_MOMO", label: "MTN MoMo", icon: "🟡" },
                                                { id: "VIREMENT_BANCAIRE", label: "Virement Bancaire", icon: "🏛️" }
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(m.id)}
                                                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                                        paymentMethod === m.id
                                                            ? 'border-[#FF8200] bg-orange-50 font-bold text-slate-900'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-lg">{m.icon}</span>
                                                    <span className="text-xs font-bold leading-tight">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Reassuring Summary Notice */}
                                <div className="bg-orange-50/70 border border-orange-200/80 p-5 rounded-2xl flex items-start gap-3">
                                    <ShieldCheck className="text-orange-600 shrink-0 mt-0.5" size={20} />
                                    <div className="text-xs text-orange-950 leading-relaxed space-y-1">
                                        <p className="font-bold text-sm text-orange-900">
                                            {typeBail === TypeBail.DECLARATIF_BDQ 
                                                ? "Procédure d'enregistrement en douceur"
                                                : "Génération et sécurisation immédiates"}
                                        </p>
                                        <p>
                                            {typeBail === TypeBail.DECLARATIF_BDQ 
                                                ? "Un message SMS courtois sera envoyé à votre locataire pour lui notifier l'enregistrement de son bail avec son reçu de paiement mensuel."
                                                : "Votre contrat de bail sera immédiatement prêt dans votre tableau de bord. Vous pourrez le faire signer électroniquement par SMS/WhatsApp ou l'imprimer au format papier."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        {step > 1 ? (
                            <button 
                                type="button" 
                                onClick={() => setStep(step - 1)} 
                                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={16} /> Étape précédente
                            </button>
                        ) : (
                            <button 
                                type="button" 
                                onClick={() => router.back()} 
                                className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                        )}

                        {step < 3 ? (
                            <button 
                                type="button" 
                                onClick={handleNext} 
                                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                            >
                                Étape suivante <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button 
                                type="submit" 
                                disabled={isPending} 
                                className="px-10 py-3.5 bg-[#FF8200] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>Enregistrement en cours...</>
                                ) : typeBail === TypeBail.DECLARATIF_BDQ ? (
                                    <>Valider l'enregistrement <CheckCircle2 size={16} /></>
                                ) : (
                                    <>Créer et Valider le Bail <CheckCircle2 size={16} /></>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

function ClockIcon({ size = 14, className = "" }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

export default function LeaseRegistrationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div></div>}>
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
        return (
            <div>
                <div className="max-w-4xl mx-auto pt-6 px-4">
                    <button 
                        onClick={() => setMode("choix")} 
                        className="text-slate-400 hover:text-slate-700 flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] transition-colors"
                    >
                        <ArrowLeft size={14} /> Revenir au choix du mode
                    </button>
                </div>
                <LeaseRegistrationForm />
            </div>
        )
    }

    return (
        <div className="p-4 max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} className="text-blue-600" />
                    Mise en Location Facile
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Comment préférez-vous enregistrer votre bail ?
                </h1>
                <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                    Deux méthodes rapides et intuitives s'offrent à vous pour déclarer ou créer le contrat de votre locataire.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Mode IA — Assistant conversationnel */}
                <div
                    onClick={() => setMode("agent")}
                    className="bg-gradient-to-br from-[#1B3A6B] to-[#0F2344] rounded-3xl p-8 cursor-pointer active:scale-[0.99] hover:shadow-2xl hover:shadow-blue-900/30 transition-all border border-blue-800/50 flex flex-col justify-between group"
                >
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            🤖
                        </div>
                        <div className="text-white font-black text-xl mb-2">
                            Guidé par l'Assistant IA
                        </div>
                        <p className="text-blue-200 text-xs leading-relaxed font-normal">
                            L'assistant vous pose quelques questions en français courant, une par une. Vous répondez simplement au fur et à mesure.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <span className="bg-[#FF8200] text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm">
                            Recommandé • 2 min
                        </span>
                        <span className="text-white text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Démarrer <ArrowRight size={14} />
                        </span>
                    </div>
                </div>

                {/* Mode formulaire classique */}
                <div
                    onClick={() => setMode("formulaire")}
                    className="bg-white border-2 border-slate-200 rounded-3xl p-8 cursor-pointer active:scale-[0.99] hover:border-orange-500 hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            📋
                        </div>
                        <div className="text-slate-900 font-black text-xl mb-2">
                            Formulaire Pas à Pas
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed font-normal">
                            Remplissez vous-même les détails du logement, du locataire et des montants grâce à un formulaire clair et interactif.
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-full">
                            3 étapes simples
                        </span>
                        <span className="text-slate-800 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Ouvrir le formulaire <ArrowRight size={14} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
