/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
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
        <section className="relative py-24 overflow-hidden bg-gray-900 text-white">
          <div className="absolute inset-0 z-0 text-white/5 font-black text-[12rem] leading-none select-none pointer-events-none text-center flex items-center justify-center whitespace-nowrap">
            CONFIDENTIALITÉ
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-primary/30">
              Protection des Données
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter mb-6 uppercase">
              Politique de <br />
              <span className="text-primary italic">Confidentialité</span>
            </h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
              Dernière mise à jour : 01 Mars 2026
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-gray-100 block mb-2">01</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">Collecte</h2>
                </div>
                <div className="md:col-span-3 space-y-4">
                    <p className="text-lg font-medium text-gray-600 leading-relaxed">
                        QAPRIL collecte les données personnelles strictement nécessaires à la sécurisation des transactions immobilières :
                    </p>
                    <ul className="grid grid-cols-1 gap-3 list-none p-0">
                      {[
                        "Identité (Nom, Prénoms, Email, Téléphone)",
                        "Documents officiels de KYC (CNI, Passeports)",
                        "Informations financières pour la consignation",
                        "Empreintes cryptographiques (Hashes SHA-256)"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center space-x-3 text-gray-900 font-bold p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-gray-100 block mb-2">02</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">Utilisation</h2>
                </div>
                <div className="md:col-span-3">
                    <p className="text-lg font-medium text-gray-600 leading-relaxed mb-6">
                        Vos données ne sont ni vendues, ni louées. Elles servent exclusivement à :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { t: "Authentification", d: "Sécurisation de l'accès à votre compte" },
                            { t: "Certification", d: "Génération automatique des titres officiels" },
                            { t: "Scoring", d: "Évaluation de la fiabilité locative" },
                            { t: "Observatoire", d: "Statistiques anonymes nationales" }
                        ].map((use, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-primary/30 transition-colors">
                                <h4 className="font-black uppercase text-xs tracking-widest text-primary mb-2">{use.t}</h4>
                                <p className="text-sm font-medium text-gray-500">{use.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-gray-100 block mb-2">03</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">Conservation</h2>
                </div>
                <div className="md:col-span-3">
                    <p className="text-lg font-medium text-gray-600 leading-relaxed border-l-4 border-primary pl-8 py-2">
                        Les données relatives aux baux sont conservées pendant toute la durée du contrat de location, augmentée des délais de prescription légale applicables en République de Côte d&apos;Ivoire.
                    </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-gray-100 block mb-2">04</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">Vos Droits</h2>
                </div>
                <div className="md:col-span-3 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <p className="text-lg font-medium text-gray-600 leading-relaxed mb-8">
                        Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-1 w-full p-6 bg-white rounded-2xl border border-gray-100 text-center">
                            <span className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Contact DPO</span>
                            <span className="text-lg font-black text-gray-900 font-mono">protection@qapril.net</span>
                        </div>
                        <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
