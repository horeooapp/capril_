"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>

      {/* HEADER */}
      <Header />

      <main className="relative z-10" style={{ paddingBottom: '100px' }}>
        {/* HERO SECTION */}
        <section className="relative py-32 bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/images/hero_abidjan.png"
              alt="Abidjan"
              className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-slate-950/75" />
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
                <h3 className="text-4xl md:text-5xl font-black text-ink uppercase tracking-tighter mb-10">Notre Vision</h3>
                <p className="text-lg text-ink3 font-medium leading-relaxed mb-12">
                  Nous croyons que la transparence est le fondement de tout marché immobilier sain. En digitalisant chaque contrat, chaque quittance et chaque incident, nous créons un écosystème où la fraude n'a plus sa place.
                </p>
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 p-6 rounded-[2rem] border border-black/5 shadow-xl bg-white"
                  >
                    <div className="w-12 h-12 rounded-2xl text-white flex-shrink-0 flex items-center justify-center font-black shadow-lg" style={{ background: "transparent" }}>1</div>
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
              <div className="relative group rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <img
                    src="/images/about_visual.png"
                    alt="Engagement QAPRIL Côte d'Ivoire"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-950/25" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-black uppercase tracking-wider shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#059669]" />
                    Pacte Républicain de Confiance
                  </div>
                </div>
                <div className="p-8 sm:p-10 bg-white border-t border-slate-100">
                  <h3 className="text-2xl font-black uppercase text-slate-900 mb-4 tracking-tight">Notre Engagement</h3>
                  <blockquote className="text-base font-bold text-slate-800 leading-snug mb-4 italic border-l-4 border-amber-500 pl-4">
                    « La technologie doit servir l'humain en apportant la certitude légale là où régnait autrefois l'incertitude. »
                  </blockquote>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Nous travaillons chaque jour pour que chaque Ivoirien, qu'il soit propriétaire de son patrimoine ou locataire de son toit, puisse vivre sereinement grâce à la certification officielle QAPRIL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
