"use client";

import React, { useState, useMemo } from "react";
import {
    Building2, Search, UserCheck, Users, Home, Phone, Mail,
    FileSignature, DollarSign, ShieldCheck, CheckCircle2,
    Clock, Eye, Filter, Share2, Copy, Sparkles, AlertCircle,
    ArrowUpRight, FileText, Check, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { Badge } from "@/components/dashboard/ui/Badge";
import MandateDetailModal from "@/components/dashboard/mandates/MandateDetailModal";

interface BiensSousMandatClientProps {
    initialMandates: any[];
    managedLandlords: any[];
    userAgencyName?: string;
}

export default function BiensSousMandatClient({
    initialMandates,
    managedLandlords,
    userAgencyName = "Agence Agréée"
}: BiensSousMandatClientProps) {
    const [mandates, setMandates] = useState<any[]>(initialMandates || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState<"ALL" | "EXCLUSIVE" | "SIMPLE" | "ACTIVE">("ALL");
    const [activeTab, setActiveTab] = useState<"biens" | "mandants">("biens");
    const [viewingMandate, setViewingMandate] = useState<any | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [copiedInvite, setCopiedInvite] = useState(false);

    // Filter mandates
    const filteredMandates = useMemo(() => {
        let list = mandates;

        if (selectedFilter === "EXCLUSIVE") {
            list = list.filter(m => m.mandateType === "EXCLUSIVE");
        } else if (selectedFilter === "SIMPLE") {
            list = list.filter(m => m.mandateType === "SIMPLE");
        } else if (selectedFilter === "ACTIVE") {
            list = list.filter(m => m.status === "ACTIVE" || m.status === "ACTIF");
        }

        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase().trim();

        return list.filter(m => {
            const ref = m.mandateRef || "";
            const addr = m.property?.address || m.property?.name || "";
            const code = m.property?.propertyCode || "";
            const commune = m.property?.commune || "";
            const ownerName = m.property?.owner
                ? `${m.property.owner.firstName || ""} ${m.property.owner.lastName || ""}`
                : "";
            return ref.toLowerCase().includes(q) ||
                addr.toLowerCase().includes(q) ||
                code.toLowerCase().includes(q) ||
                commune.toLowerCase().includes(q) ||
                ownerName.toLowerCase().includes(q);
        });
    }, [mandates, selectedFilter, searchQuery]);

    // Financial KPIs
    const activeMandatesCount = useMemo(() => {
        return mandates.filter(m => m.status === "ACTIVE" || m.status === "ACTIF").length;
    }, [mandates]);

    const totalRentUnderManagement = useMemo(() => {
        return mandates.reduce((acc, m) => {
            const rent = Number(m.property?.declaredRentFcfa || m.property?.leases?.[0]?.rentAmount || 0);
            return acc + rent;
        }, 0);
    }, [mandates]);

    const avgCommission = useMemo(() => {
        if (mandates.length === 0) return 8;
        const sum = mandates.reduce((acc, m) => acc + Number(m.commissionPct || 8), 0);
        return (sum / mandates.length).toFixed(1);
    }, [mandates]);

    const handleCopyInviteLink = () => {
        const url = `${window.location.origin}/onboarding/landlord?ref=agence-mandat`;
        navigator.clipboard.writeText(url);
        setCopiedInvite(true);
        toast.success("Lien d'invitation propriétaire copié !");
        setTimeout(() => setCopiedInvite(false), 2500);
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck size={12} className="text-amber-700" /> Espace Agence · Mandats Reçus
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">• Gestion Déléguée</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Building2 className="text-amber-500" size={32} /> Biens Gérés sous Mandat
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Portefeuille des biens et lots immobiliers confiés à votre agence par mandat de gestion de propriétaires bailleurs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                    >
                        <Share2 size={15} /> Inviter un Propriétaire
                    </button>
                </div>
            </div>

            {/* Banner: Règle Métier Mandat Reçu */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Principe de la Gestion sous Mandat
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
                            Votre agence agit en tant que mandataire pour le compte des propriétaires bailleurs. Vous assurez la recherche de locataires, la rédaction des baux, l&apos;encaissement des loyers et le reversement net après déduction de vos honoraires de gestion.
                        </p>
                    </div>
                </div>
                <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Plafond Légal Honoraires</p>
                    <p className="text-sm font-black text-amber-400">Max 15% · Standard 8%</p>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Biens sous Mandat Actif"
                    value={`${activeMandatesCount}`}
                />
                <StatCard
                    label="Volume Loyers sous Gestion"
                    value={`${totalRentUnderManagement.toLocaleString("fr-FR")} F`}
                />
                <StatCard
                    label="Taux Moyen d'Honoraires"
                    value={`${avgCommission}%`}
                />
                <StatCard
                    label="Propriétaires Mandants"
                    value={`${managedLandlords.length}`}
                />
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-4">
                <button
                    type="button"
                    onClick={() => setActiveTab("biens")}
                    className={`pb-3 text-sm font-black tracking-tight flex items-center gap-2 transition-all border-b-2 ${
                        activeTab === "biens"
                            ? "border-amber-500 text-slate-900"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <Building2 size={16} /> Biens & Lots Confiés ({filteredMandates.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("mandants")}
                    className={`pb-3 text-sm font-black tracking-tight flex items-center gap-2 transition-all border-b-2 ${
                        activeTab === "mandants"
                            ? "border-amber-500 text-slate-900"
                            : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <Users size={16} /> Bailleurs Mandants ({managedLandlords.length})
                </button>
            </div>

            {activeTab === "biens" ? (
                <>
                    {/* Filters & Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher par adresse, commune, code bien, mandant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            {[
                                { id: "ALL", label: "Tous les mandats" },
                                { id: "EXCLUSIVE", label: "Exclusifs" },
                                { id: "SIMPLE", label: "Simples" },
                                { id: "ACTIVE", label: "Actifs" },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    type="button"
                                    onClick={() => setSelectedFilter(filter.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        selectedFilter === filter.id
                                            ? "bg-slate-900 text-white shadow-2xs"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Biens List */}
                    {filteredMandates.length === 0 ? (
                        <div className="text-center py-14 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-6">
                            <Building2 size={44} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-base font-black text-slate-700">Aucun bien sous mandat trouvé</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                                Vous n&apos;avez actuellement aucun bien sous mandat correspondant à ces critères. Les mandats confiés par les propriétaires bailleurs apparaîtront automatiquement ici.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(true)}
                                className="mt-4 inline-flex items-center gap-2 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-amber-400 transition-all shadow-sm"
                            >
                                <Share2 size={14} /> Inviter un propriétaire à confier un bien
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredMandates.map((mandate) => {
                                const prop = mandate.property || {};
                                const owner = prop.owner || {};
                                const activeLease = prop.leases?.[0] || null;
                                const isExclusive = mandate.mandateType === "EXCLUSIVE";
                                const isActive = mandate.status === "ACTIVE" || mandate.status === "ACTIF";

                                return (
                                    <div
                                        key={mandate.id}
                                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Top badges */}
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

                                            {/* Property details */}
                                            <div className="flex items-start gap-3 mb-3.5">
                                                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black flex-shrink-0">
                                                    <Building2 size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-sm text-slate-900 truncate">
                                                        {prop.name || prop.address || "Bien sans nom"}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-semibold truncate">
                                                        {prop.commune || "Abidjan"} {prop.propertyCode ? `• [${prop.propertyCode}]` : ""}
                                                    </p>
                                                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                                        Réf: {mandate.mandateRef || mandate.id.substring(0, 8)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Owner Mandant Info */}
                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-3 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        Propriétaire Mandant
                                                    </p>
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                                        Bailleur
                                                    </span>
                                                </div>
                                                <p className="text-xs font-black text-slate-800 truncate">
                                                    {owner.firstName || ""} {owner.lastName || "Propriétaire Privé"}
                                                </p>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                                    {owner.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={11} className="text-slate-400" /> {owner.phone}
                                                        </span>
                                                    )}
                                                    {owner.email && (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Mail size={11} className="text-slate-400" /> {owner.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Terms & Financials */}
                                            <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
                                                <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Honoraires</p>
                                                    <p className="text-sm font-black text-amber-900 mt-0.5">
                                                        {mandate.commissionPct || 8}%
                                                    </p>
                                                    <p className="text-[9px] text-amber-600 font-medium">sur loyers encaissés</p>
                                                </div>
                                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loyer Indicatif</p>
                                                    <p className="text-sm font-black text-slate-800 mt-0.5">
                                                        {Number(prop.declaredRentFcfa || activeLease?.rentAmount || 0).toLocaleString("fr-FR")} F
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-medium">
                                                        {activeLease ? "Locataire en place" : "Disponible à la location"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setViewingMandate(mandate)}
                                                className="text-xs font-bold text-slate-700 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
                                            >
                                                <Eye size={14} /> Voir le Mandat
                                            </button>
                                            {owner.phone && (
                                                <a
                                                    href={`tel:${owner.phone}`}
                                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                                >
                                                    <Phone size={12} /> Appeler
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* Mandants Tab */
                <SectionCard title="Répertoire des Bailleurs Mandants" icon={<Users className="text-amber-500" size={20} />}>
                    {managedLandlords.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                            <Users size={36} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-500">
                                Aucun bailleur mandant enregistré pour le moment.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                                Les propriétaires vous confiant leurs biens apparaîtront ici.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {managedLandlords.map((landlord) => (
                                <div key={landlord.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-amber-300 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 font-black">
                                            {landlord.firstName?.[0] || "P"}{landlord.lastName?.[0] || ""}
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
                                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                            <Home size={11} /> {landlord.managedProperties.length} bien(s) confié(s) sous mandat
                                        </p>
                                        {landlord.managedProperties.map((p: any) => (
                                            <div key={p.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs">
                                                <div className="truncate flex-1">
                                                    <span className="font-bold text-slate-700 block truncate">{p.address || "Adresse"}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{p.mandateType || "GESTION"} • {p.commissionPct || 8}%</span>
                                                </div>
                                                <span className={`ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    p.mandateStatus === "ACTIVE" || p.mandateStatus === "ACTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                                }`}>
                                                    {p.mandateStatus}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            )}

            {/* Modal: Inviter un Propriétaire */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                    <Share2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Inviter un Propriétaire Bailleur</h3>
                                    <p className="text-xs text-slate-500">Transmettez votre lien sécurisé pour recevoir un mandat</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Partagez ce lien avec un propriétaire pour qu&apos;il enregistre ses biens et désigne votre agence <strong>{userAgencyName}</strong> comme mandataire de gestion locative sur QAPRIL.
                        </p>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-slate-700 truncate">
                                {typeof window !== "undefined" ? window.location.origin : "https://www.qapril.net"}/onboarding/landlord
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyInviteLink}
                                className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                            >
                                {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
                                {copiedInvite ? "Copié !" : "Copier"}
                            </button>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsInviteModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Mandate Details */}
            {viewingMandate && (
                <MandateDetailModal
                    mandate={viewingMandate}
                    onClose={() => setViewingMandate(null)}
                />
            )}
        </div>
    );
}
