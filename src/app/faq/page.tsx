"use client";

import { useState } from "react";
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
    BookMarked,
    Smartphone,
    QrCode,
} from "lucide-react";

const MANUAL_SECTIONS = [
    {
        id: "proprietaire",
        title: "3. Guide du Propriétaire Bailleur",
        icon: Building2,
        badge: "Propriétaires & Cours Communes",
        steps: [
            {
                subtitle: "3.1 Ajouter un bien immobilier",
                items: [
                    "Catégorie A — Maison / Villa / Appartement individuel : Vous louez un logement entier à un seul locataire.",
                    "Catégorie B — Cour commune (plusieurs portes) : Vous avez une cour avec plusieurs chambres ou portes louées séparément (saisie rapide en tableau).",
                    "Catégorie C — Immeuble / Résidence : Plusieurs appartements sur un ou plusieurs étages.",
                ],
            },
            {
                subtitle: "3.2 Créer un bail écrit ou un Bail Déclaratif (BDQ)",
                items: [
                    "Option 1 — Bail écrit complet : Génère un contrat officiel PDF conforme à la loi ivoirienne avec empreinte SHA-256.",
                    "Option 2 — Bail Déclaratif (BDQ) : Pour les locations verbales existantes sans contrat papier. 5 informations suffisent (nom, téléphone, porte, loyer, date d'entrée approximative).",
                    "Astuce WhatsApp : Envoyez « Bonjour, je veux enregistrer un locataire » au numéro WhatsApp QAPRIL pour créer un BDQ en 2 minutes de conversation naturelle.",
                ],
            },
            {
                subtitle: "3.3 Enregistrer un paiement & Générer une quittance",
                items: [
                    "Paiement Mobile Money (Orange Money, MTN MoMo, Wave) : Quittance générée et envoyée automatiquement en moins de 30 secondes.",
                    "Paiement en espèces : Cliquez sur « Enregistrer paiement espèces » ou répondez OUI au SMS de déclaration locataire.",
                    "Paiement partiel (acompte) : QAPRIL génère un reçu d'acompte et suit le solde restant dû.",
                ],
            },
            {
                subtitle: "3.4 Gérer les impayés (Séquence automatique)",
                items: [
                    "J+1 après l'échéance : Rappel automatique doux par SMS au locataire.",
                    "J+7 : Deuxième relance SMS + WhatsApp.",
                    "J+15 : Proposition de mise en demeure officielle générée par QAPRIL.",
                    "J+30 : Constitution automatique du dossier de litige (CACI / Tribunal).",
                ],
            },
        ],
    },
    {
        id: "locataire",
        title: "4. Guide du Locataire & USSD *144#",
        icon: UserCheck,
        badge: "Locataires · Web · SMS · USSD",
        steps: [
            {
                subtitle: "4.1 Confirmer votre bail par SMS",
                items: [
                    "Vous recevez un SMS : « QAPRIL : M. [Propriétaire] déclare que vous occupez [Logement] pour un loyer de [Montant] FCFA/mois. Répondez OUI pour confirmer ou NON pour signaler une erreur. »",
                    "La confirmation est 100% gratuite et active vos quittances officielles.",
                ],
            },
            {
                subtitle: "4.2 Déclarer un paiement par SMS ou WhatsApp (ADD-11)",
                items: [
                    "Envoyez « PAYE 35000 » ou « J'AI PAYE » par SMS au numéro court QAPRIL ou sur WhatsApp.",
                    "QAPRIL demande confirmation au gestionnaire ou propriétaire sans créer de conflit et vous envoie votre quittance dès validation.",
                ],
            },
            {
                subtitle: "4.3 Consulter vos informations sans internet via USSD *144#",
                items: [
                    "1. Mon solde et statut du mois en cours",
                    "2. Mes 3 dernières quittances (numéro et montant)",
                    "3. Mon score QAPRIL (Passeport Locatif / 1000)",
                    "4. Signaler un paiement effectué en espèces",
                    "5. Contacter mon propriétaire",
                ],
            },
        ],
    },
    {
        id: "agent",
        title: "5. Guide Agent Immobilier & QAPRIL Champion",
        icon: Smartphone,
        badge: "Agents Terrain & Champions",
        steps: [
            {
                subtitle: "5.1 Accompagner un propriétaire sur le terrain",
                items: [
                    "Aidez le propriétaire à créer son compte sur SON propre téléphone (il saisit lui-même son code OTP).",
                    "Ne demandez jamais le mot de passe du propriétaire.",
                    "Pour une cour commune de 10 portes, l'enregistrement complet prend moins de 15 minutes.",
                ],
            },
            {
                subtitle: "5.2 Commissions QAPRIL Champion (ADD-15)",
                items: [
                    "Bail formel créé : 1 000 FCFA dès le 1er paiement de loyer enregistré.",
                    "Bail Déclaratif (BDQ) confirmé par le locataire : 250 FCFA.",
                    "BDQ transformé en bail formel : +500 FCFA supplémentaires.",
                    "Virement groupé chaque vendredi sur votre compte Orange Money, MTN MoMo ou Wave.",
                ],
            },
        ],
    },
    {
        id: "agence",
        title: "6. Guide du Responsable d'Agence",
        icon: Briefcase,
        badge: "Agences & Gestionnaires",
        steps: [
            {
                subtitle: "6.1 Configuration & Équipe",
                items: [
                    "Importez votre portefeuille existant via le fichier modèle Excel QAPRIL.",
                    "Créez les comptes de vos agents et attribuez-leur uniquement les biens dont ils ont la charge (Rôles Multi-utilisateurs ADD-11).",
                ],
            },
            {
                subtitle: "6.2 Rapports automatiques (M-RAPPORT)",
                items: [
                    "Chaque lundi à 7h00 : Rapport hebdomadaire d'agence (taux d'encaissement, impayés).",
                    "Le 1er de chaque mois à 7h00 : Rapport mensuel propriétaire envoyé automatiquement en PDF et WhatsApp.",
                ],
            },
        ],
    },
    {
        id: "quittances",
        title: "7 & 8. Quittances SHA-256 & Fiscalité DGI (M17)",
        icon: QrCode,
        badge: "Certification & Fiscalité CI",
        steps: [
            {
                subtitle: "7. Quittance officielle QAPRIL",
                items: [
                    "Comporte un numéro unique (ex: QAP-2026-00142), un QR Code vérifiable publiquement et une empreinte cryptographique SHA-256.",
                    "Acceptée par les banques, ambassades (demandes de visa), employeurs et la CACI.",
                ],
            },
            {
                subtitle: "8. Module M17 — Droits d'enregistrement DGI",
                items: [
                    "Calcul automatique des droits d'enregistrement : Loyer mensuel × Nombre de mois × 2,5% (minimum légal 2 500 FCFA).",
                    "Alerte automatique à J-15 avant l'expiration du délai légal de 30 jours après signature.",
                ],
            },
        ],
    },
];

const OFFICIAL_FAQS = [
    {
        q: "QAPRIL est-il gratuit ?",
        a: "L'inscription est gratuite pour tous. Les locataires utilisent QAPRIL gratuitement, sans jamais payer. Pour les propriétaires, les premières quittances sont offertes, puis chaque quittance émise coûte 75 FCFA (prélevés sur le Wallet QAPRIL rechargeable dès 500 FCFA).",
    },
    {
        q: "Mon locataire n'a pas de smartphone. Peut-il quand même utiliser QAPRIL ?",
        a: "Oui, absolument. Le locataire reçoit ses quittances par SMS normal et peut consulter son compte en composant *144# depuis n'importe quel téléphone basique, sans internet.",
    },
    {
        q: "Je n'ai pas de contrat écrit avec mon locataire. Puis-je quand même l'enregistrer ?",
        a: "Oui. Utilisez le Bail Déclaratif (BDQ) ou parlez à l'assistant WhatsApp QAPRIL. En 2 minutes, votre location verbale est enregistrée et reconnue par les deux parties.",
    },
    {
        q: "Que se passe-t-il si mon locataire refuse de confirmer le BDQ ?",
        a: "Si le locataire répond NON au SMS, il peut indiquer ce qui est incorrect (montant du loyer, date d'entrée). Vous êtes informé et pouvez corriger en un clic. S'il ne répond pas, QAPRIL envoie 2 rappels automatiques sur 7 jours.",
    },
    {
        q: "Mes données sont-elles confidentielles ? La DGI a-t-elle accès à mon compte ?",
        a: "Vos données personnelles et financières sont strictement confidentielles et protégées. QAPRIL ne transmet aucune donnée à la DGI ou à tout autre organisme sans votre accord explicite.",
    },
    {
        q: "Comment recharger mon Wallet QAPRIL ?",
        a: "Depuis l'application : Menu « Mon Wallet » → « Recharger » → Choisissez Orange Money, MTN MoMo ou Wave → Entrez le montant (minimum 500 FCFA) → Confirmez avec votre code secret habituel.",
    },
    {
        q: "Puis-je gérer mes biens depuis l'étranger (diaspora) ?",
        a: "Oui. QAPRIL fonctionne depuis n'importe quel pays via le site web et l'application. Vous recevez les alertes de paiement sur WhatsApp et par email en temps réel, ainsi que votre rapport mensuel automatique le 1er de chaque mois.",
    },
    {
        q: "Que faire si j'ai fait une erreur sur une quittance déjà émise ?",
        a: "Une quittance émise et scellée SHA-256 ne peut pas être modifiée directement (garantie d'authenticité). Vous pouvez l'annuler depuis le détail du paiement en indiquant le motif, puis émettre une nouvelle quittance corrigée.",
    },
    {
        q: "Comment récupérer mon compte si je change de numéro de téléphone ?",
        a: "Contactez le support QAPRIL avec votre pièce d'identité (CNI, Passeport ou Carte de résident). Après vérification, votre compte et tout votre historique sont transférés sur votre nouveau numéro.",
    },
    {
        q: "Les quittances QAPRIL sont-elles acceptées par les banques et les ambassades ?",
        a: "Oui. Chaque quittance comporte un QR Code de vérification en ligne et une signature numérique SHA-256 infalsifiable.",
    },
];

const GLOSSARY_TERMS = [
    {
        term: "BDQ (Bail Déclaratif QAPRIL)",
        def: "Enregistrement numérique d'un bail verbal existant, confirmé par SMS par le locataire. Donne accès à tous les services QAPRIL sans contrat papier préalable.",
    },
    {
        term: "Quittance certifiée SHA-256",
        def: "Reçu officiel de paiement de loyer généré par QAPRIL, signé numériquement avec un code QR vérifiable en ligne.",
    },
    {
        term: "Passeport Locatif",
        def: "Document PDF résumant l'historique de paiement d'un locataire et son score de fiabilité sur 1 000 points.",
    },
    {
        term: "Score QAPRIL (ICL)",
        def: "Note sur 1 000 points calculée automatiquement selon la régularité et la ponctualité des paiements de loyer.",
    },
    {
        term: "Wallet QAPRIL",
        def: "Portefeuille numérique du propriétaire dans l'application, rechargeable par Mobile Money, sur lequel sont prélevés les frais de quittance (75 FCFA/quittance).",
    },
    {
        term: "OTP (Code à usage unique)",
        def: "Code à 6 chiffres envoyé par SMS pour vérifier votre identité lors de la connexion ou de la signature d'un contrat.",
    },
    {
        term: "SHA-256",
        def: "Technologie de sécurité qui crée une empreinte numérique unique pour chaque document. Si un seul chiffre du document est modifié, l'empreinte change et la fraude est détectée.",
    },
    {
        term: "KYC (Vérification d'identité)",
        def: "Processus de vérification de votre identité (CNI, Passeport ou Carte de résident) permettant de débloquer toutes les fonctionnalités.",
    },
    {
        term: "USSD (*144#)",
        def: "Technologie permettant d'utiliser QAPRIL depuis n'importe quel téléphone en composant un code court, sans connexion internet.",
    },
    {
        term: "Cour commune",
        def: "Propriété immobilière comprenant plusieurs logements (portes ou chambres) partageant une cour et des espaces communs.",
    },
    {
        term: "CACI",
        def: "Cour d'Arbitrage de Côte d'Ivoire — organisme officiel de règlement rapide des litiges locatifs.",
    },
    {
        term: "DGI (Module M17)",
        def: "Direction Générale des Impôts de Côte d'Ivoire — calcul automatique des droits d'enregistrement des baux (2,5%).",
    },
];

export default function FAQPage() {
    const [activeTab, setActiveTab] = useState<"manuel" | "faq" | "glossaire">("manuel");
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    return (
        <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
            <div className="noise-overlay"></div>
            <Header />

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* HERO */}
                <section className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.25em] mb-5 bg-white">
                        <BookOpen className="w-3.5 h-3.5 text-[#C55A11]" /> Manuel d&apos;Utilisation v1.0 & Base de Connaissances
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-ink leading-[1.08] tracking-tighter mb-4 uppercase">
                        Guide Officiel <span style={{ color: "var(--mango)" }}>QAPRIL</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-600 max-w-2xl mx-auto">
                        Quittancement Autonome et Plateforme des Ressources Immobilières Locatives — Android · Web · WhatsApp · USSD *144#
                    </p>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        <button
                            onClick={() => setActiveTab("manuel")}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === "manuel"
                                    ? "bg-[#1F4E79] text-white shadow-lg"
                                    : "bg-white text-slate-700 border border-slate-200 hover:border-[#1F4E79]"
                            }`}
                        >
                            <BookOpen className="w-4 h-4" /> Manuel d&apos;Utilisation (Pas à Pas)
                        </button>
                        <button
                            onClick={() => setActiveTab("faq")}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === "faq"
                                    ? "bg-[#C55A11] text-white shadow-lg"
                                    : "bg-white text-slate-700 border border-slate-200 hover:border-[#C55A11]"
                            }`}
                        >
                            <HelpCircle className="w-4 h-4" /> 10 Questions Fréquentes (FAQ)
                        </button>
                        <button
                            onClick={() => setActiveTab("glossaire")}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === "glossaire"
                                    ? "bg-emerald-700 text-white shadow-lg"
                                    : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-700"
                            }`}
                        >
                            <BookMarked className="w-4 h-4" /> Glossaire Officiel (12 Termes)
                        </button>
                    </div>
                </section>

                {/* TAB 1: MANUEL D'UTILISATION */}
                {activeTab === "manuel" && (
                    <section className="space-y-8">
                        {/* Chapitres 1 & 2 : Canaux & Niveaux KYC */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1F4E79] flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">
                                        1 & 2. S&apos;inscrire sur QAPRIL & Niveaux de Vérification (KYC)
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Inscription gratuite en 2 minutes avec votre numéro de téléphone ivoirien (+225)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        level: "Niveau 0 — Découverte",
                                        req: "Numéro de téléphone uniquement",
                                        access: "Consulter l'application · Voir les démonstrations",
                                    },
                                    {
                                        level: "Niveau 1 — Actif",
                                        req: "Téléphone vérifié par code SMS (OTP)",
                                        access: "Créer jusqu'à 3 baux · Recevoir des quittances · Utiliser WhatsApp",
                                    },
                                    {
                                        level: "Niveau 2 — Vérifié",
                                        req: "Téléphone + Photo CNI, Passeport ou Carte de résident",
                                        access: "Baux illimités · Quittances certifiées · Rapports mensuels · Passeport Locatif",
                                    },
                                    {
                                        level: "Niveau 3 — Professionnel",
                                        req: "Niveau 2 + RCCM / NIF (Agences)",
                                        access: "Gestion multi-agents · Tableau de bord agence · API",
                                    },
                                ].map((k) => (
                                    <div
                                        key={k.level}
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                                    >
                                        <div className="text-xs font-black text-[#1F4E79] uppercase">
                                            {k.level}
                                        </div>
                                        <div className="text-xs font-bold text-slate-800">{k.req}</div>
                                        <div className="text-xs text-slate-600">{k.access}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chapitres 3 à 8 */}
                        <div className="space-y-6">
                            {MANUAL_SECTIONS.map((sec) => {
                                const Icon = sec.icon;
                                return (
                                    <div
                                        key={sec.id}
                                        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#C55A11] flex items-center justify-center">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-black text-slate-900">
                                                    {sec.title}
                                                </h2>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold w-fit">
                                                {sec.badge}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {sec.steps.map((st) => (
                                                <div
                                                    key={st.subtitle}
                                                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2"
                                                >
                                                    <h3 className="text-sm font-black text-[#1F4E79]">
                                                        {st.subtitle}
                                                    </h3>
                                                    <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                                                        {st.items.map((it, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-[#C55A11] font-black">•</span>
                                                                <span>{it}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TAB 2: 10 QUESTIONS FRÉQUENTES */}
                {activeTab === "faq" && (
                    <section className="space-y-4 max-w-4xl mx-auto">
                        {OFFICIAL_FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className={`border rounded-3xl transition-all overflow-hidden ${
                                    openFaqIndex === index
                                        ? "border-[#C55A11]/30 bg-white shadow-lg"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                            >
                                <button
                                    onClick={() =>
                                        setOpenFaqIndex(openFaqIndex === index ? null : index)
                                    }
                                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none cursor-pointer"
                                >
                                    <span className="text-base sm:text-lg font-black text-slate-900">
                                        {index + 1}. {faq.q}
                                    </span>
                                    <span className="text-2xl font-black text-[#C55A11] ml-4">
                                        {openFaqIndex === index ? "−" : "+"}
                                    </span>
                                </button>
                                {openFaqIndex === index && (
                                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 text-sm text-slate-700 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* TAB 3: GLOSSAIRE OFFICIEL */}
                {activeTab === "glossaire" && (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {GLOSSARY_TERMS.map((item) => (
                            <div
                                key={item.term}
                                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-2"
                            >
                                <div className="inline-flex items-center gap-1.5 text-sm font-black text-[#1F4E79]">
                                    <FileCheck2 className="w-4 h-4 text-[#C55A11] shrink-0" />
                                    {item.term}
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">{item.def}</p>
                            </div>
                        ))}
                    </section>
                )}

                {/* CTA */}
                <section className="py-16 text-center">
                    <h3 className="text-2xl font-black text-ink mb-4 uppercase">
                        Besoin d&apos;aide supplémentaire ?
                    </h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-[#1F4E79] text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg"
                        >
                            Contacter le Support QAPRIL
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-[#C55A11] text-white rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg"
                        >
                            Accéder à mon Espace
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
