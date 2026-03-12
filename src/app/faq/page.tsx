/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "Qu'est-ce que le Registre Locatif National ?",
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
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 group text-decoration-none">
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
        <section className="relative py-32 overflow-hidden bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Assistance & FAQ
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-10 uppercase">
              Toutes vos <br />
              <span className="text-primary italic">réponses</span>.
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Vous avez des questions sur le registre national ? Nous avons les réponses pour vous accompagner dans votre transformation digitale immobilière.
            </p>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-32 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border-2 rounded-[2rem] transition-all overflow-hidden ${openIndex === index ? 'border-primary bg-orange-50/30 shadow-xl shadow-orange-100/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <button 
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left px-8 py-8 flex justify-between items-center focus:outline-none"
                  >
                    <span className="text-xl font-black text-gray-900 uppercase tracking-tight">{faq.q}</span>
                    <span className={`text-2xl font-black transition-transform duration-300 ${openIndex === index ? 'rotate-45 text-primary' : 'text-gray-300'}`}>
                      +
                    </span>
                  </button>
                  <div 
                    className={`px-8 transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-lg text-gray-600 font-medium leading-relaxed border-t border-gray-100 pt-6">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gray-900 text-center">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-black text-white leading-none mb-8 uppercase">
                    Encore une question ?
                </h2>
                <Link href="/contact" className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20 inline-block">
                    Contacter notre support
                </Link>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
