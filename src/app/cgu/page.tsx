/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";

export default function CGUPage() {
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
        <section className="relative py-24 overflow-hidden bg-gray-50 border-b border-gray-100">
          <div className="absolute inset-0 z-0 text-gray-200/50 font-black text-[15rem] leading-none select-none pointer-events-none text-center">
            LEGAL
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-primary/20">
              Conditions Générales
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-6 uppercase">
              Conditions Générales <br />
              <span className="text-primary italic">d&apos;Utilisation</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
              Dernière mise à jour : 01 Mars 2026
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg prose-orange max-w-none text-gray-700 space-y-16">
              
              <div className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm mr-4">1</span>
                  Objet de la Plateforme
                </h2>
                <p className="leading-relaxed font-medium text-gray-600">
                  QAPRIL (Qualité de l&apos;Administration du Patrimoine et du Registre Immobilier Locatif) est une plateforme numérique dédiée à la sécurisation des baux, à la dématérialisation des quittances de loyer et à la transparence du marché locatif en République de Côte d&apos;Ivoire.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm mr-4">2</span>
                  Acceptation des Conditions
                </h2>
                <p className="leading-relaxed font-medium text-gray-600">
                  L&apos;utilisation des services de QAPRIL implique l&apos;acceptation pleine et entière des présentes CGU. L&apos;accès aux services est réservé aux personnes physiques ou morales dument identifiées via nos protocoles de sécurité.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] bg-gray-900 text-white">
                <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-8 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-white text-gray-900 flex items-center justify-center text-sm mr-4">3</span>
                  Services Proposés
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
                  {[
                    "Gestion certifiée des mandats immobiliers",
                    "Signature électronique de baux sécurisés",
                    "Émission de quittances de loyer certifiées",
                    "Gestion des cautions via la CDC-CI",
                    "Contrôle de fiabilité locative renforcé"
                  ].map((service, i) => (
                    <li key={i} className="flex items-start space-x-3 text-gray-300 font-medium">
                      <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-10 rounded-[2rem] bg-white border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm mr-4">4</span>
                  Obligations de l&apos;Utilisateur
                </h2>
                <p className="leading-relaxed font-medium text-gray-600">
                  L&apos;utilisateur s&apos;engage à fournir des informations exactes et à jour. Toute fraude documentaire ou fausse déclaration pourra entrainer la suspension immédiate du compte et des poursuites judiciaires conformément à la législation en vigueur.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm mr-4">5</span>
                  Propriété Intellectuelle
                </h2>
                <p className="leading-relaxed font-medium text-gray-600">
                  Tous les contenus (logos, textes, algorithmes, codes, designs) présents sur la plateforme sont la propriété exclusive de Habiteax. Toute reproduction, même partielle, non autorisée expressément est strictement interdite.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] border-2 border-dashed border-gray-200">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-gray-400 text-white flex items-center justify-center text-sm mr-4">6</span>
                  Responsabilité
                </h2>
                <p className="leading-relaxed font-medium text-gray-600">
                  QAPRIL met en œuvre tous les moyens technologiques pour assurer la disponibilité et la sécurité du service. Toutefois, elle ne saurait être tenue responsable des interruptions de service dues à des cas de force majeure ou à des opérations de maintenance technique nécessaires.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
