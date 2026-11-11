"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Users,
    FileCheck,
    ShieldCheck,
    Plus,
    Download,
    ExternalLink,
    UserMinus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    MapPin
} from "lucide-react";
import {
    declarerOccupantWeb,
    cloturerOccupantWeb,
    genererAttestationResidenceWeb
} from "@/actions/occupants.actions";
import { toast } from "sonner";

const LIENS_FOYER = [
    { value: "CONJOINT", label: "Conjoint(e) / Époux(se)" },
    { value: "ENFANT", label: "Enfant" },
    { value: "PARENT", label: "Parent / Ascendant" },
    { value: "AUTRE_FAMILLE", label: "Autre membre de la famille" },
    { value: "COLOCATAIRE", label: "Colocataire" },
    { value: "HEBERGE", label: "Personne hébergée" },
    { value: "EMPLOYE_DOMESTIQUE", label: "Employé(e) domestique" }
];

export default function OccupantsClient({ initialData }: { initialData: any }) {
    const lease = initialData?.lease;
    const evaluation = initialData?.evaluation;
    const [occupants, setOccupants] = useState<any[]>(initialData?.occupants || []);
    const [attestations, setAttestations] = useState<any[]>(initialData?.attestations || []);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingAttestation, setLoadingAttestation] = useState(false);
    const [loadingOccupant, setLoadingOccupant] = useState(false);

    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        lien: "CONJOINT",
        mineur: false,
        telephone: "",
        dateNaissance: "",
        dateEntree: new Date().toISOString().split("T")[0],
        nni: ""
    });

    const activeOccupants = occupants.filter((o) => o.statut !== "CLOS" && !o.dateSortie);

    const handleGenererAttestation = async () => {
        if (!lease?.id) {
            toast.error("Aucun bail actif trouvé pour émettre une attestation.");
            return;
        }
        setLoadingAttestation(true);
        try {
            const res = await genererAttestationResidenceWeb(lease.id);
            if (res.success && res.attestation) {
                setAttestations([res.attestation, ...attestations]);
                toast.success(res.message);
            } else {
                toast.error(res.error || "Impossible de générer l'attestation.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la génération.");
        } finally {
            setLoadingAttestation(false);
        }
    };

    const handleAddOccupant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lease?.id) return;
        setLoadingOccupant(true);
        try {
            const res = await declarerOccupantWeb({
                leaseId: lease.id,
                ...form
            });
            if (res.success && res.occupant) {
                setOccupants([res.occupant, ...occupants]);
                setModalOpen(false);
                setForm({
                    nom: "",
                    prenoms: "",
                    lien: "CONJOINT",
                    mineur: false,
                    telephone: "",
                    dateNaissance: "",
                    dateEntree: new Date().toISOString().split("T")[0],
                    nni: ""
                });
                toast.success(res.message);
            } else {
                toast.error(res.error || "Erreur lors de la déclaration.");
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur inattendue.");
        } finally {
            setLoadingOccupant(false);
        }
    };

    const handleCloturer = async (id: string) => {
        const res = await cloturerOccupantWeb(id);
        if (res.success) {
            setOccupants(
                occupants.map((o) =>
                    o.id === id ? { ...o, statut: "CLOS", dateSortie: new Date().toISOString() } : o
                )
            );
            toast.success(res.message);
        } else {
            toast.error(res.error || "Impossible de clôturer cet occupant.");
        }
    };

    if (!lease) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h1 className="text-xl font-black text-slate-900 uppercase">
                    Aucun bail rattaché pour déclarer un foyer
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Vous devez disposer d&apos;un contrat de bail actif ou déclaratif sur QAPRIL pour gérer les occupants de votre logement et télécharger une Attestation de Résidence officielle.
                </p>
                <Link
                    href="/mon-espace-locataire/valider-bail"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                    Valider un contrat de bail
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24">
            {/* EN-TÊTE INSTITUTIONNEL ADD-29 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck size={14} /> Module ADD-29 · Domiciliation & Occupants
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Foyer & Attestation de Résidence
                    </h1>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin size={14} className="text-amber-600 shrink-0" />
                        <span>
                            {lease.property?.name || "Logement"} — {lease.property?.commune}, {lease.property?.address} ({lease.leaseReference})
                        </span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                        <Plus size={15} /> Déclarer un Occupant ({activeOccupants.length}/10)
                    </button>
                    <button
                        onClick={handleGenererAttestation}
                        disabled={loadingAttestation}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                    >
                        {loadingAttestation ? (
                            <>
                                <Loader2 size={15} className="animate-spin" /> Émission...
                            </>
                        ) : (
                            <>
                                <FileCheck size={15} /> Générer mon Attestation (PDF)
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* NIVEAU DE PREUVE LÉGAL (A / B / C) */}
            {evaluation && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Force Probante APBEF-CI / Administrations (RG-OCC-11)
                        </span>
                        <h2 className="text-lg font-black uppercase tracking-tight">
                            Votre éligibilité actuelle : Niveau {evaluation.niveau} ({evaluation.qualite})
                        </h2>
                        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                            {evaluation.motif}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-center">
                            <div className="text-2xl font-black text-emerald-400">NIVEAU {evaluation.niveau}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
                                Validité 3 mois
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* COLONNE GAUCHE : OCCUPANTS DU FOYER */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Users size={17} className="text-slate-700" /> Occupants Déclarés du Foyer
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Plafond réglementaire : 10 personnes maximum par logement (RG-OCC-04).
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black">
                                {activeOccupants.length} / 10 actifs
                            </span>
                        </div>

                        {occupants.length === 0 ? (
                            <div className="py-12 text-center space-y-3">
                                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="text-xs font-bold text-slate-500">
                                    Aucun occupant rattaché pour le moment.
                                </p>
                                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                    Déclarez votre conjoint(e), vos enfants ou les personnes hébergées afin qu&apos;ils puissent bénéficier d&apos;une attestation de domicile rattachée à votre bail.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {occupants.map((occ) => (
                                    <div
                                        key={occ.id}
                                        className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                            occ.statut === "CLOS" ? "opacity-50" : ""
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm text-slate-900">
                                                    {occ.nom} {occ.prenoms}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                                    {occ.lien}
                                                </span>
                                                {occ.mineur && (
                                                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-black uppercase">
                                                        Mineur
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                                                <span>
                                                    Entrée : {new Date(occ.dateEntree).toLocaleDateString("fr-FR")}
                                                </span>
                                                {occ.telephone && <span>Tél : {occ.telephone}</span>}
                                                <span className="font-mono text-[10px] text-slate-400">
                                                    SHA-256 : {occ.declarationSha256?.slice(0, 10)}...
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    occ.statut === "CONFIRME"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : occ.statut === "CLOS"
                                                        ? "bg-slate-100 text-slate-500"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                                }`}
                                            >
                                                {occ.statut}
                                            </span>
                                            {occ.statut !== "CLOS" && (
                                                <button
                                                    onClick={() => handleCloturer(occ.id)}
                                                    title="Déclarer le départ du foyer"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                >
                                                    <UserMinus size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLONNE DROITE : ATTESTATIONS DE RÉSIDENCE ÉMISES */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <FileCheck size={17} className="text-emerald-600" /> Mes Attestations de Résidence
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Documents officiels horodatés avec QR de vérification publique.
                            </p>
                        </div>

                        {attestations.length === 0 ? (
                            <div className="py-10 text-center space-y-2">
                                <p className="text-xs font-bold text-slate-500">Aucune attestation générée.</p>
                                <p className="text-[11px] text-slate-400">
                                    Cliquez sur « Générer mon Attestation (PDF) » en haut à droite pour obtenir votre justificatif de domicile immédiat.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attestations.map((att) => (
                                    <div
                                        key={att.id}
                                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-black text-slate-900">
                                                {att.numero}
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                                                Niveau {att.niveau} · {att.statut}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 space-y-1">
                                            <div>
                                                Émise le {new Date(att.emiseAt).toLocaleDateString("fr-FR")} · Valide jusqu&apos;au{" "}
                                                <strong className="text-slate-700">
                                                    {new Date(att.valideJusque).toLocaleDateString("fr-FR")}
                                                </strong>
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400 truncate">
                                                SHA-256 : {att.sha256}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            {att.pdfUrl && (
                                                <a
                                                    href={att.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider"
                                                >
                                                    <Download size={13} /> Télécharger PDF
                                                </a>
                                            )}
                                            <Link
                                                href={`/verif/attestation/${att.tokenVerif}`}
                                                target="_blank"
                                                className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold"
                                            >
                                                <ExternalLink size={13} /> Vérifier
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALE DÉCLARATION OCCUPANT */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase">
                                    Déclarer un Occupant du Foyer
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Rattachement officiel à votre bail {lease.leaseReference}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddOccupant} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Nom de famille *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.nom}
                                        onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                        placeholder="Ex: KOUASSI"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Prénoms *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.prenoms}
                                        onChange={(e) => setForm({ ...form, prenoms: e.target.value })}
                                        placeholder="Ex: Aya Marie"
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Lien avec le titulaire
                                    </label>
                                    <select
                                        value={form.lien}
                                        onChange={(e) => setForm({ ...form, lien: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold bg-white"
                                    >
                                        {LIENS_FOYER.map((l) => (
                                            <option key={l.value} value={l.value}>
                                                {l.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Date d&apos;entrée dans le logement
                                    </label>
                                    <input
                                        type="date"
                                        value={form.dateEntree}
                                        onChange={(e) => setForm({ ...form, dateEntree: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Téléphone (optionnel)
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.telephone}
                                        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                        placeholder="+225 07..."
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        N° CNI / NNI (optionnel, haché SHA-256)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.nni}
                                        onChange={(e) => setForm({ ...form, nni: e.target.value })}
                                        placeholder="CI00..."
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.mineur}
                                    onChange={(e) => setForm({ ...form, mineur: e.target.checked })}
                                    className="w-4 h-4 rounded text-slate-900"
                                />
                                <span className="text-xs font-bold text-slate-700">
                                    Cet occupant est un enfant mineur à charge (validation immédiate par le titulaire)
                                </span>
                            </label>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingOccupant}
                                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                >
                                    {loadingOccupant ? "Enregistrement..." : "Valider la déclaration"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

