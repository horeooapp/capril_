"use client"

import React, { useState, useTransition, useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
    Search, 
    MapPin, 
    DollarSign, 
    Building2, 
    Ruler, 
    Bed, 
    Home, 
    CheckCircle, 
    ArrowUpRight, 
    X, 
    Sparkles, 
    Filter, 
    Phone, 
    Briefcase, 
    FileText, 
    Lock,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Clock,
    Bell,
    SlidersHorizontal,
    RotateCcw
} from "lucide-react"
import { toast } from "sonner"
import { soumettreCandidat } from "@/actions/annonce.actions"
import { getPublicMarketplaceAnnonces } from "@/actions/marketplace-actions"
import { Badge } from "@/components/dashboard/ui/Badge"
import { CI_LOCATIONS } from "@/constants/ci-locations"

export default function MarketplaceTenantClient({ initialAnnonces }: { initialAnnonces: any[] }) {
    const { data: session } = useSession()
    const [annonces, setAnnonces] = useState<any[]>(initialAnnonces)
    const [isPending, startTransition] = useTransition()

    // Filtres d'état
    const [locationFilter, setLocationFilter] = useState<string>("Toutes")
    const [maxPriceFilter, setMaxPriceFilter] = useState<number>(2000000)
    const [minPriceFilter, setMinPriceFilter] = useState<number>(0)
    const [priceRangePreset, setPriceRangePreset] = useState<string>("all")
    const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Modal de candidature
    const [selectedAnnonce, setSelectedAnnonce] = useState<any>(null)
    const [nom, setNom] = useState<string>("")
    const [prenom, setPrenom] = useState<string>("")
    const [telephone, setTelephone] = useState<string>("")
    const [revenuMensuel, setRevenuMensuel] = useState<string>("")
    const [employeur, setEmployeur] = useState<string>("")
    const [isApplying, setIsApplying] = useState<boolean>(false)

    // Formater XOF
    const formatXof = (val: number) => (val || 0).toLocaleString("fr-FR") + " XOF"

    // Gestion de l'ouverture du modal
    const handleOpenApplyModal = (annonce: any) => {
        setSelectedAnnonce(annonce)
        if (session?.user) {
            const full = session.user.name || ""
            const parts = full.split(" ")
            setPrenom(parts[0] || "")
            setNom(parts.slice(1).join(" ") || "Locataire")
            setTelephone((session.user as any).phone || "")
        }
        setIsApplying(true)
    }

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!nom || !prenom || !telephone || !revenuMensuel) {
            toast.error("Veuillez remplir tous les champs obligatoires.")
            return
        }

        startTransition(async () => {
            try {
                await soumettreCandidat({
                    logementId: selectedAnnonce.logementId || selectedAnnonce.logement?.id,
                    candidatId: session?.user?.id,
                    nom,
                    prenom,
                    telephone,
                    revenuMensuel: parseFloat(revenuMensuel),
                    employeur
                })
                toast.success("Félicitations ! Votre candidature a été transmise au propriétaire avec succès.")
                setIsApplying(false)
                setSelectedAnnonce(null)
            } catch (err: any) {
                toast.error("Erreur lors de l'envoi de votre candidature.")
            }
        })
    }

    // Déclencher le rechargement serveur avec filtres
    const triggerSearch = (loc: string, minP: number, maxP: number, sort: 'recent' | 'price_asc' | 'price_desc') => {
        startTransition(async () => {
            const data = await getPublicMarketplaceAnnonces({
                commune: loc === "Toutes" ? undefined : loc,
                minPrice: minP > 0 ? minP : undefined,
                maxPrice: maxP < 2000000 ? maxP : undefined,
                sortBy: sort
            })
            setAnnonces(data)
        })
    }

    // Gestion changement de localisation
    const handleLocationChange = (loc: string) => {
        setLocationFilter(loc)
        triggerSearch(loc, minPriceFilter, maxPriceFilter, sortBy)
    }

    // Gestion du tri des loyers
    const handleSortChange = (newSort: 'recent' | 'price_asc' | 'price_desc') => {
        setSortBy(newSort)
        triggerSearch(locationFilter, minPriceFilter, maxPriceFilter, newSort)
    }

    // Gestion des tranches de budget rapides
    const handlePricePreset = (preset: string) => {
        setPriceRangePreset(preset)
        let minP = 0
        let maxP = 2000000

        switch (preset) {
            case "under150k":
                minP = 0
                maxP = 150000
                break
            case "150k-300k":
                minP = 150000
                maxP = 300000
                break
            case "300k-500k":
                minP = 300000
                maxP = 500000
                break
            case "500k-1m":
                minP = 500000
                maxP = 1000000
                break
            case "over1m":
                minP = 1000000
                maxP = 5000000
                break
            default: // all
                minP = 0
                maxP = 2000000
                break
        }

        setMinPriceFilter(minP)
        setMaxPriceFilter(maxP)
        triggerSearch(locationFilter, minP, maxP, sortBy)
    }

    // Réinitialiser tous les filtres
    const handleResetFilters = () => {
        setLocationFilter("Toutes")
        setMinPriceFilter(0)
        setMaxPriceFilter(2000000)
        setPriceRangePreset("all")
        setSortBy("recent")
        setSearchQuery("")
        triggerSearch("Toutes", 0, 2000000, "recent")
    }

    // Filtrage textuel local supplémentaire pour une réactivité instantanée
    const displayedAnnonces = useMemo(() => {
        let list = [...annonces]

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim()
            list = list.filter(a => {
                const titre = (a.titre || "").toLowerCase()
                const desc = (a.description || "").toLowerCase()
                const commune = (a.logement?.commune || "").toLowerCase()
                const type = (a.logement?.propertyType || "").toLowerCase()
                return titre.includes(q) || desc.includes(q) || commune.includes(q) || type.includes(q)
            })
        }

        // Tri client garanti
        if (sortBy === 'price_asc') {
            list.sort((a, b) => Number(a.loyerDemande) - Number(b.loyerDemande))
        } else if (sortBy === 'price_desc') {
            list.sort((a, b) => Number(b.loyerDemande) - Number(a.loyerDemande))
        }

        return list
    }, [annonces, searchQuery, sortBy])

    // Extraire les communes d'Abidjan et villes principales depuis le référentiel
    const abidjanCommunes = useMemo(() => {
        return CI_LOCATIONS
            .filter(l => l.ville === "Abidjan")
            .map(l => l.commune || l.nomAffiche)
            .filter(Boolean)
    }, [])

    const interieurVilles = useMemo(() => {
        return CI_LOCATIONS
            .filter(l => l.ville !== "Abidjan")
            .map(l => l.ville)
            .filter(Boolean)
    }, [])

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            
            {/* 1. HERO BANNER */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-10 text-white overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute -right-10 -top-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-3xl space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300 uppercase tracking-widest shadow-inner">
                        <Sparkles size={14} className="text-amber-400" />
                        Logements Certifiés & Baux Sécurisés
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                        Trouvez votre prochain logement vérifié en Côte d'Ivoire.
                    </h1>
                    <p className="text-xs md:text-sm font-medium text-slate-300 leading-relaxed max-w-2xl">
                        Explorez le catalogue officiel de logements déclarés. Utilisez la barre de tri selon le montant des loyers et le sélecteur géographique pour filtrer par commune et ville.
                    </p>
                </div>
            </div>

            {/* 2. BANNIÈRE ALERTE AUTOMATIQUE LINK TO PROFIL PUBLIC */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                        <Bell size={20} className="animate-pulse" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">
                            Notification Automatique de Logement Active
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                            Dès qu'un bien correspondant à vos critères de recherche est publié, vous recevez une notification immédiate.
                        </p>
                    </div>
                </div>
                <Link
                    href="/mon-espace-locataire/profil-public"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-all hover:scale-105"
                >
                    <span>Mes Critères & Alertes</span>
                    <ArrowUpRight size={14} />
                </Link>
            </div>

            {/* 3. BARRE DE TRI SELON LE MONTANT DES LOYERS & RECHERCHE AVANCÉE */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-200/80 space-y-6">
                
                {/* LIGNE 1 : SÉLECTEUR DE LOCALISATION DÉROULANT & RECHERCHE MOTS-CLÉS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* LISTE DÉROULANTE DE LOCALISATION (5 cols) */}
                    <div className="md:col-span-5 space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#FF8200]" />
                            <span>Choix de Localisation</span>
                        </label>
                        <select
                            value={locationFilter}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200] transition-colors"
                        >
                            <option value="Toutes">📍 Toutes les localisations (Côte d'Ivoire)</option>
                            
                            <optgroup label="── Communes d'Abidjan ──">
                                {abidjanCommunes.map((c) => (
                                    <option key={`abj-${c}`} value={c}>Abidjan · {c}</option>
                                ))}
                            </optgroup>

                            <optgroup label="── Principales Villes de l'Intérieur ──">
                                {interieurVilles.map((v) => (
                                    <option key={`int-${v}`} value={v}>{v}</option>
                                ))}
                            </optgroup>

                            <optgroup label="── Quartiers Phares & Périphérie ──">
                                <option value="Angré">Cocody · Angré</option>
                                <option value="Deux Plateaux">Cocody · Deux Plateaux</option>
                                <option value="Riviera Palmeraie">Cocody · Riviera Palmeraie</option>
                                <option value="Riviera Golf">Cocody · Riviera Golf</option>
                                <option value="Zone 4">Marcory · Zone 4 & Biétry</option>
                                <option value="Niangon">Yopougon · Niangon</option>
                                <option value="Grand-Bassam">Grand-Bassam (Périphérie)</option>
                                <option value="Assinie">Assinie-Mafia</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* CHAMP DE RECHERCHE MOT-CLÉ (4 cols) */}
                    <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Search size={14} className="text-slate-400" />
                            <span>Rechercher un mot-clé</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Appartement, villa, standing..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200] transition-colors"
                            />
                            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* COMPTEUR DE RÉSULTATS (3 cols) */}
                    <div className="md:col-span-3 flex items-end">
                        <div className="w-full bg-slate-900 text-white rounded-2xl p-3 text-center flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                                Résultats trouvés
                            </span>
                            <span className="text-xl font-black text-white font-mono">
                                {displayedAnnonces.length} {displayedAnnonces.length > 1 ? "logements" : "logement"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SÉPARATEUR */}
                <div className="h-px bg-slate-100" />

                {/* LIGNE 2 : BARRE DE TRI SELON LE MONTANT DES LOYERS */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown size={15} className="text-[#FF8200]" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Barre de tri selon le montant du loyer :
                            </span>
                        </div>
                        
                        {(locationFilter !== "Toutes" || priceRangePreset !== "all" || sortBy !== "recent" || searchQuery) && (
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            >
                                <RotateCcw size={13} />
                                <span>Réinitialiser les filtres</span>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Bouton Tri Croissant */}
                        <button
                            onClick={() => handleSortChange("price_asc")}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                sortBy === "price_asc"
                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-102"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            <ArrowUp size={14} />
                            <span>Loyer croissant (Moins cher d'abord)</span>
                        </button>

                        {/* Bouton Tri Décroissant */}
                        <button
                            onClick={() => handleSortChange("price_desc")}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                sortBy === "price_desc"
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-102"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            <ArrowDown size={14} />
                            <span>Loyer décroissant (Plus cher d'abord)</span>
                        </button>

                        {/* Bouton Plus récents */}
                        <button
                            onClick={() => handleSortChange("recent")}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                sortBy === "recent"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-102"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            <Clock size={14} />
                            <span>Plus récents d'abord</span>
                        </button>
                    </div>
                </div>

                {/* LIGNE 3 : TRANCHES RAPIDES DE BUDGET (CHIPS) */}
                <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Tranche de loyer mensuel :
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: "all", label: "Tous les loyers" },
                            { id: "under150k", label: "< 150 000 XOF" },
                            { id: "150k-300k", label: "150 000 - 300 000 XOF" },
                            { id: "300k-500k", label: "300 000 - 500 000 XOF" },
                            { id: "500k-1m", label: "500 000 - 1 000 000 XOF" },
                            { id: "over1m", label: "> 1 000 000 XOF" }
                        ].map((preset) => (
                            <button
                                key={preset.id}
                                onClick={() => handlePricePreset(preset.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    priceRangePreset === preset.id
                                        ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* 4. GRILLE DES ANNONCES AVEC TRI ET FILTRE EFFECTIF */}
            {isPending ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-10 h-10 border-4 border-[#FF8200] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Actualisation des logements selon vos critères...
                    </p>
                </div>
            ) : displayedAnnonces.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200 shadow-sm space-y-4">
                    <Building2 size={48} className="text-slate-300 mx-auto" />
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Aucun logement disponible selon ces critères
                        </h3>
                        <p className="text-sm font-medium text-slate-500 max-w-md mx-auto mt-1">
                            Aucun bien ne correspond actuellement à {locationFilter !== "Toutes" ? locationFilter : "cette tranche de loyer"}.
                        </p>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={handleResetFilters}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-colors"
                        >
                            Afficher tous les logements
                        </button>
                        <Link
                            href="/mon-espace-locataire/profil-public"
                            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
                        >
                            <Bell size={13} />
                            <span>Activer une alerte automatique</span>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayedAnnonces.map((annonce) => {
                        const logement = annonce.logement || {}
                        const isLoue = annonce.statut === "LOUE" || logement.status === "RENTED" || (logement.leases && logement.leases.some((l: any) => ['ACTIVE', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status)))
                        const rentPrice = Number(annonce.loyerDemande || logement.declaredRentFcfa || 0)

                        return (
                            <div 
                                key={annonce.id} 
                                className={`bg-white rounded-[28px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/80 overflow-hidden flex flex-col group ${isLoue ? 'opacity-85' : ''}`}
                            >
                                <div className="h-56 bg-slate-100 relative overflow-hidden">
                                    {(() => {
                                        const mainImg = 
                                            (annonce.photosUrls && annonce.photosUrls.length > 0 ? annonce.photosUrls[0] : null) ||
                                            (logement.images && logement.images.length > 0 ? (logement.images.find((img: any) => img.isMain)?.s3Key || logement.images[0]?.s3Key || logement.images[0]?.url) : null) ||
                                            (logement.parentProperty?.images && logement.parentProperty.images.length > 0 ? (logement.parentProperty.images.find((img: any) => img.isMain)?.s3Key || logement.parentProperty.images[0]?.s3Key) : null) ||
                                            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";

                                        return (
                                            <img 
                                                src={mainImg}
                                                alt={annonce.titre}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes("unsplash")) {
                                                        target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                                                    }
                                                }}
                                            />
                                        );
                                    })()}
                                    <div className="absolute top-4 left-4 flex items-center gap-2">
                                        {isLoue ? (
                                            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                                                <Lock size={12} /> Loué
                                            </span>
                                        ) : (
                                            <Badge color="emerald">Vérifié QAPRIL ✓</Badge>
                                        )}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-black border border-white/20 shadow-md font-mono">
                                        {formatXof(rentPrice)} / mois
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF8200] mb-1 uppercase tracking-widest">
                                            <MapPin size={14}/> {logement.commune || logement.city || 'Abidjan'} · {logement.propertyType || 'Appartement'}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-[#FF8200] transition-colors">
                                            {annonce.titre}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 line-clamp-2 mt-1">
                                            {annonce.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Bed size={14} className="text-slate-400"/> {logement.rooms || 3} pièces
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Ruler size={14} className="text-slate-400"/> {logement.superficieM2 || 85} m²
                                        </div>
                                    </div>

                                    {isLoue ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest py-3 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
                                            title="Ce bien est déjà loué et ne peut plus recevoir de candidatures"
                                        >
                                            <Lock size={14} /> Bien Déjà Loué 🔒
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenApplyModal(annonce)}
                                            className="w-full bg-slate-900 hover:bg-[#FF8200] text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-amber-500/25"
                                        >
                                            Déposer mon dossier <ArrowUpRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* MODAL DE DÉPÔT DE CANDIDATURE */}
            {isApplying && selectedAnnonce && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white relative">
                            <button 
                                onClick={() => setIsApplying(false)}
                                className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8200] block mb-1">
                                Candidature Certifiée QAPRIL
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                                {(() => {
                                    const modalImg = 
                                        (selectedAnnonce.photosUrls && selectedAnnonce.photosUrls.length > 0 ? selectedAnnonce.photosUrls[0] : null) ||
                                        (selectedAnnonce.logement?.images && selectedAnnonce.logement.images.length > 0 ? (selectedAnnonce.logement.images.find((img: any) => img.isMain)?.s3Key || selectedAnnonce.logement.images[0]?.s3Key) : null) ||
                                        (selectedAnnonce.logement?.parentProperty?.images && selectedAnnonce.logement.parentProperty.images.length > 0 ? (selectedAnnonce.logement.parentProperty.images.find((img: any) => img.isMain)?.s3Key || selectedAnnonce.logement.parentProperty.images[0]?.s3Key) : null) ||
                                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";

                                    return (
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/20">
                                            <img 
                                                src={modalImg} 
                                                alt={selectedAnnonce.titre} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes("unsplash")) {
                                                        target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80";
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">{selectedAnnonce.titre}</h3>
                                    <p className="text-xs text-slate-300 mt-0.5 font-mono">
                                        Loyer : {formatXof(Number(selectedAnnonce.loyerDemande))} / mois
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleApplySubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Prénom</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={prenom} 
                                        onChange={(e) => setPrenom(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF8200]" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Nom</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={nom} 
                                        onChange={(e) => setNom(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF8200]" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Téléphone Mobile</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        value={telephone} 
                                        onChange={(e) => setTelephone(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF8200]" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Revenu Mensuel (XOF)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={revenuMensuel} 
                                        onChange={(e) => setRevenuMensuel(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF8200]" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Employeur / Activité (Optionnel)</label>
                                <input 
                                    type="text" 
                                    value={employeur} 
                                    onChange={(e) => setEmployeur(e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF8200]" 
                                    placeholder="Ex: Entreprise, Profession libérale..."
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-[#FF8200] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending ? "Transmission en cours..." : "Transmettre ma Candidature Certifiée"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
