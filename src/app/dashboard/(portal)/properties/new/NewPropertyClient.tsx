"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
    Building2, 
    Home, 
    DoorOpen, 
    MapPin, 
    Upload, 
    X, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Info, 
    Sparkles, 
    Calculator,
    Zap, 
    Droplets, 
    Car, 
    Shield, 
    Wifi, 
    Snowflake, 
    ArrowLeft, 
    Layers,
    FileText,
    Check
} from "lucide-react"
import { creerBien, getMyParentStructures, TypeStructure } from "@/actions/property.actions"

interface CustomUnitItem {
    id: string
    label: string
    type: string
    rent: number
    area?: number
    rooms?: number
}

const COMMON_AMENITIES = [
    { id: "cie_prepaid", label: "Compteur électricité à carte (CIE Prépayé)", icon: Zap },
    { id: "cie_postpaid", label: "Compteur électricité avec facture (CIE Classique)", icon: Zap },
    { id: "sodeci_indiv", label: "Compteur d'eau individuel (SODECI)", icon: Droplets },
    { id: "clim", label: "Climatisation installée", icon: Snowflake },
    { id: "parking", label: "Place de parking sécurisée", icon: Car },
    { id: "gardien", label: "Gardiennage ou vigile 24h/24", icon: Shield },
    { id: "fibre", label: "Prêt pour la Fibre Optique Internet", icon: Wifi },
]

export default function NewPropertyClient() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    
    // Architecture du bien
    const [structureCategory, setStructureCategory] = useState<'INDEPENDANT' | 'PARENT' | 'ENFANT'>('INDEPENDANT')
    
    // Pour Immeuble / Bloc : Gestion des unités personnalisées
    const [customUnits, setCustomUnits] = useState<CustomUnitItem[]>([
        { id: "u-1", label: "Apt 1 - RDC", type: "APARTMENT", rent: 150000, area: 65, rooms: 3 },
        { id: "u-2", label: "Apt 2 - RDC", type: "APARTMENT", rent: 150000, area: 65, rooms: 3 },
        { id: "u-3", label: "Apt 3 - 1er Étage", type: "APARTMENT", rent: 180000, area: 85, rooms: 4 },
        { id: "u-4", label: "Studio 1 - 1er Étage", type: "STUDIO", rent: 90000, area: 30, rooms: 1 }
    ])

    // Générateur rapide pour Immeuble
    const [quickCount, setQuickCount] = useState<number>(4)
    const [quickDefaultRent, setQuickDefaultRent] = useState<number>(150000)

    // Équipements sélectionnés
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
        "cie_prepaid",
        "sodeci_indiv"
    ])
    
    // Parent Data (pour bien enfant)
    const [parents, setParents] = useState<any[]>([])
    const [selectedParentId, setSelectedParentId] = useState<string>("")
    const [isLoadingParents, setIsLoadingParents] = useState(false)

    // Image Upload State
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (images.length + files.length > 5) {
            setError("Vous pouvez ajouter jusqu'à 5 photos au maximum.")
            return
        }

        const newImages = [...images, ...files]
        setImages(newImages)

        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPreviews([...previews, ...newPreviews])
        setError("")
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        setImages(newImages)

        const newPreviews = [...previews]
        URL.revokeObjectURL(newPreviews[index])
        newPreviews.splice(index, 1)
        setPreviews(newPreviews)
    }

    const toggleAmenity = (id: string) => {
        setSelectedAmenities(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    // Gestion des unités de l'immeuble
    const handleAddUnit = () => {
        const nextNum = customUnits.length + 1
        const newUnit: CustomUnitItem = {
            id: `u-${Date.now()}-${nextNum}`,
            label: `Apt ${nextNum}`,
            type: "APARTMENT",
            rent: customUnits[customUnits.length - 1]?.rent || 150000,
            area: 60,
            rooms: 3
        }
        setCustomUnits([...customUnits, newUnit])
    }

    const handleRemoveUnit = (id: string) => {
        if (customUnits.length <= 1) {
            setError("Un immeuble doit comporter au moins un logement ou local.")
            return
        }
        setCustomUnits(customUnits.filter(u => u.id !== id))
    }

    const handleUpdateUnit = (id: string, field: keyof CustomUnitItem, value: any) => {
        setCustomUnits(customUnits.map(u => {
            if (u.id === id) {
                return { ...u, [field]: value }
            }
            return u
        }))
    }

    const handleApplyQuickGenerator = () => {
        if (quickCount < 1) return
        const generated: CustomUnitItem[] = []
        for (let i = 1; i <= quickCount; i++) {
            generated.push({
                id: `u-gen-${i}-${Date.now()}`,
                label: `Apt ${i}`,
                type: "APARTMENT",
                rent: quickDefaultRent,
                area: 65,
                rooms: 3
            })
        }
        setCustomUnits(generated)
    }

    const handleApplyRentToAll = (rentToApply: number) => {
        setCustomUnits(customUnits.map(u => ({ ...u, rent: rentToApply })))
    }

    // Total des loyers de l'immeuble
    const totalBuildingRent = customUnits.reduce((sum, u) => sum + (Number(u.rent) || 0), 0)

    useEffect(() => {
        if (structureCategory === 'ENFANT') {
            setIsLoadingParents(true)
            getMyParentStructures().then(data => {
                setParents(data)
                setIsLoadingParents(false)
            }).catch(() => setIsLoadingParents(false))
        }
    }, [structureCategory])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        const formElement = e.currentTarget
        const formData = new FormData(formElement)

        // Images
        images.forEach(img => formData.append("images", img))

        // Équipements cochés
        selectedAmenities.forEach(am => formData.append("amenities", am))

        // Configuration de la hiérarchie
        if (structureCategory === 'PARENT') {
            formData.append("typeStructure", (formData.get("parentType") as string) || "IMMEUBLE")
            // Joindre les unités détaillées avec loyers distincts
            formData.append("customUnits", JSON.stringify(customUnits))
            formData.append("nbUnits", customUnits.length.toString())
            formData.append("rent", totalBuildingRent.toString())
        } else {
            formData.append("typeStructure", "INDEPENDANT")
        }

        startTransition(async () => {
            const result: any = await creerBien(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                router.push("/dashboard/properties")
                router.refresh()
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            {/* Header & Retour */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/70 pb-6">
                <div>
                    <button 
                        type="button"
                        onClick={() => router.back()} 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider mb-2"
                    >
                        <ArrowLeft size={14} /> Retour à la liste
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Enregistrer un Nouveau Bien
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Formulaire guidé et détaillé pour intégrer votre logement ou votre immeuble dans votre patrimoine certifié QAPRIL.
                    </p>
                </div>
            </div>

            {/* Formulaire Principal */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium shadow-xs flex items-center justify-between">
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-red-700">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* ÉTAPE 1 : Architecture du Bien */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                1
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Type d'ensemble immobilier</h2>
                                <p className="text-xs text-slate-500">Choisissez la structure qui correspond exactement à ce que vous souhaitez gérer.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Option 1: Indépendant */}
                        <button 
                            type="button" 
                            onClick={() => setStructureCategory('INDEPENDANT')} 
                            className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                structureCategory === 'INDEPENDANT' 
                                    ? 'border-[#FF8200] bg-orange-50/40 ring-4 ring-orange-100 shadow-sm' 
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            {structureCategory === 'INDEPENDANT' && (
                                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF8200] text-white flex items-center justify-center">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            )}
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF8200] flex items-center justify-center mb-3">
                                    <Home size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Maison ou Villa Seule</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Villa basse, duplex, ou studio autonome loué à un seul locataire ou foyer.
                                </p>
                            </div>
                            <span className="text-[10px] font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md mt-4 w-fit">
                                1 seul logement
                            </span>
                        </button>

                        {/* Option 2: Immeuble (Parent) */}
                        <button 
                            type="button" 
                            onClick={() => setStructureCategory('PARENT')} 
                            className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                structureCategory === 'PARENT' 
                                    ? 'border-sky-500 bg-sky-50/40 ring-4 ring-sky-100 shadow-sm' 
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            {structureCategory === 'PARENT' && (
                                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            )}
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                                    <Building2 size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">🏢 Immeuble & Bloc Résidentiel</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Bâtiment complet, cour commune ou résidence regroupant plusieurs appartements ou locaux.
                                </p>
                            </div>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md mt-4 w-fit">
                                Plusieurs loyers modulables
                            </span>
                        </button>

                        {/* Option 3: Porte / Unité enfant */}
                        <button 
                            type="button" 
                            onClick={() => setStructureCategory('ENFANT')} 
                            className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                structureCategory === 'ENFANT' 
                                    ? 'border-emerald-500 bg-emerald-50/40 ring-4 ring-emerald-100 shadow-sm' 
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                            {structureCategory === 'ENFANT' && (
                                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            )}
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                                    <DoorOpen size={22} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">Appartement dans un Immeuble</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Ajouter une porte ou un local au sein d'un immeuble déjà enregistré auparavant.
                                </p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md mt-4 w-fit">
                                Rattaché à un immeuble existant
                            </span>
                        </button>
                    </div>
                </div>

                {/* ÉTAPE 2 : Informations Générales & Désignation */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                            2
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {structureCategory === 'PARENT' ? "Identité de l'Immeuble" : "Identité du Logement"}
                            </h2>
                            <p className="text-xs text-slate-500">Donnez un nom clair et reconnaissable pour faciliter vos suivis de loyers.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Immeuble spécifique : Type d'immeuble et Nom */}
                        {structureCategory === 'PARENT' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Forme de l'ensemble
                                    </label>
                                    <select 
                                        required 
                                        name="parentType" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none text-sm font-medium text-slate-800"
                                    >
                                        <option value="IMMEUBLE">🏢 Immeuble à étages (R+1, R+2, R+3, R+4...)</option>
                                        <option value="RESIDENCE">🏘️ Cité résidentielle clôturée (Résidence)</option>
                                        <option value="COUR_COMMUNE">🚪 Cour commune / Concession familiale</option>
                                    </select>
                                    <p className="text-[11px] text-slate-400 mt-1">Sélectionnez la configuration physique de votre propriété.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Nom du bâtiment <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        required 
                                        name="name" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400" 
                                        placeholder="Ex: Résidence Les Palmiers, Immeuble Victoire..." 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Ce nom sera mentionné sur toutes les quittances et contrats de vos locataires.</p>
                                </div>
                            </>
                        )}

                        {/* Bien Indépendant */}
                        {structureCategory === 'INDEPENDANT' && (
                            <>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Nom ou Désignation usuelle du bien (Optionnel)
                                    </label>
                                    <input 
                                        name="name" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400" 
                                        placeholder="Ex: Villa Duplex Rose - Angré, Studio Meublé Palmier..." 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Un nom évocateur pour identifier rapidement votre maison dans votre tableau de bord.</p>
                                </div>
                            </>
                        )}

                        {/* Bien Enfant rattaché */}
                        {structureCategory === 'ENFANT' && (
                            <>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Immeuble ou structure de rattachement <span className="text-red-500">*</span>
                                    </label>
                                    {isLoadingParents ? (
                                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                                            Recherche de vos immeubles enregistrés...
                                        </div>
                                    ) : parents.length === 0 ? (
                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                                            Vous n'avez pas encore d'immeuble enregistré. Choisissez l'option <strong>« 🏢 Immeuble & Bloc Résidentiel »</strong> ci-dessus pour créer votre premier immeuble.
                                        </div>
                                    ) : (
                                        <select 
                                            required 
                                            name="parentPropertyId" 
                                            value={selectedParentId}
                                            onChange={(e) => setSelectedParentId(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm font-semibold text-slate-800"
                                        >
                                            <option value="">-- Choisissez l'immeuble auquel appartient ce logement --</option>
                                            {parents.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.commune} - {p.address})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Numéro de porte ou désignation du logement <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        required 
                                        name="unitLabel" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400" 
                                        placeholder="Ex: Appartement 3B, Studio 2ème Gauche, Porte 4..." 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Identifie précisément la porte au sein du bâtiment.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ÉTAPE SPÉCIFIQUE IMMEUBLE : GRILLE DES LOGEMENTS AVEC LOYERS DISTINCTS */}
                {structureCategory === 'PARENT' && (
                    <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-md p-6 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-5">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-black uppercase tracking-wider mb-2">
                                    🏢 Détail des appartements & loyers
                                </div>
                                <h3 className="text-xl font-black text-slate-900">
                                    Personnalisation de chaque appartement
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Chaque logement de votre immeuble peut avoir un <strong>montant de loyer différent</strong>, une superficie et un type distincts.
                                </p>
                            </div>

                            {/* Résumé KPI en direct */}
                            <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center gap-6">
                                <div>
                                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Logements</span>
                                    <span className="text-lg font-black text-slate-900">{customUnits.length}</span>
                                </div>
                                <div className="border-l border-sky-200 pl-4">
                                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Revenu total mensuel</span>
                                    <span className="text-lg font-black text-sky-700">
                                        {totalBuildingRent.toLocaleString("fr-FR")} <span className="text-xs font-bold text-sky-600">FCFA</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Outil de génération rapide */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={16} className="text-amber-500" />
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Générateur rapide (Optionnel pour gagner du temps)
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre d'appartements</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="50"
                                        value={quickCount} 
                                        onChange={(e) => setQuickCount(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loyer de base indicatif (FCFA)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        step="5000"
                                        value={quickDefaultRent} 
                                        onChange={(e) => setQuickDefaultRent(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800" 
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button 
                                        type="button" 
                                        onClick={handleApplyQuickGenerator}
                                        className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                                    >
                                        <Calculator size={14} /> Pré-générer les {quickCount} unités
                                    </button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2">
                                💡 Vous pourrez ensuite modifier individuellement le montant de loyer ou le nom de chaque appartement dans le tableau ci-dessous.
                            </p>
                        </div>

                        {/* Liste interactive des logements */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Inventaire des appartements ({customUnits.length})
                                </span>
                                <button 
                                    type="button"
                                    onClick={handleAddUnit}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-bold transition-colors"
                                >
                                    <Plus size={14} /> Ajouter un appartement ou local
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                                {customUnits.map((unit, index) => (
                                    <div key={unit.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row items-start md:items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs flex-shrink-0">
                                            #{index + 1}
                                        </div>

                                        {/* Nom / Porte */}
                                        <div className="flex-1 w-full">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Désignation du logement
                                            </label>
                                            <input 
                                                type="text" 
                                                value={unit.label}
                                                onChange={(e) => handleUpdateUnit(unit.id, 'label', e.target.value)}
                                                placeholder={`Apt ${index + 1}`}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
                                            />
                                        </div>

                                        {/* Type de bien */}
                                        <div className="w-full md:w-44">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Type de bien
                                            </label>
                                            <select 
                                                value={unit.type}
                                                onChange={(e) => handleUpdateUnit(unit.id, 'type', e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
                                            >
                                                <option value="APARTMENT">Appartement (2 à 4 pièces)</option>
                                                <option value="STUDIO">Studio (1 pièce)</option>
                                                <option value="ROOM">Chambre individuelle</option>
                                                <option value="COMMERCE">Boutique / Commerce</option>
                                                <option value="OFFICE">Bureau / Professionnel</option>
                                            </select>
                                        </div>

                                        {/* Loyer spécifique (FCFA) */}
                                        <div className="w-full md:w-44">
                                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                                                <span>Loyer mensuel</span>
                                                <span className="text-[9px] text-sky-600 font-bold">FCFA</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="1000"
                                                value={unit.rent}
                                                onChange={(e) => handleUpdateUnit(unit.id, 'rent', parseInt(e.target.value) || 0)}
                                                placeholder="150000"
                                                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-lg text-xs font-black text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                                            />
                                        </div>

                                        {/* Superficie (m²) */}
                                        <div className="w-full md:w-28">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Surface (m²)
                                            </label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="1"
                                                value={unit.area || ""}
                                                onChange={(e) => handleUpdateUnit(unit.id, 'area', parseFloat(e.target.value) || undefined)}
                                                placeholder="Ex: 65"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
                                            />
                                        </div>

                                        {/* Supprimer */}
                                        <div className="pt-2 md:pt-4 flex-shrink-0 self-end md:self-center">
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveUnit(unit.id)}
                                                title="Supprimer cette unité"
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={handleAddUnit}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                >
                                    <Plus size={14} /> Ajouter un autre appartement ou local
                                </button>

                                {customUnits.length > 1 && (
                                    <button 
                                        type="button"
                                        onClick={() => handleApplyRentToAll(customUnits[0].rent)}
                                        className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4"
                                    >
                                        Harmoniser tous les loyers à {customUnits[0].rent.toLocaleString("fr-FR")} FCFA
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3 : Localisation & Adresse (Explications claires) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                            3
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Localisation & Adresse Précise</h2>
                            <p className="text-xs text-slate-500">
                                Permet aux locataires et aux techniciens de repérer facilement le bien.
                            </p>
                        </div>
                    </div>

                    {structureCategory !== 'ENFANT' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Commune ou Ville <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    required 
                                    name="commune" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-semibold text-slate-800"
                                >
                                    <optgroup label="District d'Abidjan">
                                        <option value="Cocody">Cocody (Angré, Riviera, Deux-Plateaux, Danga...)</option>
                                        <option value="Plateau">Plateau (Centre des affaires)</option>
                                        <option value="Marcory">Marcory (Zone 4, Biétry, Résidentiel...)</option>
                                        <option value="Treichville">Treichville</option>
                                        <option value="Yopougon">Yopougon (Niangon, Maroc, Bel Air...)</option>
                                        <option value="Abobo">Abobo (Samaké, Avocatier, Clouetcha...)</option>
                                        <option value="Koumassi">Koumassi (Remblais, Prodomo...)</option>
                                        <option value="Adjamé">Adjamé</option>
                                        <option value="Attécoubé">Attécoubé</option>
                                        <option value="Port-Bouët">Port-Bouët (Vridi, Aéroport...)</option>
                                        <option value="Bingerville">Bingerville</option>
                                        <option value="Songon">Songon</option>
                                        <option value="Anyama">Anyama</option>
                                    </optgroup>
                                    <optgroup label="Autres Villes">
                                        <option value="Grand-Bassam">Grand-Bassam</option>
                                        <option value="Yamoussoukro">Yamoussoukro</option>
                                        <option value="Bouaké">Bouaké</option>
                                        <option value="San Pedro">San Pedro</option>
                                        <option value="Autre">Autre localité...</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Quartier & Repère géographique <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    required 
                                    name="addressLine1" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                                    placeholder="Ex: Angré 8ème Tranche, près de la pharmacie du Soleil" 
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Indiquez un repère connu (pharmacie, carrefour, école, supermarché).
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                                    <span>Numéro de Lot / Îlot ou Référence Cadastrale (Recommandé)</span>
                                    <span className="text-[10px] font-normal text-slate-400">Optionnel</span>
                                </label>
                                <input 
                                    name="referenceCadastre" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                                    placeholder="Ex: Lot 145, Îlot 12, ou Titre Foncier N° 54321..." 
                                />
                                <div className="flex items-start gap-2 mt-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-800 text-xs leading-relaxed">
                                    <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Pourquoi cette référence ?</strong> Ce numéro figure sur votre ACD (Arrêté de Concession Définitive), certificat de mutation ou attestation d'attribution. Il permet d'authentifier officiellement votre bien et d'éviter les litiges.
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Localisation héritée de l'immeuble parent
                        selectedParentId && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                                <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <MapPin size={16} className="text-emerald-600" />
                                    Adresse héritée automatiquement de l'immeuble
                                </p>
                                {(() => {
                                    const p = parents.find(x => x.id === selectedParentId)
                                    return (
                                        <div className="text-sm text-slate-800 space-y-1">
                                            <p className="font-bold">{p?.name || 'Immeuble'}</p>
                                            <p className="text-slate-600">{p?.address}, {p?.commune}</p>
                                            <input type="hidden" name="addressLine1" value={p?.address || ''} />
                                            <input type="hidden" name="commune" value={p?.commune || ''} />
                                        </div>
                                    )
                                })()}
                            </div>
                        )
                    )}
                </div>

                {/* ÉTAPE 4 : Caractéristiques & Loyer (Pour bien indépendant ou appartement seul) */}
                {structureCategory !== 'PARENT' && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                4
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Loyer & Caractéristiques du Logement</h2>
                                <p className="text-xs text-slate-500">Précisez le loyer mensuel et les dimensions du bien.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Loyer mensuel */}
                            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200">
                                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                                    Loyer mensuel hors charges <span className="text-red-500">*</span>
                                </label>
                                <div className="relative mt-2">
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        step="5000"
                                        name="rent" 
                                        placeholder="Ex: 250000" 
                                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-[#FF8200] outline-none text-base font-black text-slate-900 placeholder:text-slate-400" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                                        FCFA / mois
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Montant net perçu chaque mois par le propriétaire pour la jouissance du logement.
                                </p>
                            </div>

                            {/* Type de bien */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Type de logement
                                </label>
                                <select 
                                    name="propertyType" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-semibold text-slate-800"
                                >
                                    <option value="VILLA">Villa / Maison basse indépendante</option>
                                    <option value="APARTMENT">Appartement (2 à 5 pièces)</option>
                                    <option value="STUDIO">Studio indépendant</option>
                                    <option value="ROOM">Chambre autonome / Porte</option>
                                    <option value="COMMERCE">Local commercial / Boutique</option>
                                    <option value="OFFICE">Bureaux / Espace professionnel</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">Définit la nature de l'espace.</p>
                            </div>

                            {/* Superficie */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Superficie estimée (m²)
                                </label>
                                <input 
                                    type="number" 
                                    name="area" 
                                    step="0.5" 
                                    min="5"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400" 
                                    placeholder="Ex: 85" 
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Repères : Studio ~25-35 m² · 3 pièces ~70-95 m² · Villa ~150-300 m².</p>
                            </div>

                            {/* Nombre de pièces */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Nombre total de pièces
                                </label>
                                <input 
                                    type="number" 
                                    name="rooms" 
                                    min="1"
                                    defaultValue="3"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none text-sm font-semibold text-slate-800" 
                                />
                                <p className="text-[11px] text-slate-400 mt-1">Exemple : Un salon + 2 chambres = 3 pièces.</p>
                            </div>
                        </div>

                        {/* Équipements cochables */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Équipements et commodités inclus
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {COMMON_AMENITIES.map(amenity => {
                                    const IconComponent = amenity.icon
                                    const isSelected = selectedAmenities.includes(amenity.id)
                                    return (
                                        <button
                                            key={amenity.id}
                                            type="button"
                                            onClick={() => toggleAmenity(amenity.id)}
                                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                                                isSelected 
                                                    ? 'border-orange-500 bg-orange-50/50 text-slate-900 font-semibold shadow-xs' 
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                                            }`}
                                        >
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                isSelected ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <IconComponent size={14} />
                                            </span>
                                            <span className="text-xs leading-snug flex-1">{amenity.label}</span>
                                            {isSelected && <Check size={14} className="text-orange-600 flex-shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 5 : Photos & Galerie du Bien (Avec prévisualisation immédiate et guide didactic) */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                                5
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Photos du Bien</h2>
                                <p className="text-xs text-slate-500">
                                    Ajoutez jusqu'à 5 photos nettes pour valoriser le logement ou la façade de l'immeuble.
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            {images.length} / 5 photos
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                                <img 
                                    src={preview} 
                                    alt={`Aperçu ${index + 1}`} 
                                    className="w-full h-full object-cover" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(index)}
                                    title="Supprimer cette photo"
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-90 hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                {index === 0 && (
                                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider py-1 text-center">
                                        Photo principale
                                    </div>
                                )}
                            </div>
                        ))}

                        {images.length < 5 && (
                            <label className="aspect-square border-2 border-dashed border-slate-300 hover:border-[#FF8200] hover:bg-orange-50/30 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-slate-400 hover:text-[#FF8200] group p-3 text-center">
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg, image/webp" 
                                    multiple 
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 transition-colors">
                                    <Upload size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 group-hover:text-orange-700">
                                    Ajouter une photo
                                </span>
                                <span className="text-[9px] text-slate-400">JPG, PNG, WEBP</span>
                            </label>
                        )}
                    </div>

                    <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Astuce photo pour louer plus rapidement :</strong> Prenez des photos de jour, bien éclairées, montrant la façade extérieure, le salon principal, la cuisine et la salle d'eau. La première photo servira de couverture principale.
                            {structureCategory === 'PARENT' && (
                                <span className="block mt-1 font-semibold text-sky-800">
                                    🏢 Pour un immeuble, la photo principale sera automatiquement associée à tous les appartements créés pour enrichir votre portefeuille.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bouton de Soumission */}
                <div className="pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={isPending || (structureCategory === 'ENFANT' && parents.length === 0)}
                        className={`w-full py-4 px-6 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                            structureCategory === 'PARENT' 
                                ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' 
                                : structureCategory === 'ENFANT' 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                : 'bg-[#FF8200] hover:bg-orange-600 shadow-orange-200'
                        } disabled:opacity-50 disabled:hover:translate-y-0`}
                    >
                        {isPending ? (
                            <>Génération de la certification spatiale et enregistrement en cours...</>
                        ) : structureCategory === 'PARENT' ? (
                            <>🏢 Enregistrer l'immeuble et ses {customUnits.length} appartements</>
                        ) : (
                            <>🏡 Enregistrer et certifier ce bien</>
                        )}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-3">
                        En enregistrant ce bien, il sera immédiatement certifié et conforme aux dispositions du Code de la Construction et de l'Habitat (CCH).
                    </p>
                </div>
            </form>
        </div>
    )
}
