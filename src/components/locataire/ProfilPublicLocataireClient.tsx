"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    Briefcase, 
    Wallet, 
    MapPin, 
    Eye, 
    EyeOff, 
    Save, 
    CheckCircle2,
    Info,
    Calendar,
    Building2,
    Plus,
    X,
    Sparkles,
    ShieldCheck,
    Share2,
    Copy,
    Compass,
    Navigation,
    Home,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { upsertPublicProfile, updateProfilVisibilite } from "@/actions/locataire-profil-public"
import { 
    CI_LOCATIONS, 
    STATUTS_PRO, 
    FOURCHETTES_REVENU, 
    PERIODES_EMMENAGEMENT, 
    TYPES_LOGEMENT_OPTIONS, 
    CRITERES_LOCALISATION_RAPIDES 
} from "@/constants/ci-locations"

interface ProfilPublicLocataireClientProps {
    userId: string
    initialData: any
}

export function ProfilPublicLocataireClient({ userId, initialData }: ProfilPublicLocataireClientProps) {
    const [loading, setLoading] = useState(false)
    const [visibilite, setVisibilite] = useState<string>(initialData?.visibilite || 'TOUS')

    // Extraire la localisation initiale
    const initialCommunes = Array.isArray(initialData?.communesSouhaitees) ? initialData.communesSouhaitees : []
    const defaultCityGroup = CI_LOCATIONS[0] // Abidjan Cocody

    // Trouver le groupe de ville correspondant à initialData.city ou default
    const matchedCityGroup = useMemo(() => {
        if (!initialData?.city) return defaultCityGroup
        return CI_LOCATIONS.find(c => c.nomAffiche === initialData.city || c.commune === initialData.city || c.ville === initialData.city) || defaultCityGroup
    }, [initialData?.city, defaultCityGroup])

    const [selectedLocationGroup, setSelectedLocationGroup] = useState<string>(matchedCityGroup.nomAffiche)
    const [selectedQuartier, setSelectedQuartier] = useState<string>(
        initialCommunes[0] || matchedCityGroup.quartiers[0] || ""
    )

    // Form state
    const [formData, setFormData] = useState({
        statutRecherche: initialData?.statutRecherche || 'EN_RECHERCHE',
        statutPro: initialData?.statutPro || 'SALARIE_CDI',
        revenuFourchette: initialData?.revenuFourchette || '250K_500K',
        employeurType: initialData?.employeurType || '',
        budgetMaxFcfa: Number(initialData?.budgetMaxFcfa) || 250000,
        city: initialData?.city || matchedCityGroup.nomAffiche,
        communesSouhaitees: initialCommunes.length > 0 ? initialCommunes : [matchedCityGroup.quartiers[0]],
        typeLogement: Array.isArray(initialData?.typeLogement) && initialData.typeLogement.length > 0 
            ? initialData.typeLogement 
            : ["2 Pièces (1 chambre)", "3 Pièces (2 chambres)"],
        disponibleAPartir: initialData?.disponibleAPartir 
            ? new Date(initialData.disponibleAPartir).toISOString().split('T')[0] 
            : '',
        detailsLocalisation: initialData?.detailsLocalisation || ''
    })

    // Récupérer la liste des quartiers disponibles pour le groupe de ville sélectionné
    const currentQuartiersList = useMemo(() => {
        const found = CI_LOCATIONS.find(l => l.nomAffiche === selectedLocationGroup)
        return found ? found.quartiers : []
    }, [selectedLocationGroup])

    // Changer de ville/commune
    const handleLocationGroupChange = (nomAffiche: string) => {
        setSelectedLocationGroup(nomAffiche)
        const found = CI_LOCATIONS.find(l => l.nomAffiche === nomAffiche)
        if (found && found.quartiers.length > 0) {
            const firstQ = found.quartiers[0]
            setSelectedQuartier(firstQ)
            setFormData(prev => ({
                ...prev,
                city: nomAffiche,
                // Mettre à jour le premier élément comme quartier principal
                communesSouhaitees: [firstQ, ...prev.communesSouhaitees.filter(q => q !== firstQ)]
            }))
        } else {
            setFormData(prev => ({ ...prev, city: nomAffiche }))
        }
    }

    // Définir le quartier principal affiché
    const handleSetMainQuartier = (quartier: string) => {
        setSelectedQuartier(quartier)
        setFormData(prev => {
            const filtered = prev.communesSouhaitees.filter(q => q !== quartier)
            return {
                ...prev,
                communesSouhaitees: [quartier, ...filtered]
            }
        })
    }

    // Ajouter un quartier supplémentaire à la recherche
    const handleAddSecondaryQuartier = () => {
        if (!selectedQuartier) return
        const fullLabel = selectedQuartier.includes(selectedLocationGroup) 
            ? selectedQuartier 
            : `${selectedQuartier}`

        if (!formData.communesSouhaitees.includes(fullLabel)) {
            setFormData(prev => ({
                ...prev,
                communesSouhaitees: [...prev.communesSouhaitees, fullLabel]
            }))
            toast.success(`Quartier ajouté : ${fullLabel}`)
        } else {
            toast.info("Ce quartier est déjà dans vos préférences.")
        }
    }

    // Supprimer un quartier des préférences
    const handleRemoveQuartier = (quartierToRemove: string) => {
        setFormData(prev => {
            const updated = prev.communesSouhaitees.filter(q => q !== quartierToRemove)
            return {
                ...prev,
                communesSouhaitees: updated.length > 0 ? updated : [currentQuartiersList[0] || selectedLocationGroup]
            }
        })
    }

    // Basculer un critère rapide de localisation dans les détails
    const toggleCritereRapide = (critere: string) => {
        setFormData(prev => {
            const currentDetails = prev.detailsLocalisation || ""
            if (currentDetails.includes(critere)) {
                const cleaned = currentDetails
                    .replace(critere, "")
                    .replace(/,\s*,/g, ",")
                    .replace(/^,\s*|,\s*$/g, "")
                    .trim()
                return { ...prev, detailsLocalisation: cleaned }
            } else {
                const prefix = currentDetails ? `${currentDetails}, ` : ""
                return { ...prev, detailsLocalisation: `${prefix}${critere}` }
            }
        })
    }

    // Basculer un type de logement
    const toggleTypeLogement = (type: string) => {
        setFormData(prev => {
            const exists = prev.typeLogement.includes(type)
            if (exists) {
                if (prev.typeLogement.length === 1) {
                    toast.warning("Veuillez conserver au moins un type de logement.")
                    return prev
                }
                return { ...prev, typeLogement: prev.typeLogement.filter(t => t !== type) }
            } else {
                return { ...prev, typeLogement: [...prev.typeLogement, type] }
            }
        })
    }

    // Calcul de la période d'emménagement rapide
    const handleQuickPeriode = (days: number) => {
        const d = new Date()
        d.setDate(d.getDate() + days)
        const iso = d.toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, disponibleAPartir: iso }))
    }

    // Formatage monétaire XOF
    const formatXof = (n: number) => (n || 0).toLocaleString("fr-FR") + " XOF"

    // Sauvegarde
    const handleSave = async () => {
        setLoading(true)
        try {
            // Compiler les détails avancés dans communesSouhaitees ou employeurType
            const payload = {
                ...formData,
                city: selectedLocationGroup,
                employeurType: formData.detailsLocalisation 
                    ? `REPÈRES: ${formData.detailsLocalisation}${formData.employeurType ? ` | EMPLOI: ${formData.employeurType}` : ''}`
                    : (formData.employeurType || null)
            }
            await upsertPublicProfile(userId, payload)
            toast.success("Profil locataire mis à jour avec succès !")
        } catch (error: any) {
            console.error("Save error:", error)
            toast.error(error.message || "Erreur lors de la sauvegarde")
        } finally {
            setLoading(false)
        }
    }

    // Modification de visibilité
    const toggleVisibilite = async (newVal: string) => {
        try {
            await updateProfilVisibilite(userId, newVal)
            setVisibilite(newVal)
            toast.success(`Visibilité mise à jour : ${newVal === 'TOUS' ? 'Public' : newVal === 'INVITATION_PROPRIO' ? 'Restreint' : 'Masqué'}`)
        } catch (error) {
            toast.error("Erreur lors de la mise à jour de la visibilité")
        }
    }

    const publicUrl = `https://qapril.net/mon-espace-locataire/profil-public`

    const userFullName = [initialData?.user?.firstName, initialData?.user?.lastName].filter(Boolean).join(" ").trim() || "Locataire Certifié"
    const statutProLabel = STATUTS_PRO.find(s => s.value === formData.statutPro)?.label || formData.statutPro
    const revenuLabel = FOURCHETTES_REVENU.find(r => r.value === formData.revenuFourchette)?.label || formData.revenuFourchette

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── COLONNE GAUCHE : FORMULAIRE COMPLET D'EXPRESSION DES BESOINS (8 cols) ── */}
            <div className="lg:col-span-8 space-y-6">

                {/* 1. CARTE PARTAGE DU PROFIL / CV LOCATIF */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-amber-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Candidature Express & Profil Public
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">
                            Votre Fiche Locative Publique QAPRIL
                        </h3>
                        <p className="text-xs text-slate-500 truncate max-w-md font-mono mt-0.5">
                            {publicUrl}
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            if (navigator?.clipboard) {
                                navigator.clipboard.writeText(publicUrl);
                                toast.success("Lien de votre profil copié dans le presse-papier !");
                            }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 shrink-0"
                    >
                        <Copy size={14} className="text-[#FF8200]" />
                        <span>Copier mon Lien</span>
                    </button>
                </div>

                {/* 2. BLOC CRITÈRES : BUDGET DE LOYER & LOCALISATION SOUHAITÉE */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-8">
                    
                    {/* EN-TÊTE SECTION */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="text-[#FF8200]" size={18} />
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                Budget de Loyer & Capacité Mensuelle
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Indiquez le loyer maximum charges comprises que vous souhaitez consacrer à votre futur logement.
                        </p>
                    </div>

                    {/* BUDGET MAX INPUT & QUICK CHIPS */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Budget Loyer Max Souhaité
                                </label>
                                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                                    {formatXof(formData.budgetMaxFcfa)}
                                </div>
                            </div>
                            <div className="w-full sm:w-56">
                                <input 
                                    type="number"
                                    min={20000}
                                    max={5000000}
                                    step={10000}
                                    value={formData.budgetMaxFcfa || ""}
                                    onChange={(e) => setFormData({...formData, budgetMaxFcfa: Math.max(0, parseInt(e.target.value) || 0)})}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200]"
                                    placeholder="Ex: 250000"
                                />
                            </div>
                        </div>

                        {/* Puces de montants rapides */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                Suggestions rapides :
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {[75000, 100000, 150000, 200000, 250000, 350000, 500000, 750000, 1000000].map((amount) => {
                                    const isSelected = formData.budgetMaxFcfa === amount
                                    return (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setFormData({...formData, budgetMaxFcfa: amount})}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                isSelected 
                                                    ? "bg-[#FF8200] text-slate-950 shadow-sm scale-105" 
                                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                            }`}
                                        >
                                            {formatXof(amount)}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* 3. SECTION LOCALISATION : VILLES, COMMUNES ET QUARTIERS EN LISTE DÉROULANTE */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="text-emerald-600" size={18} />
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                    Quartier & Localisation Recherchée
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Sélectionnez la commune ou ville ivoirienne, puis choisissez le quartier précis qui sera affiché sur votre profil.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Sélecteur Ville / Commune */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                    1. Ville ou Commune Principale
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedLocationGroup}
                                        onChange={(e) => handleLocationGroupChange(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                                    >
                                        <optgroup label="── Grand Abidjan (District) ──">
                                            {CI_LOCATIONS.filter(l => l.ville === "Abidjan").map((loc) => (
                                                <option key={loc.nomAffiche} value={loc.nomAffiche}>
                                                    {loc.nomAffiche}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="── Villes Principales de Côte d'Ivoire ──">
                                            {CI_LOCATIONS.filter(l => l.ville !== "Abidjan").map((loc) => (
                                                <option key={loc.nomAffiche} value={loc.nomAffiche}>
                                                    {loc.nomAffiche}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Sélecteur Quartier Précis */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                    2. Quartier Spécifique Souhaité
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedQuartier}
                                        onChange={(e) => handleSetMainQuartier(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                                    >
                                        {currentQuartiersList.map((q) => (
                                            <option key={q} value={q}>
                                                {q}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bouton Ajouter un autre quartier & Liste des quartiers sélectionnés */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                    <span>Quartiers Affichés & Périmètre de Recherche ({formData.communesSouhaitees.length})</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleAddSecondaryQuartier}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-2xs self-start sm:self-auto"
                                >
                                    <Plus size={13} />
                                    <span>Ajouter ce quartier au profil</span>
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {formData.communesSouhaitees.map((q, idx) => (
                                    <span 
                                        key={idx}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                                            idx === 0 
                                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" 
                                                : "bg-white text-slate-800 border-slate-200"
                                        }`}
                                    >
                                        <MapPin size={11} className={idx === 0 ? "text-emerald-200" : "text-emerald-600"} />
                                        <span>{q} {idx === 0 && "(Principal)"}</span>
                                        {formData.communesSouhaitees.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuartier(q)}
                                                className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${idx === 0 ? "text-white" : "text-slate-400 hover:text-rose-600"}`}
                                                title="Retirer"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 4. DÉTAILS DE LOCALISATIONS AVANCÉS */}
                        <div className="space-y-3 pt-2">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                                <Compass size={14} className="text-sky-600" />
                                <span>Détails & Repères de Localisation Avancés (Optionnel)</span>
                            </label>
                            
                            <textarea
                                rows={2}
                                value={formData.detailsLocalisation}
                                onChange={(e) => setFormData({...formData, detailsLocalisation: e.target.value})}
                                placeholder="Ex: À moins de 200m du goudron, carrefour Duncan, proche arrêt SOTRA, zone calme sans inondation, proche école..."
                                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-medium text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none leading-relaxed"
                            />

                            {/* Puces de critères rapides cliquables */}
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                    Critères géographiques rapides à inclure :
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {CRITERES_LOCALISATION_RAPIDES.map((crit) => {
                                        const isSelected = formData.detailsLocalisation?.includes(crit)
                                        return (
                                            <button
                                                key={crit}
                                                type="button"
                                                onClick={() => toggleCritereRapide(crit)}
                                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                                                    isSelected 
                                                        ? "bg-sky-600 text-white border-sky-700 shadow-2xs" 
                                                        : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                                                }`}
                                            >
                                                {isSelected ? "✓ " : "+ "} {crit}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* 5. SITUATION PROFESSIONNELLE & REVENU */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="text-violet-600" size={18} />
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                    Statut Professionnel & Revenu Mensuel
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Ces éléments rassurent les bailleurs institutionnels et accélèrent la validation de vos dossiers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Statut Pro */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                    Statut Professionnel
                                </label>
                                <select 
                                    value={formData.statutPro}
                                    onChange={(e) => setFormData({...formData, statutPro: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                                >
                                    {STATUTS_PRO.map((st) => (
                                        <option key={st.value} value={st.value}>
                                            {st.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Revenu Mensuel (Fourchette) */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                    Revenu Mensuel (Fourchette Globale)
                                </label>
                                <select 
                                    value={formData.revenuFourchette}
                                    onChange={(e) => setFormData({...formData, revenuFourchette: e.target.value})}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                                >
                                    {FOURCHETTES_REVENU.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Champ Employeur / Secteur */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                Employeur, Institution ou Secteur d'Activité (Optionnel)
                            </label>
                            <input 
                                type="text"
                                value={formData.employeurType}
                                onChange={(e) => setFormData({...formData, employeurType: e.target.value})}
                                placeholder="Ex: Ministère de l'Éducation, Banque Atlantique, Société Minière, Commerce..."
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* 6. PÉRIODE D'EMMÉNAGEMENT & TYPE DE BIEN */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="text-amber-600" size={18} />
                                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                    Période d'Emménagement Souhaitée & Types de Logements
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Précisez quand vous prévoyez d'intégrer le logement pour les dates de prise d'effet du bail.
                            </p>
                        </div>

                        {/* Périodes d'emménagement rapide */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                                Période Souhaitée
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {PERIODES_EMMENAGEMENT.slice(0, 4).map((p) => {
                                    return (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => handleQuickPeriode(p.days)}
                                            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-center active:scale-95"
                                        >
                                            {p.label}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="pt-2 flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-500">Date précise :</span>
                                <input 
                                    type="date"
                                    value={formData.disponibleAPartir}
                                    onChange={(e) => setFormData({...formData, disponibleAPartir: e.target.value})}
                                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                        </div>

                        {/* Types de logement recherchés */}
                        <div className="space-y-2 pt-2">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                                Types de Logements Souhaités
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {TYPES_LOGEMENT_OPTIONS.map((type) => {
                                    const isSelected = formData.typeLogement.includes(type)
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleTypeLogement(type)}
                                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                isSelected 
                                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs" 
                                                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                                            }`}
                                        >
                                            {isSelected ? "✓ " : ""} {type}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* BOUTON ENREGISTRER PRINCIPAL */}
                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            type="button"
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-2xl bg-[#FF8200] hover:bg-[#e67500] text-slate-950 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                        >
                            <Save size={18} />
                            <span>{loading ? "Enregistrement en cours..." : "Enregistrer Mon Profil Public"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── COLONNE DROITE : APERÇU LIVE & CONTRÔLE DE VISIBILITÉ (4 cols) ── */}
            <div className="lg:col-span-4 space-y-6">

                {/* CARTE APERÇU EN DIRECT DU PROFIL PUBLIC */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Sparkles size={12} className="text-[#FF8200]" /> Aperçu Live (Bailleurs & Agences)
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                            Actif
                        </span>
                    </div>

                    {/* Carte Badgée */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-extrabold text-[#FF8200] uppercase tracking-widest block">
                                    Candidat Locataire Certifié
                                </span>
                                <h4 className="text-base font-black text-white leading-snug">
                                    {userFullName}
                                </h4>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs shrink-0">
                                {userFullName.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Quartier :</span>
                                <span className="font-bold text-white text-right truncate max-w-[170px]" title={formData.communesSouhaitees[0] || selectedLocationGroup}>
                                    {formData.communesSouhaitees[0] || selectedLocationGroup}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Budget Max :</span>
                                <span className="font-black text-[#FF8200]">
                                    {formatXof(formData.budgetMaxFcfa)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Statut Pro :</span>
                                <span className="font-bold text-white truncate max-w-[150px]">
                                    {statutProLabel.split('(')[0]}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400">Revenu :</span>
                                <span className="font-medium text-slate-200">
                                    {revenuLabel}
                                </span>
                            </div>

                            {formData.disponibleAPartir && (
                                <div className="flex items-center justify-between text-slate-300">
                                    <span className="text-slate-400">Emménagement :</span>
                                    <span className="font-bold text-emerald-400">
                                        {new Date(formData.disponibleAPartir).toLocaleDateString("fr-CI", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {formData.detailsLocalisation && (
                            <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 italic leading-snug">
                                « {formData.detailsLocalisation.substring(0, 90)}{formData.detailsLocalisation.length > 90 ? '...' : ''} »
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTRÔLE DE VISIBILITÉ */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                        Contrôle de Confidentialité & Visibilité
                    </h3>
                    
                    <div className="space-y-2">
                        <button 
                            type="button"
                            onClick={() => toggleVisibilite('TOUS')}
                            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                                visibilite === 'TOUS' 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                            <Eye size={18} className={visibilite === 'TOUS' ? 'text-[#FF8200]' : 'text-slate-400'} />
                            <div className="min-w-0">
                                <p className="font-bold text-xs">Visibilité Totale</p>
                                <p className={`text-[10px] ${visibilite === 'TOUS' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Matching ouvert aux propriétaires & agences certifiées
                                </p>
                            </div>
                        </button>

                        <button 
                            type="button"
                            onClick={() => toggleVisibilite('INVITATION_PROPRIO')}
                            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                                visibilite === 'INVITATION_PROPRIO' 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                            <ShieldCheck size={18} className={visibilite === 'INVITATION_PROPRIO' ? 'text-[#FF8200]' : 'text-slate-400'} />
                            <div className="min-w-0">
                                <p className="font-bold text-xs">Accès Sécurisé sur Invitation</p>
                                <p className={`text-[10px] ${visibilite === 'INVITATION_PROPRIO' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Uniquement via votre lien direct ou numéro
                                </p>
                            </div>
                        </button>

                        <button 
                            type="button"
                            onClick={() => toggleVisibilite('INVISIBLE')}
                            className={`w-full p-3.5 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                                visibilite === 'INVISIBLE' 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                        >
                            <EyeOff size={18} className={visibilite === 'INVISIBLE' ? 'text-rose-400' : 'text-slate-400'} />
                            <div className="min-w-0">
                                <p className="font-bold text-xs">Profil Masqué (Invisible)</p>
                                <p className={`text-[10px] ${visibilite === 'INVISIBLE' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Votre profil n'apparaît dans aucun résultat
                                </p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* GARANTIES VIE PRIVÉE QAPRIL */}
                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/70 space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" size={16} />
                        <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-wider">
                            Garanties Données & Vie Privée
                        </h4>
                    </div>
                    <ul className="space-y-2.5 text-[11px] text-slate-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Vos fiches de paie et coordonnées bancaires restent strictement confidentielles.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Votre numéro de téléphone n'est dévoilé qu'après accord mutuel.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>Modifiable ou supprimable en temps réel 24h/24.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
