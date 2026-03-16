/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";

export default function ImpactPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* --- HEADER --- */}
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
        <section className="relative py-32 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/impact_vision.png" 
              alt="QAPRIL Impact Vision" 
              className="w-full h-full object-cover opacity-40 grayscale-[30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-primary/30">
              Vision & Transformation
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10">
              L&apos;IMPACT <br />
              <span className="text-primary italic">STRUCTUREL</span>.
            </h1>
            <p className="text-xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
              Plus qu&apos;une plateforme, QAPRIL est le moteur de confiance qui redéfinit l&apos;économie locative en Côte d&apos;Ivoire. Découvrez comment nous transformons les données en sécurité institutionnelle.
            </p>
          </div>
        </section>

        {/* --- THREE PILLARS OF IMPACT --- */}
        <section className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {/* Pillar 1: Social */}
              <div className="space-y-6">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-primary mb-8 border border-orange-100">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Impact Social</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Nous éradiquons la précarité liée au logement en normalisant les relations contractuelles. En sécurisant les cautions via la CDC-CI, nous rendons l&apos;accès au logement plus juste pour des milliers d&apos;Ivoiriens.
                </p>
              </div>

              {/* Pillar 2: Economic */}
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-8 border border-gray-100">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Impact Économique</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  L&apos;immobilier devient un actif liquide et transparent. Le Passeport Numérique valorise le patrimoine, tandis que l&apos;Indice de Confiance Locative (ICL) crée un marché de la réputation qui récompense les bons payeurs.
                </p>
              </div>

              {/* Pillar 3: Institutional */}
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 border border-blue-100">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Impact Institutionnel</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  En collaboration avec le Ministère de la Construction et la CDC-CI, QAPRIL structure le Registre National. Nous fournissons à l&apos;État les données nécessaires pour piloter les politiques publiques du logement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- DETAILED IMPACT BLOCKS --- */}
        <section className="bg-gray-50 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading 
                    subtitle="Indicateurs de Performance"
                    title="Mesurer la transparence en temps réel."
                />
                
                <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className="text-primary font-black text-5xl mb-4">0%</div>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-4">Fraude Documentaire</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Grâce à notre moteur d&apos;audit QR Part 21, toute quittance falsifiée est instantanément détectée. Nous avons réduit le risque de fraude de manière drastique au sein du réseau d&apos;agences partenaires.
                        </p>
                    </div>
                    <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className="text-gray-900 font-black text-5xl mb-4">100%</div>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-4">Cautions Sécurisées</h4>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Chaque dépôt de caution est tracé et transmis à la Caisse des Dépôts et Consignations (Part 10). Cela garantit aux locataires de récupérer leurs fonds et aux propriétaires de bénéficier d&apos;une protection légale.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- CONCLUSION IMPACT --- */}
        <section className="py-32 bg-white text-center">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-none mb-10">
                    Bâtir la confiance, <br /> octet par octet.
                </h2>
                <p className="text-xl text-gray-600 font-medium mb-12 leading-relaxed">
                    L&apos;impact de QAPRIL ne se mesure pas seulement en nombre d&apos;utilisateurs, mais en sérénité retrouvée pour chaque foyer ivoirien.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="/dashboard/login" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all">
                        Devenir Acteur de l&apos;Impact
                    </Link>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
