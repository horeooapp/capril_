"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    BookOpen,
    ShieldCheck,
    Building2,
    UserCheck,
    Briefcase,
    FileCheck2,
    HelpCircle,
    Smartphone,
    QrCode,
    MapPin,
    Mic,
    Percent,
    Download,
    Search,
    CheckCircle2,
    AlertTriangle,
    Users,
    KeyRound,
    Compass,
    Landmark,
    MessageSquare,
    ExternalLink,
    ChevronRight,
} from "lucide-react";

type RoleTab = "locataire" | "proprietaire" | "agence_agreee" | "intermediaire" | "transversal";

export default function ManuelUtilisationPage() {
    const [activeTab, setActiveTab] = useState<RoleTab>("proprietaire");
    const [searchQuery, setSearchQuery] = useState("");

    const tabs = [
        { id: "proprietaire" as RoleTab, label: "Propriétaire Bailleur", icon: Building2, badge: "Gestion Directe" },
        { id: "locataire" as RoleTab, label: "Locataire", icon: UserCheck, badge: "Espace & Droits" },
        { id: "agence_agreee" as RoleTab, label: "Agence Agréée", icon: Landmark, badge: "Art. 419 CCH" },
        { id: "intermediaire" as RoleTab, label: "Agence Non Agréée / Gérant", icon: Briefcase, badge: "Délégation Partielle" },
        { id: "transversal" as RoleTab, label: "Transversal (DGI, MaPoste, Voix)", icon: Compass, badge: "ADD-20 à ADD-29" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-[#1B4D3E] selection:text-white">
            <Header />

            {/* HERO BANNER OFFICIEL */}
            <div className="bg-[#1B4D3E] text-white border-b border-[#153e32]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider border border-white/15">
                                <BookOpen size={13} className="text-[#FF8200]" />
                                <span>Manuel d'Utilisation Officiel · Version 2.0 (Novembre 2026)</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                Guide Complet d'Utilisation QAPRIL
                            </h1>
                            <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                                Le guide de référence pas-à-pas pour maîtriser l'ensemble des fonctionnalités de QAPRIL selon votre rôle : Locataire, Propriétaire Bailleur, Agence Agréée et Intermédiaire de gestion.
                            </p>
                        </div>

                        {/* BOUTON TÉLÉCHARGER LE MANUEL DOCX */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="/QAPRIL_Manuel_Utilisation_v2.0.docx"
                                download="QAPRIL_Manuel_Utilisation_v2.0.docx"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF8200] hover:bg-[#e67500] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                            >
                                <Download size={15} />
                                <span>Télécharger le Manuel (.docx)</span>
                            </a>
                            <Link
                                href="/faq"
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider border border-white/20 transition-all"
                            >
                                <HelpCircle size={15} />
                                <span>Foire Aux Questions</span>
                            </Link>
                        </div>
                    </div>

                    {/* RÈGLES D'OR IMMUABLES */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-8 border-t border-white/15 text-xs">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[#FF8200] font-black block mb-0.5">1. 4 Opérateurs MM</span>
                            <span className="text-slate-300">Wave, Orange Money, MTN et Moov au même niveau.</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[#FF8200] font-black block mb-0.5">2. Zéro détention fonds</span>
                            <span className="text-slate-300">Flux directs via l'agrégateur ; séquestre notarial en vente.</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[#FF8200] font-black block mb-0.5">3. Confidentialité mandat</span>
                            <span className="text-slate-300">Locataire ne voit jamais le propriétaire sous mandat agréé.</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <span className="text-[#FF8200] font-black block mb-0.5">4. Loi 2019-576</span>
                            <span className="text-slate-300">Plafond impératif : max 2 mois avance + 2 mois caution.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CORPS PRINCIPAL DU MANUEL */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* SÉLECTEUR DE RÔLE (TABS) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                                    active
                                        ? "bg-[#1B4D3E] text-white border-[#1B4D3E] shadow-xs"
                                        : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                <Icon size={16} className={active ? "text-[#FF8200]" : "text-slate-500"} />
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                                }`}>
                                    {tab.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* CONTENU DE L'ONGLET SÉLECTIONNÉ */}
                <div className="mt-8 space-y-8">

                    {/* ==================== 1. GUIDE DU PROPRIÉTAIRE ==================== */}
                    {activeTab === "proprietaire" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <Building2 className="text-[#1B4D3E]" size={22} />
                                        Guide Pratique du Propriétaire Bailleur
                                    </h2>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        Comment ajouter un bien, créer un bail conforme, géolocaliser avec précision et automatiser les quittances.
                                    </p>
                                </div>

                                {/* Étape 1 : Ajout de bien */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>1. Ajouter et Structurer son Bien Immobilier (ADD-05 & ADD-28)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                            <p className="font-bold text-slate-900">4 Structures Parentes :</p>
                                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                                <li><strong>Maison indépendante / Villa :</strong> un logement unique loué à un locataire.</li>
                                                <li><strong>Cour commune :</strong> ensemble de portes / chambres individuelles louées séparément.</li>
                                                <li><strong>Immeuble / Résidence :</strong> appartements répartis sur plusieurs étages.</li>
                                                <li><strong>Terrain nu ou rural (ADD-25) :</strong> parcelle avec référence cadastrale (Lot/Îlot/Titre).</li>
                                            </ul>
                                        </div>
                                        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                                            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                                                <MapPin size={14} className="text-[#FF8200]" />
                                                Géolocalisation Satellite & MaPoste :
                                            </p>
                                            <p className="text-emerald-900 leading-relaxed">
                                                À la création, l'application capture automatiquement les coordonnées GPS. Le système résout instantanément le <strong>nom officiel de la Ville, de la Commune et du Quartier & Repère</strong>, et génère le code d'adresse numérique La Poste CI.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Étape 2 : Création de bail */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>2. Créer un Bail Conforme à la Loi 2019-576</span>
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
                                        <p>La rédaction s'effectue en 4 étapes guidées sans risque d'erreur juridique :</p>
                                        <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                                            <li><strong>Sélection du bien vacant :</strong> choisissez la porte ou le logement concerné.</li>
                                            <li><strong>Désignation du locataire :</strong> saisissez son numéro de téléphone ou sélectionnez-le depuis les candidatures reçues dans votre vivier.</li>
                                            <li><strong>Conditions financières encadrées :</strong> loyer mensuel, échéance (1er, 5 ou 15 du mois). L'application bloque automatiquement à <strong>2 mois maximum de loyer d'avance</strong> et <strong>2 mois maximum de dépôt de garantie</strong>.</li>
                                            <li><strong>Signature & Enregistrement DGI :</strong> signature électronique des deux parties avec calcul automatique des droits fiscaux (2,5 % × loyer annuel × durée + timbres) et reçu officiel délivré en 1 clic.</li>
                                        </ol>
                                    </div>
                                </div>

                                {/* Étape 3 : Encaissement et Quittances */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>3. Encaissements, Quittances et Paiements Partiels (ADD-24)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                            <p className="font-bold text-slate-900">Quittances Automatiques & Déclaration :</p>
                                            <p className="text-slate-600 leading-relaxed">
                                                Dès paiement Mobile Money (Wave, Orange, MTN, Moov), la quittance scellée par empreinte SHA-256 est émise et envoyée par SMS. Si le locataire paie en espèces, validez simplement d'un clic sur l'application ou en répondant <strong>OUI</strong> au SMS de confirmation.
                                            </p>
                                        </div>
                                        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
                                            <p className="font-bold text-amber-950 flex items-center gap-1.5">
                                                <Percent size={14} className="text-amber-700" />
                                                Paiements Partiels & Apurement (ADD-24) :
                                            </p>
                                            <p className="text-amber-900 leading-relaxed">
                                                Si le locataire propose un montant partiel, l'application applique la règle légale FIFO (les loyers les plus anciens sont soldés en priorité). Sur le reliquat, un Reçu d'acompte officiel est émis et un plan d'apurement échelonné peut être validé.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== 2. GUIDE DU LOCATAIRE ==================== */}
                    {activeTab === "locataire" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <UserCheck className="text-[#1B4D3E]" size={22} />
                                        Guide Pratique du Locataire
                                    </h2>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        Gérer son bail, payer en toute sécurité, obtenir ses quittances et générer ses attestations de résidence.
                                    </p>
                                </div>

                                {/* Paiement sécurisé */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>1. Payer son Loyer et Prouver son Domicile</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                                            <p className="font-bold text-slate-900">4 Opérateurs Directs</p>
                                            <p className="text-slate-600">Payez par Wave, Orange Money, MTN ou Moov. Vos fonds arrivent directement au propriétaire sans intermédiaire.</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                                            <p className="font-bold text-slate-900">Avance de 1 à 6 mois</p>
                                            <p className="text-slate-600">Vous pouvez payer plusieurs mois à l'avance si vous le souhaitez (art. 415 CCH). Une quittance officielle est générée par mois.</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                                            <p className="font-bold text-slate-900">Sans Smartphone (USSD)</p>
                                            <p className="text-slate-600">Consultez votre solde et vos quittances depuis n'importe quel téléphone à touches en composant <strong>*144#</strong>.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Attestations ADD-29 */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>2. Attestations de Résidence & Hébergement (ADD-29)</span>
                                    </h3>
                                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                                        <p className="font-bold">Attestation de Résidence Officielle en 10 Secondes :</p>
                                        <p className="leading-relaxed">
                                            Générez votre attestation de domicile avec QR code de vérification publique reconnu par les banques, ambassades et concours administratifs. Vous pouvez aussi déclarer <strong>jusqu'à 10 personnes vivant avec vous</strong> (conjoint, enfants, parents) pour leur permettre d'obtenir leur propre certificat Niveau B.
                                        </p>
                                    </div>
                                </div>

                                {/* Passeport Locatif ADD-21 */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 text-[#1B4D3E]">
                                        <span>3. Le Passeport Locatif & Indice ICL (ADD-21)</span>
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                                        <p className="font-bold text-slate-900">Votre Sérieux Locatif Récompensé :</p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Vos loyers payés à l'heure construisent votre Indice de Confiance Locative (Tranches A, B, C, D). Seule votre tranche est montrée aux bailleurs pour préserver votre vie privée. Postulez en 1 clic sur les meilleurs logements sans risque d'arnaque.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== 3. GUIDE DE L'AGENCE AGRÉÉE ==================== */}
                    {activeTab === "agence_agreee" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <Landmark className="text-[#1B4D3E]" size={22} />
                                        Guide de l'Agence Immobilière Agréée
                                    </h2>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        Substitution légale complète, gestion des mandants avec codes BAI-NNN, enregistrement DGI et ventes.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900">Substitution Totale & Mentions Légales :</p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Sous mandat actif, l'agence accomplit tous les actes (rédaction de bail, encaissement, relances, quittances). Tous les documents portent automatiquement la mention légale <strong>« [Bailleur] représenté par [Votre Agence], mandataire agréé n°... »</strong>.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900">Confidentialité par Codes BAI-NNN :</p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Pour protéger le portefeuille de l'agence, le chef d'agence peut masquer l'identité réelle des bailleurs à ses collaborateurs, qui voient un code immuable <strong>BAI-NNN</strong> sur tous les écrans et états de gestion.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900">Enregistrement des Baux Externes :</p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Enregistrez sur le canal DGI les baux conclus sur papier ou d'autres plateformes pour le compte de vos clients, sans modifier les contrats d'origine, et délivrez le reçu d'enregistrement officiel.
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900">Transactions & Ventes (ADD-25) :</p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Pilotez vos mandats de vente de villas, immeubles et terrains. Le système bloque informatiquement les doublons de titres fonciers et route les versements obligatoirement vers le notaire.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== 4. AGENCE NON AGRÉÉE & INTERMÉDIAIRE ==================== */}
                    {activeTab === "intermediaire" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <Briefcase className="text-[#1B4D3E]" size={22} />
                                        Guide de l'Agence Non Agréée et Intermédiaire
                                    </h2>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        Le cadre juridique et opérationnel de la délégation partielle de gestion (ADD-08 & ADD-09).
                                    </p>
                                </div>

                                <div className="space-y-4 text-xs text-slate-700">
                                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-amber-950 space-y-1.5">
                                        <p className="font-bold flex items-center gap-1.5">
                                            <AlertTriangle size={15} className="text-amber-600" />
                                            Principe de Délégation Partielle Stricte (RG-DEL-01) :
                                        </p>
                                        <p className="leading-relaxed">
                                            L'intermédiaire ne bénéficie pas de la substitution totale. Le propriétaire lui attribue des droits spécifiques bien par bien : <em>Créer un bail</em>, <em>Émettre des quittances</em>, <em>Encaisser</em> ou <em>Relancer</em>. Il est formellement interdit de modifier un bail existant.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                                            <p className="font-bold text-slate-900">Quittances au nom du mandataire</p>
                                            <p className="text-slate-600">Les quittances mentionnent le mandataire en tant qu'émetteur pour compte sans divulguer le compte bancaire du propriétaire.</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                                            <p className="font-bold text-slate-900">Révocation instantanée (&lt; 60 secondes)</p>
                                            <p className="text-slate-600">Le propriétaire peut révoquer les droits à tout moment. Les sessions et jetons d'accès sont invalidés informatiquement sous 60 secondes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== 5. TRANSVERSAL ==================== */}
                    {activeTab === "transversal" && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                                <div className="border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                        <Compass className="text-[#1B4D3E]" size={22} />
                                        Fonctions Transversales et Modules Nationaux
                                    </h2>
                                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                                        Pilotage vocal, intégration La Poste CI, enregistrement DGI et vérification cryptographique publique.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <Mic size={14} className="text-[#FF8200]" />
                                            Pilotage Vocal Déclaratif (ADD-27) :
                                        </p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Dictez vos actions : « Je veux rédiger un bail pour le studio de Marcory ». L'assistant ouvre l'écran adéquat et pré-remplit les informations. <strong>Règle stricte (RG-AST-01) :</strong> aucun acte juridique n'est validé par la voix seule ; un geste explicite de validation reste obligatoire.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <QrCode size={14} className="text-[#1B4D3E]" />
                                            Vérification Publique Universelle (/verif) :
                                        </p>
                                        <p className="text-slate-600 leading-relaxed">
                                            Chaque quittance, bail et attestation est scellé par une empreinte SHA-256. N'importe quel tiers (banque, commissariat, ambassade) peut scanner le QR code pour attester de son authenticité sans création de compte.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </main>

            <Footer />
        </div>
    );
}
