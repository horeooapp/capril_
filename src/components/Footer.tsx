"use client";

import Link from "next/link";

export default function Footer() {
    return (
      <div className="landing-v2-wrapper font-sans text-ink pb-0" style={{ backgroundColor: 'transparent' }}>
        <footer>
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <Link href="/" className="footer-logo">
                  <div style={{ background: 'white', padding: '10px 16px', borderRadius: '14px', display: 'inline-block', marginBottom: '16px' }}>
                    <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                  </div>
                </Link>
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
                  <a href="/#features" className="footer-link">Fonctionnalités</a>
                  <a href="/#pricing" className="footer-link">Tarifs</a>
                  <a href="#" className="footer-link">Application mobile</a>
                  <a href="#" className="footer-link">API & Intégrations</a>
                  <a href="#" className="footer-link">Nouveautés</a>
                </div>
              </div>
              <div className="footer-col">
                <h4>Pour vous</h4>
                <div className="footer-links">
                  <Link href="/mon-espace-locataire/login" className="footer-link">Locataires</Link>
                  <Link href="/dashboard/login" className="footer-link">Propriétaires</Link>
                  <Link href="/dashboard/login" className="footer-link">Agences immobilières</Link>
                  <Link href="/dashboard/login" className="footer-link">Agents NC</Link>
                  <Link href="/devenir-champion" className="footer-link">Devenir Champion</Link>
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
