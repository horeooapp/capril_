"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
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

      <main className="relative z-10" style={{ paddingBottom: '100px' }}>
        {/* HERO SECTION */}
        <section className="relative py-32" style={{ background: 'var(--ink)', color: 'white', overflow: 'hidden' }}>
          <div className="absolute inset-0 z-0">
             <div className="hero-blob-1" style={{ opacity: 0.3 }}></div>
             <div className="hero-blob-2" style={{ opacity: 0.3 }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-block px-5 py-2 rounded-full border border-white/20 text-[#FF8B00] text-[11px] font-black uppercase tracking-[0.3em] mb-10" style={{ background: 'rgba(255,139,0,0.1)' }}>
                Assistance Institutionnelle QAPRIL
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
                À votre <br />
                <span style={{ color: 'var(--mango)' }}>écoute</span>.
                </h1>
                <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-80" style={{ color: 'var(--ink3)' }}>
                Propriétaires, locataires ou partenaires, nous sommes là pour vous accompagner dans chaque étape de votre parcours immobilier digital.
                </p>
            </motion.div>
          </div>
        </section>

        {/* CONTACT METHODS */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-12 rounded-[2.5rem] border border-black/5 flex flex-col items-center text-center transition-all bg-white shadow-xl shadow-black/5"
              >
                <div className="w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8" style={{ background: 'var(--mango-l)', color: 'var(--mango-d)' }}>
                  <Phone size={28} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-ink">Par Téléphone</h3>
                <p className="font-medium mb-8 text-md text-ink3">Service disponible du lundi au vendredi de 8h à 18h.</p>
                <span className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform cursor-pointer" style={{ color: 'var(--mango-d)' }}>+225 00 00 00 00 00</span>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className="p-12 rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center text-white transition-all shadow-xl shadow-black/20"
                style={{ background: 'var(--ink)' }}
              >
                <div className="w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8 text-white transition-transform duration-500" style={{ background: 'linear-gradient(135deg, var(--sky), var(--teal))' }}>
                  <Mail size={28} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4" style={{ color: 'var(--sky)' }}>Canal Direct</h3>
                <p className="font-medium mb-8 text-md text-white/50">Pour toute demande d'information technique ou commerciale.</p>
                <span className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform cursor-pointer">contact@qapril.ci</span>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className="p-12 rounded-[2.5rem] border border-black/5 flex flex-col items-center text-center transition-all bg-white shadow-xl shadow-black/5"
              >
                <div className="w-16 h-16 rounded-[1.5rem] shadow-xl flex items-center justify-center mb-8" style={{ background: 'var(--lime-l)', color: 'var(--lime-d)' }}>
                  <MapPin size={28} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-ink">Siège Social</h3>
                <p className="font-medium mb-8 text-md text-ink3">Visitez-nous dans nos locaux pour un accompagnement physique.</p>
                <span className="text-xl font-black uppercase tracking-tighter" style={{ color: 'var(--ink)' }}>Riviéra Bonoumin, Abidjan</span>
              </motion.div>
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
