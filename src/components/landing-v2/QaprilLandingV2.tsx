"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { choisirTypeConnexion } from "@/actions/auth.actions";

export default function QaprilLandingV2({ session }: { session: any }) {
  const [activeTab, setActiveTab] = useState("tenant");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
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
          <div className="nav-logo-sq">Q</div>
          QAPRIL
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
            <button onClick={() => handleLoginClick("LOCATAIRE")} className="nav-cta">Démarrer gratuitement →</button>
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

      {/* ═══ HERO ═══ */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="hero-blob-1"></div>
          <div className="hero-blob-2"></div>
          <div className="hero-dots"></div>
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge-icon">🇨🇮</div>
              <span>Plateforme n°1 en Côte d'Ivoire</span>
              <div className="hero-badge-dot"></div>
              <span>4 800+ utilisateurs actifs</span>
            </div>
            <h1>La gestion<br/>locative <span className="accent-mango">enfin</span><br/><span className="accent-sky">simple</span> & digitale</h1>
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
      <div className="ticker">
        <div className="ticker-track" id="ticker">
            <div className="ticker-item"><div className="ticker-dot"></div> Paiement loyer via <strong>Orange Money, MTN, Wave, Moov</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Quittances PDF <strong>certifiées</strong> automatiquement</div>
            <div className="ticker-item"><div className="ticker-dot"></div> Baux enregistrés à la <strong>DGI</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Cautions consignées à la <strong>CDC-CI</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Score ICL · <strong>Passeport locatif</strong> numérique</div>
            <div className="ticker-item"><div className="ticker-dot"></div> Agent IA pour baux <strong>déclaratifs</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Paiement loyer via <strong>Orange Money, MTN, Wave, Moov</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Quittances PDF <strong>certifiées</strong> automatiquement</div>
            <div className="ticker-item"><div className="ticker-dot"></div> Baux enregistrés à la <strong>DGI</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Cautions consignées à la <strong>CDC-CI</strong></div>
            <div className="ticker-item"><div className="ticker-dot"></div> Score ICL · <strong>Passeport locatif</strong> numérique</div>
            <div className="ticker-item"><div className="ticker-dot"></div> Agent IA pour baux <strong>déclaratifs</strong></div>
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
      <section className="features" id="features">
        <div className="section-inner">
          <div className="features-header reveal">
            <div className="section-eyebrow">✨ Fonctionnalités</div>
            <h2>Tout ce dont vous avez<br/>besoin en un seul endroit</h2>
            <p className="section-desc">De la signature du bail au paiement du loyer, en passant par l'état des lieux — QAPRIL couvre tout le cycle locatif ivoirien.</p>
          </div>
          <div className="features-grid">

            <div className="feature-card fc-mango feature-card-large reveal">
              <div className="fc-text">
                <div className="fc-icon" style={{ background: 'var(--mango)', color: 'white' }}>💳</div>
                <h3>Paiement loyer<br/>Mobile Money</h3>
                <p>Payez et recevez vos loyers via Orange Money, MTN MoMo, Wave et Moov Money. Confirmation instantanée et quittance PDF générée automatiquement.</p>
                <div className="feature-tag">Orange · MTN · Wave · Moov</div>
              </div>
              <div className="fc-visual">
                <div style={{ background: 'white', borderRadius: '12px', padding: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FF6600', display: 'grid', placeItems: 'center', fontSize: '16px' }}>🟠</div>
                  <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Orange Money</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>85 000 FCFA · confirmé ✓</div></div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: 'var(--lime-d)' }}>+2s</div>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1FA4FF', display: 'grid', placeItems: 'center', fontSize: '16px' }}>🔵</div>
                  <div><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Wave CI</div><div style={{ fontSize: '11px', color: 'var(--ink3)' }}>160 000 FCFA · confirmé ✓</div></div>
                  <div style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, color: 'var(--lime-d)' }}>+1s</div>
                </div>
              </div>
            </div>

            <div className="feature-card fc-sky reveal reveal-d1">
              <div className="fc-icon" style={{ background: 'var(--sky)', color: 'white' }}>📄</div>
              <h3>Baux numériques & DGI</h3>
              <p>Créez, signez électroniquement et enregistrez vos contrats à la DGI. Bail déclaratif par SMS pour les situations existantes.</p>
              <div className="feature-tag">Signature électronique · DGI</div>
            </div>

            <div className="feature-card fc-lime reveal reveal-d2">
              <div className="fc-icon" style={{ background: 'var(--lime)', color: 'white' }}>🏛</div>
              <h3>Cautions CDC-CI</h3>
              <p>Consignez les cautions à la Caisse des Dépôts et Consignations. Restitution transparente, traçable et légale.</p>
              <div className="feature-tag">CDC-CI officiel</div>
            </div>

            <div className="feature-card fc-fuchsia reveal">
              <div className="fc-icon" style={{ background: 'var(--fuchsia)', color: 'white' }}>🤖</div>
              <h3>Agent IA Bail Déclaratif</h3>
              <p>Notre agent conversationnel guide propriétaires et locataires pour formaliser les baux existants en quelques minutes.</p>
              <div className="feature-tag">Claude AI · QAPRIL Agent</div>
            </div>

            <div className="feature-card fc-teal reveal reveal-d1">
              <div className="fc-icon" style={{ background: 'var(--teal)', color: 'white' }}>📊</div>
              <h3>Score ICL & Passeport</h3>
              <p>Construisez votre réputation de locataire fiable. Partagez votre passeport locatif pour accélérer vos candidatures.</p>
              <div className="feature-tag">Grade A → F · QR Code</div>
            </div>

            <div className="feature-card fc-coral reveal reveal-d2">
              <div className="fc-icon" style={{ background: 'var(--coral)', color: 'white' }}>🔧</div>
              <h3>Maintenance & EDL</h3>
              <p>Signalez les problèmes, suivez les interventions, réalisez les états des lieux avec photos certifiées.</p>
              <div className="feature-tag">Photos · Certification</div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how" id="how">
        <div className="section-inner">
          <div className="how-header reveal">
            <div className="section-eyebrow">🗺️ Le parcours</div>
            <h2>Opérationnel en 4 étapes</h2>
            <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>De l'inscription à la première quittance, tout se fait en moins d'une heure.</p>
          </div>
          <div className="how-steps">
            <div className="how-step reveal">
              <div className="how-step-num hs-1">
                1
                <div className="how-step-emoji">✍️</div>
              </div>
              <h3>Inscription & KYC</h3>
              <p>Créez votre compte, vérifiez votre identité en 5 minutes avec votre CNI ou passeport ivoirien.</p>
            </div>
            <div className="how-step reveal reveal-d1">
              <div className="how-step-num hs-2">
                2
                <div className="how-step-emoji">🏠</div>
              </div>
              <h3>Déclarez votre bien</h3>
              <p>Propriétaires : ajoutez vos biens, définissez le loyer, invitez votre locataire existant ou recrutez-en un nouveau.</p>
            </div>
            <div className="how-step reveal reveal-d2">
              <div className="how-step-num hs-3">
                3
                <div className="how-step-emoji">📋</div>
              </div>
              <h3>Signez le bail</h3>
              <p>Bail écrit ou déclaratif — notre agent IA vous guide. Enregistrement DGI et caution CDC automatisés.</p>
            </div>
            <div className="how-step reveal reveal-d3">
              <div className="how-step-num hs-4">
                4
                <div className="how-step-emoji">🎉</div>
              </div>
              <h3>Gérez sereinement</h3>
              <p>Paiements Mobile Money automatiques, quittances PDF, alertes impayés, relances intelligentes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ USERS ═══ */}
      <section className="users" id="users">
        <div className="section-inner">
          <div className="users-header reveal">
            <div className="section-eyebrow">👥 Pour qui ?</div>
            <h2>Une plateforme,<br/>tous les acteurs</h2>
          </div>
          <div className="users-tabs">
            <button className={`user-tab ${activeTab === 'tenant' ? 'active' : ''}`} onClick={() => setActiveTab('tenant')}>🧑 Locataire</button>
            <button className={`user-tab ${activeTab === 'landlord' ? 'active' : ''}`} onClick={() => setActiveTab('landlord')}>🏠 Propriétaire</button>
            <button className={`user-tab ${activeTab === 'agency' ? 'active' : ''}`} onClick={() => setActiveTab('agency')}>🏢 Agence</button>
            <button className={`user-tab ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>🤝 Agent NC</button>
            <button className={`user-tab ${activeTab === 'champion' ? 'active' : ''}`} onClick={() => setActiveTab('champion')}>⭐ Champion</button>
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
      <section className="pricing" id="pricing">
        <div className="section-inner">
          <div className="pricing-header reveal">
            <div className="section-eyebrow">💲 Tarifs</div>
            <h2>Des offres pour chaque profil</h2>
            <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>Commencez gratuitement. Évoluez selon vos besoins.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-badge" style={{ background: 'var(--teal-l)', color: 'var(--teal)' }}>LOCATAIRE</div>
              <div className="price-icon">🧑</div>
              <div className="price-name">Locataire</div>
              <div className="price-amount">Gratuit</div>
              <div className="price-period">Pour toujours</div>
              <div className="price-divider"></div>
              <div className="price-features">
                <div className="price-feature"><span className="price-feature-icon">✅</span> Paiement Mobile Money</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Quittances PDF</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Score ICL</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Passeport locatif</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Signalements</div>
              </div>
              <button className="price-cta" onClick={() => handleLoginClick("LOCATAIRE")}>Commencer gratuitement</button>
            </div>

            <div className="price-card reveal reveal-d1">
              <div className="price-badge" style={{ background: 'var(--mango-l)', color: 'var(--mango-d)' }}>ESSENTIEL</div>
              <div className="price-icon">🏠</div>
              <div className="price-name">Essentiel</div>
              <div className="price-amount">2 500</div>
              <div className="price-period">FCFA / mois · par bien</div>
              <div className="price-divider"></div>
              <div className="price-features">
                <div className="price-feature"><span className="price-feature-icon">✅</span> Gestion baux</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Suivi loyers</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Relances auto</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Enregistrement DGI</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Caution CDC-CI</div>
              </div>
              <button className="price-cta" onClick={() => handleLoginClick("BAILLEUR")}>Essayer 30 jours gratuit</button>
            </div>

            <div className="price-card featured reveal reveal-d2">
              <div className="price-badge">⭐ PLUS POPULAIRE</div>
              <div className="price-icon">🏢</div>
              <div className="price-name">Pro</div>
              <div className="price-amount">8 000</div>
              <div className="price-period" style={{ color: 'rgba(255,255,255,.45)' }}>FCFA / mois · illimité</div>
              <div className="price-divider"></div>
              <div className="price-features">
                <div className="price-feature"><span className="price-feature-icon">✅</span> Tout Essentiel</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Mandats de gestion</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> CRG automatiques</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Agent IA bail déclaratif</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Biens illimités</div>
              </div>
              <button className="price-cta" onClick={() => handleLoginClick("BAILLEUR")}>Commencer avec Pro →</button>
            </div>

            <div className="price-card reveal reveal-d3">
              <div className="price-badge" style={{ background: 'var(--fuchsia-l)', color: '#9C27B0' }}>INSTITUTIONNEL</div>
              <div className="price-icon">🏛</div>
              <div className="price-name">Institutionnel</div>
              <div className="price-amount">Sur devis</div>
              <div className="price-period">SCI · Foncières · Syndics</div>
              <div className="price-divider"></div>
              <div className="price-features">
                <div className="price-feature"><span className="price-feature-icon">✅</span> Tout Pro</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Multi-entités légales</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> API dédiée</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> Onboarding dédié</div>
                <div className="price-feature"><span className="price-feature-icon">✅</span> SLA premium</div>
              </div>
              <button className="price-cta" onClick={() => handleLoginClick("ADMIN")}>Contacter l'équipe</button>
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
                <div className="footer-logo-sq">Q</div>
                <span className="footer-logo-name">QAPRIL</span>
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
                <a href="#" className="footer-link">À propos</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Presse</a>
                <a href="#" className="footer-link">Carrières</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal">© 2025 QAPRIL Technologies · Abidjan, Côte d'Ivoire · Tous droits réservés</div>
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
