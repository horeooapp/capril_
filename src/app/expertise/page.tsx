"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";

export default function ExpertisePage() {
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
              src="/images/expertise_visual.png" 
              alt="QAPRIL Expertise" 
              className="w-full h-full object-cover opacity-30 grayscale-[50%] scale-105 animate-pulse duration-[25s]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/80 to-transparent"></div>
            <div className="absolute inset-0 bg-mesh opacity-20"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
            >
              <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-10 border border-primary/20 backdrop-blur-md">
                Ingénierie de Haute Précision
              </span>
              <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-12 uppercase italic">
                La data <br />
                <span className="text-primary italic drop-shadow-[0_0_30px_rgba(255,107,0,0.3)]">au service du bâti</span>.
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed opacity-80">
                Notre expertise repose sur une fusion unique entre l&apos;ingénierie logicielle avancée et une connaissance profonde du cadre législatif immobilier ivoirien.
              </p>
            </motion.div>
          </div>
        </section>

        {/* DOMAINES D'EXPERTISE */}
        <section className="py-40 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-16 bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-100/30 hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-10 block">01 / Audit & Traçabilité</div>
                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-8 group-hover:text-primary transition-colors italic">Moteur QR Anti-Fraude</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">
                  Nous avons développé un moteur de certification basé sur des signatures cryptographiques uniques. Chaque document généré sur QAPRIL est auditable en 1 seconde par quiconque, rendant la falsification techniquement impossible.
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-16 bg-gray-900 rounded-[3.5rem] shadow-2xl shadow-gray-900/30 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-10 block">02 / Fintech Immobilière</div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tight mb-8 group-hover:text-primary transition-colors italic">Consignation Sécurisée</h3>
                <p className="text-gray-400 font-medium leading-relaxed text-lg">
                  Notre intégration avec les institutions financières permet une gestion automatisée des dépôts de garantie. Nous transformons une procédure complexe en un flux transparent et conforme aux directives nationales.
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-16 bg-orange-50 rounded-[3.5rem] border border-orange-100 group relative overflow-hidden"
              >
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-10 block">03 / Identité Numérique</div>
                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-8 group-hover:text-primary transition-colors italic">Indice de Confiance (ICL)</h3>
                <p className="text-gray-600 font-medium leading-relaxed text-lg">
                  L&apos;ICL est un algorithme de notation propriétaire qui valorise le comportement locatif. Il permet aux propriétaires de réduire leurs risques et aux locataires d&apos;utiliser leur réputation comme levier d&apos;accès.
                </p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="p-16 bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-100/30 group relative overflow-hidden"
              >
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-10 block">04 / Lifecycle Management</div>
                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-8 group-hover:text-primary transition-colors italic">Passeport Numérique (PNB)</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">
                  Nous créons l&apos;ADN digital du bâtiment. De la fondation aux cycles de location successifs, chaque événement est consigné pour offrir une vue à 360° sur l&apos;état et la valeur réelle d&apos;un patrimoine.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
