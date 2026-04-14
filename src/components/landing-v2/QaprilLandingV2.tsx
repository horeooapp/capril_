"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { choisirTypeConnexion } from "@/actions/auth.actions";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Landmark, Brain, ShieldCheck, Wallet, CheckCircle2, ChevronRight, Check, User, Home, Building2, UserCheck, Star, Activity, MapPin } from "lucide-react";

export default function QaprilLandingV2({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState("tenant");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── CUSTOM CURSOR LOGIC ──
    let mx = 0, my = 0, rx = 0, ry = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const animCursor = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      }
      animationFrameId = requestAnimationFrame(animCursor);
    };

    document.addEventListener("mousemove", handleMouseMove);
    animationFrameId = requestAnimationFrame(animCursor);

    // Add hover effects
    const interactiveEls = document.querySelectorAll('a, button, .nav-link, .user-tab, .price-card, .feature-card, .testi-card');
    
    const handleMouseEnter = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '52px';
        ringRef.current.style.height = '52px';
      }
      if (cursorRef.current) {
        // Simple scaling approach via CSS directly if possible, or wait to handle transform scaling carefully.
        // It's handled gracefully enough by CSS transitions.
      }
    };
    const handleMouseLeave = () => {
      if (ringRef.current) {
        ringRef.current.style.width = '36px';
        ringRef.current.style.height = '36px';
      }
    };

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // ── SCROLL NAV SHADOW ──
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);

    // ── SCROLL REVEAL ──
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const handleLoginClick = async (role: "LOCATAIRE" | "BAILLEUR" | "ADMIN") => {
     await choisirTypeConnexion(role);
  };

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';
  const dashUrl = isAdmin ? "/admin" : (session?.user?.role === 'TENANT' ? "/mon-espace-locataire" : "/dashboard");

  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream pb-0">
      <div className="custom-cursor" ref={cursorRef}></div>
      <div className="custom-cursor-ring" ref={ringRef}></div>
      <div className="noise-overlay"></div>

      {/* ═══ NAV ═══ */}
      <nav id="navbar" style={{ boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.08)' : 'none' }}>
        <a href="#" className="nav-logo">
          <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </a>
        <div className="nav-links">
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="#how" className="nav-link">Comment ça marche</a>
          <a href="#users" className="nav-link">Pour qui ?</a>
          <a href="#pricing" className="nav-link">Tarifs</a>
        </div>
        {session?.user ? (
            <Link href={dashUrl} className="nav-cta">Mon Espace →</Link>
        ) : (
            <div className="flex items-center gap-4">
                <Link href="/mon-espace-locataire/login" className="hidden sm:inline-flex px-4 py-2 text-[11px] font-black uppercase tracking-widest text-ink hover:text-ink/70 transition-colors bg-transparent border border-transparent hover:border-black/10 rounded-full">Connexion Locataire</Link>
                <Link href="/dashboard/login" className="nav-cta">Connexion Propriétaire</Link>
            </div>
        )}
        <button className="nav-hamburger" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu open" id="mobileMenu">
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
          <a href="#users" onClick={() => setMobileMenuOpen(false)}>Pour qui ?</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
          {session?.user ? (
            <Link href={dashUrl} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--mango)', background: 'none', border: 'none', fontSize: '22px', fontWeight: 700, fontFamily: 'var(--f-display)', cursor: 'pointer', textDecoration: 'none' }}>Mon Espace →</Link>
          ) : (
            <button onClick={() => { setMobileMenuOpen(false); handleLoginClick("LOCATAIRE"); }} style={{ color: 'var(--mango)', background: 'none', border: 'none', fontSize: '22px', fontWeight: 700, fontFamily: 'var(--f-display)', cursor: 'pointer' }}>Démarrer →</button>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
      `}} />

      {/* ═══ HERO ═══ */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
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
                  opacity: bgIndex === index ? 1 : 0,
                  transform: bgIndex === index ? 'scale(1)' : 'scale(1.05)'
                }}
              />
            ))}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 251, 245, 0.40)', zIndex: 1 }}></div>
          </div>
          <div className="hero-blob-1" style={{ zIndex: 2, opacity: 0.5 }}></div>
          <div className="hero-blob-2" style={{ zIndex: 2, opacity: 0.5 }}></div>
          <div className="hero-dots" style={{ zIndex: 2 }}></div>
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge-icon">🇨🇮</div>
              <span>Plateforme n°1 en Côte d'Ivoire</span>
              <div className="hero-badge-dot"></div>
              <span>4 800+ utilisateurs actifs</span>
            </div>
            <h1 style={{ fontFamily: '"Outfit", "Cabinet Grotesk", sans-serif', fontWeight: 900, letterSpacing: '-0.04em' }}>
              La gestion<br/>locative <span className="accent-mango" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, paddingRight: '8px', letterSpacing: '-0.02em' }}>enfin</span><br/><span className="accent-sky">simple</span> & digitale
            </h1>
            <p className="hero-desc">QAPRIL connecte locataires, propriétaires et agences immobilières sur une seule plateforme. Payez votre loyer, gérez vos biens, formalisez vos baux — tout en quelques clics.</p>
            <div className="hero-actions">
              {session?.user ? (
                  <Link href={dashUrl} className="btn-hero btn-hero-primary">🚀 Retourner au Dashboard</Link>
              ) : (
                  <button onClick={() => handleLoginClick("BAILLEUR")} className="btn-hero btn-hero-primary">🚀 Commencer gratuitement</button>
              )}
              <a href="#features" className="btn-hero btn-hero-secondary">▷ Voir la démo</a>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <div className="trust-avatar" style={{ background: 'var(--mango-l)', color: 'var(--mango-d)' }}>KA</div>
                <div className="trust-avatar" style={{ background: 'var(--sky-l)', color: 'var(--sky-d)' }}>OM</div>
                <div className="trust-avatar" style={{ background: 'var(--lime-l)', color: 'var(--lime-d)' }}>BF</div>
                <div className="trust-avatar" style={{ background: 'var(--fuchsia-l)', color: '#9C27B0' }}>TN</div>
                <div className="trust-avatar" style={{ background: 'var(--teal-l)', color: 'var(--teal)' }}>+</div>
              </div>
              <div className="trust-text">
                <div className="trust-stars">★★★★★</div>
                <div><strong>4 800+ propriétaires & locataires</strong><br/>font confiance à QAPRIL chaque mois</div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="deco-ring deco-ring-1"></div>
            <div className="deco-ring deco-ring-2"></div>
            <div className="deco-dot-grid"></div>
            <div className="hero-phone-wrap">
              <div className="hero-mockup">
                <div className="mock-status">
                  <div className="mock-logo">QAPRIL</div>
                  <div className="mock-avatar">KA</div>
                </div>
                <div className="mock-body">
                  <div className="mock-greet">Bonjour 👋</div>
                  <div className="mock-name">Konan Adjoa</div>
                  <div className="mock-pay-card">
                    <div className="mock-pay-label">Loyer mai 2025 dû</div>
                    <div className="mock-pay-amount">85 000 FCFA</div>
                    <div className="mock-pay-btn">Payer maintenant →</div>
                  </div>
                  <div className="mock-stats">
                    <div className="mock-stat"><div className="mock-stat-val">14</div><div className="mock-stat-lbl">Mois payés</div></div>
                    <div className="mock-stat"><div className="mock-stat-val" style={{ color: 'var(--lime-d)' }}>72 pts</div><div className="mock-stat-lbl">Score ICL</div></div>
                  </div>
                  <div className="mock-notif">
                    <div className="mock-notif-icon" style={{ background: 'var(--teal)' }}>✓</div>
                    <div className="mock-notif-text"><strong>Quittance avril reçue</strong><br/>REC-2025-04-0089 · PDF</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-widget fw-1">
              <div className="fw-icon" style={{ background: 'var(--lime-l)' }}>📈</div>
              <div className="fw-text">
                <div className="fw-title">Score ICL · Grade B</div>
                <div className="fw-sub">+5 pts ce mois</div>
              </div>
            </div>
            <div className="float-widget fw-2">
              <div className="fw-icon" style={{ background: 'var(--sky-l)' }}>💳</div>
              <div className="fw-text">
                <div className="fw-title">Paiement confirmé</div>
                <div className="fw-sub">Orange Money · 2s</div>
              </div>
            </div>
            <div className="float-widget fw-3">
              <div className="fw-icon" style={{ background: 'var(--mango-l)' }}>🏠</div>
              <div className="fw-text">
                <div className="fw-title">3 biens actifs</div>
                <div className="fw-sub">2 loués · 1 vacant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      {/* ═══ TICKER ═══ */}
      <div className="ticker" style={{ background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.7)', padding: '16px 0', opacity: 0.95, zIndex: 10, position: 'relative' }}>
        <div className="ticker-track" id="ticker" style={{ animationDuration: '40s' }}>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--mango)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Paiement via Orange Money, MTN, Wave</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--sky)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Quittances PDF certifiées</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--lime)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Baux enregistrés DGI</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--teal)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Cautions CDC-CI</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--fuchsia)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Passeport & Agent IA</span></div>
            
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--mango)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Paiement via Orange Money, MTN, Wave</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--sky)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Quittances PDF certifiées</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--lime)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Baux enregistrés DGI</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--teal)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Cautions CDC-CI</span></div>
            <div className="ticker-item"><div className="ticker-dot" style={{ background: 'var(--fuchsia)' }}></div> <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>Passeport & Agent IA</span></div>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="stats-band">
        <div className="stats-grid">
          <div className="stat-block reveal">
            <div className="stat-number" style={{ color: 'var(--mango)' }}>4 800+</div>
            <div className="stat-label">Utilisateurs actifs<br/>sur la plateforme</div>
            <div className="stat-accent" style={{ color: 'var(--mango)' }}>↑ +124 ce mois</div>
          </div>
          <div className="stat-block reveal reveal-d1">
            <div className="stat-number" style={{ color: 'var(--sky)' }}>2 340</div>
            <div className="stat-label">Baux actifs gérés<br/>Abidjan & régions</div>
            <div className="stat-accent" style={{ color: 'var(--sky)' }}>89 déclaratifs</div>
          </div>
          <div className="stat-block reveal reveal-d2">
            <div className="stat-number" style={{ color: 'var(--teal)' }}>98.2%</div>
            <div className="stat-label">Taux de disponibilité<br/>de la plateforme</div>
            <div className="stat-accent" style={{ color: 'var(--teal)' }}>SLA garanti</div>
          </div>
          <div className="stat-block reveal reveal-d3">
            <div className="stat-number" style={{ color: 'var(--fuchsia)' }}>2s</div>
            <div className="stat-label">Délai moyen de<br/>confirmation paiement</div>
            <div className="stat-accent" style={{ color: 'var(--fuchsia)' }}>Mobile Money intégré</div>
          </div>
        </div>
      </div>

      {/* ═══ FEATURES ═══ */}
      <section className="features" id="features" style={{ background: 'linear-gradient(180deg, #FFFBF5 0%, #FFFFFF 100%)', position: 'relative' }}>
        <div className="section-inner relative z-10">
          <div className="features-header reveal text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center mb-6 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'var(--mango)' }}>
              <Sparkles size={16} className="mr-2" /> <span>Tout-en-un</span>
            </div>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.04em', color: 'var(--ink)' }}>
              La puissance d'une agence,<br/>la <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, color: 'var(--sky)', letterSpacing: '-0.02em', paddingRight: '8px' }}>simplicité</span> d'une app
            </h2>
            <p className="section-desc max-w-2xl mx-auto" style={{ fontSize: '1.25rem', color: 'var(--ink3)' }}>
              De la signature du bail au paiement du loyer mensuel, QAPRIL unifie absolument tout le cycle locatif ivoirien.
            </p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>

            <div className="glass-card feature-card-large reveal col-span-1 md:col-span-2 overflow-hidden relative group" style={{ padding: '40px', borderRadius: '32px', transition: 'all 0.4s ease', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.05)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(255, 139, 0, 0.08), transparent 60%)' }}></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-10">
                <div className="fc-text flex-1 flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm" style={{ background: 'var(--mango)', color: 'white' }}>
                    <Wallet size={26} strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '2rem', marginBottom: '16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Paiement du loyer<br/>sans friction</h3>
                  <p style={{ color: 'var(--ink2)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '24px' }}>Payez et encaissez vos loyers via Orange Money, MTN MoMo, Wave et Moov. Rapprochement bancaire quasi instantané, quittances PDF automatiques certifiées Blockchain.</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-4 py-1.5 bg-white/80 rounded-full text-xs font-bold shadow-sm border border-slate-100 uppercase tracking-wider text-slate-700">Orange</span>
                    <span className="px-4 py-1.5 bg-white/80 rounded-full text-xs font-bold shadow-sm border border-slate-100 uppercase tracking-wider text-slate-700">MTN</span>
                    <span className="px-4 py-1.5 bg-white/80 rounded-full text-xs font-bold shadow-sm border border-slate-100 uppercase tracking-wider text-slate-700">Wave</span>
                  </div>
                </div>
                
                <div className="fc-visual flex-1 flex flex-col justify-center gap-4">
                    <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,1)' }}>
                      <div className="flex flex-col items-center justify-center text-white bg-black shrink-0" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
                        <div className="bg-[#FF6600] w-[26px] h-[18px] flex items-end px-[3px] pb-[1px] mt-0.5 rounded-[4px]" style={{ justifyContent: 'center' }}>
                            <span className="text-[6px] font-black tracking-tight leading-none text-white">orange</span>
                        </div>
                        <span className="text-[5px] font-black text-white mt-0.5 tracking-[0.2em] uppercase">Money</span>
                      </div>
                      <div className="flex-1">
                        <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>Orange Money</div>
                        <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--ink3)' }}>150 000 FCFA · confirmé ✓</div>
                      </div>
                      <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '13px', fontWeight: 800, color: 'var(--lime-d)', background: 'var(--lime-l)', padding: '6px 10px', borderRadius: '10px' }}>+1s</div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,1)' }}>
                      <div className="flex flex-col items-center justify-center text-white bg-[#18A9DB] shrink-0" style={{ width: '48px', height: '48px', borderRadius: '14px' }}>
                        <div className="flex items-center gap-0 mt-0.5">
                          <span className="text-base -mt-0.5">🐧</span>
                          <span className="text-lg font-extrabold tracking-tighter leading-none">wave</span>
                        </div>
                        <span className="font-black opacity-90 tracking-[0.2em] uppercase" style={{ fontSize: '4px', marginTop: '2px' }}>Ton djê est calé</span>
                      </div>
                      <div className="flex-1">
                        <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>Wave CI</div>
                        <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--ink3)' }}>220 000 FCFA · confirmé ✓</div>
                      </div>
                      <div style={{ fontFamily: '"Outfit", sans-serif', fontSize: '13px', fontWeight: 800, color: 'var(--lime-d)', background: 'var(--lime-l)', padding: '6px 10px', borderRadius: '10px' }}>-2s</div>
                    </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[32px] reveal group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border border-white/60 shadow-[0_10px_40px_-15px_rgba(0,180,216,0.15)]">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(0, 180, 216, 0.08), transparent 70%)' }}></div>
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500" style={{ background: 'var(--sky-l)', color: 'var(--sky-d)' }}><FileText size={26} strokeWidth={2.5} /></div>
               <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Baux légaux<br/>& Enr. DGI</h3>
               <p style={{ color: 'var(--ink2)', fontSize: '1.05rem', lineHeight: 1.6 }}>Créez, signez électroniquement et enregistrez vos contrats à la DGI de manière 100% automatisée.</p>
            </div>

            <div className="glass-card p-10 rounded-[32px] reveal reveal-d1 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border border-white/60 shadow-[0_10px_40px_-15px_rgba(0,200,150,0.15)]">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(0, 200, 150, 0.08), transparent 70%)' }}></div>
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500" style={{ background: 'var(--lime-l)', color: 'var(--lime-d)' }}><Landmark size={26} strokeWidth={2.5} /></div>
               <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Cautions<br/>CDC-CI</h3>
               <p style={{ color: 'var(--ink2)', fontSize: '1.05rem', lineHeight: 1.6 }}>Consignez obligatoirement les cautions à la CDC-CI. Garantissez une restitution sans conflit à la fin du bail.</p>
            </div>

            <div className="glass-card p-10 rounded-[32px] reveal reveal-d2 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border border-white/60 shadow-[0_10px_40px_-15px_rgba(224,64,251,0.15)]">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(224, 64, 251, 0.08), transparent 70%)' }}></div>
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500" style={{ background: 'var(--fuchsia-l)', color: 'var(--fuchsia-d)' }}><Brain size={26} strokeWidth={2.5} /></div>
               <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Agent IA<br/>Autonome</h3>
               <p style={{ color: 'var(--ink2)', fontSize: '1.05rem', lineHeight: 1.6 }}>Un assistant conversationnel instruit pour récupérer les baux déclaratifs et piloter les signalements techniques.</p>
            </div>

            <div className="glass-card p-10 rounded-[32px] reveal reveal-d3 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden border border-white/60 shadow-[0_10px_40px_-15px_rgba(255,78,80,0.15)]">
               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(255, 78, 80, 0.08), transparent 70%)' }}></div>
               <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500" style={{ background: 'var(--coral-l)', color: 'var(--coral-d)' }}><ShieldCheck size={26} strokeWidth={2.5} /></div>
               <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.6rem', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Score ICL &<br/>Réputation</h3>
               <p style={{ color: 'var(--ink2)', fontSize: '1.05rem', lineHeight: 1.6 }}>Note universelle de fiabilité locative. Optimisez vos entrées avec des locataires notés A ou B vérifiés.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how" id="how" style={{ background: '#0F1117', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="section-inner relative z-10 py-24">
          <div className="how-header reveal text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center mb-6 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600, color: 'var(--sky)' }}>
              <MapPin size={16} className="mr-2" /> <span>Le parcours utilisateur</span>
            </div>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Opérationnel en <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, color: 'var(--mango)', letterSpacing: '-0.02em' }}>4 étapes</span>
            </h2>
            <p className="text-slate-400 text-lg">De l'inscription à la première quittance, numérisez votre location en moins d'une heure.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Step Connector Line (desktop) */}
            <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 z-0"></div>

            <div className="reveal relative z-10 text-center group">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-sky-500 group-hover:shadow-[0_0_30px_rgba(0,180,216,0.2)]">
                <div className="text-sky-400 mb-1"><UserCheck size={28} strokeWidth={2} /></div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '20px', color: 'white', opacity: 0.2 }}>01</div>
              </div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>Inscription & KYC</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">Créez votre compte, vérifiez votre identité simplement avec votre pièce d'identité.</p>
            </div>

            <div className="reveal reveal-d1 relative z-10 text-center group">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-mango-500 group-hover:shadow-[0_0_30px_rgba(255,139,0,0.2)]">
                <div className="text-mango-400 mb-1"><Home size={28} strokeWidth={2} /></div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '20px', color: 'white', opacity: 0.2 }}>02</div>
              </div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>Déclarez le bien</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">Ajoutez vos biens, définissez le loyer, invitez votre locataire ou un candidat.</p>
            </div>

            <div className="reveal reveal-d2 relative z-10 text-center group">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-lime-500 group-hover:shadow-[0_0_30px_rgba(0,200,150,0.2)]">
                <div className="text-lime-400 mb-1"><FileText size={28} strokeWidth={2} /></div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '20px', color: 'white', opacity: 0.2 }}>03</div>
              </div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>Signez le bail</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">Bail écrit ou déclaratif généré par l'IA. Enregistrement DGI et caution CDC inclus.</p>
            </div>

            <div className="reveal reveal-d3 relative z-10 text-center group">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center transition-all duration-500 group-hover:border-teal-500 group-hover:shadow-[0_0_30px_rgba(0,155,126,0.2)]">
                <div className="text-teal-400 mb-1"><Activity size={28} strokeWidth={2} /></div>
                <div style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '20px', color: 'white', opacity: 0.2 }}>04</div>
              </div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.25rem', marginBottom: '12px' }}>Gérez sereinement</h3>
              <p className="text-slate-400 text-sm leading-relaxed px-4">Paiements Mobile Money automatisés, reçus certifiés, relances et statistiques.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USERS ═══ */}
      <section className="users" id="users" style={{ background: '#F8FAFC', padding: '100px 0' }}>
        <div className="section-inner">
          <div className="users-header reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center mb-6 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'var(--teal)' }}>
              <User size={16} className="mr-2" /> <span>Pour qui ?</span>
            </div>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.04em' }}>
              Une seule plateforme, <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, color: 'var(--teal)', letterSpacing: '-0.02em', paddingRight: '8px' }}>tous les acteurs</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${activeTab === 'tenant' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveTab('tenant')}><User size={18} /> Locataire</button>
            <button className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${activeTab === 'landlord' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveTab('landlord')}><Home size={18} /> Propriétaire</button>
            <button className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${activeTab === 'agency' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveTab('agency')}><Building2 size={18} /> Agence</button>
            <button className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${activeTab === 'agent' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveTab('agent')}><UserCheck size={18} /> Agent NC</button>
            <button className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${activeTab === 'champion' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`} onClick={() => setActiveTab('champion')}><Star size={18} /> Champion</button>
          </div>

          {/* LOCATAIRE */}
          <div className={`users-content ${activeTab === 'tenant' ? 'show' : ''}`} id="uc-tenant">
            <div className="user-info">
              <div className="section-eyebrow" style={{ background: 'var(--teal-l)', color: 'var(--teal)', marginBottom: '14px' }}>🧑 Locataire</div>
              <h3>Votre vie locative simplifiée</h3>
              <p>Payez votre loyer en 2 secondes, recevez vos quittances PDF, signalez les problèmes et construisez votre réputation de bon locataire.</p>
              <div className="user-benefits">
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--mango-l)' }}>💳</div><span className="benefit-text">Paiement Orange Money, Wave, MTN, Moov</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--teal-l)' }}>🧾</div><span className="benefit-text">Quittances certifiées en 2 secondes</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--lime-l)' }}>📊</div><span className="benefit-text">Score ICL et passeport locatif numérique</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--sky-l)' }}>🔧</div><span className="benefit-text">Signalements de maintenance en direct</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--fuchsia-l)' }}>💬</div><span className="benefit-text">Messagerie directe avec le propriétaire</span></div>
              </div>
            </div>
            <div className="user-visual">
              <div style={{ background: 'linear-gradient(135deg,var(--teal),var(--sky))', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '18px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Score ICL</div>
                <div style={{ fontSize: '52px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'white' }}>72</div>
                <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50px', padding: '4px 16px', display: 'inline-block', color: 'white', fontSize: '13px', fontWeight: 600 }}>Grade B · Bon locataire</div>
              </div>
              <div className="user-visual-inner">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--ink)' }}>14</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Mois payés à temps</div></div>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--lime-d)' }}>100%</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Ponctualité</div></div>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '14px', boxShadow: '0 2px 10px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--mango),var(--coral))', display: 'grid', placeItems: 'center', fontSize: '20px' }}>🔲</div>
                  <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Mon passeport locatif</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>PASS-KA-2024 · valide</div></div>
                  <div style={{ marginLeft: 'auto', background: 'var(--lime-l)', color: 'var(--lime-d)', borderRadius: '50px', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>Actif</div>
                </div>
              </div>
            </div>
          </div>

          {/* PROPRIÉTAIRE */}
          <div className={`users-content ${activeTab === 'landlord' ? 'show' : ''}`} id="uc-landlord">
            <div className="user-info">
              <div className="section-eyebrow" style={{ background: 'var(--mango-l)', color: 'var(--mango-d)', marginBottom: '14px' }}>🏠 Propriétaire</div>
              <h3>Gérez votre patrimoine locatif sans stress</h3>
              <p>Suivez vos loyers en temps réel, automatisez les relances, enregistrez vos baux à la DGI et gérez les cautions CDC depuis votre téléphone.</p>
              <div className="user-benefits">
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--mango-l)' }}>💰</div><span className="benefit-text">Revenus locatifs en temps réel</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--coral-l)' }}>⚠️</div><span className="benefit-text">Alertes impayés et relances automatiques</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--sky-l)' }}>📋</div><span className="benefit-text">Enregistrement DGI en ligne</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--teal-l)' }}>🏦</div><span className="benefit-text">Cautions CDC-CI sécurisées</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--lime-l)' }}>📊</div><span className="benefit-text">Rapports et CRG mensuels</span></div>
              </div>
            </div>
            <div className="user-visual">
              <div style={{ background: 'linear-gradient(135deg,var(--mango),var(--coral))', padding: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px', marginBottom: '4px' }}>Revenus avril 2025</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '36px', fontWeight: 800, color: 'white' }}>245 000 <span style={{ fontSize: '16px' }}>FCFA</span></div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50px', padding: '4px 12px', color: 'white', fontSize: '11px' }}>3 biens</div>
                  <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50px', padding: '4px 12px', color: 'white', fontSize: '11px' }}>2 loués ✓</div>
                </div>
              </div>
              <div className="user-visual-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'var(--lime-l)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: 'var(--lime-d)', fontWeight: 500 }}>🏠 F3 Yopougon — Konan A.</span><span style={{ background: 'var(--lime-d)', color: 'white', borderRadius: '50px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>85 000 ✓</span></div>
                <div style={{ background: 'var(--coral-l)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: 'var(--coral)', fontWeight: 500 }}>🏢 Studio Cocody — Diarra M.</span><span style={{ background: 'var(--coral)', color: 'white', borderRadius: '50px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>Impayé J+12</span></div>
                <div style={{ background: 'var(--sky-l)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: 'var(--sky-d)', fontWeight: 500 }}>🏚 Chambre Abobo</span><span style={{ background: 'var(--sky-l)', color: 'var(--sky-d)', borderRadius: '50px', padding: '3px 10px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--sky)' }}>Vacant</span></div>
              </div>
            </div>
          </div>

          {/* AGENCE */}
          <div className={`users-content ${activeTab === 'agency' ? 'show' : ''}`} id="uc-agency">
            <div className="user-info">
              <div className="section-eyebrow" style={{ background: 'var(--teal-l)', color: 'var(--teal)', marginBottom: '14px' }}>🏢 Agence immobilière</div>
              <h3>Gérez tout votre portefeuille d'un coup</h3>
              <p>Mandats, baux, loyers, commissions, CRG — tout votre back-office en une plateforme. Agréée ANAH, conforme à la loi 2019-576.</p>
              <div className="user-benefits">
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--teal-l)' }}>📑</div><span className="benefit-text">Gestion mandats exclusifs et simples</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--mango-l)' }}>💵</div><span className="benefit-text">Commissions automatiquement calculées</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--sky-l)' }}>📋</div><span className="benefit-text">CRG propriétaires en un clic</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--lime-l)' }}>👥</div><span className="benefit-text">Gestion candidatures avec score ICL</span></div>
              </div>
            </div>
            <div className="user-visual">
              <div style={{ background: 'linear-gradient(135deg,var(--teal),#009B7E)', padding: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px', marginBottom: '4px' }}>Portefeuille · Prestige Immo</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '36px', fontWeight: 800, color: 'white' }}>28 biens</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50px', padding: '4px 12px', color: 'white', fontSize: '11px' }}>4.2M FCFA gérés</div>
                  <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: '50px', padding: '4px 12px', color: 'white', fontSize: '11px' }}>420K commissions</div>
                </div>
              </div>
              <div className="user-visual-inner">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--teal)' }}>24</div><div style={{ fontSize: '10px', color: 'var(--ink3)' }}>Loués</div></div>
                  <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--mango)' }}>4</div><div style={{ fontSize: '10px', color: 'var(--ink3)' }}>Candidatures</div></div>
                  <div style={{ background: 'white', borderRadius: '10px', padding: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--lime-d)' }}>6</div><div style={{ fontSize: '10px', color: 'var(--ink3)' }}>Mandats</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT NC */}
          <div className={`users-content ${activeTab === 'agent' ? 'show' : ''}`} id="uc-agent">
            <div className="user-info">
              <div className="section-eyebrow" style={{ background: 'var(--coral-l)', color: 'var(--coral)', marginBottom: '14px' }}>🤝 Agent Non Certifié</div>
              <h3>Régularisez et développez votre activité</h3>
              <p>Déclarez vos baux existants via SMS, lancez votre dossier de régularisation ANAH et obtenez votre agrément en quelques semaines.</p>
              <div className="user-benefits">
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--coral-l)' }}>📱</div><span className="benefit-text">Baux déclaratifs par SMS (BDQ)</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--mango-l)' }}>📋</div><span className="benefit-text">Suivi régularisation ANAH en ligne</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--lime-l)' }}>🏠</div><span className="benefit-text">Gestion biens en attente d'agrément</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--sky-l)' }}>🎓</div><span className="benefit-text">Formation ANAH intégrée</span></div>
              </div>
            </div>
            <div className="user-visual">
              <div style={{ background: 'linear-gradient(135deg,var(--coral),#E91E63)', padding: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px', marginBottom: '4px' }}>Régularisation</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '28px', fontWeight: 800, color: 'white' }}>En cours · Étape 2/3</div>
                <div style={{ background: 'rgba(255,255,255,.2)', height: '6px', borderRadius: '3px', marginTop: '12px' }}><div style={{ width: '66%', height: '100%', background: 'white', borderRadius: '3px' }}></div></div>
              </div>
              <div className="user-visual-inner" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ background: 'var(--lime-l)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--lime-d)', display: 'grid', placeItems: 'center', color: 'white', fontSize: '12px' }}>✓</div><span style={{ fontSize: '13px', color: 'var(--lime-d)', fontWeight: 500 }}>Dossier soumis</span></div>
                <div style={{ background: 'var(--mango-l)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--mango)', display: 'grid', placeItems: 'center', color: 'white', fontSize: '12px' }}>⟳</div><span style={{ fontSize: '13px', color: 'var(--mango-d)', fontWeight: 500 }}>Examen ANAH en cours</span></div>
                <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E8DDD0', display: 'grid', placeItems: 'center', color: 'var(--ink3)', fontSize: '12px' }}>3</div><span style={{ fontSize: '13px', color: 'var(--ink3)' }}>Agrément délivré · estimé 15 mai</span></div>
              </div>
            </div>
          </div>

          {/* CHAMPION */}
          <div className={`users-content ${activeTab === 'champion' ? 'show' : ''}`} id="uc-champion">
            <div className="user-info">
              <div className="section-eyebrow" style={{ background: 'var(--lime-l)', color: 'var(--lime-d)', marginBottom: '14px' }}>⭐ Champion QAPRIL</div>
              <h3>Gagnez de l'argent en faisant grandir QAPRIL</h3>
              <p>Recrutez des propriétaires et locataires, formalisez des baux, et percevez des commissions attractives. Plus vous agissez, plus vous gagnez.</p>
              <div className="user-benefits">
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--lime-l)' }}>💵</div><span className="benefit-text">Jusqu'à 15 000 FCFA par bail formalisé</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--mango-l)' }}>👥</div><span className="benefit-text">Bonus de recrutement de filleuls</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--sky-l)' }}>🎯</div><span className="benefit-text">Objectifs mensuels avec bonus</span></div>
                <div className="benefit"><div className="benefit-icon" style={{ background: 'var(--fuchsia-l)' }}>📱</div><span className="benefit-text">CRM prospects intégré</span></div>
              </div>
            </div>
            <div className="user-visual">
              <div style={{ background: 'linear-gradient(135deg,#F9A825,var(--lime))', padding: '20px' }}>
                <div style={{ color: 'rgba(0,0,0,.5)', fontSize: '12px', marginBottom: '4px' }}>Commissions · Yao Thierry ⭐</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '36px', fontWeight: 800, color: 'white' }}>340 000 FCFA</div>
                <div style={{ color: 'rgba(255,255,255,.8)', fontSize: '13px', marginTop: '4px' }}>cumulé 2025 · +18% vs 2024</div>
              </div>
              <div className="user-visual-inner">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--lime-d)' }}>43%</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Taux conversion</div></div>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}><div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--f-display)', color: 'var(--mango)' }}>L3</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>Niveau atteint</div></div>
                </div>
                <div style={{ background: 'var(--lime-l)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}><span style={{ fontSize: '13px', color: 'var(--lime-d)', fontWeight: 600 }}>🎯 Objectif mai : 6/10 conversions</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="testimonials" id="testimonials">
        <div className="section-inner">
          <div className="testimonials-header reveal">
            <div className="section-eyebrow">💬 Témoignages</div>
            <h2>Ils nous font confiance</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card reveal">
              <div className="testi-stars">⭐⭐⭐⭐⭐</div>
              <p className="testi-quote">« Avant QAPRIL, je courais après les loyers chaque mois. Maintenant Orange Money me notifie directement et la quittance part automatiquement. C'est magique ! »</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--mango),var(--coral))' }}>OI</div>
                <div><div className="testi-name">Ouédraogo Issa</div><div className="testi-role">Propriétaire · 3 biens · Yopougon</div></div>
              </div>
              <div className="testi-tag" style={{ background: 'var(--mango-l)', color: 'var(--mango-d)' }}>🏠 Propriétaire</div>
            </div>
            <div className="testi-card reveal reveal-d1">
              <div className="testi-stars">⭐⭐⭐⭐⭐</div>
              <p className="testi-quote">« Mon score ICL m'a permis de décrocher le logement de mes rêves à Cocody. Le propriétaire a vu que j'étais sérieuse — plus de méfiance, juste de la confiance. »</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--teal),var(--sky))' }}>KA</div>
                <div><div className="testi-name">Konan Adjoa</div><div className="testi-role">Locataire · Cocody Riviera</div></div>
              </div>
              <div className="testi-tag" style={{ background: 'var(--teal-l)', color: 'var(--teal)' }}>🧑 Locataire</div>
            </div>
            <div className="testi-card reveal reveal-d2">
              <div className="testi-stars">⭐⭐⭐⭐⭐</div>
              <p className="testi-quote">« Avec QAPRIL, je gère 28 biens depuis mon téléphone. Les CRG se génèrent automatiquement, les propriétaires sont ravis. On a doublé notre portefeuille en 6 mois. »</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--fuchsia),#9C27B0)' }}>PI</div>
                <div><div className="testi-name">Prestige Immobilier</div><div className="testi-role">Agence agréée · Cocody</div></div>
              </div>
              <div className="testi-tag" style={{ background: 'var(--fuchsia-l)', color: '#9C27B0' }}>🏢 Agence</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="pricing" id="pricing" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', padding: '100px 0' }}>
        <div className="section-inner relative z-10">
          <div className="pricing-header reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center mb-6 px-5 py-2 rounded-full border border-slate-200 bg-white shadow-sm" style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: 'var(--coral)' }}>
              <Wallet size={16} className="mr-2" /> <span>Tarifs transparents</span>
            </div>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: '20px' }}>
              Des offres pour <span style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontWeight: 700, color: 'var(--coral)', letterSpacing: '-0.02em', paddingRight: '8px' }}>chaque profil</span>
            </h2>
            <p className="text-slate-500 text-lg">Commencez gratuitement. Évoluez selon vos besoins à votre rythme.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            <div className="glass-card reveal bg-white p-8 rounded-3xl border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col">
              <div className="inline-block px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-bold font-['Outfit'] tracking-widest mb-6">LOCATAIRE</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 text-slate-800 ring-1 ring-slate-100"><User size={24} /></div>
              <div className="font-['Outfit'] font-bold text-2xl text-slate-800">Locataire</div>
              <div className="font-['Outfit'] font-black text-4xl text-slate-900 mt-4 mb-1">Gratuit</div>
              <div className="text-slate-400 text-sm font-medium mb-8">Pour toujours</div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Paiement Mobile Money</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Quittances PDF</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Score ICL</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Passeport locatif</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-teal-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Signalements</span></div>
              </div>
              <button className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-slate-800 hover:bg-slate-50 transition-colors" onClick={() => handleLoginClick("LOCATAIRE")}>Commencer gratuitement</button>
            </div>

            <div className="glass-card reveal reveal-d1 bg-white p-8 rounded-3xl border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col">
              <div className="inline-block px-3 py-1 bg-mango-50 text-mango-600 rounded-full text-xs font-bold font-['Outfit'] tracking-widest mb-6">ESSENTIEL</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 text-slate-800 ring-1 ring-slate-100"><Home size={24} /></div>
              <div className="font-['Outfit'] font-bold text-2xl text-slate-800">Essentiel</div>
              <div className="font-['Outfit'] font-black text-4xl text-slate-900 mt-4 mb-1">2 500</div>
              <div className="text-slate-400 text-sm font-medium mb-8">FCFA / mois · par bien</div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-mango-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Gestion baux</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-mango-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Suivi loyers</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-mango-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Relances auto</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-mango-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Enregistrement DGI</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-mango-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Caution CDC-CI</span></div>
              </div>
              <button className="w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-lg" onClick={() => handleLoginClick("BAILLEUR")}>Essayer 30 jours</button>
            </div>

            <div className="glass-card reveal reveal-d2 bg-slate-900 p-8 rounded-3xl border border-slate-700 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,180,216,0.5)] md:-translate-y-4 relative flex flex-col z-10">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-t-3xl"></div>
              <div className="inline-block px-3 py-1 bg-sky-900/50 text-sky-400 rounded-full text-xs font-bold font-['Outfit'] tracking-widest mb-6 border border-sky-800">⭐ PLUS POPULAIRE</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-800 text-white ring-1 ring-slate-700"><Building2 size={24} /></div>
              <div className="font-['Outfit'] font-bold text-2xl text-white">Pro</div>
              <div className="font-['Outfit'] font-black text-4xl text-white mt-4 mb-1">8 000</div>
              <div className="text-slate-400 text-sm font-medium mb-8">FCFA / mois · illimité</div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5"/> <span className="text-slate-300 text-sm">Tout Essentiel</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5"/> <span className="text-slate-300 text-sm">Mandats de gestion</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5"/> <span className="text-slate-300 text-sm">CRG automatiques</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5"/> <span className="text-slate-300 text-sm">Agent IA bail déclaratif</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 mt-0.5"/> <span className="text-slate-300 text-sm font-semibold">Biens illimités</span></div>
              </div>
              <button className="w-full py-4 rounded-xl font-bold bg-white text-slate-900 hover:bg-sky-50 transition-colors shadow-lg shadow-white/10" onClick={() => handleLoginClick("BAILLEUR")}>Commencer avec Pro <ChevronRight size={16} className="inline ml-1"/></button>
            </div>

            <div className="glass-card reveal reveal-d3 bg-white p-8 rounded-3xl border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col">
              <div className="inline-block px-3 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-full text-xs font-bold font-['Outfit'] tracking-widest mb-6">INSTITUTIONNEL</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-50 text-slate-800 ring-1 ring-slate-100"><Landmark size={24} /></div>
              <div className="font-['Outfit'] font-bold text-2xl text-slate-800">Institutionnel</div>
              <div className="font-['Outfit'] font-black text-4xl text-slate-900 mt-4 mb-1">Sur devis</div>
              <div className="text-slate-400 text-sm font-medium mb-8">SCI · Foncières · Syndics</div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-fuchsia-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Tout Pro</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-fuchsia-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Multi-entités légales</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-fuchsia-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">API dédiée</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-fuchsia-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">Onboarding dédié</span></div>
                <div className="flex items-start gap-3"><CheckCircle2 size={18} className="text-fuchsia-500 shrink-0 mt-0.5"/> <span className="text-slate-600 text-sm">SLA premium</span></div>
              </div>
              <button className="w-full py-4 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:border-slate-800 hover:bg-slate-50 transition-colors" onClick={() => handleLoginClick("ADMIN")}>Contacter l'équipe</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE ═══ */}
      <div className="mobile-section">
        <div className="mobile-inner">
          <div className="mobile-left reveal">
            <div className="section-eyebrow">📱 Application mobile</div>
            <h2>Dans votre poche,<br/>toujours disponible</h2>
            <p className="section-desc">Payez votre loyer depuis le marché, recevez vos quittances en déplacement, gérez vos biens depuis Bouaké ou San Pédro.</p>
            <div className="app-stores">
              <a href="#" className="app-store-btn">
                <span className="asb-icon">🍎</span>
                <div className="asb-text"><span className="asb-sub">Télécharger sur</span><span className="asb-name">App Store</span></div>
              </a>
              <a href="#" className="app-store-btn">
                <span className="asb-icon">🤖</span>
                <div className="asb-text"><span className="asb-sub">Disponible sur</span><span className="asb-name">Google Play</span></div>
              </a>
            </div>
          </div>
          <div className="mobile-right">
            <div className="phone-mockup phone-1">
              <div className="phone-screen">
                <div className="ps-header"><div className="ps-logo">QAPRIL</div></div>
                <div className="ps-body">
                  <div className="ps-item"><div className="ps-item-icon" style={{ background: 'var(--mango-l)' }}>💳</div><div className="ps-item-text"><strong>Loyer mai payé</strong>85 000 FCFA · Orange</div></div>
                  <div className="ps-item"><div className="ps-item-icon" style={{ background: 'var(--teal-l)' }}>✓</div><div className="ps-item-text"><strong>Quittance reçue</strong>PDF · REC-2025-05</div></div>
                  <div className="ps-item"><div className="ps-item-icon" style={{ background: 'var(--lime-l)' }}>📊</div><div className="ps-item-text"><strong>Score ICL</strong>72 pts · Grade B</div></div>
                </div>
              </div>
            </div>
            <div className="phone-mockup phone-2">
              <div className="phone-screen">
                <div className="ps-header" style={{ background: 'var(--ink)' }}><div className="ps-logo">Mon portefeuille</div></div>
                <div className="ps-body">
                  <div className="ps-item"><div className="ps-item-icon" style={{ background: '#DCFCE7' }}>🏠</div><div className="ps-item-text"><strong>F3 Yopougon</strong>85 000 FCFA ✓</div></div>
                  <div className="ps-item"><div className="ps-item-icon" style={{ background: 'var(--coral-l)' }}>🏢</div><div className="ps-item-text"><strong>Studio Cocody</strong>Impayé J+12 ⚠️</div></div>
                  <div style={{ background: 'linear-gradient(135deg,var(--mango),var(--coral))', borderRadius: '10px', padding: '10px', marginTop: '6px', textAlign: 'center', color: 'white', fontSize: '12px', fontWeight: 600 }}>245 000 FCFA ce mois</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CTA ═══ */}
      <div className="cta-band" id="cta">
        <div className="cta-deco-1"></div>
        <div className="cta-deco-2"></div>
        <div className="cta-inner">
          <h2>Rejoignez 4 800+ Ivoiriens<br/>qui gèrent mieux leur logement</h2>
          <p>Inscription gratuite · Aucune carte bancaire requise · Actif en 5 minutes</p>
          {session?.user ? (
            <Link href={dashUrl} className="btn-cta-white">🚀 Accéder à mon Dashboard</Link>
          ) : (
            <button onClick={() => handleLoginClick("LOCATAIRE")} className="btn-cta-white">🚀 Créer mon compte gratuitement</button>
          )}
          <div className="cta-sub">✓ Gratuit pour les locataires · ✓ Essai 30 jours pour les propriétaires · ✓ Support WhatsApp inclus</div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#" className="footer-logo">
                <div style={{ background: 'white', padding: '10px 16px', borderRadius: '14px', display: 'inline-block', marginBottom: '16px' }}>
                  <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                </div>
              </a>
              <p>La plateforme de gestion locative numérique de Côte d'Ivoire. Conçue pour les acteurs du marché immobilier ivoirien.</p>
              <div className="footer-socials">
                <a href="#" className="social-btn">📘</a>
                <a href="#" className="social-btn">📷</a>
                <a href="#" className="social-btn">💬</a>
                <a href="#" className="social-btn">🐦</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Produit</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Fonctionnalités</a>
                <a href="#" className="footer-link">Tarifs</a>
                <a href="#" className="footer-link">Application mobile</a>
                <a href="#" className="footer-link">API & Intégrations</a>
                <a href="#" className="footer-link">Nouveautés</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Pour vous</h4>
              <div className="footer-links">
                <a href="#users" onClick={() => setActiveTab('tenant')} className="footer-link">Locataires</a>
                <a href="#users" onClick={() => setActiveTab('landlord')} className="footer-link">Propriétaires</a>
                <a href="#users" onClick={() => setActiveTab('agency')} className="footer-link">Agences immobilières</a>
                <a href="#users" onClick={() => setActiveTab('agent')} className="footer-link">Agents NC</a>
                <a href="#users" onClick={() => setActiveTab('champion')} className="footer-link">Devenir Champion</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Entreprise</h4>
              <div className="footer-links">
                <Link href="/a-propos" className="footer-link">À propos</Link>
                <Link href="/blog" className="footer-link">Blog</Link>
                <Link href="/presse" className="footer-link">Presse</Link>
                <Link href="/carriere" className="footer-link">Carrières</Link>
                <Link href="/contact" className="footer-link">Contact</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal flex flex-wrap items-center gap-x-4 gap-y-2 justify-center md:justify-start">
              <span>© 2025 QAPRIL Technologies · Abidjan, Côte d'Ivoire · Tous droits réservés</span>
              <span className="hidden md:inline text-white/30">|</span>
              <div className="flex flex-wrap items-center gap-4 text-white/50 text-[11px] uppercase tracking-widest">
                <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
                <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>
            <div className="footer-badges">
              <div className="f-badge">🏛 ANAH-CI</div>
              <div className="f-badge">🏦 CDC-CI</div>
              <div className="f-badge">📋 DGI</div>
              <div className="f-badge">🔒 ARTCI</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
