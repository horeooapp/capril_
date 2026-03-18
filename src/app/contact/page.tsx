import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
 
export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Contactez l'assistance institutionnelle de QAPRIL. Équipe dédiée pour propriétaires, locataires et partenaires immobiliers.",
};

export default function ContactPage() {
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
          <div className="absolute inset-0 z-0 text-white/5 font-black text-[20rem] leading-none select-none pointer-events-none text-center">
            CONTACT
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-primary/30">
              Assistance Institutionnelle
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10 uppercase">
              À votre <br />
              <span className="text-primary italic">écoute</span>.
            </h1>
            <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Propriétaires, locataires ou partenaires, nous sommes là pour vous accompagner dans chaque étape de votre parcours immobilier digital.
            </p>
          </div>
        </section>

        {/* CONTACT METHODS */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-12 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-primary mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Par Téléphone</h3>
                <p className="text-gray-500 font-medium mb-6">Service disponible du lundi au vendredi de 8h à 18h.</p>
                <span className="text-2xl font-black text-gray-900">+225 00 00 00 00 00</span>
              </div>

              <div className="p-12 rounded-[2.5rem] bg-gray-900 border border-gray-100 flex flex-col items-center text-center text-white">
                <div className="w-16 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center text-white mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-primary">Par Email</h3>
                <p className="text-gray-400 font-medium mb-6">Pour toute demande d&apos;information technique ou commerciale.</p>
                <span className="text-2xl font-black">contact@qapril.ci</span>
              </div>

              <div className="p-12 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-primary mb-8">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Siège Social</h3>
                <p className="text-gray-500 font-medium mb-6">Visitez-nous dans nos locaux pour un accompagnement physique.</p>
                <span className="text-gray-900 font-bold">Abidjan, Côte d&apos;Ivoire</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAP PLACEHOLDER / DECORATIVE */}
        <section className="h-[400px] bg-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-300 font-black text-4xl uppercase tracking-[0.5em] animate-pulse">
                    Carte Interactive
                </div>
             </div>
             <div className="absolute inset-0 bg-primary/5"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
