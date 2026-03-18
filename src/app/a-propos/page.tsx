import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
 
export const metadata: Metadata = {
  title: "À Propos",
  description: "Découvrez QAPRIL, l'institution technologique dédiée à la normalisation et la sécurisation du marché locatif en Côte d'Ivoire.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-14 w-auto drop-shadow-sm group-hover:scale-110 transition-transform" />
              <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
            </Link>
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative py-40 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/about_visual.png" 
              alt="QAPRIL Institutionnel" 
              className="w-full h-full object-cover opacity-30 grayscale-[50%] scale-105 animate-pulse duration-[20s]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/40 to-gray-900"></div>
            <div className="absolute inset-0 bg-mesh opacity-20"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-primary/20 backdrop-blur-md">
                L&apos;Infrastructure de Confiance
              </span>
              <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-12 uppercase italic">
                L&apos;institution <br />
                <span className="text-primary italic drop-shadow-[0_0_30px_rgba(255,107,0,0.3)]">de la Confiance</span>.
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed opacity-80 max-w-3xl mx-auto">
                QAPRIL est l&apos;initiative technologique majeure dédiée à la normalisation du secteur locatif en Côte d&apos;Ivoire. Nous bâtissons l&apos;infrastructure qui sécurise le patrimoine des uns et le foyer des autres.
              </p>
            </motion.div>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="py-40 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-mesh opacity-5 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div>
                <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-10 italic">Notre Vision</h2>
                <p className="text-xl text-gray-600 font-medium leading-relaxed mb-12">
                  Nous croyons que la transparence est le fondement de tout marché immobilier sain. En digitalisant chaque contrat, chaque quittance et chaque incident, nous créons un écosystème où la fraude n&apos;a plus sa place.
                </p>
                <div className="space-y-6">
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex-shrink-0 flex items-center justify-center font-black shadow-lg">1</div>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Normalisation Nationale</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-6 p-8 bg-gray-900 rounded-[2rem] border border-gray-800 shadow-xl shadow-gray-900/10"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-gray-900 flex-shrink-0 flex items-center justify-center font-black shadow-lg">2</div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">Protection Institutionnelle</p>
                  </motion.div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-8 bg-primary/5 rounded-[4rem] -z-10 rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                <div className="glass-panel p-16 rounded-[3.5rem] border border-white shadow-2xl shadow-gray-200/50 relative overflow-hidden backdrop-blur-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16"></div>
                  <h3 className="text-3xl font-black uppercase text-gray-900 mb-10 italic">Notre Engagement</h3>
                  <blockquote className="text-2xl font-black leading-tight text-primary mb-10 relative">
                    <span className="absolute -left-6 -top-4 text-6xl opacity-20">&quot;</span>
                    La technologie doit servir l&apos;humain en apportant la certitude là où régnait autrefois l&apos;incertitude.
                    <span className="absolute -right-2 text-6xl opacity-20">&quot;</span>
                  </blockquote>
                  <p className="text-gray-500 font-medium text-lg leading-relaxed">
                    Nous travaillons chaque jour pour que chaque Ivoirien, qu&apos;il soit propriétaire de son patrimoine ou locataire de son toit, puisse dormir sereinement grâce à la certification QAPRIL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES */}
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-16 block">Partenaires Institutionnels Certifiés</span>
                <div className="flex flex-wrap justify-center items-center gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter hover:text-primary cursor-pointer transition-colors">CDC-CI</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter hover:text-primary cursor-pointer transition-colors uppercase">Ministère Construction</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter hover:text-primary cursor-pointer transition-colors">AGPI</span>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
