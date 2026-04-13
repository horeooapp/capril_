"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
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

      <main className="relative z-10" style={{ paddingBottom: '100px' }}>
        {/* HERO SECTION */}
        <section className="relative py-32" style={{ background: 'var(--ink)', color: 'white', overflow: 'hidden' }}>
          <div className="absolute inset-0 z-0">
            <div className="hero-blob-1" style={{ opacity: 0.3 }}></div>
            <div className="hero-blob-2" style={{ opacity: 0.3 }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-5 py-2 rounded-full border border-white/20 text-[#FF8B00] text-[11px] font-black uppercase tracking-[0.3em] mb-10" style={{ background: 'rgba(255,139,0,0.1)' }}>
                À Propos de Qapril
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                L'institution <br />
                <span style={{ color: 'var(--mango)' }}>de la Confiance</span>.
              </h1>
              <p className="text-lg md:text-xl font-medium leading-relaxed opacity-80 max-w-3xl mx-auto" style={{ color: 'var(--ink3)' }}>
                QAPRIL est l'initiative technologique majeure dédiée à la normalisation du secteur locatif en Côte d'Ivoire. Nous bâtissons l'infrastructure qui sécurise le patrimoine des uns et le foyer des autres.
              </p>
            </motion.div>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-ink uppercase tracking-tighter mb-10">Notre Vision</h2>
                <p className="text-lg text-ink3 font-medium leading-relaxed mb-12">
                  Nous croyons que la transparence est le fondement de tout marché immobilier sain. En digitalisant chaque contrat, chaque quittance et chaque incident, nous créons un écosystème où la fraude n'a plus sa place.
                </p>
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 p-6 rounded-[2rem] border border-black/5 shadow-xl bg-white"
                  >
                    <div className="w-12 h-12 rounded-2xl text-white flex-shrink-0 flex items-center justify-center font-black shadow-lg" style={{ background: 'linear-gradient(135deg, var(--mango), var(--coral))' }}>1</div>
                    <p className="text-lg font-black text-ink uppercase tracking-tight">Normalisation Nationale</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 p-6 rounded-[2rem] border border-white/10 shadow-xl" style={{ background: 'var(--ink)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white flex-shrink-0 flex items-center justify-center font-black shadow-lg" style={{ color: 'var(--ink)' }}>2</div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">Protection Institutionnelle</p>
                  </motion.div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-8 rounded-[4rem] -z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700" style={{ background: 'var(--sky-l)' }}></div>
                <div className="p-12 rounded-[3.5rem] border border-white shadow-2xl relative overflow-hidden backdrop-blur-2xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16" style={{ background: 'var(--sky)' }}></div>
                  <h3 className="text-3xl font-black uppercase text-ink mb-10 italic">Notre Engagement</h3>
                  <blockquote className="text-xl font-black leading-tight text-ink mb-10 relative">
                    <span className="absolute -left-5 -top-3 text-4xl opacity-20">"</span>
                    La technologie doit servir l'humain en apportant la certitude là où régnait autrefois l'incertitude.
                    <span className="absolute -right-2 text-4xl opacity-20">"</span>
                  </blockquote>
                  <p className="text-ink3 font-medium text-md leading-relaxed">
                    Nous travaillons chaque jour pour que chaque Ivoirien, qu'il soit propriétaire de son patrimoine ou locataire de son toit, puisse dormir sereinement grâce à la certification QAPRIL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner" style={{ paddingTop: '60px' }}>
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
