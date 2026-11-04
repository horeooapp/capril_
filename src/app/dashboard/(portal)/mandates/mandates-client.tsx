"use client";

import React, { useState, useTransition, useMemo } from "react";
import { 
    ClipboardList, Search, FileSignature, CheckCircle, ShieldAlert, 
    ArrowRight, UserCheck, Building2, Users, Home, Phone, Mail, 
    BookOpen, HelpCircle, Eye, Info, Sparkles, X, Check, DollarSign, ShieldCheck,
    Edit3, Trash2, Clock, Plus, Award, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { updateMandateStatus, deleteMandate } from "@/actions/mandate-actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { Badge } from "@/components/dashboard/ui/Badge";
import CreateMandateModal from "@/components/dashboard/mandates/CreateMandateModal";
import MandateDetailModal from "@/components/dashboard/mandates/MandateDetailModal";
import EditMandateModal from "@/components/dashboard/mandates/EditMandateModal";
import RevokeMandateModal from "@/components/dashboard/mandates/RevokeMandateModal";

interface MandatesDashboardClientProps {
    initialMandates: any[];
    properties?: any[];
    agencies?: any[];
}

export default function MandatesDashboardClient({ 
    initialMandates, 
    properties = [], 
    agencies = []
}: MandatesDashboardClientProps) {
    const [mandates, setMandates] = useState<any[]>(initialMandates || []);
    const [isPending, startTransition] = useTransition();

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewingMandate, setViewingMandate] = useState<any | null>(null);
    const [editingMandate, setEditingMandate] = useState<any | null>(null);
    const [revokingMandate, setRevokingMandate] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showEducationalBanner, setShowEducationalBanner] = useState(false);

    const handleUpdateStatus = (mandateId: string) => {
        startTransition(async () => {
             const promise = updateMandateStatus(mandateId);
             toast.promise(promise, {
                 loading: "Mise à jour sécurisée du mandat...",
                 success: "C'est fait. Le statut du contrat a été mis à jour.",
                 error: "Erreur lors de la mise à jour."
             });
             
             const res = await promise;
             if (res.success) {
                 setMandates(prev => prev.map(m => m.id === mandateId ? { ...m, status: res.newStatus } : m));
             }
        });
    };

    const handleDeleteMandate = (mandateId: string) => {
        if (!confirm("Voulez-vous vraiment révoquer ou supprimer ce mandat de vos registres ?")) return;
        startTransition(async () => {
            const res = await deleteMandate(mandateId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Le mandat a été supprimé.");
                setMandates(prev => prev.filter(m => m.id !== mandateId));
            }
        });
    };

    // Filter mandates by query
    const filteredMandates = useMemo(() => {
        if (!searchQuery.trim()) return mandates;
        const q = searchQuery.toLowerCase().trim();
        return mandates.filter(m => {
            const ref = m.mandateRef || m.id || "";
            const addr = m.property?.address || m.property?.name || "";
            const code = m.property?.propertyCode || "";
            const agentName = m.agent 
                ? `${m.agent.legalEntity?.companyName || ''} ${m.agent.firstName || ''} ${m.agent.lastName || ''}`
                : "";
            return ref.toLowerCase().includes(q) || 
                   addr.toLowerCase().includes(q) || 
                   code.toLowerCase().includes(q) || 
                   agentName.toLowerCase().includes(q);
        });
    }, [mandates, searchQuery]);

    // Unique agencies to which the landlord gave mandates
    const delegatedAgenciesCount = useMemo(() => {
        const ids = new Set<string>();
        for (const m of mandates) {
            if (m.agentUserId) ids.add(m.agentUserId);
        }
        return ids.size;
    }, [mandates]);

    const activeMandates = useMemo(() => {
        return mandates.filter(m => m.status === 'ACTIVE' || m.status === 'ACTIF');
    }, [mandates]);

    return (
        <div className="space-y-6 relative">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-700" /> Espace Propriétaire · Mandats Confiés
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• Gérance Déléguée</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <UserCheck className="text-amber-500" size={32} /> Mes Mandats de Gestion Locative
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Déléguez la gérance de vos biens à des agences immobilières agréées et suivez vos contrats en toute transparence.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowEducationalBanner(!showEducationalBanner)}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 transition-colors flex items-center gap-2 shadow-2xs"
                    >
                        <BookOpen size={16} /> Comprendre le Mandat
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus size={16} /> Confier un Bien en Gestion
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
                                    Comment fonctionne le Mandat de Gestion pour le Propriétaire ?
                                </h3>
                                <p className="text-xs text-indigo-200">
                                    Une procuration légale qui protège vos intérêts tout en vous déchargeant du quotidien.
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
                                Le mandat n&apos;est pas une cession. Vous confiez à l&apos;agence la mission de trouver les locataires, rédiger les baux et encaisser les loyers en votre nom.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <DollarSign size={16} /> Rémunération au Résultat
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Les honoraires d&apos;agence (généralement 7% à 10%) ne sont prélevés que sur les loyers encaissés. Si le bien est vacant, aucun frais de gestion n&apos;est facturé.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <ShieldCheck size={16} /> Résiliation Simple & Encadrée
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Le contrat annuel peut être résilié à chaque date d&apos;anniversaire avec un simple préavis écrit de 3 mois, sans pénalité ni litige.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <StatCard 
                    label="Biens sous Mandat Actif"
                    value={`${activeMandates.length}`}
                 />
                 <StatCard 
                    label="Taux Moyen d'Honoraires"
                    value={`${mandates.length > 0 ? (mandates.reduce((acc, m) => acc + Number(m.commissionPct||8), 0) / mandates.length).toFixed(1) : 8}%`}
                 />
                 <StatCard 
                    label="Mandats Confiés"
                    value={`${mandates.length}`}
                 />
                 <StatCard
                    label="Agences Partenaires"
                    value={`${delegatedAgenciesCount}`}
                 />
            </div>

            {/* Section: Agences Immobilières Partenaires Disponibles */}
            <SectionCard title="Agences Immobilières Agréées Partenaires" icon={<Building2 className="text-amber-500" size={20} />}>
                <p className="text-xs text-slate-500 mb-4">
                    Choisissez une agence immobilière agréée ou un gestionnaire certifié pour lui confier la gérance de votre patrimoine en toute sécurité.
                </p>

                {agencies.length === 0 ? (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                                <Award size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Réseau d&apos;Agences Agréées QAPRIL</h4>
                                <p className="text-xs text-slate-500">Agences certifiées CPRAIMA-CI prêtes à prendre en charge vos biens.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                            Confier un bien
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {agencies.map((agency) => {
                            const name = agency.legalEntity?.companyName || `${agency.firstName || ''} ${agency.lastName || ''}`.trim() || 'Agence Partenaire';
                            return (
                                <div key={agency.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                                                {agency.avatarUrl ? (
                                                    <img src={agency.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    <Building2 size={18} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-slate-900 truncate">
                                                    {name}
                                                </p>
                                                {agency.companyRegNumber && (
                                                    <p className="text-[11px] font-mono font-bold text-amber-700">
                                                        Agrément: {agency.companyRegNumber}
                                                    </p>
                                                )}
                                                {agency.phone && (
                                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                        <Phone size={11} className="text-slate-400" /> {agency.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            Agréée & Vérifiée
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="text-xs font-black text-slate-800 hover:text-amber-600 flex items-center gap-1 transition-colors"
                                        >
                                            Confier un bien <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>

            {/* Section: Registre des Mandats Donnés */}
            <SectionCard title="Mes Biens Confiés sous Mandat de Gérance" icon={<ClipboardList className="text-amber-500" size={20} />}>
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par adresse, réf mandat, agence..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                        {filteredMandates.length} mandat(s) enregistré(s)
                    </span>
                </div>

                {filteredMandates.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <ClipboardList size={40} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-600">
                            Vous n&apos;avez encore confié aucun bien en gestion locative.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
                            Cliquez sur &quot;Confier un Bien en Gestion&quot; pour sélectionner l&apos;un de vos biens et désigner une agence agréée.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-all shadow-sm"
                        >
                            <Plus size={14} /> Confier un Bien
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredMandates.map((mandate) => {
                            const prop = mandate.property || {};
                            const agent = mandate.agent || {};
                            const agentName = agent.legalEntity?.companyName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Agence Partenaire QAPRIL';
                            const isExclusive = mandate.mandateType === "EXCLUSIVE";
                            const isActive = mandate.status === "ACTIVE" || mandate.status === "ACTIF";

                            return (
                                <div
                                    key={mandate.id}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                                isExclusive 
                                                    ? "bg-amber-100 text-amber-800 border border-amber-300" 
                                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                            }`}>
                                                {isExclusive ? "Mandat Exclusif" : "Mandat Simple"}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                                isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                            }`}>
                                                {mandate.status}
                                            </span>
                                        </div>

                                        {/* Property Info */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black flex-shrink-0">
                                                <Home size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-sm text-slate-900 truncate">
                                                    {prop.name || prop.address || "Bien"}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-semibold truncate">
                                                    {prop.commune || "Abidjan"} {prop.propertyCode ? `• [${prop.propertyCode}]` : ""}
                                                </p>
                                                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                    Réf: {mandate.mandateRef || mandate.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Agent / Agency Mandataire Info */}
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-3 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Agence Mandataire
                                                </p>
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    Gestionnaire
                                                </span>
                                            </div>
                                            <p className="text-xs font-black text-slate-800 truncate">
                                                {agentName}
                                            </p>
                                            {agent.phone && (
                                                <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                                    <Phone size={11} className="text-slate-400" /> {agent.phone}
                                                </p>
                                            )}
                                        </div>

                                        {/* Terms */}
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Honoraires</p>
                                                <p className="text-sm font-black text-amber-900 mt-0.5">
                                                    {mandate.commissionPct || 8}%
                                                </p>
                                                <p className="text-[9px] text-amber-600 font-medium">prélevés sur loyers</p>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loyer Indicatif</p>
                                                <p className="text-sm font-black text-slate-800 mt-0.5">
                                                    {Number(prop.declaredRentFcfa || 0).toLocaleString("fr-FR")} F
                                                </p>
                                                <p className="text-[9px] text-slate-400 font-medium">Revenu mensuel</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setViewingMandate(mandate)}
                                            className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1 transition-colors"
                                        >
                                            <Eye size={14} /> Contrat complet
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setEditingMandate(mandate)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                                title="Modifier les termes"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRevokingMandate(mandate)}
                                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                                title="Résilier le mandat"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>

            {/* Modals */}
            {isCreateModalOpen && (
                <CreateMandateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    properties={properties}
                    agencies={agencies}
                    onMandateCreated={() => {
                        window.location.reload();
                    }}
                />
            )}

            {viewingMandate && (
                <MandateDetailModal
                    mandate={viewingMandate}
                    onClose={() => setViewingMandate(null)}
                    onEdit={(m) => { setViewingMandate(null); setEditingMandate(m); }}
                    onRevoke={(m) => { setViewingMandate(null); setRevokingMandate(m); }}
                />
            )}

            {editingMandate && (
                <EditMandateModal
                    isOpen={!!editingMandate}
                    mandate={editingMandate}
                    onClose={() => setEditingMandate(null)}
                    onMandateUpdated={() => { window.location.reload(); }}
                />
            )}

            {revokingMandate && (
                <RevokeMandateModal
                    isOpen={!!revokingMandate}
                    mandate={revokingMandate}
                    onClose={() => setRevokingMandate(null)}
                    onMandateRevoked={() => { window.location.reload(); }}
                />
            )}
        </div>
    );
}
