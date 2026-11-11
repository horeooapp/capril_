"use client";

import React, { useState } from "react";
import { Clock, ShieldCheck, AlertTriangle, CheckCircle2, History, Edit3, X } from "lucide-react";
import {
    confirmerEtatOuvertureBail,
    rectifierEtatOuvertureBail
} from "@/actions/reprise-bail.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeuxHorlogesBox({
    lease,
    role
}: {
    lease: any;
    role: "LANDLORD" | "TENANT";
}) {
    const router = useRouter();
    const opening = lease?.openingState;
    const rentHistory: any[] = lease?.historiqueLoyers || [];
    const isReprise = Boolean(opening || lease?.importMode || lease?.origineBail === "REPRISE" || lease?.isReprise);

    const [loading, setLoading] = useState(false);
    const [contestModal, setContestModal] = useState(false);
    const [rectifyModal, setRectifyModal] = useState(false);
    const [motifContestation, setMotifContestation] = useState("");
    const [scoreConsent, setScoreConsent] = useState(Boolean(lease?.scoreConsent));

    const [rectifyForm, setRectifyForm] = useState({
        loyerEnVigueur: opening?.loyerEnVigueur || lease?.rentAmount || 0,
        chargesEnVigueur: opening?.chargesEnVigueur || lease?.chargesAmount || 0,
        soldeOuverture: opening?.soldeOuverture || 0,
        dernierMoisPaye: opening?.dernierMoisPaye || ""
    });

    if (!isReprise && rentHistory.length === 0) return null;

    const handleConfirmOpening = async (decision: "CONFIRMER" | "CONTESTER") => {
        if (decision === "CONTESTER" && !motifContestation.trim()) {
            toast.error("Veuillez préciser le motif de contestation du solde d'ouverture.");
            return;
        }
        setLoading(true);
        try {
            const res = await confirmerEtatOuvertureBail({
                leaseId: lease.id,
                decision,
                motifContestation: decision === "CONTESTER" ? motifContestation.trim() : undefined,
                scoreConsent
            });
            if (res.success) {
                toast.success(
                    decision === "CONFIRMER"
                        ? "État d'ouverture contradictoire confirmé et scellé SHA-256 !"
                        : "Contestation enregistrée. Le solde d'ouverture est gelé et le bail continue en gestion courante."
                );
                setContestModal(false);
                router.refresh();
            } else {
                toast.error(res.error || "Erreur lors de la validation.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur inattendue.");
        } finally {
            setLoading(false);
        }
    };

    const handleRectify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await rectifierEtatOuvertureBail({
                leaseId: lease.id,
                loyerEnVigueur: Number(rectifyForm.loyerEnVigueur),
                chargesEnVigueur: Number(rectifyForm.chargesEnVigueur),
                soldeOuverture: Number(rectifyForm.soldeOuverture),
                dernierMoisPaye: rectifyForm.dernierMoisPaye || null
            });
            if (res.success) {
                toast.success(`État d'ouverture rectifié (Version v${res.version}) et re-soumis au locataire.`);
                setRectifyModal(false);
                router.refresh();
            } else {
                toast.error(res.error || "Impossible de rectifier l'état d'ouverture.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la rectification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full mb-1">
                        <Clock size={12} /> Protocole Deux Horloges (Reprise de Bail Antérieur)
                    </div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                        Horloge Contractuelle & État d&apos;Ouverture Contradictoire
                    </h3>
                </div>

                {opening && (
                    <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            opening.statut === "CONFIRME"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : opening.statut === "CONTESTE"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                    >
                        État v{opening.version || 1} : {opening.statut}
                    </span>
                )}
            </div>

            {/* LES DEUX HORLOGES CÔTE À CÔTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Horloge 1 : Contractuelle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-700" /> 1. Horloge Contractuelle (Origine)
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Entrée d&apos;origine :</span>
                            <span className="font-bold">
                                {new Date(lease.dateEntreeReelle || lease.startDate).toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Reconduction tacite :</span>
                            <span className="font-bold">
                                {lease.enReconductionTacite ? "Oui (En cours)" : "Période initiale"}
                            </span>
                        </div>
                        {lease.prochaineEcheanceContractuelle && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Prochaine échéance :</span>
                                <span className="font-bold">
                                    {new Date(lease.prochaineEcheanceContractuelle).toLocaleDateString("fr-FR")}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-500">Régime applicable :</span>
                            <span className="font-semibold text-right truncate max-w-[180px]">
                                {lease.loiApplicable || "Loi CCH n°2019-576"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Horloge 2 : Gestion QAPRIL */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-800 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-indigo-600" /> 2. Horloge de Gestion QAPRIL
                    </div>
                    <div className="text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date de reprise QAPRIL :</span>
                            <span className="font-bold">
                                {opening?.dateReprise
                                    ? new Date(opening.dateReprise).toLocaleDateString("fr-FR")
                                    : lease.dateReprise
                                    ? new Date(lease.dateReprise).toLocaleDateString("fr-FR")
                                    : "Dès création"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Dernier mois payé (hors QAPRIL) :</span>
                            <span className="font-mono font-bold">{opening?.dernierMoisPaye || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Arriéré d&apos;ouverture (Pré-QAPRIL) :</span>
                            <span className="font-black text-slate-900">
                                {Number(opening?.soldeOuverture || 0).toLocaleString("fr-FR")} XOF
                            </span>
                        </div>
                        {opening?.hashSha256 && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Preuve SHA-256 :</span>
                                <span className="font-mono text-[10px] text-indigo-700">
                                    {opening.hashSha256.slice(0, 14)}...
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MOTIF DE CONTESTATION SI CONTESTÉ */}
            {opening?.statut === "CONTESTE" && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                    <div>
                        <p className="font-black uppercase">Solde d&apos;ouverture contesté — Recouvrement antérieur gelé</p>
                        <p className="mt-0.5">
                            Motif : {opening.motifContestation || "Désaccord sur le solde antérieur à QAPRIL"}. Le bail fonctionne en gestion courante sans pénalité sur le passé.
                        </p>
                    </div>
                </div>
            )}

            {/* HISTORIQUE DES PALIERS DE LOYERS (LeaseRentHistory) */}
            {rentHistory.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <History size={14} /> Historique des Paliers & Révisions de Loyer
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                        {rentHistory.map((h: any) => (
                            <div key={h.id} className="p-3 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <span className="font-bold text-slate-700">
                                        {Number(h.ancienLoyer).toLocaleString("fr-FR")} XOF →{" "}
                                        <strong className="text-slate-900">
                                            {Number(h.nouveauLoyer).toLocaleString("fr-FR")} XOF
                                        </strong>
                                    </span>
                                    <span className="text-slate-400 ml-2">({h.motif || h.sourceModification})</span>
                                </div>
                                <span className="text-[11px] font-mono text-slate-500">
                                    Effet : {new Date(h.effectiveLe).toLocaleDateString("fr-FR")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIONS SELON LE RÔLE */}
            {opening && role === "TENANT" && opening.statut === "EN_ATTENTE" && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={scoreConsent}
                            onChange={(e) => setScoreConsent(e.target.checked)}
                            className="rounded text-slate-900"
                        />
                        <span>
                            J&apos;accepte l&apos;activation de mon Score de Confiance Locatif (ICL) à compter de la date de reprise QAPRIL (sans impact rétroactif).
                        </span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <button
                            disabled={loading}
                            onClick={() => handleConfirmOpening("CONFIRMER")}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                        >
                            <CheckCircle2 size={15} /> Confirmer l&apos;état d&apos;ouverture
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => setContestModal(true)}
                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black uppercase tracking-wider"
                        >
                            Contester le solde antérieur
                        </button>
                    </div>
                </div>
            )}

            {opening && role === "LANDLORD" && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={() => setRectifyModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                        <Edit3 size={13} /> Rectifier l&apos;état d&apos;ouverture (v{(opening.version || 1) + 1})
                    </button>
                </div>
            )}

            {/* MODALE CONTESTATION LOCATAIRE */}
            {contestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase text-slate-900">
                                Contester l&apos;état d&apos;ouverture
                            </h4>
                            <button onClick={() => setContestModal(false)} className="text-slate-400">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            En cas de contestation, l&apos;arriéré pré-QAPRIL est gelé (aucune procédure automatique) et votre bail fonctionne normalement pour les loyers courants.
                        </p>
                        <textarea
                            rows={3}
                            value={motifContestation}
                            onChange={(e) => setMotifContestation(e.target.value)}
                            placeholder="Précisez le motif (ex: loyer d'octobre déjà réglé en espèces, reçu disponible)..."
                            className="w-full p-3 border border-slate-200 rounded-xl text-xs"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setContestModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleConfirmOpening("CONTESTER")}
                                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black uppercase"
                            >
                                Enregistrer la contestation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE RECTIFICATION BAILLEUR */}
            {rectifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <form
                        onSubmit={handleRectify}
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase text-slate-900">
                                Rectifier l&apos;état d&apos;ouverture
                            </h4>
                            <button
                                type="button"
                                onClick={() => setRectifyModal(false)}
                                className="text-slate-400"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">Loyer en vigueur (FCFA)</label>
                                <input
                                    type="number"
                                    value={rectifyForm.loyerEnVigueur}
                                    onChange={(e) =>
                                        setRectifyForm({ ...rectifyForm, loyerEnVigueur: Number(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Solde d&apos;ouverture pré-QAPRIL (FCFA)
                                </label>
                                <input
                                    type="number"
                                    value={rectifyForm.soldeOuverture}
                                    onChange={(e) =>
                                        setRectifyForm({ ...rectifyForm, soldeOuverture: Number(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-600 mb-1">
                                    Dernier mois payé hors QAPRIL (YYYY-MM)
                                </label>
                                <input
                                    type="month"
                                    value={rectifyForm.dernierMoisPaye}
                                    onChange={(e) =>
                                        setRectifyForm({ ...rectifyForm, dernierMoisPaye: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRectifyModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase"
                            >
                                Publier la nouvelle version
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

