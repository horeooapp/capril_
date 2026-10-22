"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  Star, Quote, CheckCircle2, MessageSquare, Building2,
  Users, Briefcase, Globe, Send, ArrowRight, ShieldCheck,
  TrendingUp, Award, ThumbsUp
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const TESTIMONIALS = [
  {
    id: 1,
    name: "Kouassi Amani",
    role: "Propriétaire Bailleur",
    location: "Cocody Angré · 12 appartements",
    avatar: "KA",
    color: "#F59E0B",
    category: "BAILLEUR",
    rating: 5,
    title: "Mes loyers arrivent le 05 du mois sans aucune relance téléphonique",
    text: "Avant QAPRIL, je passais mes fins de mois à courir après mes locataires et à rédiger des reçus papier qui finissaient froissés ou perdus. Aujourd'hui, 100 % de mes baux sont signés par code SMS et les loyers tombent directement sur mon compte Wave et Orange Money. En cas de contrôle, j'ai tout mon dossier fiscal prêt en un clic.",
    highlight: "12 baux certifiés · 0 impayé depuis 14 mois",
  },
  {
    id: 2,
    name: "Oulaye Mensah",
    role: "Locataire",
    location: "Abidjan Plateau · 3 pièces",
    avatar: "OM",
    color: "#059669",
    category: "LOCATAIRE",
    rating: 5,
    title: "La quittance PDF avec QR code m'a sauvé pour mon visa",
    text: "Payer mon loyer à minuit depuis mon canapé via Wave et recevoir immédiatement la quittance horodatée avec le QR code de certification, c'est ce dont tous les locataires ivoiriens rêvaient. J'ai pu fournir mon historique locatif officiel de 12 mois pour mon dossier de visa sans devoir solliciter mon propriétaire.",
    highlight: "Quittance reçue en 15 secondes après paiement",
  },
  {
    id: 3,
    name: "Mme Diabaté Fatoumata",
    role: "Directrice d'Agence",
    location: "Agence Prestige Immo · 45 mandats",
    avatar: "DF",
    color: "#7C3AED",
    category: "AGENCE",
    rating: 5,
    title: "Nous avons divisé par 4 le temps passé sur la gestion locative",
    text: "En tant qu'agence, la réconciliation bancaire entre les virements manuels et les lots était un casse-tête quotidien. Avec le portail agence QAPRIL, les quittances mandataires sont envoyées automatiquement et nos clients propriétaires ont leur propre écran de supervision. Notre taux de rétention client a bondi.",
    highlight: "45 mandats gérés avec 1 seule gestionnaire",
  },
  {
    id: 4,
    name: "Coulibaly Drissa",
    role: "Investisseur Diaspora",
    location: "Résident à Paris · 6 logements à Bingerville",
    avatar: "CD",
    color: "#0EA5E9",
    category: "DIASPORA",
    rating: 5,
    title: "Je supervise mes biens en Côte d'Ivoire avec une sérénité totale",
    text: "Gérer un patrimoine à distance depuis la France était une source d'angoisse permanente : loyers détournés, promesses non tenues. QAPRIL m'offre une transparence absolue. Chaque encaissement est notifié, le contrat de bail est scellé conformément aux lois d'Abidjan, et les fonds sont sécurisés.",
    highlight: "Supervision 100% à distance depuis l'Europe",
  },
  {
    id: 5,
    name: "Bertrand Fofana",
    role: "Propriétaire",
    location: "Marcory Zone 4 · 4 duplex",
    avatar: "BF",
    color: "#CC2020",
    category: "BAILLEUR",
    rating: 5,
    title: "Le Score ICL m'a évité un locataire à très haut risque",
    text: "Lors d'une relocation le mois dernier, le candidat me semblait parfait mais son Score ICL a révélé des antécédents d'impayés répétés sur sa précédente location. J'ai choisi un autre profil noté Grade A+ qui paie rubis sur l'ongle depuis le premier jour. Cet outil est révolutionnaire.",
    highlight: "Évaluation du risque locatif vérifiée",
  },
  {
    id: 6,
    name: "Térèse Niamien",
    role: "Locataire",
    location: "Yopougon Maroc · 2 pièces",
    avatar: "TN",
    color: "#F59E0B",
    category: "LOCATAIRE",
    rating: 5,
    title: "Mon propriétaire ne peut plus me menacer arbitrairement",
    text: "Auparavant, le propriétaire augmentait le loyer sans préavis ou refusait de faire les réparations de plomberie. Sur QAPRIL, tout est consigné dans le contrat numérique et les réclamations de travaux sont tracées. On se sent enfin protégé par la loi.",
    highlight: "Protection contractuelle et conformité juridique",
  },
  {
    id: 7,
    name: "Cabinet Kouadio & Associés",
    role: "Administrateur de Biens",
    location: "Plateau & Riviera · 80 lots",
    avatar: "CK",
    color: "#059669",
    category: "AGENCE",
    rating: 5,
    title: "Un gain de crédibilité immense auprès de nos bailleurs institutionnels",
    text: "La certification numérique et la conformité avec la réglementation nationale ont convaincu nos plus gros investisseurs de nous confier leurs immeubles neufs. Les rapports DGI générés automatiquement en fin d'exercice fiscal sont un atout concurrentiel majeur.",
    highlight: "80 lots sous mandat certifié",
  },
  {
    id: 8,
    name: "Marc-Aurèle Yao",
    role: "Investisseur Diaspora",
    location: "Résident à Montréal · Immeuble R+3 à Abidjan",
    avatar: "MY",
    color: "#0EA5E9",
    category: "DIASPORA",
    rating: 5,
    title: "Fini les intermédiaires douteux et la perte d'argent",
    text: "Le séquestre de la caution et le versement direct sur mon compte ont éliminé toutes les zones d'ombre. QAPRIL est l'infrastructure qui manquait à la diaspora pour investir massivement dans la pierre en Côte d'Ivoire sans se faire abuser.",
    highlight: "Investissement sécurisé à 7 000 km d'Abidjan",
  },
];

export default function TemoignagesPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const filtered = filter === "ALL"
    ? TESTIMONIALS
    : TESTIMONIALS.filter((t) => t.category === filter);

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
            backgroundImage: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 75% 85%, rgba(5,150,105,0.08) 0%, transparent 50%)"
          }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 text-[11px] font-black uppercase tracking-[0.3em] mb-10 text-amber-400" style={{ background: "rgba(245,158,11,0.08)" }}>
                <Award className="w-3.5 h-3.5" />
                Avis & Retours d&apos;Expérience Vérifiés
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 uppercase">
                Ce que nos <br />
                <span style={{ color: "var(--mango)" }}>utilisateurs</span> disent
              </h1>
              <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
                Propriétaires, locataires, agences et investisseurs de la diaspora : découvrez comment QAPRIL transforme leur gestion quotidienne.
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-white/80">
                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="flex text-amber-400">★★★★★</div>
                  <span><strong>4.9 / 5</strong> (1 200+ avis)</span>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span><strong>4 800+</strong> utilisateurs actifs</span>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-sky-400" />
                  <span><strong>98 %</strong> de satisfaction</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FILTERS & TESTIMONIALS GRID ─── */}
        <section className="max-w-6xl mx-auto px-6 py-20">

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-16">
            {[
              { id: "ALL", label: "Tous les avis" },
              { id: "BAILLEUR", label: "Propriétaires Bailleurs" },
              { id: "LOCATAIRE", label: "Locataires" },
              { id: "AGENCE", label: "Agences Immobilières" },
              { id: "DIASPORA", label: "Diaspora" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${
                  filter === f.id
                    ? "bg-black text-white shadow-md scale-105"
                    : "bg-white text-ink/70 border border-black/8 hover:bg-black/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] p-8 sm:p-10 border border-black/8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-xs"
                        style={{ backgroundColor: t.color }}
                      >
                        {t.avatar}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-ink">{t.name}</h3>
                        <p className="text-xs font-bold text-amber-700">{t.role}</p>
                        <p className="text-xs text-ink3 mt-0.5">{t.location}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                  </div>

                  {/* Title & Body */}
                  <h4 className="text-base sm:text-lg font-black text-ink mb-3 leading-snug">
                    &laquo; {t.title} &raquo;
                  </h4>
                  <p className="text-sm text-ink3 leading-relaxed mb-6">
                    {t.text}
                  </p>
                </div>

                {/* Card Footer Badge */}
                <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.highlight}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── FEEDBACK SUBMISSION BANNER ─── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-black/8 shadow-xl mb-24"
          >
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-amber-100 text-amber-800">
                Votre Expérience Compte
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-ink tracking-tight uppercase">
                Vous utilisez déjà QAPRIL ?
              </h3>
              <p className="text-sm text-ink3 leading-relaxed">
                Partagez votre avis pour aider d&apos;autres propriétaires et locataires à sécuriser leurs transactions locatives.
              </p>

              {feedbackSent ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm">
                  ✓ Merci pour votre retour ! Votre avis sera modéré et publié sous peu.
                </div>
              ) : (
                <div className="pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-black text-xs uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Laisser un avis ou témoigner</span>
                  </Link>
                </div>
              )}
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
                Rejoignez la communauté
              </h3>
              <p className="text-white/60 text-base leading-relaxed">
                Digitalisez vos baux et encaissez vos loyers en toute sécurité dès aujourd&apos;hui.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-105"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/tarifs"
                  className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  Consulter les Tarifs
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
