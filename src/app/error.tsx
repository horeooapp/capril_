"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Uncaught server-side exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-red-100 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-white border-2 border-red-500 rounded-[2rem] flex items-center justify-center text-red-500 shadow-2xl rotate-3">
            <ShieldAlert size={48} />
          </div>
        </div>

        {/* Error Text */}
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter mb-6 italic leading-none">
          Incident <br />
          <span className="text-red-500">Serveur.</span>
        </h1>
        
        <p className="text-lg text-gray-500 font-medium mb-12 leading-relaxed px-4">
          Une exception serveur s&apos;est produite lors du traitement de votre demande. Notre infrastructure de sécurité a capturé l&apos;incident pour analyse.
        </p>

        {/* Diagnostic Card */}
        {error.digest && (
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-12 inline-flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Digest Code:</span>
            <code className="text-xs font-black bg-white px-3 py-1 rounded-lg border border-gray-200 text-gray-900 shadow-sm lowercase">
              {error.digest}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-xl active:scale-95 flex items-center gap-3"
          >
            <RefreshCcw size={18} />
            Réessayer
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all flex items-center gap-3"
          >
            <Home size={18} />
            Retour Accueil
          </Link>
        </div>

        <p className="mt-20 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          © 2024 QAPRIL • Infrastructure de Sécurité Nationale
        </p>
      </div>
    </div>
  );
}
