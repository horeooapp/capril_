"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem("qapril_cookie_consent");
    if (!consent) {
      // Un léger délai pour ne pas agresser l'utilisateur dès la première frame
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("qapril_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("qapril_cookie_consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:bottom-8 z-[9999] md:max-w-[400px]"
        >
          {/* Wrapper avec l'esthétique V2 (Ink/Mango) */}
          <div className="bg-ink text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 relative overflow-hidden font-sans">
            {/* Décoration subtile V2 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-mango/20 blur-[50px] rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-start space-x-4 relative z-10">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <Cookie className="text-emerald-400 w-5 h-5" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-emerald-400">Cookies & Confidentialité</h3>
                <p className="text-sm text-emerald-400/90 font-medium mb-4 leading-relaxed">
                  Nous utilisons des cookies pour assurer le bon fonctionnement de la plateforme QAPRIL, analyser son utilisation et sécuriser vos sessions.
                  <Link href="/cookies" className="text-emerald-400 hover:text-emerald-300 transition-colors ml-1 font-bold underline decoration-emerald-400/30 underline-offset-2 block mt-1">
                    En savoir plus
                  </Link>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptCookies}
                    className="flex-1 bg-mango text-white font-black uppercase text-xs tracking-widest py-3 px-4 rounded-xl hover:bg-mango-d transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Tout Accepter
                  </button>
                  <button
                    onClick={declineCookies}
                    className="flex-1 bg-white/10 text-white font-black uppercase text-xs tracking-widest py-3 px-4 rounded-xl hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
