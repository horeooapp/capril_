import Link from "next/link";
import { auth } from "@/auth";
import "../app/landing-v2.css"; // Injecting the new frontend scoped CSS
import QaprilLandingV2 from "@/components/landing-v2/QaprilLandingV2";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    console.error("[HOME] Error during initial auth fetch:", error);
  }

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';

  // If user is connected, we show a clean portal to bring them back to their dashboard,
  // honoring the new CSS variables subtly.
  if (session?.user) {
    return (
      <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col items-center justify-center font-sans">
        <header className="absolute top-0 w-full px-8 py-10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-4">
                    <img src="/logo.png" alt="QAPRIL Logo" className="h-20 w-auto rounded-xl shadow-lg border border-orange-100" />
                </Link>
            </div>
        </header>

        <main className="relative z-20 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0F1117] leading-[1.1] mb-10 flex flex-col items-center">
              <span>Quittancement <span className="text-[#FF8B00]">Autonome</span></span>
              <span className="text-2xl text-[#5C6075] mt-4 tracking-[0.1em] font-bold">PLATEFORME DE RESSOURCES IMMOBILIÈRES</span>
          </h1>
          <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#FF8B00]/10">
              <h2 className="text-xl font-black text-[#0F1117] mb-2 uppercase tracking-widest leading-relaxed">
                  {session.user.fullName || session.user.email}
              </h2>
              <p className="text-[#00B4D8] mb-8 uppercase tracking-[0.3em] text-[10px] font-bold">
                  {isAdmin ? "GOUVERNANCE" : session.user.role}
              </p>
              <Link 
                  href={isAdmin ? "/admin" : (session.user.role === 'TENANT' ? "/mon-espace-locataire" : "/dashboard")}
                  className="inline-flex items-center justify-center w-full gap-3 py-4 bg-gradient-to-r from-[#FF8B00] to-[#FF4E50] text-white rounded-2xl shadow-xl shadow-[#FF8B00]/30 font-black uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
              >
                  Retourner à mon Espace
              </Link>
          </div>
        </main>
      </div>
    );
  }

  // Pure 100% Mockup Frontend Redesign for Unauthenticated users
  return (
    <>
      <QaprilLandingV2 />
    </>
  );
}

