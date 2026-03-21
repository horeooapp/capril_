 
import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Header simple */}
      <header className="py-6 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group w-fit">
            <img src="/logo.png" alt="QAPRIL Logo" className="h-12 w-auto group-hover:scale-110 transition-transform" />
            <span className="font-black text-2xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-black text-gray-900 select-none">
                404
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-900 rounded-full blur-[120px] -ml-48 -mb-48"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-bounce">
            Page non trouvée
          </span>
          
          <h1 className="text-6xl md:text-9xl font-black text-gray-900 leading-[0.8] tracking-tighter mb-8">
            HORS <br />
            <span className="text-primary italic">REGISTRE</span>.
          </h1>
          
          <p className="text-xl text-gray-500 font-medium max-w-lg mx-auto leading-relaxed mb-12">
            La page que vous recherchez n&apos;existe pas ou a été déplacée. Notre registre national est vaste, mais ce chemin semble être une impasse.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/"
              className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-2xl shadow-gray-300 active:scale-95"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/#contact"
              className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:border-primary hover:text-primary transition-all active:scale-95"
            >
              Signaler un bug
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-24 pt-12 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <Link href="/locataire/login" className="group">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary mb-2 transition-colors">Portail</span>
                <span className="font-bold text-gray-900">Locataire</span>
            </Link>
            <Link href="/dashboard/login" className="group">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary mb-2 transition-colors">Portail</span>
                <span className="font-bold text-gray-900">Propriétaire</span>
            </Link>
            <Link href="/admin/login" className="group">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary mb-2 transition-colors">Portail</span>
                <span className="font-bold text-gray-900">Admin</span>
            </Link>
            <Link href="/impact" className="group">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary mb-2 transition-colors">Notre</span>
                <span className="font-bold text-gray-900">Impact</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
