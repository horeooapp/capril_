"use client"

import React, { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllProviders } from "@/actions/provider-actions"
import { getUnassignedTickets } from "@/actions/maintenance-actions"
import { assignPrestataireToTicket } from "@/actions/prestataire.actions"
import AddProviderModal from "@/components/dashboard/maintenance/AddProviderModal"
import ProviderDetailModal from "@/components/dashboard/maintenance/ProviderDetailModal"
import { 
    Wrench, Phone, MapPin, Loader2, Star, Plus, ClipboardList, 
    X, ShieldAlert, Search, ShieldCheck, CheckCircle2, Eye, 
    Sparkles, BookOpen, Clock, DollarSign, Filter, Building2, Flame, Droplet, Zap, Home
} from "lucide-react"
import { toast } from "sonner"

const SPECIALTIES_FILTER = [
    { id: "ALL", label: "Tous les corps d'état" },
    { id: "Plomberie", label: "Plomberie" },
    { id: "Electricite", label: "Électricité" },
    { id: "Climatisation", label: "Climatisation" },
    { id: "Maconnerie", label: "Maçonnerie" },
    { id: "Serrurerie", label: "Serrurerie" },
    { id: "Etancheite", label: "Étanchéité" },
    { id: "Peinture", label: "Peinture" },
    { id: "Menuiserie", label: "Menuiserie" },
]

export default function ProvidersDashboardPage() {
    const [providers, setProviders] = useState<any[]>([])
    const [unassignedTickets, setUnassignedTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [assigningId, setAssigningId] = useState<string | null>(null)
    const [selectedProviderForTicket, setSelectedProviderForTicket] = useState<any | null>(null)
    const [viewingProvider, setViewingProvider] = useState<any | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedFilter, setSelectedFilter] = useState("ALL")
    const [showLegalGuide, setShowLegalGuide] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [provRes, tickRes] = await Promise.all([
                getAllProviders(),
                getUnassignedTickets()
            ])
            if (provRes.success) setProviders(provRes.providers || [])
            if (tickRes.success) setUnassignedTickets(tickRes.tickets || [])
        } finally {
            setLoading(false)
        }
    }

    const handleAssign = async (ticketId: string) => {
        if (!selectedProviderForTicket) return
        
        if (!confirm(`Attention: Assigner ce ticket coûte 2 000 FCFA de frais de mise en relation (Lead). Ce montant sera débité de votre Wallet. Confirmer ?`)) {
            return
        }

        setAssigningId(ticketId)
        try {
            const res = await assignPrestataireToTicket(ticketId, selectedProviderForTicket.id)
            if (res.success) {
                toast.success("Ticket assigné avec succès ! Frais de lead prélevés.")
                setSelectedProviderForTicket(null)
                loadData()
            } else {
                toast.error(res.error)
            }
        } finally {
            setAssigningId(null)
        }
    }

    // Filter and search providers
    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const query = searchQuery.toLowerCase().trim()
            const meta = p.metadata || {}
            
            // Search matching
            const matchSearch = !query || (
                (p.nom && p.nom.toLowerCase().includes(query)) ||
                (p.specialite && p.specialite.toLowerCase().includes(query)) ||
                (p.telephone && p.telephone.toLowerCase().includes(query)) ||
                (p.adresse && p.adresse.toLowerCase().includes(query)) ||
                (meta.rccm && meta.rccm.toLowerCase().includes(query)) ||
                (meta.sousSpecialites && meta.sousSpecialites.some((s: string) => s.toLowerCase().includes(query))) ||
                (meta.zonesIntervention && meta.zonesIntervention.some((z: string) => z.toLowerCase().includes(query)))
            )

            // Category filter matching
            const matchCategory = selectedFilter === "ALL" || (
                p.specialite && p.specialite.toLowerCase().includes(selectedFilter.toLowerCase())
            )

            return matchSearch && matchCategory
        })
    }, [providers, searchQuery, selectedFilter])

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-amber-500" size={44} />
            <p className="text-sm font-semibold tracking-wide">Chargement du répertoire des prestataires certifiés...</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-amber-500" size={32} /> Répertoire Prestataires & Artisans
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Artisans certifiés CCH, frigoristes F-Gaz, électriciens habilités CIE et maîtres étancheurs sous séquestre QAPRIL.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setShowLegalGuide(!showLegalGuide)}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <BookOpen size={16} /> Guide Juridique CCH
                    </button>
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-bold text-xs uppercase tracking-wider">
                        <ClipboardList size={16} /> {unassignedTickets.length} Bons en attente
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:from-amber-600 hover:to-amber-500 hover:text-slate-950 transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus size={16} /> Ajouter un Artisan
                    </button>
                </div>
            </div>

            {/* Educational Banner - Collapsible */}
            <AnimatePresence>
                {showLegalGuide && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                                            Code de la Construction et de l&apos;Habitation (CCH) — Règles Clés d&apos;Entretien
                                        </h3>
                                        <p className="text-xs text-indigo-200">
                                            Règles légales opposables en Côte d&apos;Ivoire et standards techniques requis pour les prestataires QAPRIL.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowLegalGuide(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <Building2 size={16} /> Art. 422 : Gros Entretien (Bailleur)
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        Incombent légalement au propriétaire : toitures, étanchéités de dalles, fissures structurelles, colonnes montantes, tableau électrique général et pompes de surpression.
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <Wrench size={16} /> Art. 424 : Entretien Locatif (Locataire)
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        À la charge du preneur : joints de robinetterie, flotteurs de WC, remplacement d&apos;interrupteurs, nettoyage des filtres de climatiseurs et graissage des serrures.
                                    </p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        <ShieldCheck size={16} /> Séquestre QAPRIL Anti-Malfaçon
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        50% d&apos;acompte au démarrage des travaux, 50% de solde consigné sous séquestre QAPRIL et libéré uniquement après validation contradictoire du bon de fin de travaux.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher artisan, RCCM, commune, téléphone..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex items-center gap-1">
                        <Filter size={12} /> Métier:
                    </span>
                    {SPECIALTIES_FILTER.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                selectedFilter === tab.id
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((p, index) => {
                    const meta = p.metadata || {}
                    const certs = meta.certifications || []
                    const is24_7 = meta.dispo247 || false

                    return (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: index * 0.04 }} 
                            key={p.id} 
                            className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-amber-400/80 transition-all shadow-sm hover:shadow-xl relative overflow-hidden flex flex-col group"
                        >
                            <div className="absolute top-0 right-0 w-2 h-full bg-slate-100 group-hover:bg-amber-400 transition-colors" />
                            
                            {/* Badges Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-200/80 flex items-center gap-1.5">
                                    <Wrench size={12} />
                                    {p.specialite}
                                </div>
                                <div className="flex items-center gap-2">
                                    {is24_7 && (
                                        <span className="bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                            <Clock size={10} /> 24/7
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                                        <Star size={13} className={p.noteMoyenne >= 4 ? "text-amber-400 fill-amber-400" : "text-slate-300"} /> 
                                        <span className="text-xs font-black">{p.noteMoyenne || "5.0"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Provider Title & RCCM */}
                            <h3 className="text-lg font-black text-slate-900 capitalize truncate pr-4 group-hover:text-amber-600 transition-colors">
                                {p.nom}
                            </h3>
                            {meta.rccm ? (
                                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                    RCCM/NIF: <span className="text-slate-600 font-mono">{meta.rccm}</span>
                                </p>
                            ) : (
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                    Artisan Indépendant Agréé
                                </p>
                            )}

                            {/* Certifications Chips */}
                            {certs.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                    {certs.slice(0, 3).map((c: string) => (
                                        <span key={c} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[9.5px] font-bold flex items-center gap-1">
                                            <ShieldCheck size={10} /> {c}
                                        </span>
                                    ))}
                                    {certs.length > 3 && (
                                        <span className="text-[9.5px] font-bold text-slate-400 self-center">
                                            +{certs.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Contact info & Tarifs */}
                            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 flex-grow">
                                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                                    <Phone size={13} className="text-slate-400" /> {p.telephone}
                                </p>
                                {p.adresse && (
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 truncate">
                                        <MapPin size={13} className="text-slate-400 flex-shrink-0" /> {p.adresse}
                                    </p>
                                )}
                                {(meta.tauxHoraire || meta.forfaitDeplacement) && (
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 pt-1">
                                        {meta.tauxHoraire && (
                                            <span>Tarif: <strong className="text-slate-800">{Number(meta.tauxHoraire).toLocaleString('fr-FR')} F/h</strong></span>
                                        )}
                                        {meta.forfaitDeplacement && (
                                            <span>Dépl.: <strong className="text-slate-800">{Number(meta.forfaitDeplacement).toLocaleString('fr-FR')} F</strong></span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Card Footer: Metrics & Actions */}
                            <div className="mt-5 flex flex-col gap-2.5">
                                <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interventions</span>
                                    <span className="text-sm font-black text-slate-800">
                                        {p._count?.tickets || meta.garantieMois ? `${p._count?.tickets || 0} résolues (${meta.garantieMois || 6}m g.)` : `${p._count?.tickets || 0} résolues`}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setViewingProvider(p)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Eye size={14} /> Fiche Détail
                                    </button>
                                    <button 
                                        onClick={() => setSelectedProviderForTicket(p)}
                                        disabled={unassignedTickets.length === 0}
                                        className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-white flex items-center justify-center gap-1 shadow-sm"
                                    >
                                        Assigner Bon
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {filteredProviders.length === 0 && (
                    <div className="col-span-full p-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
                        <Wrench size={44} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-700 mb-1">
                            {searchQuery || selectedFilter !== "ALL" ? "Aucun prestataire trouvé" : "Aucun prestataire enregistré"}
                        </h3>
                        <p className="text-xs font-medium text-slate-400 max-w-md mx-auto mb-4">
                            {searchQuery || selectedFilter !== "ALL"
                                ? "Essayez d'ajuster vos critères de recherche ou réinitialisez le filtre par métier."
                                : "Enregistrez vos artisans de confiance ou référencez de nouvelles antennes techniques pour vos bons d'intervention."}
                        </p>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-amber-500 hover:text-slate-950 transition-all inline-flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} /> Ajouter un Artisan maintenant
                        </button>
                    </div>
                )}
            </div>

            {/* Modal: Add Provider with Rich 4-Step Form & CCH Educational Guide */}
            <AddProviderModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onProviderAdded={() => {
                    setIsAddModalOpen(false)
                    loadData()
                }}
            />

            {/* Modal: Provider Full Detail Sheet */}
            <ProviderDetailModal 
                provider={viewingProvider}
                onClose={() => setViewingProvider(null)}
                unassignedTicketsCount={unassignedTickets.length}
                onAssignClick={(p) => {
                    setViewingProvider(null)
                    setSelectedProviderForTicket(p)
                }}
            />

            {/* Modal: Assign Ticket to Provider */}
            <AnimatePresence>
                {selectedProviderForTicket && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[140] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-200"
                        >
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm">
                                        <Wrench size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{selectedProviderForTicket.nom}</h3>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                                            Assignation de Bon d&apos;Intervention • {selectedProviderForTicket.specialite}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedProviderForTicket(null)} 
                                    className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {unassignedTickets.length === 0 ? (
                                    <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-500 font-medium text-xs">Aucun bon d&apos;intervention en attente actuellement.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-medium flex items-center gap-2">
                                            <ShieldAlert size={16} className="text-amber-600 flex-shrink-0" />
                                            <span>
                                                Frais de lead : <strong>2 000 FCFA</strong> prélevés sur votre Wallet QAPRIL à l&apos;envoi du bon à l&apos;artisan.
                                            </span>
                                        </div>

                                        {unassignedTickets.map(ticket => (
                                            <div key={ticket.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-slate-300 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                            {ticket.ticketRef || "BON"}
                                                        </span>
                                                        <span className="text-xs font-black text-rose-500 flex items-center gap-1">
                                                            Urgence: {ticket.urgence}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-2">{ticket.description}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                        <MapPin size={13} className="text-slate-400" /> {ticket.logement?.name || ticket.logement?.address || "Lieu non précisé"}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                                                        Déclarant: {ticket.locataire?.firstName} {ticket.locataire?.lastName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <button 
                                                        onClick={() => handleAssign(ticket.id)}
                                                        disabled={assigningId === ticket.id}
                                                        className="w-full md:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-slate-950 transition-all disabled:opacity-60 flex items-center justify-center min-w-[140px] shadow-sm"
                                                    >
                                                        {assigningId === ticket.id ? <Loader2 size={16} className="animate-spin" /> : "Transmettre Bon"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
