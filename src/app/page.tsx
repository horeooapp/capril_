/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { auth } from "@/auth";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import SectionHeading from "@/components/SectionHeading";
import AppDepthCards from "@/components/AppDepthCards";
import HeroSlider from "@/components/HeroSlider";
import { logout } from "@/actions/auth";
import NewsTicker from "@/components/NewsTicker";
import { getActiveNews } from "@/actions/news-actions";

export default async function Home() {
  const session = await auth();
  const dbNews = await getActiveNews();
  
  // Fallback news if DB is empty
  const fallbackNews = [
    { id: "f1", content: "BIENVENUE SUR QAPRIL : PORTAIL NATIONAL DE NORMALISATION DU MARCHÉ LOCATIF." },
    { id: "f2", content: "DIGITALISATION : TOUTES LES CAUTIONS IMMOBILIÈRES DOIVENT ÊTRE DÉPOSÉES À LA CDC-CI." },
    { id: "f3", content: "INNOVATION : LE REGISTRE LOCATIF NATIONAL SÉCURISE VOS TRANSACTIONS IMMOBILIÈRES." }
  ];

  const newsItems = dbNews.length > 0 ? dbNews : fallbackNews;

  // Unified Mobile/Desktop News Ticker (Always at the very top)
  const ticker = <NewsTicker items={newsItems} />;

  // --- UNAUTHENTICATED: PREMIUM LOCK PORTAL ---
  if (!session?.user) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex flex-col font-sans">
        {ticker}
        {/* Premium Background Image with Overlay */}
        <div className="absolute inset-0 z-0 text-white">
          <img 
            src="/images/premium_portal_bg.png" 
            alt="Premium Architecture" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        </div>

        <header className="relative z-20 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
            <Link href="/" className="flex items-center space-x-4 ">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto drop-shadow-2xl" />
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-tighter  uppercase leading-none">QAPRIL</span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mt-1">Infrastructure Nationale</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Système Sécurisé v3.0</span>
            </div>
          </div>
        </header>

        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="max-w-4xl w-full text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 animate-in fade-in slide-in-from-top duration-1000">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">
                  Portail de Gestion Immobilier <span className="text-primary italic">Certifié</span>
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter mb-10 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              Registre Locatif <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-white">
                  National.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-16 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-500">
              La plateforme institutionnelle de normalisation et de certification des baux immobiliers en Côte d&apos;Ivoire. Sécurisation intégrale des transactions et du patrimoine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-in fade-in delay-700">
                <Link
                href="/admin/login"
                className="group relative overflow-hidden px-10 py-7 bg-white rounded-3xl transition-all hover:scale-[1.02] shadow-2xl active:scale-95 text-center"
                >
                <div className="flex flex-col items-center">
                    <span className="font-black uppercase tracking-[0.2em] text-black text-sm mb-1">Accès Administrateur</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Portail de Contrôle DGI</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
                </Link>

                <Link
                href="/dashboard/login"
                className="group relative overflow-hidden px-10 py-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95 text-center"
                >
                <div className="flex flex-col items-center">
                    <span className="font-black uppercase tracking-[0.2em] text-white text-sm mb-1">Espace Propriétaire</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Digitalisation Patrimoine</span>
                </div>
                </Link>
            </div>
          </div>
        </main>

        <footer className="relative z-20 py-10 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              &copy; {new Date().getFullYear()} QAPRIL. Services Technologiques de l&apos;Habitation.
            </p>
            <div className="flex space-x-6">
              <Link href="/cgu" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">CGU</Link>
              <Link href="/confidentialite" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/contact" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- AUTHENTICATED: FULL PREMIUM HOMEPAGE ---
  const navLinks = [
    { href: "/impact", label: "Impact" },
    { href: "/expertise", label: "Expertise" },
    { href: "/a-propos", label: "À propos" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <div className="sticky top-0 z-[60]">
        {ticker}
      </div>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[41px] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-14 w-auto drop-shadow-sm group-hover:scale-110 transition-transform" />
              <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase leading-none">QAPRIL</span>
            </Link>

            <nav className="hidden xl:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <div className="h-4 w-px bg-gray-200"></div>
              
                <Link
                  href={session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className={`px-6 py-2.5 ${session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' ? 'bg-primary' : 'bg-gray-900'} text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all shadow-xl active:scale-95`}
                >
                  {session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' ? "Panel Administrateur" : "Tableau de Bord"}
                </Link>
            </nav>

            <div className="xl:hidden">
              <MobileMenu links={navLinks} session={session} variant="light" onLogout={logout} />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 overflow-hidden">
          <HeroSlider />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-in slide-in-from-left duration-700">
                Infrastrastructure Nationale de Confiance
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
                Le Registre <span className="text-primary italic">Locatif</span> National.
              </h1>
              <p className="text-xl text-gray-700 font-medium leading-relaxed mb-12 max-w-lg animate-in fade-in duration-1000 delay-300">
                QAPRIL normalise, sécurise et certifie chaque bail immobilier en Côte d&apos;Ivoire. Une solution d&apos;État pour une transparence totale entre propriétaires et locataires.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1000 delay-500">
                <Link
                  href="/dashboard"
                  className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-2xl shadow-gray-300 flex items-center justify-center group"
                >
                  Accéder au Patrimoine
                  <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
                href="/dashboard"
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
                        <Link href="/dashboard" className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-orange-100 text-center">
                            Accéder au Dashboard
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
