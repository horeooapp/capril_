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
                Infrastructure Locative
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

          {/* Actions Droite sur Une Seule Ligne */}
          <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
            {session?.user ? (
              <Link
                href={dashUrl}
                className="qp-btn-gold-solid px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                Mon Espace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => handleLogin("LOCATAIRE")}
                  className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 border border-slate-300 bg-white rounded hover:border-slate-400 transition-colors shrink-0 whitespace-nowrap"
                >
                  Espace Locataire
                </button>
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="qp-btn-gold-solid px-3.5 sm:px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  Accès Propriétaire <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
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
                Conformité Légale Loi N° 2019-576 & OHADA · Côte d'Ivoire
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                L'Infrastructure Intégrale de{" "}
                <span className="text-[#D97706]">Gestion & Certification</span> Locative.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8 max-w-2xl">
                Baux numériques scellés par horodatage cryptographique, consignation réglementaire des cautions à la Caisse des Dépôts et Consignations (CDC-CI), encaissement automatisé des loyers par Mobile Money et quittances fiscales infalsifiables.
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
                    Encaissement garanti & rapports fiscaux DGI.
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
                    Paiement Wave/Orange & caution protégée.
                  </p>
                </button>

                <Link
                  href="/dashboard/mandates"
                  className="qp-card-light p-4 text-left rounded-lg group transition-all block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Layers className="w-5 h-5 text-[#059669]" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Agences & Mandats
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Multi-lots, reversements & comptabilité.
                  </p>
                </Link>
              </div>

              {/* Barre de Chiffres Clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-black text-slate-900">4 800+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Baux Scellés</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#059669]">99.4 %</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recouvrement</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0284C7]">2 Mois</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plafond Caution</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#D97706]">0 Litige</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Non Tracé</div>
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
                    Architecture & Patrimoine Certifié
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
                Interconnexions Natives aux Réseaux de Paiement & Institutions
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
              Piliers Réglementaires & FinTech
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Quatre technologies conçues pour structurer le marché immobilier.
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              QAPRIL ne se contente pas de numériser des documents : la plateforme standardise l'ensemble du cycle de vie locatif conformément à la législation ivoirienne.
            </p>
            <div className="mt-4">
              <Link href="/piliers" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Découvrir l'analyse approfondie des 4 piliers <ArrowRight className="w-3.5 h-3.5" />
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
                  Baux Certifiés & Signature Électronique OTP
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Génération assistée de contrats d'habitation ou commerciaux 100 % conformes à la loi n° 2019-576. Validation d'identité par SMS OTP, horodatage certifié SHA-256 et scellement inviolable conférant une valeur probante pleine et entière devant les juridictions.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Clauses obligatoires et dérogatoires formalisées
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Signature à distance sécurisée sans déplacement physique
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Archivage pérenne certifié dans le coffre-fort numérique
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
                  Paiement Mobile Money & Quittances Inviolables
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Collecte multi-opérateurs (Wave, Orange, MTN, Moov, Carte). Dès validation de la transaction, émission immédiate d'une quittance de loyer au format PDF sécurisé, pourvue d'un QR code vérifiable en ligne. Élimination totale des reçus manuels contestables.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Quittances opposables auprès des administrations et banques
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Rapprochement bancaire et comptable sans intervention manuelle
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Traçabilité bancaire garantissant l'absence de contestation
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
                  Consignation Réglementaire des Cautions (CDC-CI)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Application stricte du plafonnement légal à 2 mois de loyer pour le dépôt de garantie. Les sommes sont séquestrées de manière sécurisée sous protocole institutionnel, et ne sont débloquées qu'à la sortie des lieux après confrontation de l'état des lieux d'entrée et de sortie.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Séquestre officiel garantissant la disponibilité des fonds
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Restitution rapide et automatisée sans rétention abusive
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Procédure de médiation intégrée en cas de retenue contestée
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
                  Score ICL (Indice de Confiance Locative)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  Algorithme prédictif évaluant la régularité et le civisme locatif sur la base des historiques certifiés. Permet aux bailleurs de sélectionner des profils fiables et aux locataires sérieux de valoriser un passeport numérique probant pour accéder rapidement aux meilleurs logements.
                </p>
              </div>
              <ul className="space-y-2 pt-5 border-t border-slate-100 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Classification transparente de Grade A+ à Grade C
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Réduction de 85 % des risques d'impayés dès la sélection
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#059669]" /> Passeport portable d'un logement à un autre
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
              Solutions Métiers
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Une infrastructure unifiée pour chaque rôle du secteur.
            </h2>
            <div className="mt-3">
              <Link href="/solutions" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Explorer les solutions complètes par métier <ArrowRight className="w-3.5 h-3.5" />
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
              Agences
            </button>
            <button
              onClick={() => setActiveTab("institutionnels")}
              className={`flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === "institutionnels"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Institutionnels
            </button>
          </div>

          {/* Contenu Tab Clair & Opaque */}
          <div className="qp-card-light p-6 sm:p-10 rounded-xl">
            {activeTab === "bailleurs" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2 block">
                    Pour Bailleurs Particuliers & Investisseurs
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Sérénité absolue et encaissement sans friction de vos loyers.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Centralisez l'ensemble de vos actifs immobiliers — studios, villas ou immeubles entiers — sur un tableau de bord clair. Ne courez plus après vos loyers chaque fin de mois.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Reversement automatique :</strong> Loyers versés directement sur votre compte bancaire ou mobile wallet dès réception.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Alertes prédictives d'impayés :</strong> Relances automatiques par SMS et WhatsApp sans détériorer la relation humaine.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Rapport fiscal DGI en 1 clic :</strong> Édition des états annuels certifiés pour votre déclaration foncière.
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
                      <span className="text-slate-500">Patrimoine actif</span>
                      <span className="text-slate-900 font-bold">14 Biens · Abidjan (Cocody/Marcory)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Loyers encaissés (Mois en cours)</span>
                      <span className="text-[#059669] font-bold">4 250 000 FCFA (100%)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Cautions séquestrées (CDC-CI)</span>
                      <span className="text-[#0284C7] font-bold">8 500 000 FCFA</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Dernier rapport fiscal</span>
                      <span className="text-slate-900 font-bold">Généré le 15/01/2026 ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "locataires" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7] mb-2 block">
                    Pour les Locataires Résidentiels & Professionnels
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Votre logement sécurisé, vos droits protégés et vos quittances instantanées.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Fini les déplacements à l'agence ou les reçus manuscrits égarés. Payez depuis votre mobile avec Wave ou Orange Money, accédez à votre bail à tout moment et valorisez votre réputation locative.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Zéro litige de paiement :</strong> Quittance PDF horodatée avec QR Code transmise dès réception du loyer.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Caution préservée :</strong> Votre dépôt de 2 mois est consigné à la CDC-CI, protégé de toute retenue arbitraire.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Charges CIE & SODECI :</strong> Suivez vos décomptes divisionnaires d'eau et d'électricité en toute transparence.
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
                      <span className="text-slate-500">Score ICL personnel</span>
                      <span className="text-[#059669] font-bold">Grade A+ (870/900)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Prochaine échéance</span>
                      <span className="text-slate-900 font-bold">05 Novembre · 180 000 FCFA</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Dépôt de garantie protégé</span>
                      <span className="text-[#D97706] font-bold">360 000 FCFA sous séquestre</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Téléchargement Quittances</span>
                      <span className="text-slate-700 font-bold">24 Quittances Disponibles</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "agences" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#059669] mb-2 block">
                    Pour Agences Immobilières & Administrateurs de Biens
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    L'outil d'échelle industrielle pour gérer vos mandats et clients.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    Gérez des centaines de lots locatifs avec une rigueur comptable absolue. Découpez vos mandats, automatisez les reversements aux propriétaires après déduction de vos commissions et offrez un service irréprochable.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Multi-mandats & Reversements :</strong> Calcul automatique des commissions d'agence et virement automatique aux mandants.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Permissions collaborateurs :</strong> Rôles dédiés pour agents négociateurs, comptables et directeurs d'agence.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Signature de baux en masse :</strong> Formalisation accélérée des entrées et sorties pour vos parcs résidentiels.
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
                      <span className="text-slate-500">Lots sous mandat</span>
                      <span className="text-slate-900 font-bold">142 Logements sous gestion</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Taux d'occupation du parc</span>
                      <span className="text-[#059669] font-bold">96.8 %</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Honoraires collectés</span>
                      <span className="text-[#D97706] font-bold">Automatisés à J+1</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Exports comptables</span>
                      <span className="text-slate-700 font-bold">Format Sage / Excel ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "institutionnels" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2 block">
                    Pour Notaires, Promoteurs & Pouvoirs Publics
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                    Auditabilité totale, régulation et assainissement du secteur foncier.
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    QAPRIL fournit les outils d'audit, de séquestre institutionnel et de traçabilité nécessaires aux grands acteurs de l'immobilier et de la régulation étatique en Côte d'Ivoire.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Conformité anti-blanchiment (KYC/AML) :</strong> Traçabilité complète des flux financiers des baux de standing.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Observatoire des prix au m² :</strong> Données fiables et agrégées pour l'évaluation immobilière.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Régulation des dépôts de garantie :</strong> Protocole d'interconnexion certifié avec les caisses de consignation.
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="qp-btn-outline-light px-5 py-2.5 rounded text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    Demander une présentation institutionnelle <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="text-xs font-mono text-[#D97706] mb-4 uppercase tracking-wider font-bold">
                    [Protocole Institutionnel & Sécurité]
                  </div>
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Standard Cryptographique</span>
                      <span className="text-slate-900 font-bold">AES-256-GCM / SHA-256</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Audit Trail & Logs</span>
                      <span className="text-[#059669] font-bold">Inviolables & Non répudiables</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Régulation des flux</span>
                      <span className="text-[#0284C7] font-bold">Conforme Banque Centrale (BCEAO)</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Souveraineté des données</span>
                      <span className="text-slate-900 font-bold">Hébergement Sécurisé Souverain</span>
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
              Services Intégrés
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Six modules opérationnels pour une gestion sans angle mort.
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Chaque fonctionnalité répond à un besoin concret identifié sur le terrain en Côte d'Ivoire.
            </p>
            <div className="mt-4">
              <Link href="/services" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Voir le détail des 6 modules et le cycle locatif <ArrowRight className="w-3.5 h-3.5" />
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
                  États des Lieux (EDL) Numériques
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comparateur photographique haute définition entre l'entrée et la sortie des lieux. Constat contradictoire certifié horodaté évitant les contestations sur l'usure locative.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Module M-EDL · Conforme loi 2019
              </div>
            </div>

            {/* Module 2 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Centre de Médiation Locative
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dispositif de conciliation amiable intégré pour désamorcer les conflits d'impayés ou de réparations locatives avant toute saisine judiciaire longue et coûteuse.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Module M10-M11 · Règlement amiable
              </div>
            </div>

            {/* Module 3 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-4">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Gestion des Charges CIE & SODECI
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Suivi des compteurs divisionnaires ou collectifs, répartition transparente des consommations d'eau et d'électricité entre locataires et régularisation des charges.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Module Services Publics
              </div>
            </div>

            {/* Module 4 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-4">
                  <FolderArchive className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Coffre-Fort & Documents Sécurisés
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conservation cryptée des titres de propriété (ACD, CMP), CNI/Passeports vérifiés, pièces justificatives de revenus et baux signés sous clé de chiffrement dédiée.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Chiffrement AES-256
              </div>
            </div>

            {/* Module 5 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-4">
                  <BarChart4 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Observatoire des Loyers d'Abidjan
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Baromètre en temps réel des prix moyens au mètre carré pratiqués par commune (Cocody, Marcory, Plateau, Riviera, Yopougon, Bingerville) pour fixer le juste loyer.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Indicateurs Marché
              </div>
            </div>

            {/* Module 6 */}
            <div className="qp-card-light p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-4">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">
                  Alertes SMS & Notifications WhatsApp
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Canal de communication direct avec vos locataires pour les rappels d'échéance, la confirmation de réception de paiement et les alertes d'interventions techniques.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Réseaux Mobiles CI
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
              Comparatif Analytique
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pourquoi le marché ivoirien migre vers l'infrastructure QAPRIL.
            </h2>
            <div className="mt-3">
              <Link href="/comparatif" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] hover:text-[#B45309] transition-colors">
                Ouvrir le comparatif complet & le simulateur de rentabilité <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-slate-600 w-1/3">
                    Critères de Gestion Locative
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-red-600 w-1/3">
                    Gestion Traditionnelle & Manuelle
                  </th>
                  <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#B45309] w-1/3">
                    Infrastructure QAPRIL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Formalisation du Contrat de Bail
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Papier manuscrit, 2 à 3 semaines, déplacements physiques, risque élevé de clauses nulles.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">15 minutes en ligne :</span> Signature OTP certifiée, 100 % conforme à la loi 2019-576.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Mode de Paiement des Loyers
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Espèces sans traçabilité, chèques avec risque d'impayé, déplacements à domicile.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Wave, Orange, MTN, Moov & CB :</span> Débit instantané sans déplacement, traçabilité bancaire complète.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Délivrance des Quittances
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Carnets papier achetés en papeterie, pertes fréquentes, contestations de date.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">PDF certifié instantané :</span> Horodatage cryptographique et QR Code vérifiable par la DGI.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Dépôt de Garantie (Caution)
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Dépassant souvent le plafond légal (3 à 6 mois exigés), fonds souvent non restitués.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Consignation CDC-CI :</span> Respect strict du plafond de 2 mois, fonds séquestrés et restitués sans litige.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Sélection des Candidats Locataires
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Jugement subjectif ou bulletins de paie falsifiables, taux d'impayés élevé.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Score ICL certifié :</span> Évaluation objective de l'historique réel de paiement, impayés réduits de 85 %.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Gestion des Litiges
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Blocage verbal, expulsions sauvages illégales ou procédures judiciaires de 18 mois.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Centre de médiation intégré :</span> Dossier contradictoire opposable pour résolution sous 14 jours.
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
                Normes Techniques & Souveraineté
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Une architecture conçue pour la protection absolue des données foncières.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Chiffrement Bancaire</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Toutes les données sensibles, identités et relevés de paiement sont chiffrés au repos via le standard AES-256 et transportés sous protocole TLS 1.3 hautement sécurisé.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#059669] mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Conformité ARTCI & RGPD</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict respect de la loi ivoirienne n° 2013-450 sur la protection des données personnelles. Vos actifs et informations financières ne font l'objet d'aucune revente commerciale.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Disponibilité Continue</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Architecture conteneurisée déployée sur infrastructure redondée avec sauvegardes quotidiennes chiffrées, garantissant une disponibilité permanente de vos quittances et contrats.
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
                q: "Un bail signé électroniquement sur QAPRIL a-t-il une valeur juridique devant les tribunaux ivoiriens ?",
                a: "Oui, parfaitement. En vertu de la loi ivoirienne sur les transactions électroniques et des dispositions du Code Civil, la signature par validation OTP horodatée confère au bail numérique une pleine valeur probante, identique à celle d'un acte sous seing privé manuscrit.",
              },
              {
                q: "Comment fonctionne la consignation des deux mois de caution ?",
                a: "Conformément à la réglementation encadrant les baux d'habitation en Côte d'Ivoire, le locataire verse son dépôt de garantie (plafonné à 2 mois). Ces fonds sont enregistrés sous protocole de séquestre officiel auprès de la Caisse des Dépôts et Consignations (CDC-CI). À la fin du bail, après validation de l'état des lieux de sortie contradictoire, la somme est restituée sans délai injustifié.",
              },
              {
                q: "Quels sont les frais d'utilisation pour les propriétaires et les locataires ?",
                a: "L'inscription et la gestion de base sont entièrement gratuites. Les locataires ne paient aucun frais caché sur le règlement de leur loyer par Mobile Money. Les propriétaires et agences bénéficient de formules transparentes selon le volume de lots administrés, sans commission abusive.",
              },
              {
                q: "Que se passe-t-il si un locataire refuse de payer ou accumule des retards ?",
                a: "La plateforme active automatiquement des rappels graduels par SMS et WhatsApp. Si le retard persiste, le centre de médiation locative intégré propose un plan d'apurement contradictoire. En cas d'échec, le bailleur dispose d'un dossier complet horodaté (bail certifié, quittances, historique) opposable immédiatement devant le juge des référés.",
              },
              {
                q: "Une agence immobilière peut-elle connecter son propre logiciel ou ses comptes bancaires ?",
                a: "Oui. QAPRIL propose une suite dédiée aux agences avec gestion des mandats de gérance, reversements automatisés, exports comptables compatibles avec les logiciels du marché (Sage, Excel) et des accès multi-agents avec gestion des permissions.",
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
              Modernisez Votre Gestion Locative
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              Rejoignez l'infrastructure nationale qui certifie l'immobilier ivoirien.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Démarrez gratuitement dès aujourd'hui. Sécurisez vos baux, automatisez vos encaissements et profitez d'une conformité légale totale.
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
                    Créer mon compte Propriétaire <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLogin("LOCATAIRE")}
                    className="qp-btn-outline-light px-7 py-3 rounded text-xs uppercase tracking-wider font-black flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    Accès Locataire
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-5">
              Inscription sans engagement · Zéro carte requise · Conforme au Code Civil ivoirien
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
                QAPRIL est la plateforme nationale de normalisation, certification et gestion des baux et quittances de loyer en Côte d'Ivoire. Développée pour apporter transparence, sécurité et efficacité au marché immobilier.
              </p>
              <div className="text-xs text-slate-500">
                Abidjan, Côte d'Ivoire · Assistance : support@qapril.net
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Services & Modules
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Baux Certifiés OTP
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Paiements Mobile Money
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Consignation Cautions (CDC)
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    Score ICL Locataire
                  </Link>
                </li>
                <li>
                  <Link href="/fonctionnalites" className="hover:text-slate-900 transition-colors">
                    États des Lieux (EDL)
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Portails Métiers
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
                    Gestion des Mandats Agences
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-slate-900 transition-colors">
                    Administration QAPRIL
                  </Link>
                </li>
                <li>
                  <Link href="/tarifs" className="hover:text-slate-900 transition-colors">
                    Grille Tarifaire
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B45309] mb-3">
                Cadre Légal & Éthique
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/mentions-legales" className="hover:text-slate-900 transition-colors">
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link href="/confidentialite" className="hover:text-slate-900 transition-colors">
                    Protection des Données (ARTCI)
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-slate-900 transition-colors">
                    Conditions Générales (CGU)
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-slate-900 transition-colors">
                    Centre de Contact
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
                Hébergement Souverain
              </span>
              <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                Conforme OHADA & Loi 2019-576
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
