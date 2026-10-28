"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { choisirTypeConnexion } from "@/actions/auth.actions";
import {
  FileText,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  ArrowRight,
  Lock,
  Wrench,
  Scale,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Check,
  Smartphone,
  Droplets,
  FolderArchive,
  BarChart4,
  BadgeCheck,
  Sparkles
} from "lucide-react";

const SLIDES = [
  {
    image: "/slider/bg_slider_1.png",
    title: "Résidence Moderne Abidjan",
    subtitle: "Sécurisation locative intégrale",
    location: "Cocody Ambassades",
  },
  {
    image: "/slider/bg_slider_2.png",
    title: "Immeuble d'Habitation Haut Standing",
    subtitle: "Baux numérisés & quittances certifiées",
    location: "Plateau · Centre d'Affaires",
  },
  {
    image: "/slider/bg_slider_3.png",
    title: "Villas Duplex & Domaines Privés",
    subtitle: "Dépôts de garantie consignés à la CDC-CI",
    location: "Riviera Golf · Zone Résidentielle",
  },
  {
    image: "/slider/bg_slider_4.png",
    title: "Ensemble Immobilier & Mandats d'Agence",
    subtitle: "Gestion multi-lots & reversements automatisés",
    location: "Marcory Zone 4",
  },
  {
    image: "/slider/bg_slider_5.png",
    title: "Parc Résidentiel Nouvelle Génération",
    subtitle: "Score ICL pour locataires certifiés",
    location: "Bingerville · Abidjan Est",
  },
];

export default function QaprilLandingV2({
  session,
  paywallActif = true,
}: {
  session: any;
  paywallActif?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"bailleurs" | "locataires" | "agences" | "institutionnels">("bailleurs");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";
  const dashUrl = isAdmin ? "/admin" : session?.user?.role === "TENANT" ? "/mon-espace-locataire" : "/dashboard";

  // Auto rotation du slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("qv4-visible");
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".qv4-reveal").forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      obs.disconnect();
    };
  }, []);

  const handleLogin = async (role: "LOCATAIRE" | "BAILLEUR" | "ADMIN") => {
    await choisirTypeConnexion(role);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="landing-v2-wrapper qp-grid-pattern-light min-h-screen text-slate-900 bg-[#F8FAFC] antialiased selection:bg-[#D97706] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════
          1. HEADER NAVIGATION : ÉLÉMENTS STRICTEMENT SUR UNE SEULE LIGNE
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
          scrolled
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-white/95 border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 flex-nowrap">
          {/* Logo & Identité */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            <img src="/logo.png" alt="QAPRIL" className="h-9 w-auto object-contain shrink-0" />
            <div className="border-l border-slate-200 pl-2.5 leading-tight">
              <span className="block text-xs font-black tracking-wider text-slate-900 uppercase">
                QAPRIL
              </span>
              <span className="block text-[9px] text-[#D97706] font-bold uppercase tracking-wider">
                Gestion Locative Simple
              </span>
            </div>
          </Link>

          {/* Navigation Centrale sur Une Seule Ligne */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0">
            <Link href="/piliers" className="hover:text-[#D97706] transition-colors">
              Piliers
            </Link>
            <Link href="/solutions" className="hover:text-[#D97706] transition-colors">
              Solutions
            </Link>
            <Link href="/services" className="hover:text-[#D97706] transition-colors">
              Services
            </Link>
            <Link href="/comparatif" className="hover:text-[#D97706] transition-colors">
              Comparatif
            </Link>
            <Link href="/tarifs" className="hover:text-[#D97706] transition-colors">
              Tarifs
            </Link>
            <Link href="/contact" className="hover:text-[#D97706] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions Droite sur Une Seule Ligne — Bouton Unique Connexion */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            {session?.user ? (
              <Link
                href={dashUrl}
                className="qp-btn-gold-solid px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                Mon Espace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="qp-btn-gold-solid px-4 sm:px-5 py-2 rounded text-xs sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                Connexion <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* ══════════════════════════════════════════════════════════════════
            2. HERO SECTION LUMINEUSE AVEC SLIDE D'IMAGES CLAIR ET VISIBLE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 py-12 lg:py-20 max-w-7xl mx-auto border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Colonne Gauche : Pitch Institutionnel */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-6">
                <BadgeCheck className="w-4 h-4 text-[#D97706]" />
                Conforme à la loi sur le bail d'habitation · Côte d'Ivoire
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                Gérez vos maisons et vos loyers en toute confiance,{" "}
                <span className="text-[#D97706]">sans friction.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
                Rédigez vos contrats de bail en toute règle, payez et encaissez vos loyers par Wave et Mobile Money avec reçu officiel immédiat, et sécurisez vos 2 mois de caution à la Caisse des Dépôts (CDC-CI). Tout est clair, rapide et protégé.
              </p>

              {/* 3 Portails Métiers Directs (Cartes Claires Opaques) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="qp-card-light p-4 text-left rounded-lg group transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="w-5 h-5 text-[#D97706]" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D97706] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Propriétaires
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Suivez vos maisons & touchez vos loyers sans vous déplacer.
                  </p>
                </button>

                <button
                  onClick={() => handleLogin("LOCATAIRE")}
                  className="qp-card-light p-4 text-left rounded-lg group transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-[#0284C7]" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0284C7] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Locataires
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Payez par Wave/Mobile Money & recevez votre reçu immédiat.
                  </p>
                </button>

                <Link
                  href="/dashboard/login/agency"
                  className="qp-card-light p-4 text-left rounded-lg group transition-all block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Layers className="w-5 h-5 text-[#059669]" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Agences & Démarcheurs
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gérez vos mandats, portefeuilles & commissions en toute clarté.
                  </p>
                </Link>
              </div>

              {/* Barre de Chiffres Clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-black text-slate-900">4 800+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Baux Signés</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#059669]">99.4 %</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loyers à Jour</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0284C7]">2 Mois</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Caution Max Légale</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#D97706]">0 Litige</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sans Solution</div>
                </div>
              </div>
            </div>

            {/* Colonne Droite : VRAI SLIDE D'IMAGES CLAIR & TRÈS VISIBLE */}
            <div className="lg:col-span-5">
              <div className="qp-card-light rounded-xl p-2.5 bg-white border border-slate-300 shadow-md">
                {/* Cadre de l'image du slide */}
                <div className="relative h-80 sm:h-96 w-full rounded-lg overflow-hidden bg-slate-900">
                  {SLIDES.map((slide, idx) => (
                    <img
                      key={idx}
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                      style={{
                        opacity: currentSlide === idx ? 1 : 0,
                        zIndex: currentSlide === idx ? 1 : 0,
                      }}
                    />
                  ))}

                  {/* Boutons précédent / suivant */}
                  <button
                    onClick={prevSlide}
                    aria-label="Diapositive précédente"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Diapositive suivante"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-md transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Badge descriptif de la photo en bas */}
                  <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-slate-900/85 text-white">
                    <div className="flex items-center justify-between text-xs font-mono text-[#F59E0B] mb-1">
                      <span>{SLIDES[currentSlide].location}</span>
                      <span>0{currentSlide + 1} / 0{SLIDES.length}</span>
                    </div>
                    <div className="font-bold text-sm text-white">
                      {SLIDES[currentSlide].title}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {SLIDES[currentSlide].subtitle}
                    </div>
                  </div>
                </div>

                {/* Indicateurs de diapositives cliquables */}
                <div className="flex items-center justify-between pt-3 px-2">
                  <div className="flex items-center gap-1.5">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                          currentSlide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Maisons, appartements & résidences en Côte d'Ivoire
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. BANDEAU DES PROTOCOLES & OPÉRATEURS DE PAIEMENT SUR UNE LIGNE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-2.5 border-b border-slate-200 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 flex-nowrap">
            {/* Titre / Label fixe sur la même ligne */}
            <div className="shrink-0 flex items-center gap-2 border-r border-slate-200 pr-4 whitespace-nowrap z-10 bg-white">
              <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                Paiements Faciles & Partenaires Officiels
              </span>
            </div>

            {/* Éléments en défilement continu fluide (Marquee infini) */}
            <div className="flex-1 overflow-hidden relative">
              <div className="qp-ticker-track-light flex items-center gap-2.5">
                {/* ── Set 1 ── */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7] shrink-0" />
                  <span>Wave CI</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>Orange Money</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                  <span>MTN MoMo</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Moov Money</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Visa & Mastercard</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>CDC-CI (Cautions)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>DGI (Quittances)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>CIE & SODECI</span>
                </div>

                {/* ── Set 2 (Duplication pour boucle infinie sans saut) ── */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#0284C7] shrink-0" />
                  <span>Wave CI</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>Orange Money</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                  <span>MTN MoMo</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>Moov Money</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Visa & Mastercard</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>CDC-CI (Cautions)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>DGI (Quittances)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>CIE & SODECI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. LES 4 PILIERS RÉGLEMENTAIRES & TECHNOLOGIQUES
        ══════════════════════════════════════════════════════════════════ */}
        <section id="piliers" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="mb-14 max-w-3xl">
            <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-3">
              Ce que QAPRIL fait pour vous
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Quatre garanties pour louer ou mettre en location l'esprit tranquille.
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              QAPRIL simplifie les démarches pour les propriétaires et les locataires, dans le respect strict des lois de Côte d'Ivoire.
            </p>
            <div className="mt-4">
              <Link href="/piliers" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Comprendre comment ça marche en détail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilier 1 */}
            <div className="qp-card-light p-8 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">PILIER 01</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2.5">
                  Contrat de bail clair & signature facile par SMS
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Remplissez votre contrat de bail d'habitation ou de commerce en quelques minutes. Les deux parties signent simplement avec un code secret reçu par SMS, sans avoir besoin de se déplacer. Le document est officiel et valable devant la loi.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Contrat 100 % conforme à la loi ivoirienne (Loi 2019-576)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Signature facile par SMS sur votre téléphone sans vous déplacer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Votre contrat est conservé en lieu sûr et disponible à tout moment
                </li>
              </ul>
            </div>

            {/* Pilier 2 */}
            <div className="qp-card-light p-8 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669]">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">PILIER 02</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2.5">
                  Paiement Wave & Mobile Money avec reçu officiel
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Payez le loyer en quelques secondes avec Wave, Orange Money, MTN ou Moov. Dès réception du paiement, le locataire reçoit aussitôt son reçu officiel avec code QR, et le propriétaire est immédiatement notifié. Fini les querelles et les reçus papier perdus.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Reçu de loyer officiel avec QR Code reconnu par les banques et services
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> L'argent arrive directement sur le compte ou le numéro du propriétaire
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Historique propre et sans contestation de chaque mois payé
                </li>
              </ul>
            </div>

            {/* Pilier 3 */}
            <div className="qp-card-light p-8 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">PILIER 03</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2.5">
                  Caution de 2 mois protégée à la Caisse des Dépôts (CDC-CI)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Respect strict de la loi ivoirienne : 2 mois de caution au maximum. L'argent est gardé en toute sécurité auprès de la Caisse des Dépôts et Consignations (CDC-CI). À la fin du contrat, la caution est reversée au locataire sans tracasserie si la maison est bien entretenue.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Plafonnement respecté : 2 mois de loyer au maximum
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Caution gardée en sécurité par l'institution publique (CDC-CI)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Remboursement rapide à la sortie des lieux sans rétention injustifiée
                </li>
              </ul>
            </div>

            {/* Pilier 4 */}
            <div className="qp-card-light p-8 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">PILIER 04</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2.5">
                  Carnet de confiance & profil locataire sérieux
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Chaque loyer payé à bonne date améliore la réputation du locataire. Ce carnet de confiance permet aux locataires sérieux de trouver facilement une nouvelle maison, et aux propriétaires de choisir des locataires fiables sans stress.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Niveau de confiance clair (du Grade A+ au Grade C)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Moins de risques d'impayés pour les propriétaires
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Attestation facile à présenter pour trouver un nouveau logement
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. SOLUTIONS DÉDIÉES PAR ACTEUR DU MARCHÉ (TABS)
        ══════════════════════════════════════════════════════════════════ */}
        <section id="solutions" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="mb-10 max-w-3xl">
            <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-3">
              Des solutions adaptées à chacun
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Que vous soyez propriétaire, locataire ou gestionnaire, QAPRIL vous facilite la vie.
            </h2>
            <div className="mt-3">
              <Link href="/solutions" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Explorer les fonctionnalités par métier <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Onglets Métiers Clairs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-200 rounded-lg max-w-2xl">
            <button
              onClick={() => setActiveTab("bailleurs")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === "bailleurs"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Propriétaires
            </button>
            <button
              onClick={() => setActiveTab("locataires")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === "locataires"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Locataires
            </button>
            <button
              onClick={() => setActiveTab("agences")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === "agences"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Agences & Démarcheurs
            </button>
            <button
              onClick={() => setActiveTab("institutionnels")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === "institutionnels"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Professionnels & Notaires
            </button>
          </div>

          {/* Contenu Tab Clair & Opaque */}
          <div className="qp-card-light p-6 sm:p-10 rounded-xl">
            {activeTab === "bailleurs" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2 block">
                    Pour propriétaires de maisons, cours communes, villas et appartements
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Touchez vos loyers à temps et sans prise de tête.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Que vous ayez un studio, une cour commune, une villa ou un immeuble entier, suivez tout sur votre téléphone. Ne passez plus vos fins de mois à réclamer votre argent.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Versement automatique :</strong> Loyers reçus directement sur votre compte Wave, Mobile Money ou compte bancaire dès que le locataire paie.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Rappels automatiques par SMS & WhatsApp :</strong> QAPRIL rappelle poliment l'échéance au locataire sans gâter vos relations humaines.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Bilan clair pour vos impôts :</strong> Obtenez en un clic la liste certifiée de tous vos loyers pour votre déclaration foncière.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLogin("BAILLEUR")}
                    className="qp-btn-gold-solid px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    Activer mon compte Propriétaire <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-[#D97706] mb-4 uppercase tracking-wider font-bold">
                    [Aperçu Tableau de Bord Propriétaire]
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Patrimoine suivi</span>
                      <span className="text-slate-900 font-bold">14 Biens · Abidjan (Cocody / Marcory)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Loyers encaissés ce mois</span>
                      <span className="text-[#059669] font-bold">4 250 000 XOF (100% à jour)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Cautions gardées en sécurité</span>
                      <span className="text-[#0284C7] font-bold">8 500 000 XOF (CDC-CI)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Dernier reçu délivré</span>
                      <span className="text-slate-900 font-bold">Reçu N° 2026-042 envoyé ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "locataires" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7] mb-2 block">
                    Pour tous ceux qui louent une maison ou un magasin
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Votre logement en règle, vos reçus immédiats et votre caution protégée.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Fini les déplacements à l'agence ou les reçus papier perdus. Payez depuis votre téléphone avec Wave ou Orange Money, retrouvez votre contrat de bail à tout moment et prouvez votre sérieux.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Zéro contestation :</strong> Un vrai reçu officiel avec code QR arrive sur votre téléphone dès que vous payez.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Caution de 2 mois protégée :</strong> Votre caution est mise en sécurité à la Caisse des Dépôts (CDC-CI), pas de surprise à la sortie.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Factures CIE & SODECI claires :</strong> Suivez vos compteurs d'eau et d'électricité en toute transparence sans surfacturation.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLogin("LOCATAIRE")}
                    className="qp-btn-dark-solid px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    Accéder à mon Espace Locataire <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-[#0284C7] mb-4 uppercase tracking-wider font-bold">
                    [Aperçu Espace Locataire]
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Niveau de confiance</span>
                      <span className="text-[#059669] font-bold">Très bon payeur (Grade A+)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Prochaine échéance</span>
                      <span className="text-slate-900 font-bold">05 Novembre · 180 000 XOF</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Caution protégée</span>
                      <span className="text-[#D97706] font-bold">360 000 XOF à la CDC-CI</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Mes reçus de loyer</span>
                      <span className="text-slate-700 font-bold">24 Reçus Disponibles</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "agences" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#059669] mb-2 block">
                    Pour Agences Immobilières, Démarcheurs Agréés & Administrateurs de Biens
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Gérez vos mandats et vos propriétaires avec clarté et professionnalisme.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Suivez des dizaines ou des centaines de logements sans confusion. Prélevez vos honoraires automatiquement et reversez la part de chaque propriétaire en toute transparence.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Gestion multi-biens & Reversements :</strong> Calcul automatique de vos commissions et reversement facile aux propriétaires.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Accès pour votre équipe :</strong> Comptes séparés pour vos agents de terrain, vos comptables et la direction.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Signature rapide des baux :</strong> Entrées et sorties simplifiées pour occuper rapidement tous vos logements disponibles.
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/mandates"
                    className="qp-btn-gold-solid px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    Déployer pour mon agence <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-[#059669] mb-4 uppercase tracking-wider font-bold">
                    [Aperçu Console Agence Partenaire]
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Lots sous gestion</span>
                      <span className="text-slate-900 font-bold">142 Logements sous mandat</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Taux d'occupation</span>
                      <span className="text-[#059669] font-bold">96.8 % de maisons louées</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Commissions d'agence</span>
                      <span className="text-[#D97706] font-bold">Automatisées à J+1</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Exports comptables</span>
                      <span className="text-slate-700 font-bold">Format Excel / Sage ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "institutionnels" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2 block">
                    Pour Notaires, Promoteurs & Professionnels de l'Immobilier
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Sécurité juridique, traçabilité et assainissement des locations.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    QAPRIL apporte toute la transparence nécessaire pour sécuriser les investissements locatifs, vérifier les identités et respecter les normes officielles de Côte d'Ivoire.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Contrats certifiés conformes :</strong> Respect rigoureux des règles ivoiriennes et de l'OHADA.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Prix des loyers par quartier :</strong> Données réelles pour connaître les montants pratiqués sur le marché.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Cautions sécurisées CDC-CI :</strong> Interconnexion officielle avec la Caisse des Dépôts et Consignations.
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="qp-btn-outline-light px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    Demander une présentation <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-[#D97706] mb-4 uppercase tracking-wider font-bold">
                    [Protocole Professionnel & Sécurité]
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Protection des documents</span>
                      <span className="text-slate-900 font-bold">Cryptage de niveau bancaire</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Signatures et reçus</span>
                      <span className="text-[#059669] font-bold">Infalsifiables & Inviolables</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Paiements & Opérations</span>
                      <span className="text-[#0284C7] font-bold">Conforme aux normes bancaires</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Protection des données</span>
                      <span className="text-slate-900 font-bold">Données hébergées en sécurité</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. SERVICES ET MODULES TECHNIQUES DE L'APPLICATION
        ══════════════════════════════════════════════════════════════════ */}
        <section id="modules" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="mb-14 max-w-3xl">
            <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-3">
              Outils Pratiques
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Six outils indispensables pour tout gérer facilement.
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Chaque fonctionnalité a été conçue pour résoudre les vrais soucis quotidiens des propriétaires et locataires en Côte d'Ivoire.
            </p>
            <div className="mt-4">
              <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Découvrir toutes les fonctionnalités en détail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Module 1 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-4">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  État des lieux sur téléphone avec photos
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prenez des photos de chaque pièce à l'entrée et à la sortie. Tout le monde est d'accord sur l'état de la maison, ce qui évite les palabres au moment de rendre la caution.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Protection de la caution · Photos datées
              </div>
            </div>

            {/* Module 2 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Entente & règlement à l'amiable
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  En cas de retard de paiement ou de réparation à faire, un échange simple et encadré permet de trouver une solution rapide sans passer par de longues démarches au tribunal.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Résolution sans palabre
              </div>
            </div>

            {/* Module 3 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-4">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Suivi des factures CIE & SODECI
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Suivi clair des compteurs d'eau et d'électricité (compteurs partagés ou individuels) pour savoir exactement ce que chacun consomme sans surfacturation.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Compteurs d'eau et d'électricité
              </div>
            </div>

            {/* Module 4 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-4">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Classeur numérique sécurisé
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gardez vos pièces d'identité, attestations de propriété (ACD, CMP) et contrats de bail bien rangés et protégés sur votre compte, accessibles à tout moment.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Documents protégés & confidentiels
              </div>
            </div>

            {/* Module 5 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-4">
                  <BarChart4 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Vrais prix des loyers par quartier
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consultez les prix moyens pratiqués quartier par quartier à Abidjan et à l'intérieur (Cocody, Yopougon, Marcory, Plateau, Riviera, etc.) pour fixer le juste loyer.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Repères du marché ivoirien
              </div>
            </div>

            {/* Module 6 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Rappels par SMS & WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recevez vos rappels de loyer, confirmations de paiement et messages importants directement sur votre WhatsApp ou par SMS classique sans connexion requise.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Orange, MTN, Moov, Wave
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            7. TABLEAU COMPARATIF : MÉTHODE TRADITIONNELLE VS QAPRIL
        ══════════════════════════════════════════════════════════════════ */}
        <section id="comparatif" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="mb-14 max-w-3xl">
            <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-3">
              Comparatif Clair
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pourquoi choisir QAPRIL pour votre logement ?
            </h2>
            <div className="mt-3">
              <Link href="/comparatif" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Voir la comparaison détaillée et les avantages <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-600 w-1/3">
                    Ce qu'il faut gérer
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-red-600 w-1/3">
                    À l'ancienne (papier et bouche-à-oreille)
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#B45309] w-1/3">
                    Avec QAPRIL (simple, rapide et officiel)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Contrat de bail
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Contrat sur papier écrit à la main, voyages répétés, risque d'erreurs et de clauses non valables.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">15 minutes sur téléphone :</span> Rempli facilement, signé par code secret SMS, conforme à la loi ivoirienne.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Paiement du loyer
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Paiement en espèces de la main à la main, risque de vol ou de contestation, perte de temps.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Wave, Orange, MTN ou Moov :</span> Payez en 1 clic sans vous déplacer, avec preuve instantanée pour chacun.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Reçu de loyer (quittance)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Reçu sur petit carnet papier qui se déchire ou se perd, dates souvent contestées.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Reçu officiel avec code QR :</span> Immédiat sur votre téléphone, valable pour les banques, visas et démarches administratives.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Caution (dépôt de garantie)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    On exige souvent 3 à 6 mois de caution, et il est très difficile de récupérer son argent à la sortie.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">2 mois de caution maximum :</span> Respect strict de la loi, argent protégé à la Caisse des Dépôts (CDC-CI) et rendu sans palabre.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Choix du locataire
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Au hasard ou sur simple promesse, risque élevé d'impayés après quelques mois.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Profil sérieux vérifié :</span> Historique de ponctualité des loyers pour louer en toute confiance.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    En cas de litige ou désaccord
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Disputes verbales, menaces de fermeture de maison ou longues attentes au tribunal.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Entente à l'amiable encadrée :</span> Tous les reçus et le contrat sont sous la main pour régler la situation rapidement.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            8. SÉCURITÉ & CADRE JURIDIQUE SOUVERAIN
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="qp-card-light p-8 sm:p-12 rounded-xl bg-white border border-slate-200">
            <div className="max-w-3xl mb-10">
              <div className="inline-block px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold uppercase tracking-wider mb-3">
                Sécurité & Tranquillité
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Vos données et vos documents sont protégés comme à la banque.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Protection Maximale</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toutes vos informations personnelles et vos relevés de paiement sont verrouillés et protégés avec les normes de sécurité les plus strictes.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Respect de Votre Vie Privée</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict respect de la loi ivoirienne (ARTCI). Vos informations personnelles, contrats et finances restent totalement confidentiels et ne sont jamais vendus.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Disponible 24h/24</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vos contrats de bail, quittances et reçus de loyer restent accessibles à tout moment sur votre téléphone, de jour comme de nuit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            9. FOIRE AUX QUESTIONS (FAQ) STRATÉGIQUE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto border-b border-slate-200">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-3">
              Questions Fréquentes
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tout ce que vous devez savoir sur QAPRIL.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Est-ce que le contrat signé sur QAPRIL est reconnu par la justice ivoirienne ?",
                a: "Oui, tout à fait. La signature par code secret envoyé par SMS est reconnue par la loi ivoirienne sur les transactions électroniques. Le contrat a exactement la même valeur juridique qu'un contrat signé sur papier chez un notaire ou en agence.",
              },
              {
                q: "Comment sont protégés les 2 mois de caution ?",
                a: "La loi ivoirienne interdit d'exiger plus de 2 mois de caution. Sur QAPRIL, cette somme est mise en sécurité auprès de la Caisse des Dépôts et Consignations de Côte d'Ivoire (CDC-CI). À la fin du bail, après vérification de l'état des lieux de sortie, l'argent est restitué au locataire sans difficulté.",
              },
              {
                q: "Combien ça coûte pour les propriétaires et les locataires ?",
                a: "L'inscription et l'utilisation de base sont gratuites. Les locataires ne paient aucun frais caché sur le règlement de leur loyer par Wave ou Mobile Money. Les propriétaires et gestionnaires bénéficient de formules simples et transparentes sans surprise.",
              },
              {
                q: "Que faire si un locataire a du retard pour payer son loyer ?",
                a: "QAPRIL lui envoie d'abord des rappels automatiques et courtois par SMS et WhatsApp. Si le retard continue, notre service d'entente à l'amiable aide les deux parties à trouver un calendrier pour régulariser le paiement sans se disputer. En cas de besoin, le propriétaire dispose d'un dossier complet avec tous les reçus pour faire valoir ses droits.",
              },
              {
                q: "Est-ce qu'une agence ou un démarcheur peut utiliser QAPRIL ?",
                a: "Oui, bien sûr. QAPRIL dispose d'un espace dédié aux agences immobilières et aux démarcheurs pour gérer facilement plusieurs maisons, calculer leurs commissions automatiquement et envoyer des bilans clairs aux propriétaires.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="qp-card-light rounded-lg border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-[#D97706] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
                      openFaq === index ? "rotate-180 text-[#D97706]" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            10. GRAND BANDEAU D'APPEL À L'ACTION INSTITUTIONNEL
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="qp-card-light p-8 sm:p-14 rounded-2xl bg-white border border-slate-300 text-center max-w-4xl mx-auto shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-50 border border-amber-200 text-[#B45309] text-xs font-bold uppercase tracking-wider mb-5">
              Rejoignez QAPRIL dès aujourd'hui
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              Louez et gérez vos maisons en toute confiance partout en Côte d'Ivoire.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Démarrez gratuitement aujourd'hui. Rédigez vos baux, recevez vos loyers à temps et conservez vos reçus officiels sans vous déplacer.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {session?.user ? (
                <Link
                  href={dashUrl}
                  className="qp-btn-gold-solid px-7 py-3 rounded text-xs uppercase tracking-wider font-black flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Accéder à mon espace <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => handleLogin("BAILLEUR")}
                    className="qp-btn-gold-solid px-7 py-3 rounded text-xs uppercase tracking-wider font-black flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    Accès Propriétaire <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLogin("LOCATAIRE")}
                    className="qp-btn-gold-solid px-7 py-3 rounded text-xs uppercase tracking-wider font-black flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    Espace Locataire <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Inscription simple et rapide · Sans engagement · Conforme aux lois ivoiriennes
            </p>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          11. FOOTER INSTITUTIONNEL CLAIR
      ══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="QAPRIL" className="h-8 w-auto object-contain" />
                <span className="font-black text-base text-slate-900 tracking-wider uppercase">
                  QAPRIL
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                QAPRIL est la solution ivoirienne qui rend la location de maison simple, claire et sécurisée. Pour que propriétaires et locataires s'entendent sans palabre, dans le respect de la loi.
              </p>
              <div className="text-xs text-slate-500">
                Abidjan, Côte d'Ivoire · Assistance : support@qapril.net
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Nos Services
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Contrats de bail par SMS
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Paiements Wave & Mobile Money
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Cautions sécurisées (CDC-CI)
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Carnet de confiance locataire
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    États des lieux photo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Espaces Dédiés
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                    Espace Propriétaire
                  </Link>
                </li>
                <li>
                  <Link href="/mon-espace-locataire" className="hover:text-slate-900 transition-colors">
                    Espace Locataire
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/mandates" className="hover:text-slate-900 transition-colors">
                    Agences & Démarcheurs
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-slate-900 transition-colors">
                    Administration QAPRIL
                  </Link>
                </li>
                <li>
                  <Link href="/tarifs" className="hover:text-slate-900 transition-colors">
                    Tarifs & Formules
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Règles & Sécurité
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/mentions-legales" className="hover:text-slate-900 transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="hover:text-slate-900 transition-colors">
                    Protection de vos données
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-slate-900 transition-colors">
                    Conditions Générales (CGU)
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-slate-900 transition-colors">
                    Assistance & Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p suppressHydrationWarning>
              © {new Date().getFullYear()} QAPRIL Infrastructure S.A. Tous droits réservés.
            </p>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                Hébergement Sécurisé
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                Conforme aux Lois de Côte d'Ivoire
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
