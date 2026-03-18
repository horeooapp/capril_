import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import SectionHeading from "@/components/SectionHeading";
 
export const metadata: Metadata = {
  title: "Expertise Technologique",
  description: "L'expertise QAPRIL : fusion entre ingénierie logicielle avancée et cadre législatif immobilier ivoirien pour une sécurité totale.",
};

export default function ExpertisePage() {
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
              src="/images/expertise_visual.png" 
              alt="QAPRIL Expertise" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-900/60 to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-primary/30">
                Notre Expertise
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-10 uppercase">
                La data <br />
                <span className="text-primary italic">au service du bâti</span>.
              </h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                Notre expertise repose sur une fusion unique entre l&apos;ingénierie logicielle avancée et une connaissance profonde du cadre législatif immobilier ivoirien.
              </p>
            </div>
          </div>
        </section>

        {/* DOMAINES D'EXPERTISE */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:border-primary transition-all group">
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-6 block">01 / Audit & Traçabilité</div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-6 group-hover:text-primary transition-colors">Moteur QR Anti-Fraude</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Nous avons développé un moteur de certification basé sur des signatures cryptographiques uniques. Chaque document généré sur QAPRIL est auditable en 1 seconde par quiconque, rendant la falsification techniquement impossible.
                </p>
              </div>
              <div className="p-12 bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-900/20 group">
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-6 block">02 / Fintech Immobilière</div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-6 group-hover:text-primary transition-colors">Consignation Sécurisée</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Notre intégration avec les institutions financières permet une gestion automatisée des dépôts de garantie. Nous transformons une procédure complexe en un flux transparent et conforme aux directives nationales.
                </p>
              </div>
              <div className="p-12 bg-orange-50 rounded-[2.5rem] border border-orange-100 group">
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-6 block">03 / Identité Numérique</div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-6 group-hover:text-primary transition-colors">Indice de Confiance (ICL)</h3>
                <p className="text-gray-600 font-medium leading-relaxed">
                  L&apos;ICL est un algorithme de notation propriétaire qui valorise le comportement locatif. Il permet aux propriétaires de réduire leurs risques et aux locataires d&apos;utiliser leur réputation comme levier d&apos;accès.
                </p>
              </div>
              <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 group">
                <div className="text-primary font-black text-sm uppercase tracking-widest mb-6 block">04 / Lifecycle Management</div>
                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-6 group-hover:text-primary transition-colors">Passeport Numérique (PNB)</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Nous créons l&apos;ADN digital du bâtiment. De la fondation aux cycles de location successifs, chaque événement est consigné pour offrir une vue à 360° sur l&apos;état et la valeur réelle d&apos;un patrimoine.
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
