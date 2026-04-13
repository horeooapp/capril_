"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function BlogPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>

      {/* HEADER */}
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* HEADER SECTION */}
        <section className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.3em] mb-6 bg-white">
            Ressources & Actualités
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-ink leading-[0.9] tracking-tighter mb-6 uppercase">
            Le Blog <span style={{ color: 'var(--mango)' }}>QAPRIL</span>
            </h1>
            <p className="text-lg text-ink3 font-medium max-w-2xl mx-auto">
            Décryptage de l'actualité immobilière, conseils pratiques pour propriétaires et locataires, et nouveautés de la plateforme.
            </p>
        </section>

        {/* ARTICLES GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* ARTICLE 1 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 border border-black/5 shadow-xl shadow-black/5 flex flex-col group cursor-pointer transition-all">
                <div className="w-full h-48 bg-gray-100 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--mango), var(--coral))' }}>
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-ink shadow-sm">Guide Pratique</div>
                </div>
                <div className="flex justify-between items-center mb-4 text-[11px] font-bold text-ink3 uppercase tracking-wider">
                    <span>15 Mai 2025</span>
                    <span>Temps de lecture: 5 min</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-ink mb-4 group-hover:text-[#FF8B00] transition-colors leading-tight">
                    Comment le bail déclaratif par SMS régularise les locations existantes.
                </h3>
                <p className="text-sm text-ink3 font-medium mb-6 flex-grow">
                    Découvrez comment QAPRIL permet aux locataires et propriétaires sans contrat écrit de formaliser leur accord en quelques minutes.
                </p>
                <div className="mt-auto font-black text-[12px] uppercase tracking-widest text-ink group-hover:text-[#FF8B00]">Lire l'article →</div>
            </motion.div>

            {/* ARTICLE 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 border border-black/5 shadow-xl shadow-black/5 flex flex-col group cursor-pointer transition-all">
                <div className="w-full h-48 bg-gray-100 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--sky), var(--teal))' }}>
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-ink shadow-sm">Actualité</div>
                </div>
                <div className="flex justify-between items-center mb-4 text-[11px] font-bold text-ink3 uppercase tracking-wider">
                    <span>02 Mai 2025</span>
                    <span>Temps de lecture: 3 min</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-ink mb-4 group-hover:text-[#FF8B00] transition-colors leading-tight">
                    Intégration d'Orange Money : Payez votre loyer sans frais supplémentaires.
                </h3>
                <p className="text-sm text-ink3 font-medium mb-6 flex-grow">
                    Le paiement des loyers devient encore plus simple avec l'ajout direct du paiement mobile 100% sécurisé.
                </p>
                <div className="mt-auto font-black text-[12px] uppercase tracking-widest text-ink group-hover:text-[#FF8B00]">Lire l'article →</div>
            </motion.div>

            {/* ARTICLE 3 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-6 border border-black/5 shadow-xl shadow-black/5 flex flex-col group cursor-pointer transition-all">
                <div className="w-full h-48 bg-gray-100 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--lime-d), var(--lime))' }}>
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-ink shadow-sm">Réglementation</div>
                </div>
                <div className="flex justify-between items-center mb-4 text-[11px] font-bold text-ink3 uppercase tracking-wider">
                    <span>18 Avril 2025</span>
                    <span>Temps de lecture: 7 min</span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-ink mb-4 group-hover:text-[#FF8B00] transition-colors leading-tight">
                    Comprendre la caution de 2 mois imposée par la nouvelle loi locative.
                </h3>
                <p className="text-sm text-ink3 font-medium mb-6 flex-grow">
                    Tout ce qu'il faut savoir sur l'application de la nouvelle règlementation pour locataires et bailleurs.
                </p>
                <div className="mt-auto font-black text-[12px] uppercase tracking-widest text-ink group-hover:text-[#FF8B00]">Lire l'article →</div>
            </motion.div>

        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
