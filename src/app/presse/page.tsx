"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PressePage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>

      {/* HEADER */}
      <nav id="navbar" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: '80px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="QAPRIL Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
        </Link>
        <Link href="/" className="nav-cta" style={{ transform: 'none' }}>Accueil →</Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* HEADER SECTION */}
        <section className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.3em] mb-6 bg-white">
            Media Kit & Communications
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-ink leading-[0.9] tracking-tighter mb-6 uppercase">
            Espace <span style={{ color: 'var(--sky)' }}>Presse</span>
            </h1>
            <p className="text-lg text-ink3 font-medium max-w-2xl mx-auto">
            Retrouvez ici nos communiqués de presse, dossiers institutionnels et nos éléments graphiques officiels (logos, photos) en libre téléchargement.
            </p>
        </section>

        {/* MEDIA KIT & ASSETS */}
        <section className="mb-24">
            <h2 className="text-3xl font-black uppercase tracking-tight text-ink mb-10">Kit Média (Brand Assets)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-xl shadow-black/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-black text-ink mb-2">Logos Officiels (Pack .ZIP)</h4>
                        <p className="text-sm font-medium text-ink3">Versions vectorielles (.svg) et haute définition (.png).</p>
                    </div>
                    <button className="bg-ink text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider hover:bg-ink/80 transition-colors">Télécharger</button>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-xl shadow-black/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-black text-ink mb-2">Photos & Visuels Presse</h4>
                        <p className="text-sm font-medium text-ink3">Visuels de l'application et de l'équipe fondatrice.</p>
                    </div>
                    <button className="bg-ink text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wider hover:bg-ink/80 transition-colors">Télécharger</button>
                </div>
            </div>
        </section>

        {/* PRESS RELEASES */}
        <section>
            <h2 className="text-3xl font-black uppercase tracking-tight text-ink mb-10">Derniers Communiqués</h2>
            <div className="space-y-6">
                
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black/10 transition-colors cursor-pointer">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#FF8B00] mb-2">20 Mai 2025</div>
                        <h3 className="text-2xl font-black text-ink tracking-tight mb-2">QAPRIL lève des fonds pour accélérer la digitalisation locative en Afrique de l'Ouest.</h3>
                        <p className="text-ink3 font-medium">Le PropTech ivoirienne sécurise un tour de table historique auprès de fonds panafricains pour étendre sa présence.</p>
                    </div>
                    <div className="shrink-0">
                        <button className="border-2 border-ink text-ink font-bold px-6 py-2 rounded-xl text-sm tracking-widest uppercase hover:bg-ink hover:text-white transition-all">Lire en PDF</button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black/10 transition-colors cursor-pointer">
                    <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-sky-500 mb-2">12 Avril 2025</div>
                        <h3 className="text-2xl font-black text-ink tracking-tight mb-2">Partenariat inédit. QAPRIL s'associe à Orange Money.</h3>
                        <p className="text-ink3 font-medium">Une intégration technologique permettant à plus de 4 millions de locataires de payer leurs loyers sans frais additionnels.</p>
                    </div>
                    <div className="shrink-0">
                        <button className="border-2 border-ink text-ink font-bold px-6 py-2 rounded-xl text-sm tracking-widest uppercase hover:bg-ink hover:text-white transition-all">Lire en PDF</button>
                    </div>
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
