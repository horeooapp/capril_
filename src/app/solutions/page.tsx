"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Briefcase,
  Globe,
  Landmark,
  Check,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  CreditCard,
  PieChart,
  Smartphone,
  Sparkles,
  Zap,
  Lock,
  Clock,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  FileCheck
} from "lucide-react";

export default function SolutionsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("bailleurs");

  const ROLES = [
    {
      id: "bailleurs",
      label: "Propriétaires & Bailleurs",
      icon: <Building2 className="w-5 h-5" />,
      tagline: "Pour les bailleurs individuels, SCI familiales & multipropriétaires",
      heroTitle: "Encaissement garanti et rentabilité sereine de votre patrimoine",
      desc: "Pilotez tous vos biens locatifs (studios, villas, immeubles entiers) sans le stress des retards de paiement, sans paperasse et sans dépendre d'intermédiaires informels.",
      badgeColor: "bg-amber-50 text-[#B45309] border-amber-200",
      accent: "#D97706",
      keyMetrics: [
        { val: "99.2%", label: "Taux de recouvrement à date" },
        { val: "0 FCFA", label: "Commission sur le montant du loyer" },
        { val: "15 min", label: "Pour formaliser un bail certifié" },
        { val: "100%", label: "Conforme à la loi N° 2019-576" }
      ],
      features: [
        {
          title: "Collecte automatisée multi-Mobile Money",
          desc: "Vos locataires paient par Wave, Orange Money, MTN MoMo ou carte. Votre compte bancaire est crédité directement sans manipulation d'espèces."
        },
        {
          title: "Relances préventives et impayés gérés",
          desc: "Des rappels automatisés et courtois sont envoyés par SMS et WhatsApp 3 jours avant l'échéance. En cas de retard, les protocoles de relance légaux s'activent."
        },
        {
          title: "Bilan fiscal annuel prêt pour la DGI",
          desc: "Générez en un clic vos récapitulatifs fonciers annuels avec justificatifs certifiés conformes pour vos déclarations de revenus locatifs."
        },
        {
          title: "Contrats de bail et quittances horodatés",
          desc: "Chaque signature et chaque paiement produisent des actes juridiquement opposables scellés par certificat cryptographique SHA-256."
        }
      ],
      actionBtn: "Ouvrir mon Espace Propriétaire",
      actionHref: "/dashboard"
    },
    {
      id: "locataires",
      label: "Locataires & Résidents",
      icon: <Users className="w-5 h-5" />,
      tagline: "Pour tous les locataires exigeant transparence et respect de leurs droits",
      heroTitle: "Louez en toute sérénité, payez en 1 clic et valorisez votre réputation",
      desc: "Accédez à un habitat sécurisé, signez votre bail en ligne sans frais d'intermédiaires abusifs, payez sans file d'attente et récupérez votre caution sans bataille judiciaire.",
      badgeColor: "bg-sky-50 text-[#0284C7] border-sky-200",
      accent: "#0284C7",
      keyMetrics: [
        { val: "0 FCFA", label: "Coût de la plateforme pour le locataire" },
        { val: "2 mois", label: "Plafonnement strict de la caution" },
        { val: "48h", label: "Délai moyen de restitution de caution" },
        { val: "Score ICL", label: "Passeport locatif certifié à vie" }
      ],
      features: [
        {
          title: "Paiement du loyer en 1 clic sans déplacement",
          desc: "Réglez directement depuis votre smartphone via Wave, Orange, MTN ou Moov à toute heure, sans courir après le propriétaire ni retirer des espèces."
        },
        {
          title: "Quittances officielles téléchargeables à vie",
          desc: "Fini les carnets à souche perdus. Toutes vos quittances certifiées avec QR Code sont stockées dans votre espace, recevables auprès des banques et employeurs."
        },
        {
          title: "Caution protégée sous séquestre réglementaire",
          desc: "Votre dépôt de garantie est plafonné à 2 mois maximum et consigné sous protocole sécurisé. Aucune retenue abusive ne peut vous être imposée sans justificatif."
        },
        {
          title: "Score ICL : Votre Passeport de Confiance",
          desc: "Chaque paiement ponctuel améliore votre indice de réputation. Pour votre prochain logement, prouvez votre sérieux en un clic sans garanties démesurées."
        }
      ],
      actionBtn: "Accéder à l'Espace Locataire",
      actionHref: "/mon-espace-locataire"
    },
    {
      id: "agences",
      label: "Agences & Administrateurs",
      icon: <Briefcase className="w-5 h-5" />,
      tagline: "Pour les cabinets de gestion, agents agréés et syndics de copropriété",
      heroTitle: "Multipliez votre portefeuille sous gestion par 3 sans recruter",
      desc: "Automatisez la gestion administrative, la répartition comptable des honoraires, la génération des mandats conformes et le suivi des équipes sur le terrain.",
      badgeColor: "bg-emerald-50 text-[#059669] border-emerald-200",
      accent: "#059669",
      keyMetrics: [
        { val: "+300%", label: "Capacité de gestion par gestionnaire" },
        { val: "100%", label: "Mandats conformes Loi 2019-576" },
        { val: "Auto", label: "Reversement des honoraires d'agence" },
        { val: "Multi-sites", label: "Tableau de bord centralisé agence" }
      ],
      features: [
        {
          title: "Gestion multi-bailleurs et multi-immeubles",
          desc: "Supervisez des centaines de lots locatifs avec une vue d'ensemble instantanée des baux actifs, des entrées/sorties et des encaissements journaliers."
        },
        {
          title: "Répartition automatique des honoraires de gestion",
          desc: "Configurez votre barème de gestion (ex. 8% ou 10%). Lors de chaque encaissement, la quote-part agence est automatiquement séparée du net propriétaire."
        },
        {
          title: "Mandats de gérance numérisés conformes",
          desc: "Générez et signez vos mandats de gestion avec les propriétaires à distance par SMS OTP, scellés avec valeur probante."
        },
        {
          title: "Droits d'accès et rôles collaborateurs",
          desc: "Créez des accès spécifiques pour vos gestionnaires, comptables et agents de terrain pour les états des lieux, tout en conservant le contrôle total de la direction."
        }
      ],
      actionBtn: "Découvrir la Solution Agences",
      actionHref: "/contact"
    },
    {
      id: "diaspora",
      label: "Diaspora & Investisseurs Off-shore",
      icon: <Globe className="w-5 h-5" />,
      tagline: "Pour les Ivoiriens et investisseurs résidant à l'étranger (France, USA, Canada...)",
      heroTitle: "Contrôlez vos investissements à Abidjan depuis votre salon",
      desc: "Éliminez l'opacité et les déconvenues des intermédiaires informels. Suivez vos loyers en direct, signez vos contrats à distance et sécurisez votre patrimoine ivoirien.",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "#7C3AED",
      keyMetrics: [
        { val: "24/7", label: "Accès temps réel depuis l'étranger" },
        { val: "Zéro", label: "Dépendance envers les intermédiaires" },
        { val: "Multi-devises", label: "Suivi en FCFA, EUR ou USD" },
        { val: "HD", label: "États des lieux photos & vidéos certifiées" }
      ],
      features: [
        {
          title: "Notification instantanée à chaque loyer perçu",
          desc: "Dès que le locataire paie son loyer à Abidjan ou en province, vous recevez une notification en temps réel avec le reçu bancaire associé."
        },
        {
          title: "Compte séquestre et rapatriement fluide",
          desc: "Conservez vos revenus locatifs sur votre compte QAPRIL sécurisé ou rapatriez-les vers votre compte bancaire international en toute conformité de change."
        },
        {
          title: "États des lieux contradictoires visuels à distance",
          desc: "Consultez les photographies haute définition d'entrée et de sortie des lieux pour constater l'état réel de votre bien sans billet d'avion."
        },
        {
          title: "Mandat clair et assistance juridique sur place",
          desc: "Bénéficiez de l'appui du réseau d'experts juridiques et d'huissiers partenaires QAPRIL en Côte d'Ivoire en cas de besoin."
        }
      ],
      actionBtn: "Sécuriser mes Biens depuis l'Étranger",
      actionHref: "/contact"
    },
    {
      id: "institutionnels",
      label: "Banques & Institutionnels",
      icon: <Landmark className="w-5 h-5" />,
      tagline: "Pour les établissements financiers, la CDC-CI, la DGI et les assureurs",
      heroTitle: "Fiabilisation des données immobilières et traçabilité financière",
      desc: "Appuyez vos décisions de crédit, conformités fiscales et sécurisations de dépôts sur des historiques de paiement et des baux infalsifiables.",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      accent: "#047857",
      keyMetrics: [
        { val: "100%", label: "Traçabilité financière certifiée" },
        { val: "API", label: "Intégration bancaire & institutionnelle" },
        { val: "KYC/AML", label: "Conformité anti-blanchiment UEMOA" },
        { val: "DGI", label: "QR Code opposable aux contrôles" }
      ],
      features: [
        {
          title: "Score ICL pour l'octroi de crédits bancaires",
          desc: "Utilisez l'historique locatif certifié QAPRIL pour évaluer la solvabilité réelle d'un particulier sollicitant un prêt immobilier ou à la consommation."
        },
        {
          title: "Interfaçage réglementaire CDC-CI",
          desc: "Flux automatisé pour la consignation et la traçabilité des dépôts de garantie locatifs conformément aux prérogatives de la Caisse des Dépôts."
        },
        {
          title: "Transparence foncière pour les administrations",
          desc: "Quittances et déclarations infalsifiables pour faciliter le recensement fiscal et la perception des droits d'enregistrement sans déperdition."
        },
        {
          title: "Sécurité & Confidentialité de niveau bancaire",
          desc: "Chiffrement AES-256, protocoles TLS 1.3 et respect scrupuleux des directives de l'ARTCI sur la protection des données financières et civiles."
        }
      ],
      actionBtn: "Contacter le Pôle Institutionnel",
      actionHref: "/contact"
    }
  ];

  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay" />
      <Header />

      <main className="relative z-10">
        {/* ─── HERO ─── */}
        <section
          className="relative pt-40 pb-28 overflow-hidden"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
              backgroundSize: "60px 60px"
            }}
          />
          <div
            className="absolute inset-0 z-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 40% 30%, rgba(245,158,11,0.14) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(2,132,199,0.12) 0%, transparent 55%)"
            }}
          />

          <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-8 text-amber-400"
                style={{ background: "rgba(245,158,11,0.08)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Solutions Métiers Spécialisées · Marché Ivoirien
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Une Infrastructure Dédiée <br />
                <span style={{ color: "var(--mango)" }}>à Chaque Rôle du Secteur</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-12"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Que vous soyez propriétaire d'un studio, gestionnaire de plusieurs centaines de lots, locataire ou investisseur résidant à l'étranger, QAPRIL vous offre un espace adapté à vos priorités.
              </p>

              {/* Onglets de sélection de rôle */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl max-w-4xl mx-auto">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        isSelected
                          ? "bg-[#D97706] text-white shadow-lg shadow-amber-500/25 scale-105"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {role.icon}
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── DÉTAIL DE LA SOLUTION SÉLECTIONNÉE ─── */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div
            key={currentRole.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Bannière Header Métier */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 mb-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-8">
                  <span
                    className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-4 border ${currentRole.badgeColor}`}
                  >
                    {currentRole.tagline}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                    {currentRole.heroTitle}
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                    {currentRole.desc}
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <Link
                    href={currentRole.actionHref}
                    className="qp-btn-gold-solid px-6 py-4 rounded-xl text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    {currentRole.actionBtn} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/tarifs"
                    className="px-6 py-3 rounded-xl text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Consulter la Grille Tarifaire
                  </Link>
                </div>
              </div>

              {/* Indicateurs clés chiffrés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-10 border-t border-slate-100">
                {currentRole.keyMetrics.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
                      {m.val}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grille des fonctionnalités détaillées */}
            <div className="mb-16">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-2 inline-block">
                  Fonctionnalités & Avantages Concrets
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Ce que QAPRIL change pour votre quotidien
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentRole.features.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] font-bold text-xs">
                          {fIdx + 1}
                        </div>
                        <h4 className="text-lg font-black text-slate-900">
                          {feat.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" /> Disponible immédiatement
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── MATRICE COMPARATIVE DES DROITS & ACCÈS ─── */}
        <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-200">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-[#B45309] mb-3 inline-block">
              Vue Synoptique
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Matrice de Couverture Fonctionnelle par Métier
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Chaque intervenant dispose d'une vue étanche et sécurisée, tout en collaborant sur un registre unique et partagé.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 bg-white rounded-2xl shadow-sm text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-slate-600">Fonctionnalité</th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#D97706] text-center">Propriétaire</th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#0284C7] text-center">Locataire</th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#059669] text-center">Agence</th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-purple-700 text-center">Diaspora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Bail certifié & Signature OTP SMS</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Paiement Mobile Money (Wave, Orange, MTN, Moov)</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Réception</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">Émission</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Supervision</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Réception</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Consignation Réglementaire de la Caution (CDC)</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Score ICL & Passeport Locatif numérique</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Consultation</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">Titulaire</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Consultation</td>
                  <td className="p-4 sm:p-5 text-center text-slate-400">Consultation</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">États des Lieux photos HD entrée/sortie</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓ HD</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Déclarations fiscales DGI automatisées</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-slate-300">-</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Rapatriement de fonds international</td>
                  <td className="p-4 sm:p-5 text-center text-slate-300">-</td>
                  <td className="p-4 sm:p-5 text-center text-slate-300">-</td>
                  <td className="p-4 sm:p-5 text-center text-slate-300">-</td>
                  <td className="p-4 sm:p-5 text-center text-[#059669] font-black">✓ Devises</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── BANNIÈRE CTA BAS DE PAGE ─── */}
        <section
          className="py-20 px-6 text-center text-white relative overflow-hidden"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 70%)"
            }}
          />
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400 mb-4 inline-block">
              Passez à la Vitesse Supérieure
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 uppercase">
              Prêt à expérimenter la gestion immobilière sans friction ?
            </h2>
            <p
              className="text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Créez votre compte gratuitement en 2 minutes ou planifiez une démonstration personnalisée avec un conseiller.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="qp-btn-gold-solid px-8 py-4 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/20"
              >
                Commencer Gratuitement <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                Prendre Rendez-vous
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
