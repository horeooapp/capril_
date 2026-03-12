/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import MobileMenu from "@/components/MobileMenu";
import SectionHeading from "@/components/SectionHeading";
import AppDepthCards from "@/components/AppDepthCards";

export default async function Home() {
  const session = await auth();

  const navLinks = [
    { href: "/impact", label: "Impact" },
    { href: "/#a-propos", label: "À propos" },
    { href: "/#expertise", label: "Expertise" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-14 w-auto drop-shadow-sm group-hover:scale-110 transition-transform" />
              <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
            </Link>

            <nav className="hidden xl:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="h-4 w-px bg-gray-200"></div>
              {session?.user ? (
                <Link
                  href={session.user.role === 'TENANT' ? "/locataire" : "/dashboard"}
                  className="px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-primary transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  {session.user.role === 'TENANT' ? "Mon Espace" : "Tableau de Bord"}
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/locataire/login" className="text-[11px] font-black uppercase tracking-widest text-gray-900 hover:text-primary">
                    Locataire
                  </Link>
                  <Link
                    href="/dashboard/login"
                    className="px-6 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-95"
                  >
                    Espace Propriétaire
                  </Link>
                </div>
              )}
            </nav>

            <div className="xl:hidden">
              <MobileMenu links={navLinks} session={session} variant="light" />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 overflow-hidden">
          {/* Background Layer */}
          <div className="absolute inset-0 z-0">
             <img 
                src="/hero_abidjan.png" 
                alt="Abidjan Modern Estate" 
                className="w-full h-full object-cover grayscale-[20%] brightness-[85%]"
             />
             <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/40 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-in slide-in-from-left duration-700">
                Infrastrastructure Nationale de Confiance
              </span>
              <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
                Le Registre <br />
                <span className="text-primary italic">Locatif</span> National.
              </h1>
              <p className="text-xl text-gray-700 font-medium leading-relaxed mb-12 max-w-lg animate-in fade-in duration-1000 delay-300">
                QAPRIL normalise, sécurise et certifie chaque bail immobilier en Côte d&apos;Ivoire. Une solution d&apos;État pour une transparence totale entre propriétaires et locataires.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1000 delay-500">
                <Link
                  href="/dashboard/login"
                  className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-2xl shadow-gray-300 flex items-center justify-center group"
                >
                  Débuter la Digitation
                  <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <div className="p-1 rounded-2xl bg-white/50 backdrop-blur-md border border-white/20">
                    <Link
                    href="/#expertise"
                    className="px-8 py-4 text-gray-900 font-black uppercase tracking-widest text-sm hover:text-primary transition-all flex items-center justify-center"
                    >
                    En savoir plus
                    </Link>
                </div>
              </div>

              {/* Stats / Social Proof */}
              <div className="mt-20 flex items-center space-x-8 text-gray-500 animate-in fade-in duration-1000 delay-700">
                <div>
                    <span className="block text-3xl font-black text-gray-900 leading-none">25+</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Modules Audit</span>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div>
                    <span className="block text-3xl font-black text-gray-900 leading-none">100%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Certifié CDC-CI</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- EXPERTISE / DEPTH SECTION --- */}
        <section id="expertise" className="py-32 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>
            
            <SectionHeading 
                subtitle="Profondeur Applicative"
                title="Une gestion locative sans angle mort."
            />

            <AppDepthCards />
        </section>

        {/* --- TRUST SCORE SECTION --- */}
        <section className="bg-gray-900 py-32 text-center overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 text-[15rem] font-black text-white/5 select-none pointer-events-none lowercase">
                trust
            </div>
            <SectionHeading 
                dark
                subtitle="Score de Fiabilité National"
                title="L'Indice de Confiance Locative (ICL)."
            />
            <p className="text-xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Votre historique de paiement et de gestion crée votre réputation. Obtenez votre certificat de fiabilité certifié par QAPRIL pour faciliter vos futurs accès au logement.
            </p>
            <Link 
                href="/dashboard/login"
                className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 inline-block"
            >
                Consulter mon Score ICL
            </Link>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-orange-50 rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 border border-orange-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary animate-pulse blur-[120px] opacity-20"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-none mb-6">
                            Prêt à digitaliser <br /> votre patrimoine ?
                        </h2>
                        <p className="text-xl text-gray-600 font-medium max-w-md">
                            Rejoignez le registre national et bénéficiez de la protection institutionnelle QAPRIL dès aujourd&apos;hui.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 relative z-10">
                        <Link href="/dashboard/login" className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-orange-100 text-center">
                            S&apos;inscrire comme Propriétaire
                        </Link>
                        <Link href="/locataire/login" className="px-12 py-5 bg-white border-2 border-primary text-primary rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-50 transition-all text-center">
                            Accès Locataire
                        </Link>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
