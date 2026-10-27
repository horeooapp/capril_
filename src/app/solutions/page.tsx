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
      label: "Propriétaires",
      icon: <Building2 className="w-5 h-5" />,
      tagline: "Pour tous les propriétaires : cours communes, maisons, villas, immeubles",
      heroTitle: "Encaissez vos loyers à bonne date et gérez vos biens en toute tranquillité",
      desc: "Suivez toutes vos locations sans le stress des retards de paiement, sans paperasse inutile et sans dépendre d'intermédiaires informels.",
      badgeColor: "bg-amber-50 text-[#B45309] border-amber-200",
      accent: "#D97706",
      keyMetrics: [
        { val: "99.2%", label: "Loyers payés à bonne date" },
        { val: "0 FCFA", label: "Commission sur le montant du loyer" },
        { val: "15 min", label: "Pour faire un bail complet" },
        { val: "100%", label: "Conforme à la loi N° 2019-576" }
      ],
      features: [
        {
          title: "Paiement direct Wave et Mobile Money",
          desc: "Vos locataires paient par Wave, Orange Money, MTN MoMo ou carte. Votre compte bancaire ou compte mobile est crédité directement sans avoir à courir après l'argent liquide."
        },
        {
          title: "Rappels automatiques sans gâter les relations",
          desc: "Des rappels polis et automatiques sont envoyés par SMS et WhatsApp avant l'échéance. En cas de retard, des courriers officiels clairs sont prêts en un clic."
        },
        {
          title: "Bilan annuel clair pour les impôts (DGI)",
          desc: "Téléchargez en un clic le récapitulatif annuel de vos loyers encaissés pour vos déclarations foncières sans erreur."
        },
        {
          title: "Contrats et reçus officiels reconnus par la loi",
          desc: "Chaque signature par code SMS et chaque reçu avec code QR sont infalsifiables et ont une vraie valeur juridique devant la justice."
        }
      ],
      actionBtn: "Ouvrir mon Espace Propriétaire",
      actionHref: "/dashboard"
    },
    {
      id: "locataires",
      label: "Locataires",
      icon: <Users className="w-5 h-5" />,
      tagline: "Pour tous les locataires qui veulent la tranquillité et le respect de leurs droits",
      heroTitle: "Louez en toute sérénité, payez par Wave / Mobile Money et gardez vos reçus",
      desc: "Accédez à un logement décent, signez votre contrat sur votre téléphone sans faux frais, payez sans faire de rang et récupérez votre caution sans palabre.",
      badgeColor: "bg-sky-50 text-[#0284C7] border-sky-200",
      accent: "#0284C7",
      keyMetrics: [
        { val: "0 FCFA", label: "Frais de dossier locataire" },
        { val: "2 mois", label: "Caution max légale en Côte d'Ivoire" },
        { val: "48h", label: "Remboursement rapide de la caution" },
        { val: "Score ICL", label: "Votre carnet de bon payeur à vie" }
      ],
      features: [
        {
          title: "Paiement du loyer en 1 clic sans déplacement",
          desc: "Payez directement depuis votre smartphone via Wave, Orange, MTN ou Moov à toute heure, sans chercher la monnaie ni retirer des espèces."
        },
        {
          title: "Reçus officiels conservés à vie sur votre mobile",
          desc: "Fini les carnets papier déchirés ou perdus. Tous vos reçus officiels avec code QR sont rangés dans votre espace, utilisables pour la banque, un prêt ou votre employeur."
        },
        {
          title: "Caution protégée (2 mois maximum)",
          desc: "Votre caution est strictement plafonnée à 2 mois maximum et gardée en sécurité. Aucune retenue injustifiée ne peut vous être imposée au départ."
        },
        {
          title: "Carnet de Confiance (Score ICL)",
          desc: "Chaque loyer payé à temps renforce votre réputation. Pour votre prochaine maison ou magasin, prouvez votre sérieux en un clic sans tracasseries."
        }
      ],
      actionBtn: "Accéder à l'Espace Locataire",
      actionHref: "/mon-espace-locataire"
    },
    {
      id: "agences",
      label: "Agences & Démarcheurs",
      icon: <Briefcase className="w-5 h-5" />,
      tagline: "Pour les agences immobilières, démarcheurs professionnels et syndics",
      heroTitle: "Gérez plus de maisons et d'immeubles en toute simplicité",
      desc: "Gagnez du temps sur l'administration, le prélèvement automatique de vos commissions, la rédaction rapide des baux et le suivi de vos agents sur le terrain.",
      badgeColor: "bg-emerald-50 text-[#059669] border-emerald-200",
      accent: "#059669",
      keyMetrics: [
        { val: "+300%", label: "Capacité de gestion accrue" },
        { val: "100%", label: "Mandats conformes Loi 2019-576" },
        { val: "Auto", label: "Prélèvement de votre commission" },
        { val: "Multi-sites", label: "Suivi centralisé de vos biens" }
      ],
      features: [
        {
          title: "Gestion multi-propriétaires et multi-immeubles",
          desc: "Supervisez tous vos biens avec une vue d'ensemble claire des contrats en cours, des entrées/sorties et des encaissements de chaque jour."
        },
        {
          title: "Prélèvement automatique de votre commission",
          desc: "Fixez votre taux de commission (ex. 8% ou 10%). À chaque loyer payé, votre commission est immédiatement séparée du montant reversé au propriétaire."
        },
        {
          title: "Mandats de gestion clairs et rapides",
          desc: "Rédigez et faites signer vos mandats de gestion avec les propriétaires par SMS sans rendez-vous interminables."
        },
        {
          title: "Comptes pour vos collaborateurs et agents de terrain",
          desc: "Donnez des accès simples à vos agents pour faire les états des lieux avec photos tout en gardant la main sur les comptes."
        }
      ],
      actionBtn: "Découvrir la Solution Agences",
      actionHref: "/contact"
    },
    {
      id: "diaspora",
      label: "Diaspora Ivoirienne",
      icon: <Globe className="w-5 h-5" />,
      tagline: "Pour les Ivoiriens et investisseurs vivant à l'étranger (France, USA, Canada...)",
      heroTitle: "Suivez vos maisons à Abidjan et en province depuis votre salon",
      desc: "Fini les soucis et les déconvenues avec les proches ou les démarcheurs informels. Suivez vos loyers en direct, signez vos contrats à distance et gardez le contrôle de votre patrimoine.",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      accent: "#7C3AED",
      keyMetrics: [
        { val: "24/7", label: "Accès en direct depuis l'étranger" },
        { val: "Zéro", label: "Dépendance envers les intermédiaires" },
        { val: "FCFA / EUR", label: "Suivi clair des montants" },
        { val: "Photos HD", label: "États des lieux visibles à distance" }
      ],
      features: [
        {
          title: "Alerte immédiate à chaque loyer versé",
          desc: "Dès que le locataire paie son loyer en Côte d'Ivoire, vous recevez une alerte sur votre téléphone avec le reçu officiel."
        },
        {
          title: "Versement sécurisé de vos loyers",
          desc: "Conservez vos revenus locatifs en toute sécurité sur votre espace ou virez-les directement sur votre compte bancaire."
        },
        {
          title: "États des lieux avec photos visibles à distance",
          desc: "Regardez les photos de l'état du logement à l'entrée et à la sortie pour vérifier vos biens sans devoir payer un billet d'avion."
        },
        {
          title: "Accompagnement juridique sur place",
          desc: "Bénéficiez du réseau d'experts juridiques et de commissaires de justice partenaires en Côte d'Ivoire en cas de difficulté."
        }
      ],
      actionBtn: "Gérer mes Biens depuis l'Étranger",
      actionHref: "/contact"
    },
    {
      id: "institutionnels",
      label: "Professionnels & Partenaires",
      icon: <Landmark className="w-5 h-5" />,
      tagline: "Pour les banques, la CDC-CI, la DGI, notaires et assureurs",
      heroTitle: "Fiabilisation des données locatives et traçabilité financière",
      desc: "Appuyez vos décisions de crédit, conformités fiscales et sécurisations de dépôts sur des historiques de paiement et des baux infalsifiables.",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      accent: "#047857",
      keyMetrics: [
        { val: "100%", label: "Traçabilité des paiements" },
        { val: "Sécurisé", label: "Conforme CDC-CI & DGI" },
        { val: "UEMOA", label: "Normes financières respectées" },
        { val: "Code QR", label: "Reçus vérifiables en direct" }
      ],
      features: [
        {
          title: "Historique locatif pour crédits bancaires",
          desc: "Utilisez le carnet de paiement certifié pour évaluer la capacité réelle de remboursement d'un client demandant un prêt."
        },
        {
          title: "Lien réglementaire avec la Caisse des Dépôts (CDC-CI)",
          desc: "Gestion automatique de la mise en réserve et du suivi des cautions locatives selon les règles de la CDC-CI."
        },
        {
          title: "Reçus et déclarations vérifiables pour les impôts",
          desc: "Reçus dotés de codes QR infalsifiables pour faciliter les contrôles et justifier les déclarations foncières."
        },
        {
          title: "Sécurité et protection des données privées",
          desc: "Respect strict des règles de l'ARTCI sur la confidentialité des données personnelles et financières des citoyens."
        }
      ],
      actionBtn: "Contacter le Pôle Partenaires",
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
                Des Solutions Adaptées à Chacun · Côte d'Ivoire
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8 uppercase">
                Une Solution Simple <br />
                <span style={{ color: "var(--mango)" }}>pour Chaque Profil</span>
              </h1>

              <p
                className="text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed mb-12"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Que vous soyez propriétaire d'une maison ou d'un grand immeuble, locataire, agent immobilier ou Ivoirien vivant à l'étranger, QAPRIL vous offre un espace adapté à vos priorités.
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
