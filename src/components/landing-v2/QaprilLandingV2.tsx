"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { choisirTypeConnexion } from "@/actions/auth.actions";
import { motion } from "framer-motion";
import {
  Building2, Home, ShieldCheck, ArrowRight, Zap, FileText,
  CreditCard, Users, TrendingUp, Lock, Star, CheckCircle2,
  BarChart3, Smartphone, Bell, MessageSquare, Globe, Award
} from "lucide-react";

export default function QaprilLandingV2({ session, paywallActif = true }: { session: any; paywallActif?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";
  const dashUrl = isAdmin ? "/admin" : session?.user?.role === "TENANT" ? "/mon-espace-locataire" : "/dashboard";

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".qv3-reveal").forEach((el) => obs.observe(el));
    return () => { window.removeEventListener("scroll", handleScroll); obs.disconnect(); };
  }, []);

  const handleLogin = async (role: "LOCATAIRE" | "BAILLEUR" | "ADMIN") => {
    await choisirTypeConnexion(role);
  };

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Baux Numérisés",
      desc: "Rédigez, signez et archivez vos contrats de bail en quelques minutes. Conformes au droit ivoirien.",
      tag: "Légal & Conforme",
      size: "large",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Paiement Mobile",
      desc: "Orange Money, MTN, Wave, Moov — tous les moyens de paiement ivoiriens intégrés nativement.",
      tag: "FinTech",
      size: "small",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Score ICL",
      desc: "Un score de fiabilité unique pour chaque locataire. Réduisez vos risques d'impayés.",
      tag: "Intelligence",
      size: "small",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Propriétaire",
      desc: "Visualisez l'état de votre patrimoine en temps réel. Loyers, taux d'occupation, alertes — tout en un seul écran.",
      tag: "Tableau de Bord",
      size: "large",
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Alertes Intelligentes",
      desc: "Notifications automatiques pour les impayés, fins de bail et demandes de maintenance.",
      tag: "Automatisation",
      size: "small",
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Sécurité & Conformité",
      desc: "Données hébergées et chiffrées. Conformité RGPD et droit ivoirien.",
      tag: "Sécurité",
      size: "small",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  const stats = [
    { value: "4 800+", label: "Utilisateurs actifs", sub: "Propriétaires & Locataires" },
    { value: "98%", label: "Satisfaction client", sub: "Note moyenne 4.9/5" },
    { value: "48h", label: "Délai de formalisation", sub: "De la signature au bail actif" },
    { value: "0 FCFA", label: "Frais cachés", sub: "Tarification transparente" },
  ];

  const steps = [
    {
      num: "01",
      title: "Créez votre compte",
      desc: "Inscription en 2 minutes. Choisissez votre profil : Locataire, Propriétaire ou Agence.",
      icon: <Users className="w-5 h-5" />,
    },
    {
      num: "02",
      title: "Ajoutez vos biens ou trouvez votre logement",
      desc: "Propriétaires : importez votre patrimoine. Locataires : accédez à votre espace via invitation.",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      num: "03",
      title: "Formalisez votre bail numériquement",
      desc: "Contrat conforme au droit ivoirien, signé électroniquement, archivé automatiquement.",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      num: "04",
      title: "Payez et gérez en temps réel",
      desc: "Loyers via mobile money, quittances PDF automatiques, tableaux de bord en direct.",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  const testimonials = [
    {
      name: "Kouassi Amani",
      role: "Propriétaire · 12 biens",
      avatar: "KA",
      color: "bg-amber-500",
      text: "Avant QAPRIL, je courais après mes loyers chaque mois. Maintenant tout est automatisé. Je reçois mes notifications et mes quittances sans rien faire.",
      stars: 5,
    },
    {
      name: "Oulaye Mensah",
      role: "Locataire · Abidjan Plateau",
      avatar: "OM",
      color: "bg-emerald-600",
      text: "Payer mon loyer via Wave directement depuis l'app, c'est exactement ce dont j'avais besoin. Plus besoin de me déplacer au bureau de l'agence.",
      stars: 5,
    },
    {
      name: "Agence Prestige Immo",
      role: "Agence · 28 mandats",
      avatar: "PI",
      color: "bg-sky-600",
      text: "La gestion de nos 28 mandats est devenue fluide. Le tableau de bord propriétaire est remarquable de clarté. Nos clients sont ravis.",
      stars: 5,
    },
    {
      name: "Bertrand Fofana",
      role: "Propriétaire · 3 appartements",
      avatar: "BF",
      color: "bg-violet-600",
      text: "Le score ICL m'a permis d'éviter un mauvais locataire. Un outil indispensable pour tout propriétaire sérieux.",
      stars: 5,
    },
    {
      name: "Térèse Niamien",
      role: "Locataire · Cocody",
      avatar: "TN",
      color: "bg-rose-600",
      text: "Mon bail numérique est toujours accessible sur mon téléphone. En cas de litige, j'ai toutes les preuves. Très rassurant.",
      stars: 5,
    },
    {
      name: "Coulibaly Drissa",
      role: "Investisseur · 8 biens",
      avatar: "CD",
      color: "bg-indigo-600",
      text: "Je gère mon portefeuille depuis Paris. QAPRIL me donne une visibilité totale sur mes biens en Côte d'Ivoire. Révolutionnaire.",
      stars: 5,
    },
  ];

  const paymentLogos = [
    { name: "Orange Money", emoji: "🟠", color: "text-orange-500" },
    { name: "MTN MoMo", emoji: "💛", color: "text-yellow-500" },
    { name: "Wave", emoji: "🔵", color: "text-blue-500" },
    { name: "Moov Money", emoji: "🟢", color: "text-green-500" },
    { name: "Visa", emoji: "💳", color: "text-blue-400" },
    { name: "MasterCard", emoji: "🔴", color: "text-red-500" },
  ];

  return (
    <div className="qv3-wrapper bg-[#09090B] text-white font-sans antialiased tracking-tight overflow-x-hidden">

      {/* ═══════════════════════════════════
          NAV
      ═══════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-300 ${
        scrolled ? "bg-[#09090B]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}>
        <a href="#" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="QAPRIL" className="h-9 w-auto object-contain brightness-110" />
        </a>
        <div className="hidden md:flex items-center gap-1">
          {["#features", "#howto", "#testimonials"].map((href, i) => (
            <a key={i} href={href} className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white/90 transition-colors rounded-lg hover:bg-white/5">
              {["Fonctionnalités", "Comment ça marche", "Avis"][i]}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link href={dashUrl} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-5 py-2 rounded-full transition-all">
              Mon Espace <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button onClick={() => handleLogin("LOCATAIRE")} className="hidden md:block text-sm font-medium text-white/60 hover:text-white transition-colors px-4 py-2">
                Connexion
              </button>
              <button onClick={() => handleLogin("BAILLEUR")} className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-5 py-2 rounded-full transition-all qv3-btn-glow">
                Commencer →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════
          HERO
      ═══════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        
        {/* BG Slider */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[0, 1, 2, 3, 4].map((index) => (
            <img
              key={index}
              src={`/slider/bg_slider_${index + 1}.png`}
              alt={`QAPRIL Slider ${index + 1}`}
              className="transition-all duration-[2000ms] ease-in-out"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: bgIndex === index ? 0.35 : 0,
                transform: bgIndex === index ? 'scale(1)' : 'scale(1.05)'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/60 via-[#09090B]/30 to-[#09090B]"></div>
        </div>

        {/* Isometric Grid */}
        <div className="qv3-grid-bg absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay" />

        {/* Radial glow center */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-500/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-10 text-xs font-semibold text-white/70 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            🇨🇮 Plateforme immobilière n°1 en Côte d'Ivoire · 4 800+ utilisateurs actifs
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="text-[clamp(44px,7vw,88px)] font-[900] leading-[1.0] tracking-[-0.05em] mb-8"
          >
            <span className="text-white">La gestion locative</span>
            <br />
            <span className="qv3-text-gold">ivoirienne</span>
            <span className="text-white">, enfin</span>
            <br />
            <span className="text-white/30">moderne.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            QAPRIL connecte locataires, propriétaires et agences immobilières sur une seule infrastructure.
            Payez votre loyer, gérez vos biens, formalisez vos baux — tout en quelques clics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            {session?.user ? (
              <Link href={dashUrl} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base px-8 py-3.5 rounded-full transition-all qv3-btn-glow">
                Retourner au Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base px-8 py-3.5 rounded-full transition-all qv3-btn-glow"
                >
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </button>
                <a href="#howto" className="flex items-center gap-2 text-white/60 hover:text-white border border-white/10 hover:border-white/20 font-medium text-base px-8 py-3.5 rounded-full transition-all">
                  Voir comment ça marche
                </a>
              </>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="flex -space-x-2">
              {["KA", "OM", "BF", "TN", "CD"].map((initials, i) => (
                <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#09090B] flex items-center justify-center text-xs font-bold text-white ${["bg-amber-500","bg-emerald-600","bg-sky-600","bg-violet-600","bg-rose-600"][i]}`}>
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5 text-amber-400 text-sm">★★★★★</div>
              <div className="text-xs text-white/40 mt-0.5">4 800+ propriétaires & locataires</div>
            </div>
          </motion.div>
        </div>

        {/* Floating UI Cards */}
        <div className="absolute left-[5%] top-[35%] hidden xl:block qv3-float">
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/15 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Loyer reçu</div>
              <div className="text-[11px] text-white/40 mt-0.5">135 000 FCFA · Orange Money</div>
            </div>
          </div>
        </div>

        <div className="absolute right-[5%] top-[40%] hidden xl:block qv3-float qv3-float-d1">
          <div className="bg-[#111827] border border-white/8 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Score ICL · Grade A</div>
              <div className="text-[11px] text-white/40 mt-0.5">Excellent locataire</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          PAYMENT TICKER
      ═══════════════════════════════════ */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5 overflow-hidden">
        <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
          Intégrations natives avec les acteurs du marché
        </div>
        <div className="flex overflow-hidden">
          <div className="qv3-ticker-track gap-0">
            {[...paymentLogos, ...paymentLogos].map((p, i) => (
              <div key={i} className="inline-flex items-center gap-2.5 px-10 text-sm font-semibold text-white/40">
                <span className="text-xl">{p.emoji}</span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════
          FEATURES — BENTO GRID
      ═══════════════════════════════════ */}
      <section id="features" className="px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16 qv3-reveal">
          <div className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full mb-5">
            Fonctionnalités
          </div>
          <h2 className="text-[clamp(32px,4vw,52px)] font-[900] tracking-[-0.04em] text-white mb-4">
            Tout ce dont vous avez besoin.<br />
            <span className="text-white/30">Rien de superflu.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Une plateforme conçue pour l'immobilier ivoirien, avec les intégrations qui comptent vraiment.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Large 1 */}
          <div className="md:col-span-2 qv3-bento-card bg-[#111827] border border-white/8 rounded-3xl p-8 qv3-reveal">
            <div className={`w-12 h-12 rounded-2xl ${features[0].bg} flex items-center justify-center ${features[0].color} mb-6`}>
              {features[0].icon}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{features[0].tag}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{features[0].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">{features[0].desc}</p>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs text-white/20 font-medium">Conforme au Code Civil Ivoirien</span>
            </div>
          </div>

          {/* Card Small 1 */}
          <div className="qv3-bento-card bg-[#111827] border border-white/8 rounded-3xl p-8 qv3-reveal qv3-reveal-d1">
            <div className={`w-12 h-12 rounded-2xl ${features[1].bg} flex items-center justify-center ${features[1].color} mb-6`}>
              {features[1].icon}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{features[1].tag}</div>
            <h3 className="text-xl font-bold text-white mb-3">{features[1].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{features[1].desc}</p>
          </div>

          {/* Card Small 2 */}
          <div className="qv3-bento-card bg-[#111827] border border-white/8 rounded-3xl p-8 qv3-reveal">
            <div className={`w-12 h-12 rounded-2xl ${features[2].bg} flex items-center justify-center ${features[2].color} mb-6`}>
              {features[2].icon}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{features[2].tag}</div>
            <h3 className="text-xl font-bold text-white mb-3">{features[2].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{features[2].desc}</p>
          </div>

          {/* Card Small 3 */}
          <div className="qv3-bento-card bg-[#111827] border border-white/8 rounded-3xl p-8 qv3-reveal qv3-reveal-d1">
            <div className={`w-12 h-12 rounded-2xl ${features[4].bg} flex items-center justify-center ${features[4].color} mb-6`}>
              {features[4].icon}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{features[4].tag}</div>
            <h3 className="text-xl font-bold text-white mb-3">{features[4].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{features[4].desc}</p>
          </div>

          {/* Card Large 2 */}
          <div className="md:col-span-2 qv3-bento-card bg-[#111827] border border-white/8 rounded-3xl p-8 qv3-reveal qv3-reveal-d2">
            <div className={`w-12 h-12 rounded-2xl ${features[3].bg} flex items-center justify-center ${features[3].color} mb-6`}>
              {features[3].icon}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-3">{features[3].tag}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{features[3].title}</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">{features[3].desc}</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {["Loyers encaissés", "Taux d'occupation", "Alertes actives"].map((label, i) => (
                <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
                  <div className="text-lg font-bold qv3-text-gold">—</div>
                  <div className="text-[10px] text-white/30 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          STATS BAND
      ═══════════════════════════════════ */}
      <section className="bg-[#0F172A] border-y border-white/5 py-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`text-center qv3-reveal qv3-reveal-d${i}`}>
              <div className="text-[clamp(36px,5vw,64px)] font-[900] tracking-[-0.05em] qv3-text-gold mb-2">
                {s.value}
              </div>
              <div className="text-sm font-semibold text-white mb-1">{s.label}</div>
              <div className="text-xs text-white/30">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          HOW IT WORKS — VERTICAL TIMELINE
      ═══════════════════════════════════ */}
      <section id="howto" className="px-6 md:px-10 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-20 qv3-reveal">
          <div className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded-full mb-5">
            Comment ça marche
          </div>
          <h2 className="text-[clamp(30px,4vw,50px)] font-[900] tracking-[-0.04em] text-white mb-4">
            Opérationnel en moins de 10 minutes.
          </h2>
          <p className="text-white/40 text-lg">Aucune installation requise. Tout depuis votre navigateur.</p>
        </div>

        <div className="relative">
          <div className="qv3-timeline-line" />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className={`flex gap-10 items-start qv3-reveal qv3-reveal-d${i}`}>
                <div className="relative flex-shrink-0 w-14 h-14 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center z-10">
                  <span className="text-amber-400 font-black text-lg">{step.num}</span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-emerald-400">{step.icon}</div>
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          TESTIMONIALS — MASONRY
      ═══════════════════════════════════ */}
      <section id="testimonials" className="px-6 md:px-10 py-24 bg-[#0B1220]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 qv3-reveal">
            <div className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-sky-400 bg-sky-400/10 px-4 py-1.5 rounded-full mb-5">
              Témoignages
            </div>
            <h2 className="text-[clamp(30px,4vw,50px)] font-[900] tracking-[-0.04em] text-white mb-4">
              Ils font confiance à QAPRIL.
            </h2>
            <p className="text-white/40 text-lg">Des milliers d'utilisateurs satisfaits à travers la Côte d'Ivoire.</p>
          </div>

          <div className="qv3-masonry">
            {testimonials.map((t, i) => (
              <div key={i} className="qv3-masonry-item">
                <div className="bg-[#111827] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors">
                  <div className="flex items-center gap-0.5 text-amber-400 text-sm mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => <span key={j}>★</span>)}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/30">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════ */}
      <section className="relative px-6 md:px-10 py-32 text-center overflow-hidden bg-[#09090B]">
        <div className="qv3-grid-bg absolute inset-0 pointer-events-none opacity-60" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-8">
            <Award className="w-3.5 h-3.5" />
            Rejoignez 4 800+ utilisateurs
          </div>
          <h2 className="text-[clamp(36px,5vw,68px)] font-[900] tracking-[-0.05em] text-white mb-6 leading-[1.05]">
            Prêt à moderniser<br />
            <span className="qv3-text-gold">votre gestion locative ?</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Commencez gratuitement aujourd'hui. Aucune carte de crédit requise.
            Vos données sont sécurisées et hébergées localement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session?.user ? (
              <Link href={dashUrl} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg px-10 py-4 rounded-full transition-all qv3-btn-glow">
                Accéder à mon espace <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button onClick={() => handleLogin("BAILLEUR")} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-base px-10 py-4 rounded-full transition-all qv3-btn-glow">
                  Créer mon compte propriétaire <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => handleLogin("LOCATAIRE")} className="text-white/60 hover:text-white border border-white/10 hover:border-white/20 font-medium text-base px-8 py-4 rounded-full transition-all">
                  Accès locataire
                </button>
              </>
            )}
          </div>
          <p className="text-white/20 text-xs mt-6">Accès sécurisé · Données chiffrées · Conforme au droit ivoirien</p>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FOOTER
      ═══════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-[#09090B] px-6 md:px-10 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-1">
              <img src="/logo.png" alt="QAPRIL" className="h-10 w-auto object-contain brightness-110 mb-4" />
              <p className="text-sm text-white/30 leading-relaxed max-w-[200px]">
                L'infrastructure immobilière de référence en Côte d'Ivoire.
              </p>
            </div>
            {[
              { title: "Produit", links: ["Fonctionnalités", "Tarifs", "Sécurité", "API"] },
              { title: "Portails", links: ["Espace Locataire", "Espace Propriétaire", "Administration", "Agences"] },
              { title: "Légal", links: ["Mentions légales", "Politique de confidentialité", "CGU", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-5">{col.title}</div>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} QAPRIL Infrastructure. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/20 bg-white/5 border border-white/8 px-3 py-1 rounded-full">🇨🇮 Made in Côte d'Ivoire</span>
              <span className="text-xs text-white/20 bg-white/5 border border-white/8 px-3 py-1 rounded-full">🔒 ISO 27001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
