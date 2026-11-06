"use client";

import React, { useEffect, useState } from "react";
import {
    Trophy,
    Wallet,
    Target,
    Users,
    Clock,
    Plus,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Phone,
    MapPin,
    Calendar,
    MessageSquare,
    Sparkles,
    Trash2,
} from "lucide-react";

export default function ChampionDashboardPage() {
    const [data, setData] = useState<any>(null);
    const [weeklyReport, setWeeklyReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statutFilter, setStatutFilter] = useState<string>("ALL");
    const [showNewProspectModal, setShowNewProspectModal] = useState(false);
    const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        nom: "",
        telephone: "",
        quartier: "",
        nb_logements_estime: "6-15",
        argument_cle: "Quittances automatiques & zéro conflit",
        date_rappel_prevu: "",
        note: "",
    });

    async function loadDashboard() {
        setLoading(true);
        try {
            const [resDash, resWeek] = await Promise.all([
                fetch("/api/v1/champion/dashboard"),
                fetch("/api/v1/champion/rapport-semaine"),
            ]);
            if (resDash.ok) {
                const json = await resDash.json();
                setData(json);
                if (json?.champion?.zone_principale && !form.quartier) {
                    setForm((prev) => ({ ...prev, quartier: json.champion.zone_principale }));
                }
            }
            if (resWeek.ok) {
                setWeeklyReport(await resWeek.json());
            }
        } catch (err) {
            console.error("Erreur chargement dashboard Champion:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    async function handleAddProspect(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nom.trim()) return;
        setSubmitting(true);
        setDuplicateAlert(null);
        try {
            const res = await fetch("/api/v1/champion/prospects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (res.ok) {
                if (json.alerte_doublon) {
                    setDuplicateAlert(json.alerte_doublon);
                } else {
                    setShowNewProspectModal(false);
                }
                setForm({
                    nom: "",
                    telephone: "",
                    quartier: data?.champion?.zone_principale || "",
                    nb_logements_estime: "6-15",
                    argument_cle: "Quittances automatiques & zéro conflit",
                    date_rappel_prevu: "",
                    note: "",
                });
                await loadDashboard();
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStatusChange(prospectId: string, newStatut: string) {
        await fetch(`/api/v1/champion/prospects/${prospectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statut: newStatut }),
        });
        await loadDashboard();
    }

    async function handleDeleteProspect(prospectId: string) {
        await fetch(`/api/v1/champion/prospects/${prospectId}`, {
            method: "DELETE",
        });
        await loadDashboard();
    }

    if (loading && !data) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-slate-500 font-bold animate-pulse">
                    Chargement du Tableau de Bord QAPRIL Champion...
                </div>
            </div>
        );
    }

    const b1 = data?.bloc_1_commissions_mois || {};
    const b2 = data?.bloc_2_performance_mois || {};
    const b3 = data?.bloc_3_prospects_a_rappeler || { prospects: [] };
    const b4 = data?.bloc_4_inscriptions_recentes || [];
    const b5 = data?.bloc_5_classement_zone || [];

    const filteredProspects = (b3.prospects || []).filter((p: any) =>
        statutFilter === "ALL" ? true : p.statut === statutFilter
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900] text-white p-6 rounded-3xl shadow-lg">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest mb-2">
                        <Trophy className="w-3.5 h-3.5" /> QAPRIL Champion · Zone {data?.champion?.zone_principale || "Abidjan"}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black">
                        Bonjour, {data?.champion?.nom || "Champion"}
                    </h1>
                    <p className="text-blue-100 text-sm mt-1">
                        Suivi en temps réel de vos commissions, objectifs terrain et carnet de prospects propriétaires.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setDuplicateAlert(null);
                        setShowNewProspectModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C55A11] hover:bg-[#a84a0c] text-white font-black text-sm shadow-lg transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Nouveau Prospect Propriétaire
                </button>
            </div>

            {duplicateAlert && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm font-bold">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>{duplicateAlert}</span>
                    </div>
                    <button
                        onClick={() => setDuplicateAlert(null)}
                        className="text-xs font-black underline ml-4"
                    >
                        Fermer
                    </button>
                </div>
            )}

            {/* BLOC 1 & BLOC 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BLOC 1 : Mes commissions du mois */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900">
                                    1. Mes Commissions du Mois
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Prochain virement Mobile Money : Vendredi {b1.date_prochain_paiement}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                            Confirmé
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                            <div className="text-xs font-bold text-emerald-700 uppercase">
                                Gains Confirmés
                            </div>
                            <div className="text-2xl font-black text-emerald-900 mt-1">
                                {(b1.montant_confirme_fcfa || 0).toLocaleString("fr-FR")} FCFA
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                            <div className="text-xs font-bold text-amber-700 uppercase">
                                En attente confirmation SMS
                            </div>
                            <div className="text-2xl font-black text-amber-900 mt-1">
                                {(b1.montant_en_attente_fcfa || 0).toLocaleString("fr-FR")} FCFA
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-sm">
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-600 font-medium">
                                Bails formels créés (× 1 000 FCFA)
                            </span>
                            <span className="font-black text-slate-900">
                                {b1.detail_par_action?.bails_formels?.count || 0} →{" "}
                                {(b1.detail_par_action?.bails_formels?.total || 0).toLocaleString("fr-FR")} FCFA
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-600 font-medium">
                                BDQ confirmés par locataire (× 250 FCFA)
                            </span>
                            <span className="font-black text-slate-900">
                                {b1.detail_par_action?.bdq_confirmes?.count || 0} →{" "}
                                {(b1.detail_par_action?.bdq_confirmes?.total || 0).toLocaleString("fr-FR")} FCFA
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-slate-600 font-medium">
                                BDQ formalisés en bail écrit (× 500 FCFA)
                            </span>
                            <span className="font-black text-slate-900">
                                {b1.detail_par_action?.bdq_formalises?.count || 0} →{" "}
                                {(b1.detail_par_action?.bdq_formalises?.total || 0).toLocaleString("fr-FR")} FCFA
                            </span>
                        </div>
                    </div>
                </div>

                {/* BLOC 2 : Ma performance ce mois */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1F4E79] flex items-center justify-center">
                                <Target className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900">
                                    2. Ma Performance ce Mois
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Objectif mensuel : {b2.objectif_mensuel || 30} inscriptions
                                </p>
                            </div>
                        </div>
                        <span className="text-xl font-black text-[#1F4E79]">
                            {b2.inscriptions_realisees || 0} / {b2.objectif_mensuel || 30} ({b2.progression_pct || 0}%)
                        </span>
                    </div>

                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-slate-900] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, b2.progression_pct || 0)}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-[11px] font-bold text-slate-500 uppercase">
                                Jours restants
                            </div>
                            <div className="text-lg font-black text-slate-900 mt-1">
                                {b2.jours_restants || 0} j
                            </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-[11px] font-bold text-slate-500 uppercase">
                                Rythme requis
                            </div>
                            <div className="text-lg font-black text-[#C55A11] mt-1">
                                {b2.rythme_quotidien_requis || 0} / jour
                            </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="text-[11px] font-bold text-slate-500 uppercase">
                                vs Mois dernier
                            </div>
                            <div className="text-lg font-black text-emerald-700 mt-1 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {b2.evolution_vs_mois_precedent >= 0
                                    ? `+${b2.evolution_vs_mois_precedent}`
                                    : b2.evolution_vs_mois_precedent}
                            </div>
                        </div>
                    </div>

                    {weeklyReport?.whatsapp_text && (
                        <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-line">
                            <div className="flex items-center gap-1.5 text-amber-400 font-sans font-bold mb-1">
                                <Sparkles className="w-3.5 h-3.5" /> Aperçu Rapport Hebdomadaire WhatsApp (Lundi 7h30)
                            </div>
                            {weeklyReport.whatsapp_text}
                        </div>
                    )}
                </div>
            </div>

            {/* BLOC 3 : Carnet de prospects à rappeler */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#C55A11] flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">
                                3. Mon Carnet de Prospects Propriétaires ({b3.total_prospects || 0})
                            </h2>
                            <p className="text-xs text-slate-500">
                                Triés par date de rappel · Alerte automatique si rappel dépassé de +48h
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {["ALL", "A_RAPPELER", "EN_DISCUSSION", "INSCRIT", "PAS_INTERESSE"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatutFilter(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    statutFilter === st
                                        ? "bg-[#1F4E79] text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {st === "ALL" ? "Tous" : st.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProspects.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                        Aucun prospect dans cette catégorie. Cliquez sur « Nouveau Prospect Propriétaire » pour en ajouter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 font-black">
                                    <th className="py-3 px-3">Propriétaire</th>
                                    <th className="py-3 px-3">Quartier / Portefeuille</th>
                                    <th className="py-3 px-3">Argument Clé & Note</th>
                                    <th className="py-3 px-3">Rappel Prévu</th>
                                    <th className="py-3 px-3">Statut</th>
                                    <th className="py-3 px-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProspects.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-slate-50/80">
                                        <td className="py-3.5 px-3">
                                            <div className="font-black text-slate-900 flex items-center gap-2">
                                                {p.nom}
                                                {p.deja_inscrit_qapril && (
                                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">
                                                        Déjà sur QAPRIL
                                                    </span>
                                                )}
                                            </div>
                                            {p.telephone && (
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3" /> {p.telephone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="text-slate-800 font-bold flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.quartier || "—"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {p.nb_logements_estime || "1-5"} portes
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 max-w-xs">
                                            <div className="font-semibold text-slate-800 truncate">
                                                {p.argument_cle || "—"}
                                            </div>
                                            {p.note && (
                                                <div className="text-xs text-slate-500 truncate">{p.note}</div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            {p.date_rappel_prevu ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(p.date_rappel_prevu).toLocaleDateString("fr-FR")}
                                                    </span>
                                                    {p.badge_retard_48h && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black w-fit">
                                                            <AlertTriangle className="w-3 h-3" /> Retard +48h
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Non planifié</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <select
                                                value={p.statut}
                                                onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                                            >
                                                <option value="A_RAPPELER">À RAPPELER</option>
                                                <option value="EN_DISCUSSION">EN DISCUSSION</option>
                                                <option value="INSCRIT">INSCRIT (Génère Commission)</option>
                                                <option value="PAS_INTERESSE">PAS INTÉRESSÉ</option>
                                                <option value="PERDU">PERDU</option>
                                            </select>
                                        </td>
                                        <td className="py-3.5 px-3 text-right">
                                            <button
                                                onClick={() => handleDeleteProspect(p.id)}
                                                title="Supprimer"
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* BLOC 4 & BLOC 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* BLOC 4 : Mes inscriptions récentes */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">
                                4. Mes 10 Dernières Inscriptions Propriétaires
                            </h2>
                            <p className="text-xs text-slate-500">
                                Propriétaires accompagnés et statut de vos commissions
                            </p>
                        </div>
                    </div>

                    {b4.length === 0 ? (
                        <div className="text-sm text-slate-400 py-8 text-center">
                            Aucune inscription récente enregistrée sous votre identifiant Champion.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {b4.map((ins: any) => (
                                <div key={ins.id} className="py-3 flex items-center justify-between text-sm">
                                    <div>
                                        <div className="font-bold text-slate-900">{ins.proprietaire_nom}</div>
                                        <div className="text-xs text-slate-500">{ins.description_logement}</div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                                ins.commission_declenchee
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : "bg-amber-100 text-amber-800"
                                            }`}
                                        >
                                            {ins.commission_declenchee
                                                ? `+${ins.montant_commission_fcfa} FCFA`
                                                : "En attente SMS"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* BLOC 5 : Mon classement dans ma zone (Anonymisé) */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">
                                5. Classement Champions — Zone {data?.champion?.zone_principale}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Classement anonymisé (Prénom + Initiale) mis à jour chaque nuit
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {b5.map((row: any) => (
                            <div
                                key={row.champion_id}
                                className={`py-3 px-3 rounded-xl flex items-center justify-between text-sm ${
                                    row.est_moi ? "bg-amber-50/90 border border-amber-200 font-black" : ""
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                                        #{row.rang}
                                    </span>
                                    <span className="text-slate-900">
                                        {row.nom_affiche}{" "}
                                        {row.marqueur_vous && (
                                            <span className="ml-1.5 px-2 py-0.5 rounded-md bg-[#C55A11] text-white text-[10px] font-black">
                                                {row.marqueur_vous}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-[#1F4E79]">
                                        {row.inscriptions_mois} inscr.
                                    </span>
                                    <span className="text-xs text-slate-500 ml-2">
                                        ({(row.commissions_mois_fcfa || 0).toLocaleString("fr-FR")} FCFA)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Ajout Prospect */}
            {showNewProspectModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-black text-slate-900">
                            Ajouter un Prospect Propriétaire
                        </h3>
                        <form onSubmit={handleAddProspect} className="space-y-3 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Nom ou surnom du propriétaire *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: M. Koné Moussa ou Tonton Bamba"
                                    value={form.nom}
                                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0708123456"
                                        value={form.telephone}
                                        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Quartier / Zone
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Yopougon Wassakara"
                                        value={form.quartier}
                                        onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Portes estimées
                                    </label>
                                    <select
                                        value={form.nb_logements_estime}
                                        onChange={(e) => setForm({ ...form, nb_logements_estime: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                                    >
                                        <option value="1-5">1 à 5 portes</option>
                                        <option value="6-15">6 à 15 portes (Cour commune)</option>
                                        <option value="16-30">16 à 30 portes</option>
                                        <option value="30+">Plus de 30 portes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Date de rappel prévue
                                    </label>
                                    <input
                                        type="date"
                                        value={form.date_rappel_prevu}
                                        onChange={(e) => setForm({ ...form, date_rappel_prevu: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Argument clé qui a retenu son attention
                                </label>
                                <input
                                    type="text"
                                    value={form.argument_cle}
                                    onChange={(e) => setForm({ ...form, argument_cle: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Note libre
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ex: Rappeler après la prière de vendredi..."
                                    value={form.note}
                                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewProspectModal(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-[#1F4E79] text-white font-black"
                                >
                                    {submitting ? "Enregistrement..." : "Enregistrer dans le carnet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

