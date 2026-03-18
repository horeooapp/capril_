"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";

export default function ImpactClient() {
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
        {/* --- HERO SECTION IMPACT --- */}
        <section className="relative py-40 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/impact_vision.png" 
              alt="QAPRIL Impact Vision" 
              className="w-full h-full object-cover opacity-30 grayscale-[50%] scale-105 animate-pulse duration-[20s]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/40 to-gray-900"></div>
            <div className="absolute inset-0 bg-mesh opacity-20"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-primary/20 backdrop-blur-md">
                Vision & Transformation Souveraine
                </span>
                <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-12">
                L&apos;IMPACT <br />
                <span className="text-primary italic drop-shadow-[0_0_30px_rgba(255,107,0,0.3)]">STRUCTUREL</span>.
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed opacity-80">
                Plus qu&apos;une plateforme, QAPRIL est le moteur de confiance qui redéfinit l&apos;économie locative en Côte d&apos;Ivoire. Découvrez comment nous transformons les données en sécurité institutionnelle.
                </p>
            </motion.div>
          </div>
        </section>

        {/* --- THREE PILLARS OF IMPACT --- */}
        <section className="py-40 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-primary to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {/* Pillar 1: Social */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="space-y-8 group"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-primary mb-10 border border-orange-100 shadow-xl shadow-orange-500/5 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Impact Social</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">
                  Nous éradiquons la précarité liée au logement en normalisant les relations contractuelles. En sécurisant les cautions via la CDC-CI, nous rendons l&apos;accès au logement plus juste pour des milliers d&apos;Ivoiriens.
                </p>
              </motion.div>

              {/* Pillar 2: Economic */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="space-y-8 group"
              >
                <div className="w-20 h-20 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white mb-10 border border-gray-800 shadow-xl shadow-gray-900/10 group-hover:bg-primary transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Impact Économique</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">
                  L&apos;immobilier devient un actif liquide et transparent. Le Passeport Numérique valorise le patrimoine, tandis que l&apos;Indice de Confiance Locative (ICL) crée un marché de la réputation qui récompense les bons payeurs.
                </p>
              </motion.div>

              {/* Pillar 3: Institutional */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="space-y-8 group"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-10 border border-blue-100 shadow-xl shadow-blue-500/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Impact Institutionnel</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">
                  En collaboration avec le Ministère de la Construction et la CDC-CI, QAPRIL structure le Registre National. Nous fournissons à l&apos;État les données nécessaires pour piloter les politiques publiques du logement.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- DETAILED IMPACT BLOCKS --- */}
        <section className="bg-gray-50 py-40 relative">
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-mesh opacity-10 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                    subtitle="Indicateurs de Performance Certifiés"
                    title="Mesurer la transparence en temps réel."
                />
                
                <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="glass-panel p-16 rounded-[3.5rem] border border-white shadow-2xl shadow-gray-200/50 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                        <div className="text-primary font-black text-7xl mb-6 tracking-tighter italic">0%</div>
                        <h4 className="text-2xl font-black uppercase tracking-tight mb-6">Fraude Documentaire</h4>
                        <p className="text-gray-500 font-medium leading-relaxed text-lg">
                            Grâce à notre moteur d&apos;audit QR Part 21, toute quittance falsifiée est instantanément détectée. Nous avons réduit le risque de fraude de manière drastique au sein du réseau d&apos;agences partenaires.
                        </p>
                    </div>
                    <div className="glass-panel p-16 rounded-[3.5rem] border border-white shadow-2xl shadow-gray-200/50 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900/5 blur-3xl -mr-16 -mt-16 group-hover:bg-gray-900/20 transition-colors"></div>
                        <div className="text-gray-900 font-black text-7xl mb-6 tracking-tighter italic">100%</div>
                        <h4 className="text-2xl font-black uppercase tracking-tight mb-6">Cautions Sécurisées</h4>
                        <p className="text-gray-500 font-medium leading-relaxed text-lg">
                            Chaque dépôt de caution est tracé et transmis à la Caisse des Dépôts et Consignations (Part 10). Cela garantit aux locataires de récupérer leurs fonds et aux propriétaires de bénéficier d&apos;une protection légale.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- CONCLUSION IMPACT --- */}
        <section className="py-40 bg-white text-center relative">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.9] mb-12 tracking-tighter">
                    Bâtir la confiance, <br /> 
                    <span className="text-primary">OCTET PAR OCTET.</span>
                </h2>
                <p className="text-2xl text-gray-500 font-medium mb-16 leading-relaxed max-w-2xl mx-auto opacity-80">
                    L&apos;impact de QAPRIL ne se mesure pas seulement en nombre d&apos;utilisateurs, mais en sérénité retrouvée pour chaque foyer ivoirien.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Link href="/dashboard/login" className="px-12 py-6 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-2xl shadow-gray-900/20 active:scale-95">
                        Devenir Acteur de l&apos;Impact
                    </Link>
                    <Link href="/expertise" className="px-12 py-6 bg-white border border-gray-100 text-gray-900 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all shadow-xl shadow-gray-200/50 active:scale-95">
                        Détails Techniques
                    </Link>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
