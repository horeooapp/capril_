 
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

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  let session = null;
  let dbNews: any[] = [];
  let isLandingPageEnabled = false;
  let stats = { totalLeases: 450, totalSecuredFunds: 125000000, totalFiscal: 15400000, totalUsers: 1200 }; // Fallbacks
  let flags = { impact: true, observatory: true, geo: true, ranking: true };

  try {
    session = await auth();
    dbNews = await getActiveNews();
    isLandingPageEnabled = await isFeatureEnabled("LANDING_PAGE");
    
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

    // --- 2. ACCESS CONTROL & REDIRECTION ---
    // If the user is connected, we ALWAYS bypass the restricted "Black Portal" (which the user calls "landing page").
    // We let them see the full, unrestricted White Portal (which the user calls "page d'accueil").

    // Show restricted Luminous Portal (which the user calls "Landing Page") 
    // ONLY if the mode is activated AND the user is not authenticated.
    if (isLandingPageEnabled && !session?.user) {
        // Show restricted Luminous Portal
        return (
            <div className="relative min-h-screen bg-[#F5F7FA] overflow-hidden flex flex-col font-sans">
                {ticker}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/images/abidjan_plateau_bg.png" 
                        alt="Plateau Abidjan" 
                        className="w-full h-full object-cover opacity-80 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/50 to-white/95 backdrop-blur-[2px]"></div>
                </div>

                <header className="relative z-20 w-full px-8 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <Link href="/" className="flex items-center space-x-6 group">
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-24 w-auto relative z-10 rounded-2xl group-hover:scale-105 transition-transform duration-700 shadow-xl shadow-black/5 bg-white/50 backdrop-blur-md p-1" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[#0B4619] mt-2 ml-1">Infrastructure Nationale</span>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
                    <div className="max-w-5xl w-full">
                        <h1 className="text-6xl md:text-[8rem] font-black text-[#0B4619] leading-[0.8] tracking-tighter mb-12 uppercase italic drop-shadow-sm">
                            Registre <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F77F00] via-[#E85D04] to-[#0B4619]">National.</span>
                        </h1>
                        {session?.user ? (
                            <div className="max-w-xl mx-auto glass-card-premium px-10 py-12 bg-white/70 backdrop-blur-3xl border border-white/40 shadow-2xl shadow-black/5 rounded-[2.5rem] transition-all hover:-translate-y-2 text-center">
                                <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-widest leading-relaxed">
                                    {session.user.fullName || session.user.email}
                                </h2>
                                <p className="text-[#0B4619] mb-8 uppercase tracking-[0.3em] text-[10px] font-bold">
                                    {session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN" ? "GOUVERNANCE" : session.user.role}
                                </p>
                                <Link 
                                    href={isAdmin ? "/admin" : (session.user.role === 'TENANT' ? "/locataire" : "/dashboard")}
                                    className="inline-flex items-center justify-center w-full gap-3 py-5 bg-gradient-to-r from-[#0B4619] to-[#063010] border border-[#0B4619]/20 text-white rounded-2xl shadow-xl shadow-[#0B4619]/30 font-black uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
                                >
                                    Retourner à mon Espace
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
                                <form action={async () => { "use server"; const { choisirTypeConnexion } = await import("@/actions/auth.actions"); await choisirTypeConnexion("ADMIN") }} className="group px-10 py-10 bg-white/80 backdrop-blur-2xl border border-white border-b-4 border-b-[#0B4619] rounded-[2.5rem] shadow-xl shadow-black/5 transition-all hover:-translate-y-2 hover:shadow-2xl text-center cursor-pointer">
                                    <button type="submit" className="w-full outline-none">
                                        <span className="font-black uppercase tracking-[0.3em] text-[#0B4619] text-xs block mb-2">Accès Gouvernance</span>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Contrôle DGI & Audit</span>
                                    </button>
                                </form>
                                <form action={async () => { "use server"; const { choisirTypeConnexion } = await import("@/actions/auth.actions"); await choisirTypeConnexion("BAILLEUR") }} className="group px-10 py-10 bg-white/80 backdrop-blur-2xl border border-white border-b-4 border-b-[#F77F00] rounded-[2.5rem] shadow-xl shadow-black/5 transition-all hover:-translate-y-2 hover:shadow-2xl text-center cursor-pointer">
                                    <button type="submit" className="w-full outline-none">
                                        <span className="font-black uppercase tracking-[0.3em] text-gray-900 text-xs block mb-2">Espace Bailleur</span>
                                        <span className="text-[9px] font-black text-[#F77F00] uppercase tracking-widest block">Gestion de Patrimoine</span>
                                    </button>
                                </form>
                                <form action={async () => { "use server"; const { choisirTypeConnexion } = await import("@/actions/auth.actions"); await choisirTypeConnexion("LOCATAIRE") }} className="group px-10 py-10 bg-gradient-to-br from-[#0B4619] to-[#063010] border border-[#0B4619]/20 rounded-[2.5rem] shadow-xl shadow-[#0B4619]/30 transition-all hover:-translate-y-2 hover:shadow-2xl text-center cursor-pointer">
                                    <button type="submit" className="w-full outline-none">
                                        <span className="font-black uppercase tracking-[0.3em] text-white text-xs block mb-2">Portail Locataire</span>
                                        <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block">Consultation & Reçus</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        );
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
        <div className="bg-gradient-to-b from-[#F5F7FA] via-[#FAFBFC] to-[#F5F7FA] min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
            <div className="sticky top-0 z-[60]">
                {ticker}
            </div>
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-[41px] z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-4 group">
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-20 w-auto group-hover:scale-105 transition-transform duration-700" />
                        </Link>

                        <nav className="hidden xl:flex space-x-8 items-center">
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                        
                        {session?.user ? (
                            <div className="flex gap-4">
                                <Link href={isAdmin ? "/admin" : (session.user.role === 'TENANT' ? "/locataire" : "/dashboard")} className="px-6 py-2 bg-[#C55A11] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all outline-none flex items-center justify-center shadow-lg shadow-[#C55A11]/20">
                                    Retour au Tableau de Bord
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                 <form action={async () => { "use server"; const { choisirTypeConnexion } = await import("@/actions/auth.actions"); await choisirTypeConnexion("BAILLEUR") }}>
                                    <button type="submit" className="px-6 py-2 h-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:scale-105 transition-all">Propriétaire</button>
                                 </form>
                                 <form action={async () => { "use server"; const { choisirTypeConnexion } = await import("@/actions/auth.actions"); await choisirTypeConnexion("LOCATAIRE") }}>
                                    <button type="submit" className="px-6 py-2 h-full bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full cursor-pointer hover:scale-105 transition-all">Locataire</button>
                                 </form>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="relative min-h-[90vh] flex items-center pt-24 pb-32">
                    <HeroSlider />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-2xl text-center md:text-left">
                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-none">
                                Le Registre <span className="text-primary italic">Locatif</span> National.
                            </h1>
                            <p className="text-xl text-gray-600 mb-12">Normalisation et sécurisation du marché immobilier ivoirien.</p>
                            {session?.user ? (
                                <Link href={isAdmin ? "/admin" : (session.user.role === 'TENANT' ? "/locataire" : "/dashboard")} className="px-10 py-5 bg-[#C55A11] text-white rounded-2xl font-black uppercase tracking-widest text-sm inline-block shadow-xl shadow-[#C55A11]/20">Retour au Tableau de Bord</Link>
                            ) : (
                                <Link href="/locataire/login" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm inline-block">Démarrer l'Expérience</Link>
                            )}
                        </div>
                    </div>
                </section>
                <section className="py-32 bg-transparent"><AppDepthCards /></section>
            </main>
            <Footer />
        </div>
    );
}
