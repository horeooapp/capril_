 
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
import { isFeatureEnabled } from "@/lib/features";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImpactStats from "@/components/ImpactStats";
import RealEstateObservatory from "@/components/RealEstateObservatory";
import GeographicRentAnalysis from "@/components/GeographicRentAnalysis";
import RentRanking from "@/components/RentRanking";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;
  let dbNews: any[] = [];
  let isLandingPageRestricted = true;
  let stats = { totalLeases: 450, totalSecuredFunds: 125000000, totalFiscal: 15400000, totalUsers: 1200 }; // Fallbacks
  let flags = { impact: true, observatory: true, geo: true, ranking: true };

  try {
    session = await auth();
    dbNews = await getActiveNews();
    isLandingPageRestricted = await isFeatureEnabled("LANDING_PAGE");
    
    // Fetch Global Impact Stats & Feature Flags
    const [tLeases, tSecured, tFiscal, tUsers, fImpact, fObs, fGeo, fRank] = await Promise.all([
        prisma.lease.count({ where: { status: "ACTIVE" } }).catch(() => 450),
        prisma.cDCDeposit.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: 125000000 } })),
        prisma.fiscalDossier.aggregate({ _sum: { totalDgi: true } }).catch(() => ({ _sum: { totalDgi: 15400000 } })),
        prisma.user.count().catch(() => 1200),
        isFeatureEnabled("HOME_IMPACT_STATS"),
        isFeatureEnabled("HOME_OBSERVATORY"),
        isFeatureEnabled("HOME_GEO_ANALYSIS"),
        isFeatureEnabled("HOME_RENT_RANKING")
    ]);

    stats = {
        totalLeases: tLeases,
        totalSecuredFunds: Number((tSecured as any)._sum?.amount || 0),
        totalFiscal: Number((tFiscal as any)._sum?.totalDgi || 0),
        totalUsers: tUsers
    };

    flags = {
        impact: fImpact,
        observatory: fObs,
        geo: fGeo,
        ranking: fRank
    };
  } catch (error) {
    console.error("[HOME] Error during initial data fetch:", error);
  }



  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  // --- 1. DATA PREPARATION ---
  const fallbackNews = [
    { id: "f1", content: "BIENVENUE SUR QAPRIL : PORTAIL NATIONAL DE NORMALISATION DU MARCHÉ LOCATIF." },
    { id: "f2", content: "DIGITALISATION : TOUTES LES CAUTIONS IMMOBILIÈRES DOIVENT ÊTRE DÉPOSÉES À LA CDC-CI." },
    { id: "f3", content: "INNOVATION : LE REGISTRE LOCATIF NATIONAL SÉCURISE VOS TRANSACTIONS IMMOBILIÈRES." }
  ];
  const newsItems = dbNews.length > 0 ? dbNews : fallbackNews;
  const ticker = <NewsTicker items={newsItems} />;

  // --- 2. ACCESS CONTROL LOGIC ---
  if (isLandingPageRestricted) {
    if (!session?.user) {
      // Show Premium Lock Portal (Black)
      return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col font-sans">
          {ticker}
          <div className="absolute inset-0 z-0 text-white">
            <img 
              src="/images/premium_portal_bg.png" 
              alt="Premium Architecture" 
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
          </div>

          <header className="relative z-20 w-full px-8 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
              <Link href="/" className="flex items-center space-x-6 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-110"></div>
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-20 w-auto relative z-10 rounded-2xl shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-5xl tracking-tighter text-white leading-none italic">QAPRIL.</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-ivoire-orange mt-2">Infrastructure Nationale</span>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Status: Operational Certifié</span>
                  </div>
              </div>
            </div>
          </header>

          <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pb-20">
            <div className="max-w-5xl w-full text-center">
              <div className="inline-flex items-center px-6 py-2.5 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 mb-10 animate-in fade-in slide-in-from-top duration-1000">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/50">
                    Protocole de Gestion Immobilier <span className="text-primary italic">Souverain</span>
                </span>
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black text-white leading-[0.8] tracking-[calc(-0.05em)] mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200 uppercase italic">
                Registre <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ivoire-orange via-orange-400 to-white">
                    National.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/40 font-medium leading-relaxed mb-20 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-500">
                L&apos;infrastructure d&apos;État pour la normalisation, la certification et la sécurisation intégrale du patrimoine immobilier en Côte d&apos;Ivoire.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-in fade-in delay-700">
                  <Link href="/admin/login" className="group glass-card-premium overflow-hidden px-10 py-10 rounded-[2.5rem] bg-white border border-white transition-all hover:scale-[1.03] shadow-2xl active:scale-95 text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black uppercase tracking-[0.3em] text-black text-xs mb-2 italic">Accès Gouvernance</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-6">Contrôle DGI & Audit d&apos;État</span>
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                  </Link>
                  <Link href="/dashboard/login" className="group glass-card-premium overflow-hidden px-10 py-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] transition-all hover:bg-white/10 hover:scale-[1.03] active:scale-95 text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black uppercase tracking-[0.3em] text-white text-xs mb-2 italic">Espace Propriétaire</span>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-6">Digitalisation du Patrimoine</span>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-primary transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                    </div>
                  </Link>
                  <Link href="/locataire/login" className="group glass-card-premium overflow-hidden px-10 py-10 bg-primary/90 backdrop-blur-xl rounded-[2.5rem] transition-all hover:bg-primary hover:scale-[1.03] shadow-2xl shadow-primary/20 active:scale-95 text-center border border-white/20">
                    <div className="flex flex-col items-center">
                        <span className="font-black uppercase tracking-[0.3em] text-white text-xs mb-2 italic">Portail Locataire</span>
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-6">Consultation & Paiement</span>
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                  </Link>
              </div>

              {/* Social Proof for Restricted Portal */}
              {/* Impact stats removed from public entry */}
            </div>
          </main>

          <Footer />
        </div>
      );
    } else if (!isAdmin) {
      redirect("/dashboard");
    }
  }

  // --- 3. RENDERING FULL HOMEPAGE ---
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
            <Link href="/" className="flex items-center space-x-4 group">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto rounded-2xl shadow-2xl border border-gray-100 group-hover:scale-105 transition-transform duration-700" />
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-tighter text-ivoire-dark leading-none uppercase">QAPRIL</span>
                <span className="text-[9px] font-black tracking-[0.2em] text-ivoire-orange mt-1 uppercase opacity-80">Infrastructure</span>
              </div>
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
                  href={isAdmin ? "/admin" : (session.user.role === 'TENANT' ? "/locataire" : "/dashboard")}
                  className={`px-6 py-2.5 ${isAdmin ? 'bg-primary' : 'bg-gray-900'} text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all shadow-xl active:scale-95`}
                >
                  {isAdmin ? "Panel Administrateur" : (session.user.role === 'TENANT' ? "Espace Locataire" : "Tableau de Bord")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard/login"
                    className="px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                  >
                    Propriétaire
                  </Link>
                  <Link
                    href="/locataire/login"
                    className="px-6 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                  >
                    Locataire
                  </Link>
                </>
              )}
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
              <p className="text-xl text-gray-700 font-medium leading-relaxed mb-12 max-lg animate-in fade-in duration-1000 delay-300">
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
            </div>
          </div>
        </section>

        {/* --- IMPACT STATISTICS --- */}
        {/* Impact stats are now reserved for Admin Dashboard */}

        {/* --- EXPERTISE / DEPTH SECTION --- */}
        <section id="expertise" className="py-32 bg-white relative overflow-hidden">

            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -ml-48 -mb-48"></div>
            <SectionHeading subtitle="Profondeur Applicative" title="Une gestion locative sans angle mort." />
            <AppDepthCards />
        </section>

        {/* Advanced Market Insights are now reserved for Admin Dashboard */}

        {/* --- TRUST SCORE SECTION --- */}




        <section className="bg-gray-900 py-32 text-center overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 text-[15rem] font-black text-white/5 select-none pointer-events-none lowercase">trust</div>
            <SectionHeading dark subtitle="Score de Fiabilité National" title="L'Indice de Confiance Locative (ICL)." />
            <p className="text-xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Votre historique de paiement et de gestion crée votre réputation. Obtenez votre certificat de fiabilité certifié par QAPRIL pour faciliter vos futurs accès au logement.
            </p>
            <Link href="/dashboard" className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-2xl shadow-primary/20 active:scale-95 inline-block">
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
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-none mb-6">Prêt à digitaliser <br /> votre patrimoine ?</h2>
                        <p className="text-xl text-gray-600 font-medium max-w-md">Rejoignez le registre national et bénéficiez de la protection institutionnelle QAPRIL dès aujourd&apos;hui.</p>
                    </div>
                    <div className="flex flex-col gap-4 relative z-10">
                        <Link href="/dashboard" className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-orange-100 text-center">Accéder au Dashboard</Link>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
