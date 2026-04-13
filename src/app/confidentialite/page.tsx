"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative">
      <div className="noise-overlay"></div>

      {/* HEADER */}
      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* HERO SECTION */}
        <section className="text-center mb-20">
            <span className="inline-block px-5 py-2 rounded-full border border-black/10 text-ink text-[11px] font-black uppercase tracking-[0.3em] mb-6 bg-white">
            Protection des Données
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-ink leading-[1.1] tracking-tighter mb-6 uppercase">
            Politique de <br />
            <span style={{ color: 'var(--mango)' }}>Confidentialité</span>
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-ink3 mb-24">
            Dernière mise à jour : 01 Mars 2026
            </p>
        </section>

        {/* CONTENT */}
        <section className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start pb-8 border-b border-black/5">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">01</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Collecte</h2>
                </div>
                <div className="md:col-span-3 space-y-4">
                    <p className="text-lg font-medium text-ink3 leading-relaxed">
                        QAPRIL collecte les données personnelles strictement nécessaires à la sécurisation des transactions immobilières :
                    </p>
                    <ul className="grid grid-cols-1 gap-3 list-none p-0">
                      {[
                        "Identité (Nom, Prénoms, Email, Téléphone)",
                        "Documents officiels de KYC (CNI, Passeports)",
                        "Informations financières pour la consignation",
                        "Empreintes cryptographiques (Hashes SHA-256)"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center space-x-3 text-ink font-bold p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--mango)' }}></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start pb-8 border-b border-black/5">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">02</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Utilisation</h2>
                </div>
                <div className="md:col-span-3">
                    <p className="text-lg font-medium text-ink3 leading-relaxed mb-6">
                        Vos données ne sont ni vendues, ni louées. Elles servent exclusivement à :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { t: "Authentification", d: "Sécurisation de l'accès à votre compte" },
                            { t: "Certification", d: "Génération automatique des titres officiels" },
                            { t: "Scoring", d: "Évaluation de la fiabilité locative" },
                            { t: "Observatoire", d: "Statistiques anonymes nationales" }
                        ].map((use, i) => (
                            <div key={i} className="p-6 rounded-2xl border border-black/5 bg-white hover:shadow-lg transition-shadow">
                                <h4 className="font-black uppercase text-xs tracking-widest mb-2" style={{ color: 'var(--sky)' }}>{use.t}</h4>
                                <p className="text-sm font-medium text-ink3">{use.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start pb-8 border-b border-black/5">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">03</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Conservation</h2>
                </div>
                <div className="md:col-span-3">
                    <p className="text-lg font-medium text-ink3 leading-relaxed border-l-4 pl-8 py-2" style={{ borderColor: 'var(--lime-d)' }}>
                        Les données relatives aux baux sont conservées pendant toute la durée du contrat de location, augmentée des délais de prescription légale applicables en République de Côte d'Ivoire.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <span className="text-5xl font-black text-black/5 block mb-2">04</span>
                    <h2 className="text-lg font-black uppercase tracking-tight text-ink">Vos Droits</h2>
                </div>
                <div className="md:col-span-3 p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5">
                    <p className="text-lg font-medium text-ink3 leading-relaxed mb-8">
                        Vous disposez d'un droit d'accès, de rectification et de suppression.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-1 w-full p-6 bg-cream rounded-2xl border border-black/5 text-center">
                            <span className="block text-xs font-black uppercase tracking-widest text-[#FF8B00] mb-1">Contact DPO</span>
                            <span className="text-lg font-black text-ink font-mono">protection@qapril.net</span>
                        </div>
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
                <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
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
