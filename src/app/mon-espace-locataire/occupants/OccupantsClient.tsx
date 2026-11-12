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
    MapPin,
    Calendar,
    Clock,
    Home,
    Phone,
    Shield,
    HeartHandshake,
    Eye,
    FileText,
    Info,
    Check
} from "lucide-react";
import {
    declarerOccupantWeb,
    cloturerOccupantWeb,
    genererAttestationResidenceWeb
} from "@/actions/occupants.actions";
import { toast } from "sonner";

const LIENS_FOYER = [
    { value: "CONJOINT", label: "Conjoint(e) / Époux(se)", desc: "Vie maritale ou union légale" },
    { value: "ENFANT", label: "Enfant du titulaire", desc: "Filiation directe ou enfant à charge" },
    { value: "PARENT", label: "Parent / Ascendant", desc: "Père, mère, grand-parent" },
    { value: "AUTRE_FAMILLE", label: "Autre membre de la famille", desc: "Frère, sœur, neveu, cousin(e)..." },
    { value: "COLOCATAIRE", label: "Colocataire déclaré", desc: "Partage officiel du logement" },
    { value: "HEBERGE", label: "Personne hébergée / Invité", desc: "Accueil à titre gracieux ou temporaire" },
    { value: "EMPLOYE_DOMESTIQUE", label: "Personnel de maison résident", desc: "Aide ménagère, gardiennage, chauffeur" }
];

const MOTIFS_ARRIVEE = [
    { value: "REGROUPEMENT_FAMILIAL", label: "Regroupement familial / Vie commune", badge: "Famille" },
    { value: "ETUDES_FORMATION", label: "Études supérieures / Scolarité / Stage étudiant", badge: "Études" },
    { value: "STAGE_EMPLOI", label: "Mission professionnelle / Nouvel emploi", badge: "Professionnel" },
    { value: "VACANCES_VISITE", label: "Séjour familial / Vacances / Visite temporaire", badge: "Visite" },
    { value: "SANTE_CONVALESCENCE", label: "Soins médicaux / Convalescence", badge: "Santé" },
    { value: "ASSISTANCE_FAMILIALE", label: "Assistance parentale / Garde d'enfants", badge: "Assistance" },
    { value: "AUTRE", label: "Autre situation personnelle", badge: "Personnel" }
];

const ESPACES_OCCUPES = [
    { value: "CHAMBRE_INDIVIDUELLE", label: "Chambre individuelle dédiée" },
    { value: "ESPACE_PARTAGE", label: "Chambre / Espace partagé" },
    { value: "LOGEMENT_ENTIER", label: "Ensemble du logement" }
];

const TYPES_PIECES = [
    { value: "CNI", label: "Carte Nationale d'Identité (CNI)" },
    { value: "PASSEPORT", label: "Passeport biométrique" },
    { value: "EXTRAIT_NAISSANCE", label: "Extrait d'acte de naissance (Mineurs)" },
    { value: "CARTE_CONSULAIRE", label: "Carte consulaire / Titre de séjour" },
    { value: "ATTESTATION_IDENTITE", label: "Attestation d'identité / Autre pièce" }
];

function parseOccupantMetadata(occ: any) {
    if (!occ?.motifDesaccord) return null;
    try {
        if (typeof occ.motifDesaccord === "string" && occ.motifDesaccord.startsWith("{")) {
            return JSON.parse(occ.motifDesaccord);
        }
        return { motifPrecision: String(occ.motifDesaccord) };
    } catch {
        return { motifPrecision: String(occ.motifDesaccord) };
    }
}

export default function OccupantsClient({ initialData }: { initialData: any }) {
    const lease = initialData?.lease;
    const evaluation = initialData?.evaluation;
    const [occupants, setOccupants] = useState<any[]>(initialData?.occupants || []);
    const [attestations, setAttestations] = useState<any[]>(initialData?.attestations || []);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailModalOccupant, setDetailModalOccupant] = useState<any | null>(null);
    const [loadingAttestation, setLoadingAttestation] = useState(false);
    const [loadingOccupant, setLoadingOccupant] = useState(false);

    const [form, setForm] = useState({
        nom: "",
        prenoms: "",
        sexe: "M",
        lien: "CONJOINT",
        mineur: false,
        telephone: "",
        dateNaissance: "",
        dateEntree: new Date().toISOString().split("T")[0],
        dateSortie: "",
        typeSejour: "PERMANENT", // PERMANENT | TEMPORAIRE
        dureePreset: "indeterminee",
        motifArrivee: "REGROUPEMENT_FAMILIAL",
        motifPrecision: "",
        espaceOccupe: "CHAMBRE_INDIVIDUELLE",
        priseEnCharge: "CHARGE_TITULAIRE",
        contactUrgenceNom: "",
        contactUrgenceTel: "",
        pieceIdentiteType: "CNI",
        nni: "",
        observations: ""
    });

    const activeOccupants = occupants.filter((o) => o.statut !== "CLOS" && !o.dateSortie);

    // Calcul de la date de départ en fonction d'un raccourci de jours
    const applyDurationPreset = (days: number | null, presetKey: string) => {
        if (days === null) {
            setForm((prev) => ({
                ...prev,
                typeSejour: "PERMANENT",
                dateSortie: "",
                dureePreset: presetKey
            }));
            return;
        }

        const base = form.dateEntree ? new Date(form.dateEntree) : new Date();
        const future = new Date(base.getTime() + days * 24 * 3600 * 1000);
        const y = future.getFullYear();
        const m = String(future.getMonth() + 1).padStart(2, "0");
        const d = String(future.getDate()).padStart(2, "0");

        setForm((prev) => ({
            ...prev,
            typeSejour: "TEMPORAIRE",
            dateSortie: `${y}-${m}-${d}`,
            dureePreset: presetKey
        }));
    };

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
                nom: form.nom,
                prenoms: form.prenoms,
                sexe: form.sexe,
                lien: form.lien,
                mineur: form.mineur,
                telephone: form.telephone || undefined,
                dateNaissance: form.dateNaissance || undefined,
                dateEntree: form.dateEntree,
                dateSortie: form.typeSejour === "TEMPORAIRE" && form.dateSortie ? form.dateSortie : undefined,
                typeSejour: form.typeSejour,
                motifArrivee: form.motifArrivee,
                motifPrecision: form.motifPrecision || undefined,
                espaceOccupe: form.espaceOccupe,
                priseEnCharge: form.priseEnCharge,
                contactUrgenceNom: form.contactUrgenceNom || undefined,
                contactUrgenceTel: form.contactUrgenceTel || undefined,
                pieceIdentiteType: form.pieceIdentiteType,
                nni: form.nni || undefined,
                observations: form.observations || undefined
            });

            if (res.success && res.occupant) {
                setOccupants([res.occupant, ...occupants]);
                setModalOpen(false);
                setForm({
                    nom: "",
                    prenoms: "",
                    sexe: "M",
                    lien: "CONJOINT",
                    mineur: false,
                    telephone: "",
                    dateNaissance: "",
                    dateEntree: new Date().toISOString().split("T")[0],
                    dateSortie: "",
                    typeSejour: "PERMANENT",
                    dureePreset: "indeterminee",
                    motifArrivee: "REGROUPEMENT_FAMILIAL",
                    motifPrecision: "",
                    espaceOccupe: "CHAMBRE_INDIVIDUELLE",
                    priseEnCharge: "CHARGE_TITULAIRE",
                    contactUrgenceNom: "",
                    contactUrgenceTel: "",
                    pieceIdentiteType: "CNI",
                    nni: "",
                    observations: ""
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
        if (!confirm("Confirmez-vous le départ définitif de cet occupant du logement ?")) return;
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
            <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4 bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h1 className="text-xl font-bold text-slate-900">
                    Aucun bail rattaché pour déclarer un foyer
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Vous devez disposer d&apos;un contrat de bail actif ou déclaratif sur QAPRIL pour gérer les occupants de votre logement et télécharger une Attestation de Résidence officielle.
                </p>
                <Link
                    href="/mon-espace-locataire/valider-bail"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                    Valider un contrat de bail
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24">
            {/* EN-TÊTE INSTITUTIONNEL ADD-29 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                            Bail {lease.leaseReference}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 flex items-center gap-1.5">
                            <ShieldCheck size={13} />
                            Foyer certifié ADD-29
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Occupants &amp; Foyer du Logement
                    </h1>
                    <p className="text-sm text-slate-600 max-w-2xl">
                        Déclarez les membres permanents de votre foyer et vos invités hébergés avec les conditions précises de leur arrivée, la durée de leur séjour et leurs motifs légitimes.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                        <Plus size={16} />
                        Déclarer un occupant ou invité
                    </button>
                    <button
                        onClick={handleGenererAttestation}
                        disabled={loadingAttestation}
                        className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                        {loadingAttestation ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Génération...
                            </>
                        ) : (
                            <>
                                <FileCheck size={16} />
                                Mon Attestation de Résidence
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* GRILLE PRINCIPALE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* COLONNE GAUCHE : LISTE DES OCCUPANTS & CONDITIONS DE SÉJOUR */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Users size={18} className="text-slate-700" />
                                    Membres du Foyer &amp; Personnes Hébergées
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Rattachés au logement ({lease.property?.name || lease.property?.address || "Bien loué"})
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                                {activeOccupants.length} actif{activeOccupants.length > 1 ? "s" : ""}
                            </span>
                        </div>

                        {occupants.length === 0 ? (
                            <div className="py-12 text-center space-y-3">
                                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="text-sm font-semibold text-slate-700">
                                    Aucun occupant rattaché pour le moment.
                                </p>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Déclarez votre conjoint(e), vos enfants ou les personnes hébergées avec les dates d&apos;arrivée et de départ pour générer leurs attestations de résidence.
                                </p>
                                <button
                                    onClick={() => setModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold mt-2"
                                >
                                    <Plus size={14} /> Déclarer maintenant
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {occupants.map((occ) => {
                                    const meta = parseOccupantMetadata(occ);
                                    const isClosed = occ.statut === "CLOS" || occ.dateSortie && new Date(occ.dateSortie) < new Date();
                                    const motifObj = MOTIFS_ARRIVEE.find((m) => m.value === meta?.motifArrivee);
                                    const lienObj = LIENS_FOYER.find((l) => l.value === occ.lien);

                                    return (
                                        <div
                                            key={occ.id}
                                            className={`py-4 transition-colors ${isClosed ? "opacity-60" : ""}`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {occ.nom} {occ.prenoms}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold">
                                                            {lienObj?.label || occ.lien}
                                                        </span>
                                                        {occ.mineur && (
                                                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-semibold">
                                                                Enfant mineur
                                                            </span>
                                                        )}
                                                        {motifObj && (
                                                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                                                                {motifObj.badge} : {motifObj.label.split("/")[0]}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* CONDITIONS DE SÉJOUR & ARRIVÉE */}
                                                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-slate-400" />
                                                            Arrivée : {new Date(occ.dateEntree).toLocaleDateString("fr-FR")}
                                                        </span>
                                                        {occ.dateSortie ? (
                                                            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                                                                <Clock size={13} className="text-amber-600" />
                                                                Départ prévu : {new Date(occ.dateSortie).toLocaleDateString("fr-FR")}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                                                                <Home size={13} className="text-slate-400" />
                                                                Résidence continue
                                                            </span>
                                                        )}
                                                        {occ.telephone && (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Phone size={13} className="text-slate-400" />
                                                                {occ.telephone}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* PRÉCISION MOTIF */}
                                                    {meta?.motifPrecision && (
                                                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-150 mt-1.5">
                                                            « {meta.motifPrecision} »
                                                        </p>
                                                    )}
                                                </div>

                                                {/* ACTIONS OCCUPANT */}
                                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                    <button
                                                        onClick={() => setDetailModalOccupant(occ)}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                                                        title="Consulter la fiche complète"
                                                    >
                                                        <Eye size={13} />
                                                        Fiche
                                                    </button>
                                                    {!isClosed && (
                                                        <button
                                                            onClick={() => handleCloturer(occ.id)}
                                                            title="Enregistrer le départ définitif"
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        >
                                                            <UserMinus size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLONNE DROITE : ATTESTATIONS DE RÉSIDENCE ÉMISES */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck size={18} className="text-emerald-700" />
                                Attestations de Résidence Émises
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Justificatifs officiels scellés avec QR de vérification républicaine.
                            </p>
                        </div>

                        {attestations.length === 0 ? (
                            <div className="py-10 text-center space-y-2">
                                <p className="text-xs font-semibold text-slate-600">Aucune attestation générée.</p>
                                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                    Générez un justificatif de domicile certifié à présenter aux banques, mairies et démarches administratives.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attestations.map((att) => (
                                    <div
                                        key={att.id}
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        Attestation Niveau {att.niveau}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                                        {att.qualite}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    Émise le {new Date(att.emiseAt).toLocaleDateString("fr-FR")}
                                                </p>
                                            </div>
                                            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                                {att.tokenVerif}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            {att.pdfUrl && (
                                                <a
                                                    href={att.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                                                >
                                                    <Download size={13} /> Télécharger PDF
                                                </a>
                                            )}
                                            <Link
                                                href={`/verif/attestation/${att.tokenVerif}`}
                                                target="_blank"
                                                className="inline-flex items-center justify-center gap-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
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

            {/* MODALE PREMIUM DE DÉCLARATION D'OCCUPANT (ADD-29) */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                    Norme ADD-29 · Foyer &amp; Hébergement
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-2">
                                    Déclarer un Occupant ou Invité du Logement
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Rattachement certifié au contrat de bail {lease.leaseReference}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                                aria-label="Fermer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddOccupant} className="space-y-6">
                            {/* SECTION 1 : IDENTITÉ CIVILE */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Users size={14} className="text-slate-500" />
                                    1. Identité Civile de l&apos;Occupant
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Nom de famille *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.nom}
                                            onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                            placeholder="Ex: KOUASSI"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Prénoms complets *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.prenoms}
                                            onChange={(e) => setForm({ ...form, prenoms: e.target.value })}
                                            placeholder="Ex: Aya Marie-Josée"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Sexe
                                        </label>
                                        <select
                                            value={form.sexe}
                                            onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                        >
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Date de naissance
                                        </label>
                                        <input
                                            type="date"
                                            value={form.dateNaissance}
                                            onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Téléphone personnel
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.telephone}
                                            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                                            placeholder="+225 07..."
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Type de pièce d&apos;identité
                                        </label>
                                        <select
                                            value={form.pieceIdentiteType}
                                            onChange={(e) => setForm({ ...form, pieceIdentiteType: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                        >
                                            {TYPES_PIECES.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Numéro de pièce (haché SHA-256)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.nni}
                                            onChange={(e) => setForm({ ...form, nni: e.target.value })}
                                            placeholder="Ex: C0123456789"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium font-mono"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.mineur}
                                        onChange={(e) => setForm({ ...form, mineur: e.target.checked })}
                                        className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                                    />
                                    <span className="text-xs font-medium text-slate-700">
                                        Cet occupant est un enfant mineur à charge (rattachement direct sans obligation de numéro de téléphone)
                                    </span>
                                </label>
                            </div>

                            {/* SECTION 2 : LIEN DE PARENTÉ */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <HeartHandshake size={14} className="text-slate-500" />
                                    2. Lien avec le Titulaire du Logement
                                </h4>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Qualité au sein du foyer *
                                    </label>
                                    <select
                                        value={form.lien}
                                        onChange={(e) => setForm({ ...form, lien: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                    >
                                        {LIENS_FOYER.map((l) => (
                                            <option key={l.value} value={l.value}>
                                                {l.label} — {l.desc}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* SECTION 3 : CONDITIONS D'ARRIVÉE & DURÉE DU SÉJOUR */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Clock size={14} className="text-slate-500" />
                                    3. Conditions d&apos;Arrivée &amp; Durée du Séjour
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Type de séjour
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm({ ...form, typeSejour: "PERMANENT", dateSortie: "" });
                                                }}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                                    form.typeSejour === "PERMANENT"
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                Résidence continue
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm({ ...form, typeSejour: "TEMPORAIRE" });
                                                    if (!form.dateSortie) applyDurationPreset(90, "3m");
                                                }}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                                                    form.typeSejour === "TEMPORAIRE"
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                }`}
                                            >
                                                Séjour temporaire / Invité
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Date d&apos;arrivée effective *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={form.dateEntree}
                                            onChange={(e) => setForm({ ...form, dateEntree: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                {form.typeSejour === "TEMPORAIRE" && (
                                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <label className="text-xs font-bold text-amber-900">
                                                Durée prévue du séjour &amp; Date de départ :
                                            </label>
                                            <span className="text-[11px] text-amber-800">
                                                {form.dateSortie
                                                    ? `Départ le ${new Date(form.dateSortie).toLocaleDateString("fr-FR")}`
                                                    : "Sélectionnez une durée"}
                                            </span>
                                        </div>

                                        {/* Raccourcis de durée */}
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { key: "15j", label: "15 jours", days: 15 },
                                                { key: "1m", label: "1 mois (30j)", days: 30 },
                                                { key: "3m", label: "3 mois (90j)", days: 90 },
                                                { key: "6m", label: "6 mois", days: 180 },
                                                { key: "1an", label: "1 an", days: 365 },
                                            ].map((p) => (
                                                <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={() => applyDurationPreset(p.days, p.key)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                        form.dureePreset === p.key
                                                            ? "bg-amber-900 text-white border-amber-900"
                                                            : "bg-white text-amber-900 border-amber-300 hover:bg-amber-100/50"
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                Ou ajuster manuellement la date de départ prévue :
                                            </label>
                                            <input
                                                type="date"
                                                value={form.dateSortie}
                                                onChange={(e) =>
                                                    setForm({ ...form, dateSortie: e.target.value, dureePreset: "custom" })
                                                }
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Motif officiel de l&apos;arrivée / du séjour *
                                    </label>
                                    <select
                                        value={form.motifArrivee}
                                        onChange={(e) => setForm({ ...form, motifArrivee: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                    >
                                        {MOTIFS_ARRIVEE.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Précisions sur les conditions d&apos;accueil (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.motifPrecision}
                                        onChange={(e) => setForm({ ...form, motifPrecision: e.target.value })}
                                        placeholder="Ex: Vient préparer son master à l'Université FHB d'Abidjan..."
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* SECTION 4 : LOGISTIQUE DU LOGEMENT & URGENCE */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Home size={14} className="text-slate-500" />
                                    4. Espace Occupé &amp; Contact d&apos;Urgence
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Espace / Chambre occupée
                                        </label>
                                        <select
                                            value={form.espaceOccupe}
                                            onChange={(e) => setForm({ ...form, espaceOccupe: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                        >
                                            {ESPACES_OCCUPES.map((e) => (
                                                <option key={e.value} value={e.value}>
                                                    {e.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Prise en charge financière
                                        </label>
                                        <select
                                            value={form.priseEnCharge}
                                            onChange={(e) => setForm({ ...form, priseEnCharge: e.target.value })}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-white"
                                        >
                                            <option value="CHARGE_TITULAIRE">À la charge complète du titulaire du bail</option>
                                            <option value="AUTONOME">Autonome financièrement</option>
                                            <option value="PARTICIPATION">Participation aux charges communes</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Contact d&apos;urgence (Nom)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.contactUrgenceNom}
                                            onChange={(e) => setForm({ ...form, contactUrgenceNom: e.target.value })}
                                            placeholder="Ex: M. KOUASSI Jean (Oncle)"
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Téléphone d&apos;urgence
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.contactUrgenceTel}
                                            onChange={(e) => setForm({ ...form, contactUrgenceTel: e.target.value })}
                                            placeholder="+225 01..."
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ENGAGEMENT SUR L'HONNEUR & SUBMIT */}
                            <div className="pt-2 border-t border-slate-100 space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                    <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                                    <span>
                                        En validant, je certifie sur l&apos;honneur l&apos;exactitude des informations fournies sur cet occupant. Un scellé cryptographique SHA-256 sera généré et rattaché au contrat de bail.
                                    </span>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loadingOccupant}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loadingOccupant ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                Enregistrement certifié...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={14} />
                                                Valider la Déclaration
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE FICHE DÉTAILLÉE D'UN OCCUPANT */}
            {detailModalOccupant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                                    Fiche Individuelle ADD-29
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-1">
                                    {detailModalOccupant.nom} {detailModalOccupant.prenoms}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Statut : {detailModalOccupant.statut} · Déclaré par le titulaire
                                </p>
                            </div>
                            <button
                                onClick={() => setDetailModalOccupant(null)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                                aria-label="Fermer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {(() => {
                            const meta = parseOccupantMetadata(detailModalOccupant);
                            const lienObj = LIENS_FOYER.find((l) => l.value === detailModalOccupant.lien);
                            const motifObj = MOTIFS_ARRIVEE.find((m) => m.value === meta?.motifArrivee);
                            const espaceObj = ESPACES_OCCUPES.find((e) => e.value === meta?.espaceOccupe);

                            return (
                                <div className="space-y-4 text-xs">
                                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-150">
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Qualité au foyer</span>
                                            <span className="font-bold text-slate-900">{lienObj?.label || detailModalOccupant.lien}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Type de séjour</span>
                                            <span className="font-bold text-slate-900">
                                                {meta?.typeSejour === "TEMPORAIRE" ? "Séjour temporaire" : "Résidence continue"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Date d&apos;arrivée</span>
                                            <span className="font-bold text-slate-900">
                                                {new Date(detailModalOccupant.dateEntree).toLocaleDateString("fr-FR")}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block text-[11px]">Départ prévu</span>
                                            <span className="font-bold text-slate-900">
                                                {detailModalOccupant.dateSortie
                                                    ? new Date(detailModalOccupant.dateSortie).toLocaleDateString("fr-FR")
                                                    : "Indéterminé"}
                                            </span>
                                        </div>
                                    </div>

                                    {motifObj && (
                                        <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                                            <span className="text-slate-500 font-semibold block text-[11px]">Motif du séjour</span>
                                            <p className="font-bold text-slate-900">{motifObj.label}</p>
                                            {meta?.motifPrecision && (
                                                <p className="text-slate-600 italic mt-1">« {meta.motifPrecision} »</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-xl border border-slate-200">
                                            <span className="text-slate-400 block text-[11px]">Espace occupé</span>
                                            <span className="font-semibold text-slate-800">{espaceObj?.label || "Chambre"}</span>
                                        </div>
                                        <div className="p-3 rounded-xl border border-slate-200">
                                            <span className="text-slate-400 block text-[11px]">Prise en charge</span>
                                            <span className="font-semibold text-slate-800">
                                                {meta?.priseEnCharge === "AUTONOME" ? "Autonome" : "Par le titulaire"}
                                            </span>
                                        </div>
                                    </div>

                                    {(meta?.contactUrgenceNom || meta?.contactUrgenceTel) && (
                                        <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-rose-900 space-y-1">
                                            <span className="font-bold block text-[11px]">Contact d&apos;urgence</span>
                                            <p>{meta.contactUrgenceNom || "Contact"} : {meta.contactUrgenceTel || "Non renseigné"}</p>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                        <span>Empreinte SHA-256 :</span>
                                        <span>{detailModalOccupant.declarationSha256?.slice(0, 16)}...</span>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setDetailModalOccupant(null)}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
