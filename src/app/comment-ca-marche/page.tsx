"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Users, Building2, Briefcase, CheckCircle2, ArrowRight,
  Smartphone, FileText, CreditCard, ShieldCheck, HelpCircle,
  Clock, Zap, Check, Lock
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const ROLES_STEPS = {
  BAILLEUR: [
    {
      num: "01",
      duration: "2 minutes",
      title: "Créez votre compte Propriétaire",
      desc: "Renseignez vos coordonnées de base et validez votre numéro de téléphone via OTP SMS sécurisé.",
      details: ["Inscription sans carte bancaire", "Vérification instantanée par SMS", "Accès direct au tableau de bord"],
      accent: "#F59E0B",
    },
    {
      num: "02",
      duration: "3 minutes",
      title: "Enregistrez vos biens immobiliers",
      desc: "Ajoutez vos appartements, villas, studios ou immeubles avec adresse, loyer mensuel et charges associées.",
      details: ["Support mono-lot et multi-immeubles", "Référence cadastrale ou ACD (optionnel)", "Paramétrage des modes de paiement acceptés"],
      accent: "#059669",
    },
    {
      num: "03",
      duration: "5 minutes",
      title: "Invitez votre locataire & Rédigez le bail",
      desc: "Générez un contrat de bail 100 % conforme au droit ivoirien. Envoyez une invitation sécurisée à votre locataire.",
      details: ["Modèle juridique officiel conforme", "Signature électronique bilatérale par OTP", "Archivage numérique avec horodatage légal"],
      accent: "#0EA5E9",
    },
    {
      num: "04",
      duration: "Automatique",
      title: "Encaissez les loyers par Mobile Money",
      desc: "Vos locataires règlent via Wave, Orange Money, MTN MoMo ou Moov. Les fonds sont tracés et réconciliés en temps réel.",
      details: ["Génération automatique de la quittance PDF", "Notification instantanée à chaque encaissement", "Zéro manipulation d'espèces risquée"],
      accent: "#7C3AED",
    },
    {
      num: "05",
      duration: "En continu",
      title: "Pilotez et exportez vos états locatifs",
      desc: "Suivez le taux d'occupation, les scores ICL de vos locataires et exportez vos justificatifs comptables et fiscaux.",
      details: ["Rapports certifiés pour la DGI", "Alertes en cas d'impayé ou de fin de bail", "Assistance médiation en cas de litige"],
      accent: "#CC2020",
    },
  ],
  LOCATAIRE: [
    {
      num: "01",
      duration: "1 minute",
      title: "Rejoignez la plateforme par invitation",
      desc: "Recevez le lien d'accès envoyé par votre bailleur ou votre agence par SMS ou WhatsApp.",
      details: ["Aucun frais d'inscription", "Application web ultra-légère sans téléchargement", "Profil locataire sécurisé"],
      accent: "#059669",
    },
    {
      num: "02",
      duration: "3 minutes",
      title: "Vérifiez votre identité (KYC)",
      desc: "Téléchargez une pièce d'identité valide (CNI, Passeport, Attestation) pour certifier votre dossier.",
      details: ["Protection absolue de vos données personnelles", "Validation rapide par les équipes QAPRIL", "Dossier locatif numérique réutilisable"],
      accent: "#0EA5E9",
    },
    {
      num: "03",
      duration: "2 minutes",
      title: "Relisez et signez votre bail en ligne",
      desc: "Consultez l'ensemble des clauses contractuelles et signez via un code SMS sécurisé reçu sur votre mobile.",
      details: ["Valeur légale identique à une signature manuscrite", "Copie PDF téléchargeable à tout moment", "Conditions claires sans frais surprises"],
      accent: "#F59E0B",
    },
    {
      num: "04",
      duration: "30 secondes",
      title: "Payez votre loyer depuis votre téléphone",
      desc: "Réglez vos échéances sans vous déplacer via Wave, Orange Money, MTN ou Moov Money en quelques clics.",
      details: ["Paiement sécurisé et instantané", "Quittance PDF disponible immédiatement", "Historique de paiement irréfutable"],
      accent: "#7C3AED",
    },
    {
      num: "05",
      duration: "En continu",
      title: "Bâtissez votre Score ICL",
      desc: "Chaque paiement ponctuel améliore votre Indice de Confiance Locative et facilite vos futurs accès au logement.",
      details: ["Attestation de régularité locative", "Grade de confiance A+, A ou B", "Avantages exclusifs partenaires"],
      accent: "#CC2020",
    },
  ],
  AGENCE: [
    {
      num: "01",
      duration: "5 minutes",
      title: "Ouvrez votre portail Agence & Mandats",
      desc: "Espace multi-utilisateurs dédié aux professionnels de l'immobilier, administrateurs de biens et cabinets.",
      details: ["Gestion des rôles (gestionnaires, comptables)", "Mandats de gestion personnalisables", "Logo de votre agence sur les baux"],
      accent: "#7C3AED",
    },
    {
      num: "02",
      duration: "10 minutes",
      title: "Importez vos parcs de gestion en masse",
      desc: "Importation fluide de vos propriétaires, lots, baux en cours et locataires via fichier Excel ou API.",
      details: ["Importation assistée par nos experts", "Prise en charge des parcs de 10 à 500+ lots", "Vérification automatique de conformité"],
      accent: "#059669",
    },
    {
      num: "03",
      duration: "Automatique",
      title: "Centralisez les flux et quittances",
      desc: "Les loyers collectés sont automatiquement rapprochés des lots avec génération des quittances mandataire.",
      details: ["Déduction automatique des honoraires d'agence", "Rapports mensuels prêts pour les propriétaires", "Moins de 80% de temps de saisie administrative"],
      accent: "#F59E0B",
    },
    {
      num: "04",
      duration: "En continu",
      title: "Sécurisez les cautions et états des lieux",
      desc: "Bénéficiez du séquestre officiel des cautions et du comparateur d'état des lieux numérique photo.",
      details: ["Traçabilité juridique complète", "Photos horodatées non modifiables", "Évite 100% des litiges de restitution"],
      accent: "#0EA5E9",
    },
  ],
};

const HOW_FAQS = [
  {
    q: "Ai-je besoin d'installer une application sur mon téléphone ?",
    a: "Non. QAPRIL fonctionne directement sur n'importe quel navigateur (Chrome, Safari, Edge) sur smartphone, tablette ou ordinateur. Le site est optimisé pour les réseaux mobiles ivoiriens avec une vitesse de chargement instantanée.",
  },
  {
    q: "Quelle est la valeur juridique d'un bail signé sur QAPRIL ?",
    a: "Le contrat est 100 % conforme à la loi ivoirienne n° 2019-576 sur les baux d'habitation et au Code Civil. La signature par OTP SMS est reconnue par les tribunaux ivoiriens et l'ARTCI comme ayant la même valeur probante qu'une signature manuscrite.",
  },
  {
    q: "Comment le propriétaire reçoit-il l'argent des loyers ?",
    a: "Lorsque le locataire règle par Wave, Orange Money ou MTN, les fonds sont instantanément crédités sur le compte bancaire ou le compte Mobile Money enregistré par le propriétaire.",
  },
  {
    q: "Que se passe-t-il si un locataire n'a pas de smartphone ?",
    a: "Le bailleur ou l'agence peut envoyer le lien par SMS simple. Le locataire peut signer depuis n'importe quel terminal connecté ou se faire assister physiquement.",
  },
];

export default function CommentCaMarchePage() {
  const [activeTab, setActiveTab] = useState<"BAILLEUR" | "LOCATAIRE" | "AGENCE">("BAILLEUR");

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
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(14,165,233,0.08) 0%, transparent 50%)"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <Clock className="w-3.5 h-3.5" />
                Guide d&apos;Utilisation Pas à Pas
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 uppercase">
                Comment <br />
                <span style={{ color: "var(--mango)" }}>ça marche ?</span>
              </h1>
              <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Moins de 10 minutes suffisent pour numériser votre gestion locative. Découvrez le parcours adapté à votre profil.
              </p>

              {/* Role selector tabs */}
              <div className="inline-flex p-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl">
                {[
                  { id: "BAILLEUR", label: "Propriétaire Bailleur", icon: <Building2 className="w-4 h-4" /> },
                  { id: "LOCATAIRE", label: "Locataire", icon: <Users className="w-4 h-4" /> },
                  { id: "AGENCE", label: "Agence Immobilière", icon: <Briefcase className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                      activeTab === tab.id
                        ? "bg-[#F59E0B] text-black shadow-lg"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── TIMELINE SECTION ─── */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="space-y-8 mb-24">
            {ROLES_STEPS[activeTab].map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/8 shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row md:items-start gap-8"
              >
                {/* Left Number Badge */}
                <div className="shrink-0 flex md:flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-md"
                    style={{ backgroundColor: step.accent }}
                  >
                    {step.num}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-black/40 bg-black/5 px-3 py-1 rounded-full">
                    {step.duration}
                  </span>
                </div>

                {/* Right Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-ink tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-ink3 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {step.details.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-ink bg-cream p-3 rounded-xl border border-black/5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── FAQ ─── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-black/5 text-ink/60 mb-3">
                Aide & Précisions
              </span>
              <h3 className="text-3xl font-black text-ink tracking-tight uppercase">
                Questions fréquentes sur le parcours
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HOW_FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-black/8 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <h4 className="font-black text-base text-ink">{faq.q}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-ink3 leading-relaxed pl-8">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ─── CTA ─── */}
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
                Commencez en quelques clics
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Aucun engagement, aucune carte requise. Rejoignez la communauté immobilière nouvelle génération en Côte d&apos;Ivoire.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-105"
                >
                  Je commence en tant que Propriétaire
                </Link>
                <Link
                  href="/mon-espace-locataire/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Je suis Locataire
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
