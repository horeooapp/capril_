"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  FileText, CreditCard, TrendingUp, BarChart3, ShieldCheck,
  Wrench, CheckCircle2, ArrowRight, Zap, Lock, Smartphone,
  Users, Building2, Scale, Clock, Sparkles
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const FEATURES = [
  {
    id: "baux",
    icon: <FileText className="w-8 h-8" />,
    badge: "Juridique & Légal",
    title: "Baux Numérisés & Certifiés",
    subtitle: "100 % conforme au droit ivoirien et à la législation OHADA",
    desc: "Rédigez, validez et signez électroniquement vos contrats de bail en quelques clics sans intermédiaire physique. Chaque contrat généré intègre les clauses légales obligatoires en Côte d'Ivoire.",
    highlights: [
      "Signature électronique par OTP SMS à valeur probante légale",
      "Horodatage et scellement cryptographique des accords",
      "Clauses d'indexation et d'usage conformes au Code Civil ivoirien",
      "Archivage à vie dans un coffre-fort numérique sécurisé",
    ],
    accent: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    id: "paiements",
    icon: <CreditCard className="w-8 h-8" />,
    badge: "FinTech & Intégration",
    title: "Paiement Mobile Money & Quittances",
    subtitle: "Règlement en un clic via Wave, Orange, MTN, Moov et CB",
    desc: "Fini les déplacements en agence et les encaissements en espèces. Les locataires règlent leur loyer via leur opérateur mobile préféré, avec notification instantanée et quittance immédiate.",
    highlights: [
      "Intégration directe Wave, Orange Money, MTN MoMo, Moov Money",
      "Émission automatique d'une quittance certifiée PDF avec QR Code",
      "Zéro litige sur la date ou le montant : traçabilité bancaire complète",
      "Rapprochement comptable automatisé pour le bailleur",
    ],
    accent: "#059669",
    bg: "#D1FAE5",
  },
  {
    id: "score",
    icon: <TrendingUp className="w-8 h-8" />,
    badge: "Intelligence Artificielle",
    title: "Score ICL (Indice de Confiance Locative)",
    subtitle: "L'indicateur de solvabilité unique du marché ivoirien",
    desc: "Un algorithme exclusif qui évalue la régularité et l'historique de paiement de chaque locataire. Réduisez vos risques d'impayés de plus de 85 % avant toute signature de bail.",
    highlights: [
      "Classification par Grade (A+, A, B, C) basée sur l'historique réel",
      "Passeport locataire numérique partageable avec les bailleurs",
      "Valorisation des bons payeurs pour faciliter leur accès au logement",
      "Protection stricte des données et respect de la vie privée",
    ],
    accent: "#0EA5E9",
    bg: "#E0F2FE",
  },
  {
    id: "dashboard",
    icon: <BarChart3 className="w-8 h-8" />,
    badge: "Gestion de Patrimoine",
    title: "Dashboard Multi-Biens pour Propriétaires",
    subtitle: "Visualisez l'ensemble de vos actifs immobiliers en direct",
    desc: "Que vous possédiez un studio à Yopougon, une villa à Cocody ou plusieurs immeubles au Plateau, suivez vos encaissements, vos taux d'occupation et vos déclarations fiscales.",
    highlights: [
      "Suivi des encaissements et des retards en temps réel",
      "Export des états locatifs certifiés pour la DGI et l'administration",
      "Gestion centralisée des mandats pour les agences partenaires",
      "Alertes automatiques avant expiration de bail ou révision de loyer",
    ],
    accent: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    id: "cautions",
    icon: <ShieldCheck className="w-8 h-8" />,
    badge: "Séquestre Sécurisé",
    title: "Encadrement des Cautions & Garantie",
    subtitle: "Séquestre digital transparent conforme aux réglementations",
    desc: "Sécurisez les dépôts de garantie lors de l'entrée dans les lieux. QAPRIL garantit la séquestration et la traçabilité des fonds pour une restitution sans conflit à la fin du bail.",
    highlights: [
      "Gel sécurisé du dépôt de garantie dès l'entrée dans les lieux",
      "Processus de déblocage transparent basé sur l'état des lieux",
      "Médiation intégrée en cas de contestation sur les retenues",
      "Prévention des conflits bailleur-locataire",
    ],
    accent: "#CC2020",
    bg: "#FEE2E2",
  },
  {
    id: "maintenance",
    icon: <Wrench className="w-8 h-8" />,
    badge: "Opérations & Entretien",
    title: "Gestion des Incidents & État des Lieux",
    subtitle: "Signalez les pannes et formalisez l'état du logement",
    desc: "Un système complet pour consigner l'état des lieux d'entrée et de sortie avec photographies certifiées, et pour traiter les réclamations de travaux en toute transparence.",
    highlights: [
      "Comparateur numérique EDL Entrée vs EDL Sortie",
      "Signalement des incidents avec photos géolocalisées et horodatées",
      "Attribution des responsabilités selon la loi (bailleur vs locataire)",
      "Historique complet des interventions pour chaque logement",
    ],
    accent: "#D97706",
    bg: "#FEF3C7",
  },
];

const COMPARISON = [
  { feature: "Formalisation du bail", traditional: "Papier, 2 à 3 semaines, démarches physiques", qapril: "Numérique en 15 minutes, signature OTP certifiée" },
  { feature: "Paiement du loyer", traditional: "Espèces, chèques ou déplacements en agence", qapril: "Wave, Orange Money, MTN MoMo, Moov en 30 secondes" },
  { feature: "Quittances de loyer", traditional: "Manuelles, souvent perdues ou contestées", qapril: "Génération PDF instantanée avec QR code et scellé" },
  { feature: "Évaluation du locataire", traditional: "Intuition ou fiches de paie falsifiables", qapril: "Score ICL basé sur l'historique certifié de paiement" },
  { feature: "Gestion des impayés", traditional: "Relances par téléphone, conflits fréquents", qapril: "Alertes automatiques, médiation et assistance juridique" },
];

export default function FonctionnalitesPage() {
  const [selectedFeature, setSelectedFeature] = useState(0);

  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>
      <Header />

      <main className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="relative pt-40 pb-28 overflow-hidden" style={{ background: "var(--ink)" }}>
          <div className="absolute inset-0" aria-hidden style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
          <div className="absolute inset-0 z-0" aria-hidden style={{
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(5,150,105,0.08) 0%, transparent 50%)"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <Sparkles className="w-3.5 h-3.5" />
                Plateforme Immobilière Complète
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 uppercase">
                Toutes nos <br />
                <span style={{ color: "var(--mango)" }}>Fonctionnalités</span>
              </h1>
              <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Conçue pour simplifier la vie des propriétaires, sécuriser les locataires et donner aux agences des outils de pilotage de pointe en Côte d&apos;Ivoire.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-white/70">
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Automatisation 100%</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conformité juridique OHADA / CI</span>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mobile First & Accès Web</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES GRID ─── */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
              Modules Clés
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-ink tracking-tight uppercase">
              Une infrastructure pensée pour l&apos;immobilier ivoirien
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 border border-black/8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs" style={{ backgroundColor: feat.bg, color: feat.accent }}>
                      {feat.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/5 text-ink/60">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-ink mb-2">{feat.title}</h3>
                  <p className="text-xs font-bold mb-4" style={{ color: feat.accent }}>{feat.subtitle}</p>
                  <p className="text-sm text-ink3 leading-relaxed mb-6">{feat.desc}</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-black/5">
                  {feat.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-medium text-ink">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── TABLEAU COMPARATIF ─── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-black/8 shadow-xl mb-24"
          >
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-amber-100 text-amber-800 mb-3">
                Transformation Digitale
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-ink tracking-tight uppercase">
                Avant vs Avec QAPRIL
              </h3>
              <p className="text-sm text-ink3 mt-2">
                Découvrez pourquoi plus de 4 800 propriétaires et locataires ont abandonné la gestion papier.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black/10">
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-ink/40">Fonctionnalité</th>
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-red-500">Gestion Traditionnelle</th>
                    <th className="py-4 px-4 text-xs font-black uppercase tracking-wider text-emerald-600">Avec QAPRIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="hover:bg-cream/50 transition-colors">
                      <td className="py-4 px-4 font-black text-sm text-ink">{row.feature}</td>
                      <td className="py-4 px-4 text-sm text-ink3 font-medium">{row.traditional}</td>
                      <td className="py-4 px-4 text-sm font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.qapril}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ─── CTA BANNER ─── */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-10 sm:p-14 rounded-[2.5rem] text-center relative overflow-hidden"
            style={{ background: "var(--ink)" }}
          >
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Prêt à moderniser vos locations ?
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Inscrivez-vous en 2 minutes. Commencez gratuitement dès aujourd&apos;hui et prenez le contrôle de votre patrimoine.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-105"
                >
                  Créer un compte Propriétaire
                </Link>
                <Link
                  href="/mon-espace-locataire/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Accès Espace Locataire
                </Link>
              </div>
            </div>
          </motion.div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
