import { auth } from "@/auth";
import { getActiveNews } from "@/actions/news-actions";
import { isFeatureEnabled } from "@/lib/features";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewsTicker from "@/components/NewsTicker";
import MobileMenu from "@/components/MobileMenu";
import HeroSlider from "@/components/HeroSlider";
import SectionHeading from "@/components/SectionHeading";
import { logout } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth().catch(() => null);
  const dbNews: any[] = await getActiveNews().catch(() => []);
  const isLandingPageRestricted = await isFeatureEnabled("LANDING_PAGE").catch(() => true);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  if (isLandingPageRestricted && !session?.user) {
      return (
        <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">QAPRIL SECURE.</h1>
          <p className="text-gray-400 mt-4">Accès Restreint - Infrastructure Nationale</p>
          <div className="mt-8">
             <Link href="/dashboard/login" className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors">Portail</Link>
          </div>
        </main>
      );
  } else if (isLandingPageRestricted && session?.user && !isAdmin) {
      redirect("/dashboard");
  }

  const navLinks = [
    { href: "/impact", label: "Impact" },
    { href: "/expertise", label: "Expertise" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <div className="sticky top-0 z-[60]">
        <NewsTicker items={dbNews} />
      </div>
      
      <header className="p-4 border-b flex justify-between items-center sticky top-[41px] z-50 bg-white/80 backdrop-blur">
        <h1 className="text-2xl font-black uppercase tracking-tighter">QAPRIL HEADER</h1>
        <MobileMenu links={navLinks} session={session} variant="light" onLogout={logout} />
      </header>

      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <HeroSlider />
        <div className="relative z-10 p-10 max-w-2xl">
           <h2 className="text-5xl font-black text-white drop-shadow-2xl">Hero Slider Debug.</h2>
           <p className="text-white/80 mt-4 font-medium">Si vous voyez le slider bouger, c&apos;est parfait.</p>
        </div>
      </section>

      <section className="py-20">
         <SectionHeading subtitle="Expertise Digitale" title="Un registre pour tous." />
         <div className="text-center mt-10">
            <p className="text-gray-500">DEBUG STEP: HeroSlider and SectionHeading reintroduced.</p>
         </div>
      </section>
    </main>
  );
}
