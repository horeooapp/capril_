"use client"

import React, { useState, useTransition } from "react"
import { ClipboardList, Search, Plus, Key, Filter, Edit3, Trash2, Eye, Calendar, Home, Phone, User, X, Check, AlertTriangle, ShieldCheck, Clock, RefreshCw, Printer, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner";
import { renewLeaseAction, deleteLeaseAction } from "@/actions/lease.actions";
import { modifierBailDeclaratif, supprimerBailDeclaratif } from "@/actions/bail-declaratif.actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

interface LeasesDashboardClientProps {
    initialLeases: any[];
    properties?: any[];
}

export default function LeasesDashboardClient({ initialLeases, properties = [] }: LeasesDashboardClientProps) {
    const [leases, setLeases] = useState<any[]>(initialLeases || [])
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modals state
    const [editingBdq, setEditingBdq] = useState<any | null>(null);
    const [viewingBdq, setViewingBdq] = useState<any | null>(null);
    const [deletingLease, setDeletingLease] = useState<any | null>(null);

    // Edit form fields
    const [editNom, setEditNom] = useState("");
    const [editPrenom, setEditPrenom] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editRent, setEditRent] = useState<number>(0);
    const [editPropertyId, setEditPropertyId] = useState<string>("");
    const [editDescription, setEditDescription] = useState("");
    const [editStartDate, setEditStartDate] = useState("");
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

    React.useEffect(() => {
        setLeases(initialLeases || []);
    }, [initialLeases]);

    const openEditModal = (bdq: any) => {
        setEditingBdq(bdq);
        setEditNom(bdq.nomLocataireDeclare || bdq.tenant?.lastName || "");
        setEditPrenom(bdq.prenomLocataireDeclare || bdq.tenant?.firstName || "");
        setEditPhone(bdq.telephoneLocataire || bdq.tenant?.phone || "");
        setEditRent(Number(bdq.rentAmount || bdq.loyerDeclareMensuel || 0));
        setEditPropertyId(bdq.propertyId || (properties.length > 0 ? properties[0].id : "AUTRE"));
        setEditDescription(bdq.descriptionLogement || bdq.property?.name || bdq.adresseLibre || "");
        
        let dateVal = "";
        if (bdq.dateEntreeEstimee) {
            try {
                dateVal = new Date(bdq.dateEntreeEstimee).toISOString().split("T")[0];
            } catch {
                dateVal = "";
            }
        }
        setEditStartDate(dateVal);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBdq) return;

        if (!editNom.trim()) {
            toast.error("Veuillez renseigner le nom du locataire.");
            return;
        }
        if (!editPhone.trim()) {
            toast.error("Veuillez indiquer un numéro de téléphone joignable.");
            return;
        }
        if (editRent <= 0) {
            toast.error("Le loyer mensuel doit être supérieur à zéro.");
            return;
        }

        setIsSubmittingEdit(true);
        const toastId = toast.loading("Mise à jour du bail déclaratif en cours...");

        try {
            const res = await modifierBailDeclaratif({
                bdqId: editingBdq.id,
                nomLocataire: editNom.trim(),
                prenomLocataire: editPrenom.trim(),
                telephoneLocataire: editPhone.trim(),
                loyerDeclareMensuel: Number(editRent),
                descriptionLogement: editDescription.trim() || undefined,
                dateEntreeEstimee: editStartDate ? new Date(editStartDate) : null,
                propertyId: editPropertyId === "AUTRE" ? null : editPropertyId,
            });

            if (res && !res.success) {
                toast.error(res.error || "Erreur lors de la modification du bail.", { id: toastId });
            } else {
                toast.success("Bail déclaratif modifié avec succès !", { id: toastId });
                // Update local state
                setLeases(prev => prev.map(l => {
                    if (l.id === editingBdq.id) {
                        const selectedProp = properties.find(p => p.id === editPropertyId);
                        return {
                            ...l,
                            nomLocataireDeclare: editNom.trim(),
                            prenomLocataireDeclare: editPrenom.trim(),
                            telephoneLocataire: editPhone.trim(),
                            rentAmount: Number(editRent),
                            propertyId: editPropertyId === "AUTRE" ? null : editPropertyId,
                            descriptionLogement: editDescription.trim(),
                            property: selectedProp || (editPropertyId === "AUTRE" ? { name: editDescription.trim(), address: editDescription.trim() } : l.property),
                            tenant: {
                                firstName: editPrenom.trim(),
                                lastName: editNom.trim(),
                                phone: editPhone.trim()
                            },
                            dateEntreeEstimee: editStartDate || l.dateEntreeEstimee
                        };
                    }
                    return l;
                }));
                setEditingBdq(null);
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur interne lors de la modification.", { id: toastId });
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingLease) return;
        setIsSubmittingDelete(true);
        const toastId = toast.loading("Suppression du bail en cours...");

        try {
            const res = deletingLease.isBdq 
                ? await supprimerBailDeclaratif(deletingLease.id)
                : await deleteLeaseAction(deletingLease.id);

            if (res && !res.success) {
                toast.error(res.error || "Impossible de supprimer ce bail.", { id: toastId });
            } else {
                toast.success(res?.message || "Bail supprimé avec succès.", { id: toastId });
                setLeases(prev => prev.filter(l => l.id !== deletingLease.id));
                setDeletingLease(null);
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur lors de la suppression.", { id: toastId });
        } finally {
            setIsSubmittingDelete(false);
        }
    };

    const handleRenew = (leaseId: string) => {
        startTransition(async () => {
            const toastId = toast.loading("Traitement de la prolongation...");
            try {
                const res = await renewLeaseAction(leaseId);
                if (res && !res.success) {
                    toast.error(res.error || "Erreur de prolongation.", { id: toastId });
                } else {
                    toast.success(res?.message || "Bail prolongé avec succès.", { id: toastId });
                }
            } catch (err: any) {
                toast.error(err?.message || "Erreur lors de la prolongation.", { id: toastId });
            }
        });
    }

    const filteredLeases = leases.filter(l => {
        const matchesSearch = 
            (l.tenant?.firstName || '').toLowerCase().includes(search.toLowerCase()) || 
            (l.tenant?.lastName || '').toLowerCase().includes(search.toLowerCase()) || 
            (l.nomLocataireDeclare || '').toLowerCase().includes(search.toLowerCase()) || 
            (l.telephoneLocataire || l.tenant?.phone || '').toLowerCase().includes(search.toLowerCase()) || 
            (l.leaseReference || l.id).toLowerCase().includes(search.toLowerCase()) ||
            (l.property?.name || l.descriptionLogement || '').toLowerCase().includes(search.toLowerCase());

        if (statusFilter === "ALL") return matchesSearch;
        if (statusFilter === "BDQ") return matchesSearch && l.isBdq;
        if (statusFilter === "ACTIVE") return matchesSearch && (l.status === 'ACTIVE' || l.status === 'ACTIF');
        if (statusFilter === "PENDING") return matchesSearch && (l.status === 'PENDING_CONFIRMATION' || l.status === 'DRAFT' || l.status === 'PENDING_SIGNATURE');
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header controls & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par locataire, bien, téléphone, référence..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-sm" 
                    />
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                        <button
                            onClick={() => setStatusFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Tous ({leases.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("BDQ")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === "BDQ" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Déclaratifs ({leases.filter(l => l.isBdq).length})
                        </button>
                        <button
                            onClick={() => setStatusFilter("ACTIVE")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === "ACTIVE" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                        >
                            Actifs ({leases.filter(l => l.status === 'ACTIVE' || l.status === 'ACTIF').length})
                        </button>
                    </div>

                    <Link 
                        href="/dashboard/lease-wizard" 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12.5px] font-bold shadow-sm transition-all"
                    >
                        <Plus size={15} /> Nouveau Bail
                    </Link>
                </div>
            </div>

            {/* Registre des baux */}
            <SectionCard title="Registre des Baux & Déclarations Locatives" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Référence & Type</th>
                                <th className="text-left py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Preneur (Locataire)</th>
                                <th className="text-left py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Bien Loué</th>
                                <th className="text-left py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Loyer Mensuel</th>
                                <th className="text-left py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Statut</th>
                                <th className="text-right py-3 px-4 text-slate-500 font-semibold text-[11px] border-b border-slate-200 bg-slate-50/75 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeases.map(l => {
                                const tenantName = l.tenant 
                                    ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() || l.nomLocataireDeclare
                                    : (l.nomLocataireDeclare || "Non assigné");
                                const tenantPhone = l.telephoneLocataire || l.tenant?.phone;
                                const propLabel = l.property?.name || l.descriptionLogement || l.property?.address || "Logement non spécifié";

                                return (
                                    <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                                        {/* Référence */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Key size={14} className={l.isBdq ? "text-amber-500" : "text-sky-500"}/>
                                                <span className="font-bold text-[13px] text-slate-800">{l.leaseReference || l.id.substring(0,8)}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${l.isBdq ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-100 text-slate-600"}`}>
                                                    {l.isBdq ? "Bail Déclaratif" : (l.leaseType || 'Bail Classique')}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Preneur */}
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-[13px] text-slate-800">{tenantName}</p>
                                            {tenantPhone && (
                                                <p className="text-[11.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Phone size={11} className="text-slate-400" />
                                                    {tenantPhone}
                                                </p>
                                            )}
                                        </td>

                                        {/* Bien Loué */}
                                        <td className="py-3 px-4">
                                            <p className="text-[12.5px] font-semibold text-slate-700 truncate max-w-[200px]" title={propLabel}>
                                                {propLabel}
                                            </p>
                                            {l.property?.commune && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">{l.property.commune}</p>
                                            )}
                                        </td>

                                        {/* Loyer */}
                                        <td className="py-3 px-4">
                                            <span className="font-extrabold text-[13px] text-slate-900">
                                                {(l.rentAmount || l.loyerDeclareMensuel || 0).toLocaleString('fr-FR')}
                                            </span>
                                            <span className="text-[10.5px] text-slate-500 font-semibold ml-1">XOF</span>
                                        </td>

                                        {/* Statut */}
                                        <td className="py-3 px-4">
                                            {l.status === 'ACTIVE' || l.status === 'ACTIF' ? (
                                                <Badge color="green">ACTIF</Badge>
                                            ) : (
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge color={l.status === 'ANNULÉ' ? 'rose' : 'amber'}>
                                                        {l.status === 'PENDING_CONFIRMATION' ? 'EN ATTENTE PRENEUR' : l.status}
                                                    </Badge>
                                                    {['DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status) && l.daysSinceCreation !== undefined && (
                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${l.daysSinceCreation >= 4 ? 'text-rose-600 bg-rose-50 border-rose-200 animate-pulse' : 'text-amber-700 bg-amber-50 border-amber-200'}`}>
                                                            Expire dans {Math.max(0, 5 - l.daysSinceCreation)} jours
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Détails / Aperçu */}
                                                {l.isBdq ? (
                                                    <button
                                                        onClick={() => setViewingBdq(l)}
                                                        title="Voir les détails complets de ce bail déclaratif"
                                                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={13} className="text-slate-400 group-hover:text-sky-600" />
                                                        <span className="hidden md:inline">Détails</span>
                                                    </button>
                                                ) : (
                                                    <Link 
                                                        href={`/dashboard/leases/${l.id}`}
                                                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Eye size={13} className="text-slate-400" />
                                                        <span className="hidden md:inline">Détails</span>
                                                    </Link>
                                                )}

                                                {/* Imprimer / Lire le Contrat Officiel */}
                                                <Link
                                                    href={`/dashboard/leases/${l.id}/contract`}
                                                    title="Lire et imprimer le contrat de bail officiel (format papier ou PDF)"
                                                    className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Printer size={13} className="text-slate-600" />
                                                    <span className="hidden lg:inline">Contrat</span>
                                                </Link>

                                                {/* Télécharger PDF direct */}
                                                <a
                                                    href={`/api/leases/${l.id}/pdf`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Télécharger le fichier PDF certifié du bail"
                                                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 px-2 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Download size={13} />
                                                    <span className="hidden xl:inline">PDF</span>
                                                </a>

                                                {/* Modifier (pour Bail Déclaratif ou Bail Classique modifiable) */}
                                                {l.isBdq ? (
                                                    <button
                                                        onClick={() => openEditModal(l)}
                                                        title="Modifier les coordonnées, loyer ou informations de ce bail déclaratif"
                                                        className="inline-flex items-center gap-1 text-[11.5px] font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={13} />
                                                        <span>Modifier</span>
                                                    </button>
                                                ) : (
                                                    ['DRAFT', 'PENDING_SIGNATURE', 'PENDING_CONFIRMATION'].includes(l.status) && (
                                                        <Link
                                                            href={`/dashboard/leases/${l.id}/edit`}
                                                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 size={13} />
                                                            <span className="hidden md:inline">Modifier</span>
                                                        </Link>
                                                    )
                                                )}

                                                {/* Prolonger ou Renouveler */}
                                                {l.isBdq ? (
                                                    (l.status === 'PENDING_CONFIRMATION' || l.rawStatut === 'PENDING_LOCATAIRE') && (
                                                        <button 
                                                            onClick={() => handleRenew(l.id)} 
                                                            disabled={isPending}
                                                            title="Prolonger le délai de confirmation locataire de 5 jours"
                                                            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            <Clock size={13} />
                                                            <span className="hidden lg:inline">+5 jours</span>
                                                        </button>
                                                    )
                                                ) : (
                                                    <button 
                                                        onClick={() => handleRenew(l.id)} 
                                                        disabled={isPending}
                                                        title="Renouveler ce contrat de bail pour une année"
                                                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <RefreshCw size={13} />
                                                        <span className="hidden lg:inline">Renouveler</span>
                                                    </button>
                                                )}

                                                {/* Supprimer / Archiver */}
                                                <button
                                                    onClick={() => setDeletingLease(l)}
                                                    title={l.isBdq ? "Supprimer et archiver ce bail déclaratif" : "Supprimer ce contrat"}
                                                    className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLeases.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[13px] text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <ClipboardList size={20} />
                                            </div>
                                            <p className="font-semibold text-slate-700">Aucun bail trouvé dans votre registre</p>
                                            <p className="text-xs text-slate-400 max-w-sm">
                                                Essayez d'ajuster vos critères de recherche ou ajoutez un nouveau bail écrit ou déclaratif.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* ======================================================== */}
            {/* MODAL 1 : MODIFIER LE BAIL DÉCLARATIF                    */}
            {/* ======================================================== */}
            {editingBdq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 relative">
                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                                    <Edit3 size={12} />
                                    Bail Déclaratif & Verbal
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    Modifier le Bail Déclaratif
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Référence : <span className="font-semibold text-slate-700">{editingBdq.leaseReference || editingBdq.id}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingBdq(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Guide didactique */}
                        <div className="my-4 p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 leading-relaxed">
                            <p className="font-bold mb-1">💡 Bon à savoir sur les modifications :</p>
                            <p>
                                Vous pouvez ajuster les coordonnées du locataire, corriger le montant du loyer ou rattacher ce bail à l'un de vos biens immobiliers enregistrés. Vos quittances et futurs avis de paiement prendront immédiatement ces modifications en compte.
                            </p>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            {/* Preneur (Locataire) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nom de famille du locataire <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editNom}
                                        onChange={(e) => setEditNom(e.target.value)}
                                        placeholder="Ex: KOUASSI"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Prénoms du locataire
                                    </label>
                                    <input
                                        type="text"
                                        value={editPrenom}
                                        onChange={(e) => setEditPrenom(e.target.value)}
                                        placeholder="Ex: Jean-Marc"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Numéro de Téléphone (Mobile / WhatsApp) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        required
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        placeholder="Ex: +225 07 00 00 00 00"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Utilisé pour lui transmettre ses reçus électroniques et les notifications de paiement.
                                </p>
                            </div>

                            {/* Choix du Bien */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Logement ou Bien rattaché
                                </label>
                                <select
                                    value={editPropertyId}
                                    onChange={(e) => {
                                        setEditPropertyId(e.target.value);
                                        const p = properties.find(prop => prop.id === e.target.value);
                                        if (p) {
                                            setEditDescription(p.name || p.address || "");
                                            const rentVal = p.declaredRentFcfa || p.rentAmount;
                                            if (rentVal && editRent <= 0) {
                                                setEditRent(Number(rentVal));
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                >
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name || p.address} ({p.commune || 'Abidjan'}) - Réf: {p.propertyCode || p.id.substring(0,6)}
                                        </option>
                                    ))}
                                    <option value="AUTRE">➕ Autre logement / Description libre</option>
                                </select>
                            </div>

                            {/* Description libre si Autre ou pas de biens */}
                            {(editPropertyId === "AUTRE" || properties.length === 0) && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Description ou Adresse du logement
                                    </label>
                                    <input
                                        type="text"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Ex: Appartement 3 pièces, Cocody Angré 8ème tranche"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </div>
                            )}

                            {/* Loyer et Date d'entrée */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Loyer mensuel (XOF) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        required
                                        value={editRent || ""}
                                        onChange={(e) => setEditRent(Number(e.target.value))}
                                        placeholder="Ex: 150000"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                    {editRent > 0 && (
                                        <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                                            {editRent.toLocaleString('fr-FR')} XOF / mois
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Date d'entrée dans les lieux
                                    </label>
                                    <div className="relative">
                                        <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isSubmittingEdit}
                                    onClick={() => setEditingBdq(null)}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingEdit}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isSubmittingEdit ? (
                                        <>
                                            <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            Enregistrer les modifications
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2 : APERÇU DÉTAILLÉ DU BAIL DÉCLARATIF             */}
            {/* ======================================================== */}
            {viewingBdq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative">
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                                    <Eye size={12} />
                                    Fiche de Bail Déclaratif
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900">
                                    {viewingBdq.leaseReference || viewingBdq.id}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Déclaré par vos soins sur QAPRIL
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingBdq(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="my-5 space-y-4 text-xs">
                            {/* Preneur */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Preneur / Locataire</p>
                                <p className="text-sm font-extrabold text-slate-900">
                                    {viewingBdq.tenant?.firstName} {viewingBdq.tenant?.lastName || viewingBdq.nomLocataireDeclare}
                                </p>
                                <p className="text-slate-600 flex items-center gap-1.5">
                                    <Phone size={12} className="text-slate-400" />
                                    {viewingBdq.telephoneLocataire || viewingBdq.tenant?.phone || 'Non renseigné'}
                                </p>
                            </div>

                            {/* Logement & Loyer */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Loyer Mensuel</p>
                                    <p className="text-base font-extrabold text-slate-900">
                                        {(viewingBdq.rentAmount || viewingBdq.loyerDeclareMensuel || 0).toLocaleString('fr-FR')} XOF
                                    </p>
                                </div>
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Date d'effet / Entrée</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {viewingBdq.dateEntreeEstimee 
                                            ? new Date(viewingBdq.dateEntreeEstimee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : 'Date non précisée'}
                                    </p>
                                </div>
                            </div>

                            {/* Logement */}
                            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Logement désigné</p>
                                <p className="text-sm font-bold text-slate-900">
                                    {viewingBdq.property?.name || viewingBdq.descriptionLogement || viewingBdq.property?.address}
                                </p>
                                {viewingBdq.property?.commune && (
                                    <p className="text-slate-500">Commune : {viewingBdq.property.commune}</p>
                                )}
                            </div>

                            {/* Statut & Sécurité */}
                            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                                <div className="text-[11.5px] text-emerald-900">
                                    <p className="font-bold">Déclaration certifiée et enregistrée</p>
                                    <p className="text-emerald-700 text-[10.5px]">Ce bail est répertorié dans votre registre pour la délivrance légale de quittances.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/leases/${viewingBdq.id}/contract`}
                                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Printer size={13} />
                                    Imprimer Contrat
                                </Link>

                                <a
                                    href={`/api/leases/${viewingBdq.id}/pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Download size={13} />
                                    PDF
                                </a>

                                <button
                                    type="button"
                                    onClick={() => {
                                        const bdq = viewingBdq;
                                        setViewingBdq(null);
                                        openEditModal(bdq);
                                    }}
                                    className="px-3 py-2 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Edit3 size={13} />
                                    Modifier
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewingBdq(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3 : CONFIRMATION DE SUPPRESSION                     */}
            {/* ======================================================== */}
            {deletingLease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative">
                        <div className="flex items-center gap-3 pb-3">
                            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">
                                    {deletingLease.isBdq ? "Supprimer ce bail déclaratif ?" : "Supprimer ce contrat de bail ?"}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Réf : {deletingLease.leaseReference || deletingLease.id}
                                </p>
                            </div>
                        </div>

                        {/* Message didactique */}
                        <div className="my-4 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-950 leading-relaxed">
                            <p className="font-semibold mb-1">
                                {deletingLease.isBdq ? "Que se passe-t-il en supprimant cette déclaration ?" : "Attention lors de la suppression :"}
                            </p>
                            <p className="text-slate-600">
                                {deletingLease.isBdq
                                    ? "Cette déclaration sera archivée et retirée de vos baux actifs. Les quittances automatiques et notifications au locataire seront interrompues, et le logement sera immédiatement libéré pour une future location."
                                    : "Ce contrat de bail sera archivé et ne figurera plus dans vos baux actifs. Les accès associés seront révoqués."
                                }
                            </p>
                        </div>

                        {/* Récapitulatif */}
                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 mb-5 border border-slate-100">
                            <p className="text-slate-500">
                                Locataire : <span className="font-bold text-slate-800">
                                    {deletingLease.tenant?.firstName} {deletingLease.tenant?.lastName || deletingLease.nomLocataireDeclare}
                                </span>
                            </p>
                            <p className="text-slate-500">
                                Loyer : <span className="font-bold text-slate-800">
                                    {(deletingLease.rentAmount || deletingLease.loyerDeclareMensuel || 0).toLocaleString('fr-FR')} XOF / mois
                                </span>
                            </p>
                            <p className="text-slate-500 truncate">
                                Logement : <span className="font-bold text-slate-800">
                                    {deletingLease.property?.name || deletingLease.descriptionLogement || "Logement associé"}
                                </span>
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={isSubmittingDelete}
                                onClick={() => setDeletingLease(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
                            >
                                Conserver le bail
                            </button>
                            <button
                                type="button"
                                disabled={isSubmittingDelete}
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isSubmittingDelete ? (
                                    <>
                                        <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={13} />
                                        Oui, supprimer définitivement
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

