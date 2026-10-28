"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
    BookOpen, Search, ChevronRight, FileText, Video, HelpCircle,
    LifeBuoy, Download, Printer, ShieldCheck, CheckCircle2,
    Database, Activity, ArrowRight, ExternalLink, Scale,
    PlayCircle, Wrench, Lock, CreditCard, Sparkles, X, Check
} from "lucide-react"
import { toast } from "sonner"
import SupportTicketModal from "@/components/dashboard/manual/SupportTicketModal"
import TutorialModal, { TutorialItem } from "@/components/dashboard/manual/TutorialModal"
import LegalProcedureModal, { LegalProcedureItem } from "@/components/dashboard/manual/LegalProcedureModal"
import ManualOfficielContent from "@/components/manual/ManualOfficielContent"
import { logManualDownload } from "@/actions/manual-actions"

interface UserContext {
    isAuthenticated: boolean
    role: string
    name: string
    email: string
    phone: string
    isVerified: boolean
    propertiesCount: number
    activeLeasesCount: number
    openTicketsCount: number
    recentEvents: { id: string; action: string; module: string; date: string }[]
    dbStatus: string
}

const TUTORIALS: TutorialItem[] = [
    {
        id: "tut-1",
        title: "Créer et faire signer un contrat de bail numérique",
        subtitle: "Générez un contrat de bail 100% conforme à la loi 2019-576, signé par OTP SMS et scellé cryptographiquement.",
        category: "Baux & Contrats",
        duration: "3 min",
        badgeColor: "indigo",
        actionUrl: "/dashboard/leases",
        actionLabel: "Accéder aux baux",
        steps: [
            {
                stepNumber: 1,
                title: "Sélectionnez le bien et le locataire",
                description: "Dans le menu 'Baux', cliquez sur 'Nouveau Bail'. Choisissez le logement concerné et renseignez le numéro de téléphone ivoirien du locataire (10 chiffres).",
                tip: "Le locataire n'a pas besoin d'avoir créé de compte au préalable : un accès lui est ouvert automatiquement par SMS."
            },
            {
                stepNumber: 2,
                title: "Définissez le loyer et les conditions financières",
                description: "Indiquez le montant du loyer mensuel en XOF et les charges éventuelles. La plateforme vérifie automatiquement le respect du plafond légal de 2 mois de caution maximum.",
                tip: "La loi 2019-576 interdit formellement d'exiger plus de 2 mois de caution et 2 mois d'avance."
            },
            {
                stepNumber: 3,
                title: "Signature électronique et scellement d'intégrité",
                description: "Le propriétaire et le locataire reçoivent chacun un code de signature OTP sécurisé par SMS. Une fois validé, le contrat PDF scellé par empreinte SHA-256 devient immédiatement opposable.",
                tip: "Le contrat est consultable et téléchargeable à tout moment avec son QR code d'authenticité."
            }
        ]
    },
    {
        id: "tut-2",
        title: "Émettre et délivrer une quittance de loyer certifiée",
        subtitle: "Émettez des quittances officielles avec QR Code fiscal, conformes aux exigences des banques et de l'administration.",
        category: "Quittancement",
        duration: "2 min",
        badgeColor: "emerald",
        actionUrl: "/dashboard/receipts",
        actionLabel: "Gérer les quittances",
        steps: [
            {
                stepNumber: 1,
                title: "Paiement Mobile Money ou enregistrement manuel",
                description: "Dès qu'un paiement de loyer est réglé via Wave, Orange, MTN ou Moov, la quittance est générée en temps réel. Pour un paiement direct en espèces ou chèque, utilisez le bouton 'Nouveau Reçu' dans la rubrique 'Quittances'.",
                tip: "Chaque quittance est numérotée sous le format unique REC-AAAA-MM-XXXXXX."
            },
            {
                stepNumber: 2,
                title: "Ventilation automatique du loyer et des charges",
                description: "Le système distingue le loyer net des charges locatives et recalcule l'état de solde du bail en direct.",
                tip: "Toutes les valeurs financières sont strictement enregistrées en monnaie XOF."
            },
            {
                stepNumber: 3,
                title: "Délivrance au locataire et archivage probatoire",
                description: "Le locataire reçoit un SMS avec le lien de téléchargement immédiat. Le document est stocké dans le registre infalsifiable de la plateforme.",
                tip: "Vous pouvez également imprimer un exemplaire papier certifié en un clic."
            }
        ]
    },
    {
        id: "tut-3",
        title: "Séquestrer et restituer une caution dans le Vault CDC-CI",
        subtitle: "Bloquez le dépôt de garantie sur un compte de cantonnement sécurisé pour éliminer tout litige de fin de location.",
        category: "Séquestre & Caution",
        duration: "3 min",
        badgeColor: "purple",
        actionUrl: "/dashboard/vault",
        actionLabel: "Ouvrir le Vault Caution",
        steps: [
            {
                stepNumber: 1,
                title: "Consigner le dépôt de garantie",
                description: "Rendez-vous dans 'Vault Caution' et cliquez sur 'Consigner'. Sélectionnez le bail et saisissez le montant de la caution versée par le locataire.",
                tip: "Les fonds sont sécurisés auprès de la Caisse des Dépôts et Consignations de Côte d'Ivoire (CDC-CI)."
            },
            {
                stepNumber: 2,
                title: "Génération de l'attestation de séquestre",
                description: "Le bailleur et le preneur reçoivent une attestation numérique officielle attestant du cantonnement des fonds.",
                tip: "Cette attestation protège le propriétaire contre les accusations d'encaissement indu."
            },
            {
                stepNumber: 3,
                title: "Restitution en fin de bail sur Mobile Money",
                description: "À la sortie du locataire et après validation de l'état des lieux, cliquez sur 'Restituer'. Les fonds sont virés directement sur le compte Wave ou Mobile Money du locataire sous 24h.",
                tip: "En cas de dégradations justifiées, une retenue partielle peut être appliquée avec justificatifs."
            }
        ]
    },
    {
        id: "tut-4",
        title: "Recharger son portefeuille et activer les prélèvements",
        subtitle: "Gérez vos unités de quittancement et vos services sans interruption via Mobile Money.",
        category: "Wallet & Finances",
        duration: "2 min",
        badgeColor: "sky",
        actionUrl: "/dashboard/wallet",
        actionLabel: "Accéder à mon Wallet",
        steps: [
            {
                stepNumber: 1,
                title: "Consultez votre solde en XOF",
                description: "Dans la rubrique 'Portefeuille', visualisez votre solde courant et vos dernières transactions enregistrées en base de données.",
                tip: "Le coût standard d'une quittance certifiée est de 90 XOF."
            },
            {
                stepNumber: 2,
                title: "Sélectionnez votre opérateur Mobile Money",
                description: "Cliquez sur 'Recharger' et choisissez votre canal de paiement officiel : Wave, Orange Money, MTN MoMo ou Moov Money.",
                tip: "Les logos officiels vectoriels des opérateurs garantissent une transaction sécurisée."
            },
            {
                stepNumber: 3,
                title: "Crédit immédiat du portefeuille",
                description: "Validez la demande de paiement sur votre téléphone. Votre solde est crédité instantanément et consigné dans l'historique comptable.",
                tip: "Aucun frais caché n'est appliqué sur le rechargement de votre wallet."
            }
        ]
    },
    {
        id: "tut-5",
        title: "Déclarer un incident technique et mandater un artisan",
        subtitle: "Signalez une panne de plomberie ou d'électricité avec photos horodatées et suivez l'intervention.",
        category: "Maintenance",
        duration: "2 min",
        actionUrl: "/dashboard/maintenance",
        actionLabel: "Ouvrir la Maintenance",
        badgeColor: "amber",
        steps: [
            {
                stepNumber: 1,
                title: "Décrivez l'anomalie constatée",
                description: "Dans 'Maintenance', cliquez sur 'Signaler un Incident'. Choisissez la catégorie (Plomberie, Électricité, Serrurerie, etc.) et le degré d'urgence.",
                tip: "Le degré 'Urgent' notifie immédiatement le propriétaire par SMS prioritaire."
            },
            {
                stepNumber: 2,
                title: "Ajoutez des photos de constatation",
                description: "Prenez 1 à 3 photos claires du problème. Chaque image est scellée avec son empreinte numérique pour éviter tout litige sur l'état d'origine.",
                tip: "L'horodatage fait foi en cas de recours auprès de l'assurance multirisque habitation."
            },
            {
                stepNumber: 3,
                title: "Devis, intervention et clôture du ticket",
                description: "Un artisan agréé QAPRIL ou désigné par le propriétaire est mandaté. Une fois les travaux réalisés et confirmés par le locataire, le ticket est clôturé en base.",
                tip: "Le montant final des travaux est consigné dans le Compte Rendu de Gestion (CRG) du bailleur."
            }
        ]
    }
]

const LEGAL_PROCEDURES: LegalProcedureItem[] = [
    {
        id: "proc-1",
        title: "Loi n° 2019-576 du 26 juin 2019 sur le bail d'habitation",
        lawReference: "Loi n° 2019-576 (Côte d'Ivoire)",
        summary: "Le texte fondamental qui régit l'ensemble des relations contractuelles entre propriétaires et locataires à usage d'habitation sur le territoire ivoirien.",
        keyArticles: [
            {
                articleNumber: "Article 4",
                text: "Le contrat de bail est constaté par un écrit comportant obligatoirement l'identité des parties, la désignation des locaux, le montant du loyer et des charges, ainsi que la date de prise d'effet."
            },
            {
                articleNumber: "Article 21",
                text: "Il est formellement interdit au bailleur de se faire justice lui-même. Toute expulsion du locataire sans décision de justice exécutoire constitue une voie de fait pénalement réprimée."
            }
        ],
        practicalRule: "QAPRIL génère exclusivement des contrats certifiés intégrant l'intégralité des clauses d'ordre public de la loi 2019-576.",
        penalties: "Expulsion sauvage : 1 à 3 ans d'emprisonnement et amende de 500 000 à 3 000 000 XOF (Article 470 du Code Pénal)."
    },
    {
        id: "proc-2",
        title: "Plafonnement légal des cautions et loyers d'avance",
        lawReference: "Décret d'application de la Loi 2019-576",
        summary: "Limitation stricte du montant que le bailleur est autorisé à exiger lors de la remise des clés du logement.",
        keyArticles: [
            {
                articleNumber: "Article 11",
                text: "Le montant du dépôt de garantie exigible par le bailleur ne peut excéder deux (2) mois de loyer. Le montant des loyers d'avance ne peut également excéder deux (2) mois de loyer."
            }
        ],
        practicalRule: "La plateforme QAPRIL bloque automatiquement toute saisie de caution ou d'avance supérieure à 2 mois de loyer afin de protéger le bailleur contre la nullité de la clause.",
        penalties: "Nullité absolue de la clause d'excédent et obligation de restitution immédiate sous astreinte avec intérêts légaux."
    },
    {
        id: "proc-3",
        title: "Enregistrement fiscal obligatoire à la DGI (Art. 550 CGI)",
        lawReference: "Article 550 du Code Général des Impôts (CGI)",
        summary: "Obligation légale d'enregistrement du contrat de bail auprès de la Direction Générale des Impôts de Côte d'Ivoire.",
        keyArticles: [
            {
                articleNumber: "Article 550 CGI",
                text: "Les baux d'immeubles à usage d'habitation sont assujettis à un droit d'enregistrement proportionnel fixé à 2.5% du montant cumulé des loyers de la période contractuelle."
            }
        ],
        practicalRule: "QAPRIL calcule automatiquement la taxe de 2.5% et génère le fichier récapitulatif fiscal officiel DGI exportable en un clic.",
        penalties: "Pénalité de 100% du montant des droits éludés en cas de retard supérieur à 30 jours calendaires."
    },
    {
        id: "proc-4",
        title: "Procédure légale de mise en demeure pour impayé de loyer",
        lawReference: "Articles 33 & 34 de la Loi 2019-576",
        summary: "Étapes impératives à respecter scrupuleusement avant de pouvoir intenter une action en résiliation de bail pour loyers impayés.",
        keyArticles: [
            {
                articleNumber: "Article 33",
                text: "À défaut de paiement du loyer à l'échéance convenue, le bailleur ne peut agir en résiliation du bail qu'après avoir délivré une mise en demeure par exploit d'huissier de justice restée infructueuse pendant un délai de trente (30) jours."
            }
        ],
        practicalRule: "Le module 'Recouvrement' de QAPRIL génère automatiquement la lettre de sommation probatoire horodatée et calcule le délai franc des 30 jours.",
        penalties: "Toute assignation en justice déposée avant l'expiration du délai de 30 jours est déclarée irrecevable par le tribunal."
    }
]

const FAQS = [
    {
        q: "Comment modifier ou éditer un bail déclaratif existant ?",
        a: "Dans la rubrique 'Baux', cliquez sur l'onglet 'Baux Déclaratifs'. Cliquez sur le bouton 'Modifier' en bout de ligne. Vous pourrez réajuster le loyer mensuel en XOF, les charges ou les informations du locataire sans perdre l'historique."
    },
    {
        q: "Pourquoi toutes les valeurs monétaires sont-elles affichées en XOF ?",
        a: "Le franc CFA d'Afrique de l'Ouest est officiellement désigné sous le code international ISO 4217 'XOF'. QAPRIL standardise toutes ses transactions financières en XOF pour garantir la conformité avec la BCEAO et le système bancaire."
    },
    {
        q: "Comment fonctionne le séquestre CDC-CI dans le Vault Caution ?",
        a: "Le Vault bloque le montant de la caution sur un compte dédié de la Caisse des Dépôts et Consignations. Ni le propriétaire ni le locataire ne peuvent y toucher unilatéralement, ce qui garantit qu'en fin de location, l'argent sera disponible immédiatement sans contestation."
    },
    {
        q: "Comment exporter mes données fiscales pour la Direction Générale des Impôts (DGI) ?",
        a: "Dans la rubrique 'Quittances', cliquez sur le bouton 'Fichier DGI'. Sélectionnez l'année fiscale concernée. Le système calcule l'assiette brute de vos loyers, le droit d'enregistrement de 2.5% et génère un fichier CSV prêt pour l'administration fiscale."
    },
    {
        q: "Que faire en cas d'erreur de numéro de téléphone Mobile Money ?",
        a: "Si un numéro a été mal saisi lors d'une transaction Wave ou Orange Money, ouvrez immédiatement un ticket technique via le bouton 'Ouvrir un Ticket' ci-dessus. Notre infrastructure de sécurité isolera la transaction dans le registre d'audit pour correction."
    }
]

export default function ManualDashboardClient({ userContext }: { userContext: UserContext }) {
    const [activeTab, setActiveTab] = useState<"tutorials" | "procedures" | "manual" | "faq">("tutorials")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null)
    const [selectedProcedure, setSelectedProcedure] = useState<LegalProcedureItem | null>(null)
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
    const [isPinging, setIsPinging] = useState(false)

    // Filtered tutorials
    const filteredTutorials = useMemo(() => {
        if (!searchQuery.trim()) return TUTORIALS
        const q = searchQuery.toLowerCase()
        return TUTORIALS.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.subtitle.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        )
    }, [searchQuery])

    // Filtered procedures
    const filteredProcedures = useMemo(() => {
        if (!searchQuery.trim()) return LEGAL_PROCEDURES
        const q = searchQuery.toLowerCase()
        return LEGAL_PROCEDURES.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.lawReference.toLowerCase().includes(q)
        )
    }, [searchQuery])

    // Filtered FAQs
    const filteredFaqs = useMemo(() => {
        if (!searchQuery.trim()) return FAQS
        const q = searchQuery.toLowerCase()
        return FAQS.filter(f =>
            f.q.toLowerCase().includes(q) ||
            f.a.toLowerCase().includes(q)
        )
    }, [searchQuery])

    // Button Action: Test Database Ping
    const handlePingDatabase = async () => {
        setIsPinging(true)
        try {
            const start = performance.now()
            const res = await fetch("/api/health")
            const data = await res.json()
            const duration = Math.round(performance.now() - start)

            if (data.status === "ok") {
                toast.success(`Base PostgreSQL Connectée avec succès (Latence: ${data.dbLatencyMs || duration} ms)`)
            } else {
                toast.error("La base de données a répondu avec un statut anormal.")
            }
        } catch {
            toast.error("Impossible de joindre le point de contrôle de la base de données.")
        } finally {
            setIsPinging(false)
        }
    }

    // Button Action: Print / Download PDF
    const handleDownloadPdf = async () => {
        toast.promise(logManualDownload(), {
            loading: "Préparation du document PDF...",
            success: "Format d'impression prêt.",
            error: "Erreur d'impression."
        })
        setTimeout(() => {
            window.print()
        }, 500)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="mb-2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <BookOpen size={12} className="text-indigo-600" /> Centre de Connaissances & Assistance
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        Manuel & Guides Opérationnels
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Guides interactifs, fiches de lois ivoiriennes et assistance technique connectée en direct à la base de données.
                    </p>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={handlePingDatabase}
                        disabled={isPinging}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                        title="Tester la connexion active avec la base de données PostgreSQL"
                    >
                        <Database size={14} className={`text-emerald-600 ${isPinging ? "animate-pulse" : ""}`} />
                        <span>Vérifier Base DB</span>
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                        title="Imprimer ou enregistrer le manuel officiel au format PDF"
                    >
                        <Printer size={14} />
                        <span>Imprimer Manuel</span>
                    </button>

                    <button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                        title="Soumettre un ticket d'assistance technique directement en base de données"
                    >
                        <LifeBuoy size={14} />
                        <span>Ouvrir un Ticket</span>
                    </button>
                </div>
            </div>

            {/* Connected User & Platform Context Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-[24px] p-6 sm:p-7 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                                Session Active • Base PostgreSQL En Ligne
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                            Bienvenue, {userContext.name}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
                            Profil <strong className="text-indigo-300 uppercase">{userContext.role}</strong> {userContext.isVerified ? "• Identité Certifiée" : "• Compte Opérationnel"}. Toutes les actions d&apos;assistance sont tracées avec scellement SHA-256.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <span className="text-[9px] font-bold text-slate-300 uppercase block tracking-wider">Biens</span>
                            <span className="text-xl font-black text-white">{userContext.propertiesCount}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <span className="text-[9px] font-bold text-slate-300 uppercase block tracking-wider">Baux Actifs</span>
                            <span className="text-xl font-black text-emerald-400">{userContext.activeLeasesCount}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                            <span className="text-[9px] font-bold text-slate-300 uppercase block tracking-wider">Tickets</span>
                            <span className="text-xl font-black text-amber-400">{userContext.openTicketsCount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un guide, un texte de loi, quittance, caution, DGI..."
                    className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto max-w-full">
                    <button
                        onClick={() => setActiveTab("tutorials")}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === "tutorials"
                                ? "bg-white text-indigo-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Video size={15} />
                        Tutoriels Vidéos & Guides ({filteredTutorials.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("procedures")}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === "procedures"
                                ? "bg-white text-amber-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Scale size={15} />
                        Procédures & Lois ({filteredProcedures.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("manual")}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === "manual"
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <BookOpen size={15} />
                        Manuel Officiel Intégral
                    </button>

                    <button
                        onClick={() => setActiveTab("faq")}
                        className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === "faq"
                                ? "bg-white text-emerald-700 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <HelpCircle size={15} />
                        FAQ ({filteredFaqs.length})
                    </button>
                </div>
            </div>

            {/* TAB CONTENT 1: TUTORIALS */}
            {activeTab === "tutorials" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Guides pas-à-pas interactifs pour maîtriser l&apos;application
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                            {filteredTutorials.length} tutoriels disponibles
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTutorials.map((tut) => (
                            <div
                                key={tut.id}
                                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                                            <PlayCircle size={12} /> {tut.category}
                                        </span>
                                        <span className="text-[11px] font-medium text-slate-400">
                                            {tut.duration}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {tut.title}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">
                                        {tut.subtitle}
                                    </p>
                                </div>

                                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedTutorial(tut)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <span>Consulter le guide complet</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    {tut.actionUrl && (
                                        <Link
                                            href={tut.actionUrl}
                                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                        >
                                            {tut.actionLabel || "Appliquer"}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: LEGAL PROCEDURES */}
            {activeTab === "procedures" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Cadre réglementaire officiel en République de Côte d&apos;Ivoire
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                            {filteredProcedures.length} textes de loi
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProcedures.map((proc) => (
                            <div
                                key={proc.id}
                                className="bg-white border border-slate-200 hover:border-amber-300 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                            <Scale size={12} /> {proc.lawReference}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                                        {proc.title}
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-3">
                                        {proc.summary}
                                    </p>
                                </div>

                                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedProcedure(proc)}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                                    >
                                        <span>Lire les articles et sanctions</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT 3: OFFICIAL FULL MANUAL */}
            {activeTab === "manual" && (
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 sm:p-10 shadow-sm animate-in fade-in duration-200">
                    <ManualOfficielContent />
                </div>
            )}

            {/* TAB CONTENT 4: FAQ */}
            {activeTab === "faq" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-200 rounded-[20px] p-6 sm:p-8 shadow-xs divide-y divide-slate-100">
                        {filteredFaqs.map((faq, i) => (
                            <div key={i} className="py-4 first:pt-0 last:pb-0 space-y-2">
                                <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2.5">
                                    <HelpCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                    <span>{faq.q}</span>
                                </h3>
                                <p className="text-xs sm:text-sm font-medium text-slate-600 pl-6 leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Contact Footer */}
            <div className="text-center pt-6 border-t border-slate-200/80">
                <p className="text-xs font-medium text-slate-500">
                    Vous ne trouvez pas la réponse à votre situation ?{" "}
                    <button
                        onClick={() => setIsTicketModalOpen(true)}
                        className="text-indigo-600 font-bold underline hover:text-indigo-800 transition-colors"
                    >
                        Ouvrir un ticket d&apos;assistance immédiat
                    </button>{" "}
                    ou contacter notre service juridique certifié.
                </p>
            </div>

            {/* Modals */}
            <SupportTicketModal
                isOpen={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
            />

            <TutorialModal
                tutorial={selectedTutorial}
                onClose={() => setSelectedTutorial(null)}
            />

            <LegalProcedureModal
                procedure={selectedProcedure}
                onClose={() => setSelectedProcedure(null)}
            />
        </div>
    )
}
