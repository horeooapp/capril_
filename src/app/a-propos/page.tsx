/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
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
        <section className="relative py-32 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/about_visual.png" 
              alt="QAPRIL Institutionnel" 
              className="w-full h-full object-cover opacity-30 grayscale-[20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-primary/30">
                Qui sommes-nous ?
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10 uppercase">
                L&apos;institution <br />
                <span className="text-primary italic">de la Confiance</span>.
              </h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                QAPRIL est l&apos;initiative technologique majeure dédiée à la normalisation du secteur locatif en Côte d&apos;Ivoire. Nous bâtissons l&apos;infrastructure qui sécurise le patrimoine des uns et le foyer des autres.
              </p>
            </div>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-8">Notre Vision</h2>
                <p className="text-lg text-gray-600 font-medium leading-relaxed mb-6">
                  Nous croyons que la transparence est le fondement de tout marché immobilier sain. En digitalisant chaque contrat, chaque quittance et chaque incident, nous créons un écosystème où la fraude n&apos;a plus sa place.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex-shrink-0 flex items-center justify-center font-bold">1</div>
                    <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Normalisation Nationale</p>
                  </div>
                  <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex-shrink-0 flex items-center justify-center font-bold">2</div>
                    <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Protection Institutionnelle</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gray-100 rounded-[3rem] -z-10 rotate-2"></div>
                <div className="bg-gray-900 p-12 rounded-[2.5rem] shadow-2xl text-white">
                  <h3 className="text-2xl font-black uppercase text-primary mb-6">Notre Engagement</h3>
                  <blockquote className="text-xl font-medium italic border-l-4 border-primary pl-6 mb-8">
                    &quot;La technologie doit servir l&apos;humain en apportant la certitude là où régnait autrefois l&apos;incertitude.&quot;
                  </blockquote>
                  <p className="text-gray-400 font-medium">
                    Nous travaillons chaque jour pour que chaque Ivoirien, qu&apos;il soit propriétaire de son patrimoine ou locataire de son toit, puisse dormir sereinement grâce à la certification QAPRIL.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES */}
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-12 block">Partenaires Institutionnels</span>
                <div className="flex flex-wrap justify-center items-center gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <span className="text-2xl font-black text-gray-900">CDC-CI</span>
                    <span className="text-2xl font-black text-gray-900">MINISTÈRE DE LA CONSTRUCTION</span>
                    <span className="text-2xl font-black text-gray-900">AGPI</span>
                </div>
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
