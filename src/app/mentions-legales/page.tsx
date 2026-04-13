"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MentionsLegalesPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>

      {/* HEADER */}
      <nav id="navbar" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: '80px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </Link>
        <div className="flex items-center gap-4">
            <Link href="/mon-espace-locataire/login" className="hidden sm:inline-flex px-4 py-2 text-[11px] font-black uppercase tracking-widest text-ink hover:text-ink/70 transition-colors bg-transparent border border-transparent hover:border-black/10 rounded-full">Connexion Locataire</Link>
            <Link href="/dashboard/login" className="bg-ink text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full hover:bg-ink/80 transition-colors">Connexion Propriétaire</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* HERO SECTION */}
        <section className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.3em] mb-6 bg-white">
            Informations Éditeur
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-ink leading-[1.1] tracking-tighter mb-6 uppercase">
            Mentions <br />
            <span style={{ color: 'var(--lime-d)' }}>Légales</span>
            </h1>
        </section>

        {/* CONTENT */}
        <section className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start pb-8 border-b border-black/5">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">01</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">L'Éditeur</h2>
                </div>
                <div className="md:col-span-3 space-y-4">
                    <p className="text-lg font-medium text-ink3 leading-relaxed">
                        Le site internet <strong>QAPRIL</strong> et les applications mobiles associées sont édités par l'entreprise QAPRIL Technologies, enregistrée au registre du commerce de Côte d'Ivoire.
                    </p>
                    <ul className="grid grid-cols-1 gap-3 list-none p-0">
                        <li className="flex items-center space-x-3 text-ink font-bold p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--mango)' }}></div>
                          <span><strong>Siège Social :</strong> Abidjan, Riviéra Bonoumin</span>
                        </li>
                        <li className="flex items-center space-x-3 text-ink font-bold p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--sky)' }}></div>
                          <span><strong>Email :</strong> contact@qapril.ci</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start pb-8 border-b border-black/5">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">02</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Hébergement</h2>
                </div>
                <div className="md:col-span-3">
                    <p className="text-lg font-medium text-ink3 leading-relaxed mb-6">
                        L'infrastructure technique de QAPRIL est hautement sécurisée et hébergée sur des serveurs certifiés garantissant l'intégrité des bases de données immobilières.
                    </p>
                    <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-xl shadow-black/5">
                        <h4 className="font-black uppercase text-xs tracking-widest text-[#FF8B00] mb-2">Hébergeur Principal</h4>
                        <p className="text-sm font-bold text-ink">Hostinger International Ltd.</p>
                        <p className="text-sm font-medium text-ink3 mt-2">Services et bases de données du registre QAPRIL V3.</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">03</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Cookies</h2>
                </div>
                <div className="md:col-span-3 p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5">
                    <p className="text-lg font-medium text-ink3 leading-relaxed">
                        QAPRIL utilise uniquement des <strong>cookies fonctionnels de session</strong>, strictement nécessaires au maintien de la connexion (authentification) de ses utilisateurs Locataires, Propriétaires et Administrateurs. 
                        Aucun cookie de ciblage publicitaire ni revente à des tiers n'est effectué sur cette plateforme.
                    </p>
                </div>
            </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner" style={{ paddingTop: '20px' }}>
          <div className="footer-bottom">
            <div className="footer-legal flex flex-wrap items-center gap-x-4 gap-y-2 justify-center md:justify-start">
              <span>© 2025 QAPRIL Technologies · Tous droits réservés</span>
              <span className="hidden md:inline text-white/30">|</span>
              <div className="flex flex-wrap items-center gap-4 text-white/50 text-[11px] uppercase tracking-widest">
                <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
                <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
                <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
                <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>
            <div className="footer-badges">
              <div className="f-badge">🏛 ANAH-CI</div>
              <div className="f-badge">🏦 CDC-CI</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
