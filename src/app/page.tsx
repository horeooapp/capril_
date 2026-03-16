/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col font-sans">
      {/* Premium Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/premium_portal_bg.png" 
          alt="Premium Architecture" 
          className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90"></div>
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <header className="relative z-20 w-full px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-4">
            <img src="/logo.png" alt="QAPRIL Logo" className="h-16 w-auto drop-shadow-2xl" />
            <div className="flex flex-col">
              <span className="font-black text-3xl tracking-tighter text-white uppercase leading-none">QAPRIL</span>
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
          {/* Badge */}
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
             {session?.user ? (
                <Link
                  href={session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className="col-span-1 md:col-span-2 group relative overflow-hidden px-12 py-6 bg-white rounded-3xl transition-all hover:scale-[1.02] shadow-2xl active:scale-95 text-center"
                >
                  <span className="relative z-10 font-black uppercase tracking-[0.2em] text-black">
                    Accéder à mon Espace Privé
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </Link>
             ) : (
                <>
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
                </>
             )}
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
