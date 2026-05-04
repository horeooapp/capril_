"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, ShieldCheck, X, ChevronRight, Settings2, Check } from "lucide-react";

type CookieSettings = {
  accepted: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<"basic" | "custom">("basic");
  
  // States for customization
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem("qapril_cookie_consent_v2");
    if (!savedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (settings: CookieSettings) => {
    localStorage.setItem("qapril_cookie_consent_v2", JSON.stringify(settings));
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      accepted: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleDeclineAll = () => {
    saveConsent({
      accepted: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      accepted: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-auto md:right-8 z-[9999] p-4 md:p-0 md:w-[440px]"
        >
          <div className="relative overflow-hidden bg-white/90 dark:bg-[#0F1117]/95 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)]">
            
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative p-6 md:p-8">
              {view === "basic" ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                      <Cookie size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Confidentialité</h3>
                      <p className="text-xs font-bold text-orange-500 tracking-widest uppercase">QAPRIL Infrastructure</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et assurer la sécurité de vos transactions immobilières.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      Tout accepter
                      <ShieldCheck size={18} />
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => setView("custom")}
                        className="flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        Personnaliser
                        <Settings2 size={14} />
                      </button>
                      <button
                        onClick={handleDeclineAll}
                        className="flex-1 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 font-bold py-3 px-4 rounded-2xl transition-all text-xs uppercase tracking-wider"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link href="/cookies" className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-orange-500 transition-colors">
                      Politique relative aux cookies
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <button 
                      onClick={() => setView("basic")}
                      className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Préférences</h3>
                    <div className="w-5" />
                  </div>

                  <div className="space-y-4 mb-8">
                    {/* Necessary */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Essentiels</span>
                        <span className="text-[10px] font-black uppercase text-emerald-500">Toujours Actif</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Nécessaires au fonctionnement du portail, à la connexion et à la sécurité des paiements.
                      </p>
                    </div>

                    {/* Analytics */}
                    <button 
                      onClick={() => setAnalytics(!analytics)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left ${
                        analytics 
                        ? "bg-orange-500/5 border-orange-500/20" 
                        : "bg-transparent border-gray-100 dark:border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Statistiques</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          analytics ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 dark:border-white/20"
                        }`}>
                          {analytics && <Check size={12} strokeWidth={4} />}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Nous permettent de mesurer l'audience et d'améliorer les performances de la plateforme.
                      </p>
                    </button>

                    {/* Marketing */}
                    <button 
                      onClick={() => setMarketing(!marketing)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left ${
                        marketing 
                        ? "bg-orange-500/5 border-orange-500/20" 
                        : "bg-transparent border-gray-100 dark:border-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Marketing</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          marketing ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300 dark:border-white/20"
                        }`}>
                          {marketing && <Check size={12} strokeWidth={4} />}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                        Utilisés pour vous proposer des contenus et offres adaptés à vos besoins immobiliers.
                      </p>
                    </button>
                  </div>

                  <button
                    onClick={handleSaveCustom}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
                  >
                    Enregistrer mes choix
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

