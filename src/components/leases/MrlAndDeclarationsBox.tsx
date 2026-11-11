"use client";

import React, { useState } from "react";
import { TrendingUp, Receipt, CheckCircle2, XCircle, Plus, X, AlertCircle } from "lucide-react";
import {
    proposerRevisionLoyerAction,
    statuerDeclarationPaiementAction
} from "@/actions/mrl-paiement.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MrlAndDeclarationsBox({
    leaseId,
    currentRent,
    propositions = [],
    declarationsPaiement = []
}: {
    leaseId: string;
    currentRent: number;
    propositions?: any[];
    declarationsPaiement?: any[];
}) {
    const router = useRouter();
    const [mrlModal, setMrlModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Date d'effet par défaut : dans 3 mois + 1 jour (préavis légal CCH)
    const defaultDateEffet = new Date(Date.now() + 92 * 24 * 3600 * 1000).toISOString().split("T")[0];
    const [nouveauMontant, setNouveauMontant] = useState<number>(currentRent);
    const [dateEffet, setDateEffet] = useState<string>(defaultDateEffet);
    const [raison, setRaison] = useState<string>("Révision triennale conforme CCH / Travaux de valorisation");

    const handleCreateMrl = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await proposerRevisionLoyerAction({
                leaseId,
                nouveauMontant: Number(nouveauMontant),
                dateEffet,
                raison
            });
            if (res.success) {
                toast.success(res.message);
                setMrlModal(false);
                router.refresh();
            } else {
                toast.error(res.error || "Impossible de soumettre la proposition.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur inattendue.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatuerDeclaration = async (declarationId: string, decision: "CONFIRMER" | "CONTESTER") => {
        setLoading(true);
        try {
            const res = await statuerDeclarationPaiementAction({ declarationId, decision });
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error || "Erreur lors du traitement.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur inattendue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. DÉCLARATIONS DE PAIEMENT ALTERNATIF DU LOCATAIRE (ADD-26) */}
            {declarationsPaiement.length > 0 && (
                <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-amber-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                ADD-26 · Paiements Déclarés par le Locataire
                            </span>
                            <h3 className="text-base font-black text-slate-900 uppercase mt-1">
                                Déclarations « J&apos;ai payé autrement » ({declarationsPaiement.length})
                            </h3>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {declarationsPaiement.map((d: any) => (
                            <div
                                key={d.id}
                                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-sm text-slate-900">
                                            {Number(d.montant).toLocaleString("fr-FR")} XOF
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                            Mois : {d.mois}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold uppercase">
                                            {d.moyen}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Déclaré le {new Date(d.datePaiement || d.createdAt).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {d.statut === "DECLARE" ? (
                                        <>
                                            <button
                                                disabled={loading}
                                                onClick={() => handleStatuerDeclaration(d.id, "CONFIRMER")}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider"
                                            >
                                                <CheckCircle2 size={14} /> Confirmer & Émettre Quittance
                                            </button>
                                            <button
                                                disabled={loading}
                                                onClick={() => handleStatuerDeclaration(d.id, "CONTESTER")}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold uppercase"
                                            >
                                                <XCircle size={14} /> Non reçu
                                            </button>
                                        </>
                                    ) : (
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                d.statut === "CONFIRME"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                            }`}
                                        >
                                            {d.statut === "CONFIRME" ? "Confirmé (Quittance émise)" : "Contesté"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. RÉVISION DE LOYER MRL-01 & CONSENTEMENT LOCATAIRE */}
            <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Protocole MRL-01 · Révision Contractuelle du Loyer (Loi CCH)
                        </span>
                        <h3 className="text-base font-black text-slate-900 uppercase mt-0.5 flex items-center gap-2">
                            <TrendingUp size={18} className="text-amber-600" /> Révision de Loyer & Consentement
                        </h3>
                    </div>
                    <button
                        onClick={() => setMrlModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider"
                    >
                        <Plus size={14} /> Proposer une révision (MRL-01)
                    </button>
                </div>

                {propositions.length === 0 ? (
                    <p className="text-xs text-slate-500">
                        Aucune proposition de révision de loyer en cours. Toute modification du loyer requiert un préavis légal de 3 mois et le consentement explicite du locataire.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                        {propositions.map((p: any) => (
                            <div
                                key={p.id}
                                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {Number(p.montantActuel).toLocaleString("fr-FR")} XOF →{" "}
                                        <span className="text-amber-700 font-black">
                                            {Number(p.nouveauMontant).toLocaleString("fr-FR")} XOF
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        Date d&apos;effet : {new Date(p.dateEffet).toLocaleDateString("fr-FR")} · Motif :{" "}
                                        {p.raison || "Révision MRL-01"}
                                    </div>
                                    {p.motifNullite && (
                                        <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> Alerte CCH : {p.motifNullite}
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase self-start sm:self-center ${
                                        p.statut === "ACCEPTEE"
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : p.statut === "REFUSEE"
                                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                    }`}
                                >
                                    {p.statut === "EN_ATTENTE" ? "En attente locataire" : p.statut}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODALE MRL-01 */}
            {mrlModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <form
                        onSubmit={handleCreateMrl}
                        className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-black uppercase text-slate-900">
                                Proposer une révision de loyer (MRL-01)
                            </h4>
                            <button
                                type="button"
                                onClick={() => setMrlModal(false)}
                                className="text-slate-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                                <span className="text-slate-500">Loyer actuel :</span>
                                <span className="font-black text-slate-900">
                                    {Number(currentRent).toLocaleString("fr-FR")} XOF
                                </span>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nouveau loyer mensuel proposé (XOF) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={nouveauMontant}
                                    onChange={(e) => setNouveauMontant(Number(e.target.value))}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-sm"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Date d&apos;effet souhaitée (Préavis légal : 3 mois) *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={dateEffet}
                                    onChange={(e) => setDateEffet(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Justification / Motif de la révision *
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={raison}
                                    onChange={(e) => setRaison(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setMrlModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                            >
                                {loading ? "Transmission..." : "Soumettre au locataire"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

