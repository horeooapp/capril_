"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "Qu'est-ce que QAPRIL (Quittancement autonome plateforme de ressource immobilière locative) ?",
    a: "C'est la base de données centrale opérée par QAPRIL pour normaliser, enregistrer et certifier l'ensemble des baux immobiliers en Côte d'Ivoire."
  },
  {
    q: "Comment fonctionne la vérification QR Code ?",
    a: "Chaque quittance possède un QR unique. En le scannant avec un smartphone, n'importe qui peut vérifier sur le serveur QAPRIL si le document est authentique et validé."
  },
  {
    q: "Est-ce obligatoire d'inscrire son bien sur QAPRIL ?",
    a: "Dans le cadre de la modernisation du secteur, QAPRIL devient le standard technique recommandé par les institutions pour garantir la protection juridique des deux parties."
  },
  {
    q: "Comment est calculé l'Indice de Confiance Locative (ICL) ?",
    a: "L'ICL est basé sur la ponctualité des paiements, le respect du contrat de bail et la gestion des incidents. Un score élevé facilite l'accès à de nouveaux logements."
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui, QAPRIL utilise des protocoles de sécurité bancaire et les données sont hébergées selon les normes de souveraineté numérique."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              Assistance
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-ink leading-[1.1] tracking-tighter mb-6 uppercase">
              Toutes vos <br />
              <span style={{ color: 'var(--mango)' }}>Réponses</span>
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-ink3 mb-24">
              Base de connaissances officielle
            </p>
        </section>

        {/* FAQ ACCORDION */}
        <section className="space-y-4">
            {faqs.map((faq, index) => (
            <div 
                key={index} 
                className={`border-2 rounded-[2rem] transition-all overflow-hidden ${openIndex === index ? 'border-none bg-white shadow-xl shadow-black/5' : 'border-black/5 bg-cream hover:border-black/10'}`}
            >
                <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-8 py-8 flex justify-between items-center focus:outline-none"
                >
                <span className="text-xl font-black text-ink uppercase tracking-tight" style={{ color: openIndex === index ? 'var(--mango)' : 'inherit' }}>{faq.q}</span>
                <span className={`text-2xl font-black transition-transform duration-300 ${openIndex === index ? 'rotate-45' : 'text-black/30'}`} style={{ color: 'var(--mango)' }}>
                    +
                </span>
                </button>
                <div 
                className={`px-8 transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                <p className="text-lg text-ink3 font-medium leading-relaxed border-t border-black/5 pt-6">
                    {faq.a}
                </p>
                </div>
            </div>
            ))}
        </section>
        
        {/* CTA */}
        <section className="py-24 text-center">
            <h2 className="text-3xl font-black text-ink leading-none mb-8 uppercase">
                Encore une question ?
            </h2>
            <Link href="/contact" className="px-10 py-5 bg-ink text-white rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-black/20 inline-block">
                Contacter notre support
            </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
