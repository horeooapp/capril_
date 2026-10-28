"use client"

import React, { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Map, Navigation, MapPin, Search, Layers, Crosshair, MapPinned,
    ActivitySquare, AlertOctagon, Download, RefreshCw, Building2,
    ShieldCheck, TrendingUp, ExternalLink, X, CheckCircle2, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/dashboard/ui/Badge"
import { recalculateMarketStats, exportObservatoryDataCsv } from "@/actions/observatory-actions"

interface ObservatorySummary {
    totalTracked: number
    totalSafe: number
    totalCritical: number
    occupancyRate: number
    totalRentRoll: number
    avgRent: number
    communesCount: number
}

interface PropertyItem {
    id: string
    code?: string
    name: string
    district: string
    commune?: string
    address?: string
    lat?: number
    lng?: number
    mapX?: number
    mapY?: number
    status: "SAFE" | "CRITICAL" | string
    statusLabel?: string
    rentability?: "HAUTE" | "MOYENNE" | "ACCESSIBLE" | string
    rentAmount?: number
    units?: number
    warning?: string | null
    leaseCount?: number
    hasActiveLease?: boolean
}

export default function GeoRadarDashboardClient({
    properties = [],
    summary
}: {
    properties?: PropertyItem[]
    summary?: ObservatorySummary
}) {
    const router = useRouter()
    const [isRefreshing, startRefresh] = useTransition()
    const [isExporting, setIsExporting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "SAFE" | "CRITICAL">("all")
    const [communeFilter, setCommuneFilter] = useState<string>("all")
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    // Filter out null/undefined objects
    const safeProperties = useMemo(() => {
        return (Array.isArray(properties) ? properties : []).filter(
            (p): p is PropertyItem => Boolean(p && typeof p === "object" && p.id)
        )
    }, [properties])

    // Extract available distinct communes
    const availableCommunes = useMemo(() => {
        const set = new Set<string>()
        safeProperties.forEach(p => {
            if (p.district) set.add(p.district)
            else if (p.commune) set.add(p.commune)
        })
        return Array.from(set).sort()
    }, [safeProperties])

    // Apply active filters
    const filteredProperties = useMemo(() => {
        return safeProperties.filter(p => {
            // Status filter
            if (statusFilter !== "all" && p.status !== statusFilter) {
                return false
            }
            // Commune filter
            if (communeFilter !== "all") {
                const targetCommune = (p.district || p.commune || "").toLowerCase()
                if (targetCommune !== communeFilter.toLowerCase()) return false
            }
            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase()
                const matchName = (p.name || "").toLowerCase().includes(q)
                const matchDistrict = (p.district || "").toLowerCase().includes(q)
                const matchAddress = (p.address || "").toLowerCase().includes(q)
                const matchCode = (p.code || "").toLowerCase().includes(q)
                if (!matchName && !matchDistrict && !matchAddress && !matchCode) return false
            }
            return true
        })
    }, [safeProperties, statusFilter, communeFilter, searchQuery])

    // Selected property details
    const selectedProperty = useMemo(() => {
        if (!selectedPropertyId) return null
        return safeProperties.find(p => p.id === selectedPropertyId) || null
    }, [safeProperties, selectedPropertyId])

    // Computed or provided stats
    const totalCount = summary?.totalTracked ?? safeProperties.length
    const safeCount = summary?.totalSafe ?? safeProperties.filter(p => p.status === "SAFE").length
    const criticalCount = summary?.totalCritical ?? (totalCount - safeCount)
    const occupancyRate = summary?.occupancyRate ?? (totalCount > 0 ? Math.round((safeCount / totalCount) * 100) : 0)
    const totalRentRoll = summary?.totalRentRoll ?? safeProperties.reduce((acc, p) => acc + (p.rentAmount || 0), 0)

    // Button: Center on Abidjan
    const handleCenterAbidjan = () => {
        setSelectedPropertyId(null)
        setStatusFilter("all")
        setCommuneFilter("all")
        setSearchQuery("")
        window.scrollTo({ top: 0, behavior: "smooth" })
        toast.success("Radar recentré sur la métropole d'Abidjan.")
    }

    // Button: Recalculate and synchronize market stats with database
    const handleRecalculateStats = () => {
        startRefresh(async () => {
            try {
                const res = await recalculateMarketStats()
                if (res.success) {
                    toast.success(res.message || "Indicateurs de marché synchronisés avec la base de données.")
                    router.refresh()
                } else {
                    toast.error(res.error || "Impossible de recalculer les indicateurs.")
                }
            } catch {
                toast.error("Erreur de connexion au serveur.")
            }
        })
    }

    // Button: Export CSV
    const handleExportCsv = async () => {
        setIsExporting(true)
        try {
            const res = await exportObservatoryDataCsv()
            if (!res.success || !res.csvData) {
                toast.error(res.error || "Erreur lors de l'exportation.")
                setIsExporting(false)
                return
            }

            const blob = new Blob([res.csvData], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", res.filename || "observatoire_qapril.csv")
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success("Export CSV téléchargé avec succès.")
        } catch {
            toast.error("Échec du téléchargement du rapport.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="mb-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <MapPinned size={12} className="text-emerald-600" /> Cartographie & Télémétrie Active
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        Observatoire du Marché
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Supervision géographique et télémétrique de votre patrimoine immobilier en temps réel.
                    </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`border px-4 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 ${
                            showFilters || statusFilter !== "all" || communeFilter !== "all"
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                        title="Afficher les filtres cartographiques"
                    >
                        <Layers size={15} />
                        Filtres Heatmap
                        {(statusFilter !== "all" || communeFilter !== "all") && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                    </button>

                    <button
                        onClick={handleCenterAbidjan}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                        title="Recentrer le radar sur Abidjan"
                    >
                        <Navigation size={15} className="text-indigo-600" /> Cadrer sur Abidjan
                    </button>

                    <button
                        onClick={handleRecalculateStats}
                        disabled={isRefreshing}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                        title="Recalculer les moyennes du marché depuis la base de données"
                    >
                        <RefreshCw size={15} className={`text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
                        Actualiser
                    </button>

                    <button
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                        title="Exporter les données complètes de l'observatoire au format CSV"
                    >
                        <Download size={15} />
                        {isExporting ? "Exportation..." : "Exporter CSV"}
                    </button>
                </div>
            </div>

            {/* KPI Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-[18px] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={13} className="text-indigo-500" /> Actifs Suivis
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Biens</span>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-[18px] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-500" /> Taux d&apos;Occupation
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600">{occupancyRate}%</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">{safeCount} loués</span>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-[18px] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={13} className="text-indigo-500" /> Loyer Portefeuille
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-lg sm:text-2xl font-black text-slate-900 truncate">
                            {totalRentRoll.toLocaleString("fr-FR")}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">XOF</span>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-[18px] border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertOctagon size={13} className="text-amber-500" /> Actifs Vacants
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                        <span className={`text-2xl sm:text-3xl font-black ${criticalCount > 0 ? "text-amber-600" : "text-slate-900"}`}>
                            {criticalCount}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">À louer</span>
                    </div>
                </div>
            </div>

            {/* Filter Toggle Bar */}
            {showFilters && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-[18px] flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Statut :</span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    statusFilter === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                Tous ({safeProperties.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter("SAFE")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    statusFilter === "SAFE" ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                Loués ({safeCount})
                            </button>
                            <button
                                onClick={() => setStatusFilter("CRITICAL")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    statusFilter === "CRITICAL" ? "bg-rose-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                Vacants ({criticalCount})
                            </button>
                        </div>
                    </div>

                    {availableCommunes.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Commune :</span>
                            <select
                                value={communeFilter}
                                onChange={(e) => setCommuneFilter(e.target.value)}
                                className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">Toutes les communes</option>
                                {availableCommunes.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(statusFilter !== "all" || communeFilter !== "all") && (
                        <button
                            onClick={() => { setStatusFilter("all"); setCommuneFilter("all"); }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 ml-auto flex items-center gap-1"
                        >
                            <X size={14} /> Réinitialiser les filtres
                        </button>
                    )}
                </div>
            )}

            {/* Main Area: Radar Map + Register */}
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Radar Visual Map */}
                <div className="flex-1 bg-white rounded-[24px] border border-slate-200 overflow-hidden relative min-h-[520px] shadow-sm flex items-center justify-center">
                    {/* Map Grid Background */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at center, transparent 0%, #f8fafc 100%)" }}></div>

                    {/* Simulated Radar Sweep */}
                    <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/10 animate-[spin_12s_linear_infinite] flex items-center justify-center pointer-events-none">
                        <div className="w-[500px] h-[500px] rounded-full border border-indigo-500/10 flex items-center justify-center">
                            <div className="w-[300px] h-[300px] rounded-full border border-indigo-500/15"></div>
                        </div>
                        {/* Sweeper arm */}
                        <div
                            className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-400 origin-left"
                            style={{ clipPath: "polygon(0 0, 100% -5000%, 100% 5000%)" }}
                        ></div>
                    </div>

                    {/* Top Left GPS indicator */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-[8px] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-700 shadow-sm">
                            <Crosshair size={14} className="text-indigo-600" /> Télémétrie Active ({filteredProperties.length} actifs)
                        </div>
                    </div>

                    {/* Empty State Overlay */}
                    {filteredProperties.length === 0 && (
                        <div className="relative z-10 text-center p-8 max-w-md bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg">
                            <Building2 className="mx-auto text-slate-400 mb-3" size={36} />
                            <h3 className="font-bold text-slate-800 text-base">Aucun actif affiché</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {safeProperties.length === 0
                                    ? "Aucun bien immobilier n'est encore enregistré sous surveillance. Enregistrez votre premier actif pour activer le radar."
                                    : "Aucun bien ne correspond aux filtres appliqués."}
                            </p>
                            {safeProperties.length === 0 ? (
                                <Link
                                    href="/dashboard/properties/new"
                                    className="inline-flex items-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    <Building2 size={14} /> Ajouter un bien
                                </Link>
                            ) : (
                                <button
                                    onClick={() => { setStatusFilter("all"); setCommuneFilter("all"); setSearchQuery(""); }}
                                    className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    Réinitialiser les critères
                                </button>
                            )}
                        </div>
                    )}

                    {/* Properties blips on map */}
                    {filteredProperties.map((p, i) => {
                        const isSelected = selectedPropertyId === p.id
                        const posX = p.mapX ?? (25 + ((i * 17) % 55))
                        const posY = p.mapY ?? (25 + ((i * 23) % 55))
                        const isSafe = p.status === "SAFE"

                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPropertyId(p.id)}
                                className={`absolute cursor-pointer group transition-transform duration-200 ${
                                    isSelected ? "z-30 scale-125" : "z-10 hover:scale-110"
                                }`}
                                style={{ top: `${posY}%`, left: `${posX}%` }}
                            >
                                {/* Ping animation */}
                                <div
                                    className={`w-4 h-4 rounded-full animate-ping absolute ${
                                        isSafe ? "bg-indigo-500 opacity-40" : "bg-rose-500 opacity-50"
                                    }`}
                                ></div>

                                {/* Blip pin */}
                                <div
                                    className={`w-4 h-4 rounded-full border-2 border-white shadow-md relative z-10 flex items-center justify-center transition-all ${
                                        isSelected
                                            ? "ring-4 ring-indigo-400 ring-offset-1 bg-indigo-700"
                                            : isSafe
                                            ? "bg-indigo-600 group-hover:bg-indigo-700"
                                            : "bg-rose-600 group-hover:bg-rose-700"
                                    }`}
                                >
                                    {isSafe && <MapPinned size={10} className="text-white" />}
                                </div>

                                {/* Floating tooltip card */}
                                <div
                                    className={`absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 p-3 rounded-[12px] w-52 shadow-xl z-20 pointer-events-auto transition-opacity ${
                                        isSelected ? "block ring-2 ring-indigo-500/20" : "hidden group-hover:block"
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-1">
                                        <p className="text-[12px] font-bold text-slate-900 truncate">{p.name || "Actif immobilier"}</p>
                                        <Badge color={isSafe ? "emerald" : "rose"}>
                                            {isSafe ? "Loué" : "Vacant"}
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                                        {p.district || p.commune || "Abidjan"}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                        <span className="font-semibold text-slate-400">Loyer</span>
                                        <span className="font-bold text-slate-900">
                                            {(p.rentAmount || 0).toLocaleString("fr-FR")} XOF
                                        </span>
                                    </div>
                                    {p.warning && !isSafe && (
                                        <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 bg-rose-50 py-1 px-1.5 rounded">
                                            <AlertOctagon size={11} /> {p.warning}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Assets Register (Right Panel) */}
                <div className="w-full xl:w-[420px] shrink-0 flex flex-col gap-4">
                    {/* Register Header + Search */}
                    <div className="bg-white border border-slate-200 p-4 rounded-[18px] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ActivitySquare className="text-indigo-600" size={18} />
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Registre des Actifs ({filteredProperties.length})
                                </h3>
                            </div>
                            {selectedProperty && (
                                <button
                                    onClick={() => setSelectedPropertyId(null)}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                                >
                                    Désélectionner
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filtrer par nom, commune ou code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selected Asset Quick-Card (If active) */}
                    {selectedProperty && (
                        <div className="bg-indigo-50/60 border border-indigo-200 p-4 rounded-[18px] shadow-sm space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">
                                        Actif Sélectionné
                                    </span>
                                    <h4 className="font-black text-slate-900 text-sm mt-0.5">{selectedProperty.name}</h4>
                                    <p className="text-xs text-slate-600 mt-0.5">{selectedProperty.address || selectedProperty.district}</p>
                                </div>
                                <Badge color={selectedProperty.status === "SAFE" ? "emerald" : "rose"}>
                                    {selectedProperty.status === "SAFE" ? "Sécurisé" : "Vacant"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-indigo-100">
                                <div>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Loyer Mensuel</span>
                                    <p className="font-bold text-slate-900">{(selectedProperty.rentAmount || 0).toLocaleString("fr-FR")} XOF</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Rentabilité</span>
                                    <p className="font-bold text-indigo-700">{selectedProperty.rentability || "MOYENNE"}</p>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-500">
                                    GPS: {selectedProperty.lat?.toFixed(4)}, {selectedProperty.lng?.toFixed(4)}
                                </span>
                                <Link
                                    href={`/dashboard/properties/${selectedProperty.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors"
                                >
                                    Fiche Complète <ChevronRight size={13} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Scrollable list of properties */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
                        {filteredProperties.length === 0 && (
                            <div className="text-center text-slate-500 text-xs font-medium py-10 px-4 border border-dashed border-slate-200 rounded-[18px] bg-slate-50">
                                Aucun actif trouvé avec ces critères.
                            </div>
                        )}

                        {filteredProperties.map(p => {
                            const isSelected = selectedPropertyId === p.id
                            const isSafe = p.status === "SAFE"

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPropertyId(p.id)}
                                    className={`bg-white border transition-all p-3.5 rounded-[16px] shadow-xs flex flex-col gap-2.5 cursor-pointer group ${
                                        isSelected
                                            ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="max-w-[70%]">
                                            <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                                {p.name || "Actif immobilier"}
                                            </p>
                                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                                                {p.district || p.commune || "Abidjan"}
                                            </p>
                                        </div>
                                        {isSafe ? (
                                            <Badge color="emerald">LOUÉ</Badge>
                                        ) : (
                                            <Badge color="rose">VACANT</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                                        <div className="flex items-center gap-1 font-mono text-slate-500">
                                            <MapPin size={11} className="text-slate-400" />
                                            {p.lat?.toFixed(3)}, {p.lng?.toFixed(3)}
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            {(p.rentAmount || 0).toLocaleString("fr-FR")} XOF
                                        </div>
                                    </div>

                                    {p.warning && !isSafe && (
                                        <div className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-[6px] border border-rose-100 flex items-center gap-1.5">
                                            <AlertOctagon size={12} className="shrink-0" />
                                            <span className="truncate">{p.warning}</span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
