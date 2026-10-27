"use client"

import React, { useState, useTransition, useMemo } from "react"
import { 
    ClipboardList, Search, FileSignature, CheckCircle, ShieldAlert, 
    ArrowRight, UserCheck, Building2, Users, Home, Phone, Mail, 
    BookOpen, HelpCircle, Eye, Info, Sparkles, X, Check, DollarSign, ShieldCheck,
    Edit3, Trash2, Clock
} from "lucide-react"
import { toast } from "sonner"
import { updateMandateStatus, deleteMandate } from "@/actions/mandate-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import CreateMandateModal from "@/components/dashboard/mandates/CreateMandateModal"
import MandateDetailModal from "@/components/dashboard/mandates/MandateDetailModal"
import EditMandateModal from "@/components/dashboard/mandates/EditMandateModal"
import RevokeMandateModal from "@/components/dashboard/mandates/RevokeMandateModal"

export default function MandatesDashboardClient({ 
    initialMandates, 
    properties = [], 
    managedLandlords = [] 
}: { 
    initialMandates: any[], 
    properties?: any[], 
    managedLandlords?: any[] 
}) {
    const [mandates, setMandates] = useState<any[]>(initialMandates || [])
    const [isPending, startTransition] = useTransition()

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [viewingMandate, setViewingMandate] = useState<any | null>(null)
    const [editingMandate, setEditingMandate] = useState<any | null>(null)
    const [revokingMandate, setRevokingMandate] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showEducationalBanner, setShowEducationalBanner] = useState(false)

    const handleUpdateStatus = (mandateId: string) => {
        startTransition(async () => {
             const promise = updateMandateStatus(mandateId)
             toast.promise(promise, {
                 loading: "Mise à jour sécurisée du mandat...",
                 success: "C'est fait. Le statut du contrat a été mis à jour.",
                 error: "Erreur lors de la mise à jour."
             })
             
             const res = await promise
             if (res.success) {
                 setMandates(prev => prev.map(m => m.id === mandateId ? { ...m, status: res.newStatus } : m))
             }
        })
    }

    const handleDeleteMandate = (mandateId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce mandat de vos registres ?")) return;
        startTransition(async () => {
            const res = await deleteMandate(mandateId)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Le mandat a été supprimé.")
                setMandates(prev => prev.filter(m => m.id !== mandateId))
            }
        })
    }

    // Filter mandates by query
    const filteredMandates = useMemo(() => {
        if (!searchQuery.trim()) return mandates
        const q = searchQuery.toLowerCase().trim()
        return mandates.filter(m => {
            const ref = m.mandateRef || m.id || ""
            const addr = m.property?.address || m.property?.name || ""
            const code = m.property?.propertyCode || ""
            const ownerName = m.property?.owner ? `${m.property.owner.firstName || ''} ${m.property.owner.lastName || ''}` : ""
            return ref.toLowerCase().includes(q) || 
                   addr.toLowerCase().includes(q) || 
                   code.toLowerCase().includes(q) || 
                   ownerName.toLowerCase().includes(q)
        })
    }, [mandates, searchQuery])

    return (
        <div className="space-y-6 relative">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <UserCheck className="text-amber-500" size={32} /> Mandats de Gérance Immobilière
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Vos contrats officiels de procuration et de gestion locative rédigés en termes clairs et transparents.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowEducationalBanner(!showEducationalBanner)}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <BookOpen size={16} /> Comprendre le Mandat
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                    >
                        <FileSignature size={16} /> Nouveau Mandat
                    </button>
                </div>
            </div>

            {/* Educational Banner - Collapsible */}
            {showEducationalBanner && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-500/30 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    Qu&apos;est-ce qu&apos;un Mandat de Gestion Locative ?
                                </h3>
                                <p className="text-xs text-indigo-200">
                                    Démystification des termes juridiques pour tous les propriétaires et visiteurs.
                                </p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setShowEducationalBanner(false)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Home size={16} /> Vous restez 100% Propriétaire
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Le mandat n&apos;est pas une vente. C&apos;est une procuration de gestion : l&apos;agence agit en votre nom pour trouver les locataires, faire les visites et rédiger le bail.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <DollarSign size={16} /> Rémunération Transparente
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Les honoraires de gestion (généralement entre 7% et 10%) ne sont prélevés que sur les loyers effectivement encaissés. Si le bien est vide, vous ne payez rien.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <ShieldCheck size={16} /> Résiliation Simple
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Le contrat se renouvelle chaque année automatiquement. Vous pouvez y mettre fin à chaque date d&apos;anniversaire avec un simple préavis de 3 mois, sans pénalité.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <StatCard 
                    label="Mandats Actifs"
                    value={`${mandates.filter(m => m.status === 'ACTIVE' || m.status === 'ACTIF').length}`}
                 />
                 <StatCard 
                    label="Taux Moyen d'Honoraires"
                    value={`${mandates.length > 0 ? (mandates.reduce((acc, m) => acc + Number(m.commissionPct||0), 0) / mandates.length).toFixed(1) : 0}%`}
                 />
                 <StatCard 
                    label="Total Mandats Émis"
                    value={`${mandates.length}`}
                 />
                 <StatCard
                    label="Propriétaires Accompagnés"
                    value={`${managedLandlords.length}`}
                 />
            </div>

            {/* Section: Propriétaires ayant confié leurs biens */}
            <SectionCard title="Propriétaires en Gestion" icon={<Users className="text-amber-500" size={20} />}>
                {managedLandlords.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <Users size={36} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-500">
                            Aucun propriétaire n&apos;a encore confié de bien à votre agence.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Cliquez sur &quot;Nouveau Mandat&quot; pour formaliser votre premier contrat de gestion.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {managedLandlords.map(landlord => (
                            <div key={landlord.id} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 hover:border-amber-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 overflow-hidden font-black">
                                        {landlord.avatarUrl ? (
                                            <img src={landlord.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>
                                                {(landlord.firstName?.[0] || '') + (landlord.lastName?.[0] || '') || 'P'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm text-slate-900 truncate">
                                            {landlord.firstName} {landlord.lastName}
                                        </p>
                                        {landlord.phone && (
                                            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                <Phone size={11} className="text-slate-400" /> {landlord.phone}
                                            </p>
                                        )}
                                        {landlord.email && (
                                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate mt-0.5">
                                                <Mail size={11} className="text-slate-400" /> {landlord.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                                        <Home size={11} /> {landlord.managedProperties.length} bien(s) sous mandat
                                    </p>
                                    {landlord.managedProperties.map((prop: any) => (
                                        <div key={prop.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-2xs">
                                            <div className="truncate flex-1">
                                                <span className="text-xs font-bold text-slate-700 block truncate">{prop.address || 'Adresse N/A'}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{prop.mandateType || 'GESTION'} • {prop.commissionPct || 8}%</span>
                                            </div>
                                            <span className={`ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                prop.mandateStatus === 'ACTIVE' || prop.mandateStatus === 'ACTIF' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {prop.mandateStatus}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Section: Registre des Mandats */}
            <SectionCard title="Registre des Contrats de Gérance" icon={<ClipboardList className="text-slate-500" />}>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par référence, bien, propriétaire..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-slate-800" 
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                        {filteredMandates.length} mandat{filteredMandates.length > 1 ? "s" : ""} trouvé{filteredMandates.length > 1 ? "s" : ""}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                <th className="pb-3 pl-2">Référence Mandat</th>
                                <th className="pb-3">Logement Confié</th>
                                <th className="pb-3">Propriétaire</th>
                                <th className="pb-3">Formule & Frais</th>
                                <th className="pb-3">Durée / Échéance</th>
                                <th className="pb-3 text-right pr-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMandates.map(m => {
                                const isActive = m.status === 'ACTIVE' || m.status === 'ACTIF'
                                const isDraft = m.status === 'DRAFT'
                                const isCancelled = m.status === 'CANCELLED'
                                const isSuspended = m.status === 'SUSPENDED'
                                const ownerName = m.property?.owner 
                                    ? `${m.property.owner.firstName || ''} ${m.property.owner.lastName || ''}`.trim() 
                                    : 'Non assigné'

                                return (
                                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 pl-2">
                                            <span className="font-black text-xs text-slate-900 block font-mono">{m.mandateRef || m.id.substring(0,8)}</span>
                                            <div className="mt-1">
                                                {isActive ? (
                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        <CheckCircle size={10} /> Actif
                                                    </span>
                                                ) : isDraft ? (
                                                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        <FileSignature size={10} /> Brouillon
                                                    </span>
                                                ) : isCancelled ? (
                                                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        <ShieldAlert size={10} /> Révoqué
                                                    </span>
                                                ) : isSuspended ? (
                                                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        <Clock size={10} /> Suspendu
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                                                        {m.status}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <p className="font-bold text-xs text-slate-800">{m.property?.name || m.property?.address || 'Non assigné'}</p>
                                            <p className="text-[11px] text-slate-400 font-medium">{m.property?.commune || 'Abidjan'} • {m.property?.propertyCode}</p>
                                        </td>
                                        <td className="py-4">
                                            <p className="font-bold text-xs text-slate-700">{ownerName}</p>
                                            {m.property?.owner?.phone && (
                                                <p className="text-[10px] text-slate-400 font-medium">{m.property.owner.phone}</p>
                                            )}
                                        </td>
                                        <td className="py-4">
                                            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-block mb-1 border border-slate-200">
                                                {m.mandateType === 'EXCLUSIVE' ? 'Exclusif' : m.mandateType === 'CO_EXCLUSIVE' ? 'Co-Exclusif' : 'Simple'}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 block">{m.commissionPct}%</span>
                                        </td>
                                        <td className="py-4 text-xs font-bold text-slate-500">
                                            {m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : '1 an reconductible'}
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                {/* 1. Consulter Fiche */}
                                                <button 
                                                    type="button"
                                                    onClick={() => setViewingMandate(m)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Consulter les détails du mandat et imprimer"
                                                >
                                                    <Eye size={12} /> Fiche
                                                </button>

                                                {/* 2. Éditer / Modifier */}
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditingMandate(m)}
                                                    className="text-[10px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                    title="Modifier la formule, les honoraires ou les missions de ce mandat"
                                                >
                                                    <Edit3 size={12} /> Modifier
                                                </button>

                                                {/* 3. Révoquer (si non déjà révoqué) */}
                                                {!isCancelled && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setRevokingMandate(m)}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                        title="Révoquer ou résilier ce contrat de gérance"
                                                    >
                                                        <ShieldAlert size={12} /> Révoquer
                                                    </button>
                                                )}

                                                {/* 4. Supprimer (uniquement brouillon ou révoqué) */}
                                                {(isDraft || isCancelled) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMandate(m.id)}
                                                        disabled={isPending}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                        title="Supprimer ce mandat"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredMandates.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <FileSignature size={32} className="mx-auto mb-2 opacity-50 text-slate-400" />
                                        Aucun contrat de mandat trouvé pour cette recherche.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Modal: Create Mandate with Multi-step Friendly Form */}
            <CreateMandateModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                properties={properties}
                onMandateCreated={() => {
                    setIsCreateModalOpen(false)
                    window.location.reload()
                }}
            />

            {/* Modal: View Mandate Details Sheet */}
            <MandateDetailModal 
                mandate={viewingMandate}
                onClose={() => setViewingMandate(null)}
                onEdit={(m) => {
                    setViewingMandate(null)
                    setEditingMandate(m)
                }}
                onRevoke={(m) => {
                    setViewingMandate(null)
                    setRevokingMandate(m)
                }}
                onStatusChanged={() => {
                    setViewingMandate(null)
                    window.location.reload()
                }}
            />

            {/* Modal: Edit Mandate */}
            <EditMandateModal
                isOpen={!!editingMandate}
                mandate={editingMandate}
                onClose={() => setEditingMandate(null)}
                onMandateUpdated={() => {
                    setEditingMandate(null)
                    window.location.reload()
                }}
            />

            {/* Modal: Revoke Mandate */}
            <RevokeMandateModal
                isOpen={!!revokingMandate}
                mandate={revokingMandate}
                onClose={() => setRevokingMandate(null)}
                onMandateRevoked={() => {
                    setRevokingMandate(null)
                    window.location.reload()
                }}
            />
        </div>
    )
}
