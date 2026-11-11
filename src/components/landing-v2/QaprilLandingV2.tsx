"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { choisirTypeConnexion } from "@/actions/auth.actions";
import InteractiveShowcase from "./InteractiveShowcase";
import InteractiveModulesGrid from "./InteractiveModulesGrid";
import InteractiveMarketChart from "./InteractiveMarketChart";
import { SessionProvider } from "next-auth/react";
import { executeLogout } from "@/lib/auth-logout";
import MobileMenu from "@/components/MobileMenu";
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
  Sparkles,
  Home,
  LogOut,
  MessageSquare,
  Receipt,
  LayoutDashboard,
  Mic,
  MapPin,
  FileCheck2,
  Download,
} from "lucide-react";

const SLIDES = [
  {
    image: "/slider/bg_slider_1.png",
    title: "Résidences Contemporaines d'Abidjan",
    subtitle: "Gestion locative certifiée & Baux 100% conformes",
    location: "Cocody Ambassades · Côte d'Ivoire",
  },
  {
    image: "/slider/bg_slider_2.png",
    title: "Plateau & Immeubles de Prestige",
    subtitle: "Baux numérisés & quittances officielles avec QR code",
    location: "Plateau · Centre d'Affaires",
  },
  {
    image: "/slider/bg_slider_3.png",
    title: "Villas Duplex & Domaines Privés",
    subtitle: "Cautions et dépôts de garantie sécurisés",
    location: "Riviera Golf & Beverly Hills",
  },
  {
    image: "/slider/bg_slider_4.png",
    title: "Ensembles Résidentiels & Mandats d'Agences",
    subtitle: "Gestion multi-lots & reversements instantanés Wave / MoMo",
    location: "Marcory Zone 4 & Biétry",
  },
  {
    image: "/slider/bg_slider_5.png",
    title: "Remise des Clés & Emménagement Serein",
    subtitle: "Passeport locatif avec Score ICL de ponctualité",
    location: "Bingerville & Côte Lagunaire",
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

  const landingNavLinks = [
    { href: "/", label: "Accueil", icon: <Home size={18} /> },
    { href: "/telecharger", label: "Applications Mobiles", icon: <Smartphone size={18} /> },
    { href: "/verifier", label: "Vérifier une Quittance", icon: <ShieldCheck size={18} /> },
    { href: "/piliers", label: "Piliers QAPRIL", icon: <ShieldCheck size={18} /> },
    { href: "/solutions", label: "Nos Solutions", icon: <LayoutDashboard size={18} /> },
    { href: "/services", label: "Services & Garanties", icon: <Building2 size={18} /> },
    { href: "/comparatif", label: "Comparatif", icon: <Scale size={18} /> },
    { href: "/tarifs", label: "Tarifs & Formules", icon: <Receipt size={18} /> },
    { href: "/contact", label: "Contact & Support", icon: <MessageSquare size={18} /> },
    ...(session?.user ? [
      { href: dashUrl, label: "Mon Espace Dédié", icon: <ArrowRight size={18} /> }
    ] : [])
  ];

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
    <SessionProvider session={session}>
    <div className="landing-v2-wrapper qp-grid-pattern-light min-h-screen text-slate-900 bg-[#F8FAFC] antialiased selection:bg-[#D97706] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════
          1. HEADER NAVIGATION : ÉLÉMENTS STRICTEMENT SUR UNE SEULE LIGNE
      ══════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-white border-slate-200 shadow-sm"
            : "bg-[#090D16] border-slate-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Logo & Identité */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
            <img src="/logo.png" alt="QAPRIL" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <div className={`border-l pl-2 sm:pl-2.5 leading-tight transition-colors ${scrolled ? 'border-slate-200' : 'border-white/20'}`}>
              <span className={`block text-xs font-black tracking-wider uppercase transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                QAPRIL
              </span>
              <span className="hidden sm:block text-[9px] text-[#FF8200] font-bold uppercase tracking-wider">
                Gestion Locative Simple
              </span>
            </div>
          </Link>

          {/* Navigation Centrale sur Une Seule Ligne */}
          <nav className={`hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${scrolled ? 'text-slate-700' : 'text-slate-200'}`}>
            <Link href="/telecharger" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-bold transition-colors">
              <Smartphone size={14} />
              <span>Apps Mobiles</span>
            </Link>
            <Link href="/verifier" className="hover:text-[#D97706] transition-colors">
              Vérifier
            </Link>
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

          {/* Actions Droite sur Une Seule Ligne — Bouton Connexion/Espace & Menu Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {session?.user ? (
              <>
                <Link
                  href={dashUrl}
                  className="qp-btn-gold-solid px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 shrink-0 font-bold"
                >
                  <span className="hidden xs:inline">Mon </span>Espace <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => executeLogout("/")}
                  className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="qp-btn-gold-solid px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0"
              >
                <span>Connexion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Menu Hamburger Mobile visible sur mobile/tablette (< 1024px) */}
            <div className="flex lg:hidden shrink-0 ml-1">
              <MobileMenu 
                links={landingNavLinks} 
                session={session} 
                variant="dark"
                activeRole={session?.user ? (session?.user?.role || "MEMBRE") : "PORTAIL"}
                onLogout={() => executeLogout("/")}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-0">
        {/* ══════════════════════════════════════════════════════════════════
            2. HERO SECTION IMMERSIVE AVEC SLIDES EN ARRIÈRE-PLAN (FULLSCREEN)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-slate-950 text-white min-h-[100dvh] lg:h-[100dvh] flex flex-col justify-between border-b border-slate-800">

          {/* SLIDESHOW D'ARCHITECTURES EN ARRIÈRE-PLAN */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {SLIDES.map((slide, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: currentSlide === idx ? 1 : 0,
                  zIndex: currentSlide === idx ? 1 : 0,
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center transition-transform duration-[4500ms] ease-out ${
                    currentSlide === idx ? "scale-105" : "scale-100"
                  }`}
                />
              </div>
            ))}

            {/* OVERLAY SOUVERAIN ÉLÉGANT & HAUTE LISIBILITÉ */}
            <div className="absolute inset-0 bg-slate-950/50 z-10" />
          </div>

          {/* CONTENU PRINCIPAL DU HERO (FOREGROUND) */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-26 pb-6 sm:pb-8 lg:pb-10 w-full flex-1 flex flex-col justify-between">

            {/* Haut : Pitch Institutionnel & Titre Épuré */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                <BadgeCheck className="w-4 h-4 text-amber-400" />
                Conforme à la loi sur le bail d'habitation · Côte d'Ivoire
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-semibold text-white tracking-tight leading-[1.12] mb-6 max-w-4xl">
                Gestion locative certifiée et baux d'habitation conformes en Côte d'Ivoire
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed mb-8 max-w-3xl">
                Rédigez vos contrats de bail en toute règle, payez et encaissez vos loyers par Wave et Mobile Money avec reçu officiel immédiat, dans le respect strict du plafond légal de 2 mois de caution. Tout est clair, rapide et protégé.
              </p>

              {/* 3 Portails Métiers Directs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <button
                  onClick={() => handleLogin("BAILLEUR")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 shadow-sm transition-colors duration-200 group cursor-pointer overflow-hidden"
                >
                  {/* Image d'illustration réelle */}
                  <img
                    src="/images/login_landlord_visual.jpg"
                    alt="Propriétaires Bailleurs"
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.1] group-hover:scale-105 group-hover:brightness-[0.35] transition-all duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-slate-950/75 group-hover:bg-slate-950/60 transition-colors pointer-events-none" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-amber-300 shadow-sm group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-amber-300 group-hover:bg-amber-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Propriétaires bailleurs
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Gérez vos biens, validez les déclarations locataires facilement et encaissez en toute sérénité.
                  </p>
                </button>

                <button
                  onClick={() => handleLogin("LOCATAIRE")}
                  className="relative p-5 text-left rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 shadow-sm transition-colors duration-200 group cursor-pointer overflow-hidden"
                >
                  {/* Image d'illustration réelle */}
                  <img
                    src="/images/hero_family_moving_new_home_1773609766414.png"
                    alt="Locataires certifiés"
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.1] group-hover:scale-105 group-hover:brightness-[0.35] transition-all duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-slate-950/75 group-hover:bg-slate-950/60 transition-colors pointer-events-none" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-sky-300 shadow-sm group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-sky-300 group-hover:bg-sky-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Locataires certifiés
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Déclarez votre logement en 30s, payez vos loyers et obtenez vos quittances certifiées immédiates.
                  </p>
                </button>

                <Link
                  href="/dashboard/login/agency"
                  className="relative p-5 text-left rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 shadow-sm transition-colors duration-200 group cursor-pointer block overflow-hidden"
                >
                  {/* Image d'illustration réelle */}
                  <img
                    src="/images/hero_abidjan_modern_district_1773609699145.png"
                    alt="Agences & Mandats"
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.25] contrast-[1.1] group-hover:scale-105 group-hover:brightness-[0.35] transition-all duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-slate-950/75 group-hover:bg-slate-950/60 transition-colors pointer-events-none" />
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shadow-sm group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white relative z-10">
                    Agences & Mandats
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed relative z-10">
                    Pilotez vos mandats, portefeuilles et commissions en toute sérénité.
                  </p>
                </Link>
              </div>
            </div>

            {/* Bas du Hero : Chiffres Clés & Ticker Minimaliste du Slide Actif */}
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">

              {/* Chiffres Clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">4 800+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Baux Signés</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">99.4 %</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Loyers à Jour</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">2 Mois</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Caution Max Légale</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">0 Litige</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sans Solution</div>
                </div>
              </div>

              {/* Ticker & Navigation Minimaliste du Slide (Style Apple/Luxury Architectural) */}
              <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 self-start md:self-auto">
                <div className="text-right">
                  <p className="text-[11px] font-bold text-white truncate max-w-[200px]">
                    {SLIDES[currentSlide].title}
                  </p>
                  <p className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                    {SLIDES[currentSlide].location}
                  </p>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-1">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                        currentSlide === i ? "w-6 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={prevSlide}
                    aria-label="Diapositive précédente"
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Diapositive suivante"
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
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
                  <span>Cautions Réglementées</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>DGI (Quittances)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>CIE & SODECI</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#1B4D3E] shrink-0" />
                  <span>La Poste CI (MaPoste)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  <span>Attestation de Résidence</span>
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
                  <span>Cautions Réglementées</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>DGI (Quittances)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>CIE & SODECI</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#1B4D3E] shrink-0" />
                  <span>La Poste CI (MaPoste)</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-800 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  <span>Attestation de Résidence</span>
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

          <div className="mt-8">
            <InteractiveShowcase />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4bis. NOUVELLES NORMES & INNOVATIONS RÉPUBLICAINES 2026
        ══════════════════════════════════════════════════════════════════ */}
        <section id="innovations" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <div className="mb-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs font-semibold uppercase tracking-wider mb-3">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              Réformes 2026 & Code de la Construction et de l'Habitat
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
              Quatre avancées majeures pour la sécurité locative et le confort de gestion
            </h2>
            <p className="text-base text-slate-600 font-normal mt-3 leading-relaxed">
              QAPRIL intègre les dernières directives de l'État ivoirien et innove pour simplifier chaque acte locatif, de la déclaration spontanée de logement à la quittance officielle instantanée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARTE 1 : ADOPTION IMMÉDIATE & PAIEMENT DIRECT */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                    Adoption Immédiate
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Déclaration en 30s & Quittance instantanée
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal mb-4">
                  Le locataire déclare son logement et invite son bailleur par SMS ou WhatsApp. Déclaration de paiements directs (Wave, Orange, MTN, Moov, Espèces) avec émission immédiate de quittance certifiée dès validation par le propriétaire.
                </p>
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Déclaration locataire & validation propriétaire simplifiée</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Quittance officielle avec empreinte horodatée immédiate</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Règlements Wave, Orange Money, MTN, Moov & Espèces</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Validation instantanée républicaine</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARTE 2 : PILOTAGE VOCAL */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                    Cockpit Vocal
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Assistant intelligent & saisie vocale
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal mb-4">
                  Décrivez un logement, enregistrez les caractéristiques d'un bail ou demandez le statut des loyers à la voix. Le moteur comprend le langage naturel ivoirien et pré-remplit les formulaires sans manipulation fastidieuse.
                </p>
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Création d'un bien complet en 90 secondes à la voix</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Confirmation tactile obligatoire pour tout acte contractuel</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Accessible sur mobile Propriétaire & Locataire</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Contrôle vocal sécurisé</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARTE 3 : GÉOLOCALISATION & MAPOSTE */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-md">
                    GPS & La Poste CI
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  GPS certifié & Adressage précis
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal mb-4">
                  Relevé GPS in situ automatique avec identification immédiate de la Ville, Commune et Quartier. Attribution de la boîte postale numérique officielle de La Poste de Côte d'Ivoire.
                </p>
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>Détection GPS automatique & Commune/Quartier résolus</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>Boîte postale numérique MaPoste rattachée au bail</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>Protection de l'identité bailleur (« Bailleur certifié »)</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700">
                <span>Adressage officiel et boîte postale numérique</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* CARTE 4 : FOYER & ATTESTATION DE RÉSIDENCE OFFICIELLE */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                    Foyer & Résidence
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Attestations & Protection du Foyer
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal mb-4">
                  Déclarez les membres du foyer (conjoint, enfants, tiers) et générez votre Attestation de Résidence officielle avec code QR certifié pour vos démarches administratives et bancaires.
                </p>
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Plafonds légaux stricts respectés (caution ≤ 2 mois)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Générateur de préavis avec délai légal de 30 jours</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Attestation de résidence officielle acceptée partout</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>Code de la Construction & Habitation</span>
                <ArrowRight className="w-4 h-4" />
              </div>
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
                        <strong className="text-slate-900">Validation immédiate des loyers :</strong> Votre locataire déclare son logement ou ses règlements directs (Wave, MoMo, Espèces) ? Validez en un geste pour émettre instantanément la quittance certifiée.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Reprise de baux antérieurs (Deux Horloges) :</strong> Importez facilement vos baux signés avant QAPRIL, avec préservation de vos antécédents, clauses particulières et historique sans rupture.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Révision triennale encadrée :</strong> Proposez un ajustement de loyer dans le respect du délai légal de 3 ans, avec notification formelle et traçabilité claire de l'accord locataire.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Confidentialité & Géocodage :</strong> Masquez votre numéro de téléphone personnel sous le label « Bailleur certifié » et géolocalisez votre bien automatiquement (GPS + Commune/Quartier).
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
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white group">
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <img
                      src="/images/login_landlord_visual.jpg"
                      alt="Gestion locative bailleur Abidjan"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/35" />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#059669]" />
                      Patrimoine Sécurisé · Cocody & Marcory
                    </div>
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Loyers ce mois</span>
                        <span className="text-[#059669] font-bold text-sm">4 250 000 XOF</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Cautions Réglementées</span>
                        <span className="text-[#0284C7] font-bold text-sm">8 500 000 XOF</span>
                      </div>
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
                        <strong className="text-slate-900">Déclaration de logement & quittance immédiate :</strong> Déclarez votre logement en quelques questions simples et recevez immédiatement votre quittance officielle certifiée.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Bouton « J'ai payé autrement » :</strong> Vous avez réglé par espèces, virement ou un autre canal ? Déclarez le paiement en 10 secondes avec preuve pour inviter votre bailleur à confirmer.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Foyer & Attestation de Résidence :</strong> Déclarez les membres de votre foyer (conjoint, enfants, colocataires, tiers) et téléchargez une Attestation de Résidence officielle avec code QR certifié pour vos démarches.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700">
                        <strong className="text-slate-900">Candidature Unique & Plafond légal :</strong> Candidatez sereinement aux annonces avec un dossier vérifié sans doublons, et bénéficiez du respect strict du plafond de caution (2 mois maximum).
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
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white group">
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <img
                      src="/images/hero_family_moving_new_home_1773609766414.png"
                      alt="Famille locataire emménageant à Abidjan"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/35" />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                      Locataire Certifié · Grade A+
                    </div>
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Prochaine échéance</span>
                        <span className="text-slate-900 font-bold text-sm">180 000 XOF · Wave</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Caution Protégée</span>
                        <span className="text-[#D97706] font-bold text-sm">360 000 XOF (Plafond 2 mois)</span>
                      </div>
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
                        <strong className="text-slate-900">Cautions sécurisées :</strong> Sécurisation légale des dépôts de garantie avec respect strict du plafonnement.
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
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white group">
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                    <img
                      src="/images/cdc_visual_fcfa.png"
                      alt="Cadre réglementaire officiel du logement"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/35" />
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      Cadre Souverain CCH & DGI
                    </div>
                  </div>
                  <div className="p-5 bg-white border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Valeur Légale</span>
                        <span className="text-slate-900 font-bold text-sm">Code Construction CI</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Sécurité Dépôts</span>
                        <span className="text-[#059669] font-bold text-sm">Dépôt de Garantie Réglementé</span>
                      </div>
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

          <div className="mt-8">
            <InteractiveModulesGrid />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            ANIMATION GRAPHIQUE & OBSERVATOIRE INTERACTIF DU MARCHÉ (STYLE META/APPLE)
        ══════════════════════════════════════════════════════════════════ */}
        <section id="observatoire-marche" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
          <InteractiveMarketChart />
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
                    <span className="text-[#059669] font-bold">Wave, Orange, MTN ou Moov :</span> Payez facilement sans vous déplacer, avec preuve instantanée pour chacun.
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
                    <span className="text-[#059669] font-bold">2 mois de caution maximum :</span> Respect strict de la loi ivoirienne, montant consigné et restitué sans palabre.
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

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">
                    Justificatif de domicile & attestation
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Certificats manuscrits ou de complaisance, démarches longues et refus fréquents en banque ou consulat.
                  </td>
                  <td className="p-4 sm:p-5 text-slate-900 font-semibold">
                    <span className="text-[#059669] font-bold">Attestation officielle avec code QR (Niveaux A/B/C) :</span> Délivrée en 10 secondes, vérifiable en ligne et acceptée par les institutions.
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
                a: "La loi ivoirienne interdit d'exiger plus de 2 mois de caution. Sur QAPRIL, cette somme est formellement consignée dans le contrat de bail conformément à la réglementation. À la fin du bail, après l'état des lieux de sortie contradictoire, le dépôt de garantie est restitué sans palabre.",
              },
              {
                q: "Que faire si mon contrat de bail a été signé avant mon inscription sur QAPRIL ?",
                a: "QAPRIL intègre un module de reprise de bail antérieur (Deux Horloges). Vous renseignez la date de prise d'effet d'origine, le loyer en vigueur et l'historique des paiements. Le propriétaire et le locataire confirment ensemble cet état d'ouverture sans rompre l'ancienneté du bail.",
              },
              {
                q: "Comment s'effectue la révision légale du loyer ?",
                a: "La loi ivoirienne encadre la révision du loyer, qui ne peut intervenir qu'après 3 ans de location (délai triennal légal). QAPRIL calcule automatiquement cette échéance et permet au bailleur de notifier une proposition formelle, avec recueil clair de l'accord du locataire.",
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
              {
                q: "Comment obtenir une Attestation de Résidence officielle et est-elle acceptée par les consulats et banques ?",
                a: "L'attestation de résidence QAPRIL certifie officiellement votre domicile pour l'ensemble du foyer (titulaire, conjoint, enfants, tiers à charge). Elle est générée en 10 secondes selon 3 niveaux de preuve formelle (Niveau A avec bail enregistré, Niveau B avec résidence constatée, Niveau C sur déclaration sur l'honneur). Dotée d'un code QR officiel vérifiable instantanément, elle est acceptée par les banques, ambassades et administrations publiques, tout en préservant la vie privée du bailleur.",
              },
              {
                q: "À quoi sert la géolocalisation certifiée et l'adresse numérique La Poste CI ?",
                a: "Conformément à la réglementation sur l'adressage en Côte d'Ivoire, QAPRIL certifie la position exacte du bien sur le terrain. Le logement bénéficie d'une référence territoriale claire (Commune, Quartier) et d'une boîte postale numérique officielle de La Poste de Côte d'Ivoire directement rattachée au bail.",
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
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl">
            {/* Image de fond architecturale crépusculaire d'Abidjan */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <img
                src="/images/hero_abidjan_skyline_dusk_1773609749211.png"
                alt="Skyline crépusculaire Abidjan"
                className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-slate-950/80" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
                Rejoignez QAPRIL dès aujourd'hui
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                Louez et gérez vos maisons en toute confiance partout en Côte d'Ivoire.
              </h2>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto mb-8">
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
                    Cautions sécurisées
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
                  <Link href="/telecharger" className="text-emerald-700 font-bold hover:text-emerald-900 transition-colors flex items-center gap-1.5">
                    <Smartphone size={13} />
                    <span>Applications Mobiles (APK)</span>
                  </Link>
                </li>
                <li>
                  <Link href="/verifier" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                    <ShieldCheck size={13} />
                    <span>Vérifier une Quittance</span>
                  </Link>
                </li>
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

      {/* ══════════════════════════════════════════════════════════════════
          BARRE FLOTTANTE MOBILE : TÉLÉCHARGER L'APPLICATION MOBILE
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-950/95 border border-emerald-500/50 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl flex items-center justify-between gap-2.5 text-white animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-wider text-white truncate">App Mobile QAPRIL</div>
            <div className="text-[10px] text-emerald-400 font-medium truncate">Version 2.0.0 Android</div>
          </div>
        </div>
        <Link
          href="/telecharger"
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer</span>
        </Link>
      </div>
    </div>
    </SessionProvider>
  );
}