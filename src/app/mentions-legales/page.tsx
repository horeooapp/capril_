/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";

export default function MentionsLegalesPage() {
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
          <div className="absolute inset-0 z-0 text-gray-200/50 font-black text-[12rem] leading-none select-none pointer-events-none text-center flex items-center justify-center">
             MENTIONS
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              Transparence
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-6 uppercase">
              Mentions <br />
              <span className="text-primary italic">Légales</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
              Habiteax CI &bull; Édition &bull; Hébergement
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              <div className="space-y-8">
                <div className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-6 border-b border-gray-100 pb-4">
                        Éditeur de la Plateforme
                    </h2>
                    <div className="space-y-4 font-medium text-gray-600 leading-relaxed">
                        <p>La plateforme QAPRIL est opérée par :</p>
                        <div className="space-y-1">
                            <span className="block font-black text-gray-900 uppercase text-xs tracking-widest">Société</span>
                            <p className="text-lg">Habiteax</p>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-black text-gray-900 uppercase text-xs tracking-widest">Siège Social</span>
                            <p>Cocody, Abidjan, République de Côte d&apos;Ivoire</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 mb-6 border-b border-gray-100 pb-4">
                        Hébergement
                    </h2>
                    <div className="space-y-4 font-medium text-gray-600 leading-relaxed">
                        <p>Infrastructures serveurs sécurisées :</p>
                        <div className="space-y-1">
                            <span className="block font-black text-gray-900 uppercase text-xs tracking-widest">Prestataires</span>
                            <p className="text-lg">LWS / Hostinger</p>
                        </div>
                        <div className="space-y-1">
                            <span className="block font-black text-gray-900 uppercase text-xs tracking-widest">Niveau de sécurité</span>
                            <p>Tier III / IV Datacenters Certifiés</p>
                        </div>
                    </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-10 rounded-[2.5rem] bg-gray-900 text-white shadow-2xl">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-primary mb-6 border-b border-white/10 pb-4">
                        Propriété Intellectuelle
                    </h2>
                    <p className="font-medium text-gray-400 leading-relaxed text-sm mb-6">
                        L&apos;ensemble des éléments constituant la plateforme QAPRIL (algorithmes, codes source, designs UI/UX, bases de données) sont protégés par le droit d&apos;auteur.
                    </p>
                    <p className="font-black text-white uppercase text-xs tracking-[0.2em] bg-white/10 p-4 rounded-xl inline-block">
                        Propriété exclusive de Habiteax CI
                    </p>
                </div>

                <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
                        Crédits Techniques
                    </h2>
                    <p className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">
                        QAPRIL <span className="text-primary italic">Tech Team</span>
                    </p>
                </div>

                <div className="pt-12 text-center">
                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
                        Dernière mise à jour : 01 Mars 2026
                    </p>
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
