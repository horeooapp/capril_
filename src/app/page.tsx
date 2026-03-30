 
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

    // --- 2. ACCESS CONTROL & REDIRECTION ---
    if (session?.user) {
        if (isAdmin) redirect("/admin");
        if (session.user.role === 'TENANT') redirect("/locataire");
        redirect("/dashboard");
    }

    if (isLandingPageRestricted) {
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
                </div>

                <header className="relative z-20 w-full px-8 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-white">
                        <Link href="/" className="flex items-center space-x-6 group">
                            <img src="/logo.png" alt="QAPRIL Logo" className="h-24 w-auto relative z-10 rounded-2xl group-hover:scale-105 transition-transform duration-700" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-ivoire-orange mt-2 ml-1">Infrastructure Nationale</span>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
                    <div className="max-w-5xl w-full">
                        <h1 className="text-6xl md:text-[8rem] font-black text-white leading-[0.8] tracking-tighter mb-12 uppercase italic">
                            Registre <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ivoire-orange via-orange-400 to-white">National.</span>
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <Link href="/admin/login" className="group glass-card-premium px-10 py-10 bg-white rounded-[2.5rem] transition-all hover:scale-[1.03] active:scale-95 text-center">
                                <span className="font-black uppercase tracking-[0.3em] text-black text-xs block mb-2">Accès Gouvernance</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Contrôle DGI & Audit</span>
                            </Link>
                            <Link href="/dashboard/login" className="group glass-card-premium px-10 py-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] transition-all hover:scale-[1.03] active:scale-95 text-center">
                                <span className="font-black uppercase tracking-[0.3em] text-white text-xs block mb-2">Espace Bailleur</span>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block">Gestion de Patrimoine</span>
                            </Link>
                            <Link href="/locataire/login" className="group glass-card-premium px-10 py-10 bg-primary/90 backdrop-blur-xl rounded-[2.5rem] transition-all hover:scale-[1.03] active:scale-95 text-center border border-white/20 shadow-2xl shadow-primary/20">
                                <span className="font-black uppercase tracking-[0.3em] text-white text-xs block mb-2">Portail Locataire</span>
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest block">Consultation de Bail</span>
                            </Link>
                        </div>
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
        <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
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
                        
                        <div className="flex gap-4">
                             <Link href="/dashboard/login" className="px-6 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Propriétaire</Link>
                             <Link href="/locataire/login" className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Locataire</Link>
                        </div>
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
                            <Link href="/locataire/login" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm inline-block">Démarrer l'Expérience</Link>
                        </div>
                    </div>
                </section>
                <section className="py-32 bg-white"><AppDepthCards /></section>
            </main>
            <Footer />
        </div>
    );
}
