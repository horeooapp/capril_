"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CarrierePage() {
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* HEADER SECTION */}
        <section className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.3em] mb-6 bg-white">
            Talents & Recrutement
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-ink leading-[0.9] tracking-tighter mb-6 uppercase">
            Rejoignez <span style={{ color: 'var(--teal)' }}>L'Aventure</span>
            </h1>
            <p className="text-lg text-ink3 font-medium max-w-3xl mx-auto">
            Nous recherchons des esprits brillants pour construire la principale infrastructure technologique de l'immobilier ivoirien. Venez faire la différence.
            </p>
        </section>

        {/* VALEURS */}
        <section className="mb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-[2rem] border border-black/5 bg-white shadow-xl shadow-black/5 text-center">
                    <div className="text-4xl mb-4">💡</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-2">Innovation</h3>
                    <p className="text-sm font-medium text-ink3">Nous repensons des processus anciens avec des solutions technologiques modernes et élégantes.</p>
                </div>
                <div className="p-8 rounded-[2rem] border border-black/5 bg-white shadow-xl shadow-black/5 text-center">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-2">Transparence</h3>
                    <p className="text-sm font-medium text-ink3">Notre culture interne reflète la mission de notre plateforme : intégrité et confiance absolue.</p>
                </div>
                <div className="p-8 rounded-[2rem] border border-black/5 bg-white shadow-xl shadow-black/5 text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-2">Impact</h3>
                    <p className="text-sm font-medium text-ink3">Chaque ligne de code écrite simplifie et sécurise la vie d'un locataire ou d'un propriétaire.</p>
                </div>
            </div>
        </section>

        {/* OPEN POSITIONS */}
        <section>
            <h2 className="text-3xl font-black uppercase tracking-tight text-ink mb-10 text-center">Postes Ouverts</h2>
            
            <div className="space-y-4 max-w-4xl mx-auto">
                {/* JOB 1 */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-shadow cursor-pointer group">
                    <div>
                        <div className="flex gap-2 mb-2">
                            <span className="bg-[#FF8B00]/10 text-[#FF8B00] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Tech</span>
                            <span className="bg-black/5 text-ink3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Temps Plein</span>
                            <span className="bg-black/5 text-ink3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Hybride</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-ink mb-2 group-hover:text-[#FF8B00] transition-colors">Développeur Frontend React / Next.js (H/F)</h3>
                        <p className="text-ink3 font-medium text-sm">Abidjan · Riviéra Bonoumin</p>
                    </div>
                    <div className="shrink-0 text-xl font-black text-ink group-hover:translate-x-2 transition-transform">→</div>
                </div>

                {/* JOB 2 */}
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-shadow cursor-pointer group">
                    <div>
                        <div className="flex gap-2 mb-2">
                            <span className="bg-sky-500/10 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Business</span>
                            <span className="bg-black/5 text-ink3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Temps Plein</span>
                            <span className="bg-black/5 text-ink3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Présentiel</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-ink mb-2 group-hover:text-sky-600 transition-colors">Key Account Manager (B2B) (H/F)</h3>
                        <p className="text-ink3 font-medium text-sm">Abidjan · Riviéra Bonoumin</p>
                    </div>
                    <div className="shrink-0 text-xl font-black text-ink group-hover:translate-x-2 transition-transform">→</div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-ink3 font-medium mb-6">Vous ne trouvez pas le poste idéal ? Envoyez-nous une candidature spontanée.</p>
                <button className="bg-ink text-white font-bold px-8 py-4 rounded-xl text-md tracking-widest uppercase hover:bg-ink/80 transition-colors">Candidature Spontanée</button>
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
