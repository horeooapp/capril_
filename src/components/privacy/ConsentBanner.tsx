"use client";

import { useState, useEffect } from "react";
import { grantConsentAction } from "@/actions/privacy-actions";

/**
 * PRIVACY BY DESIGN — Principe 6 : Transparence
 * ConsentBanner : Bandeau de consentement conforme RGPD.
 * Granulaire (Cookies, Analytics, Marketing) et mémorisé en base.
 */
export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // État local des consentements (décoché par défaut = Privacy by Default)
  const [consents, setConsents] = useState({
    ANALYTICS: false,
    MARKETING: false,
    COOKIES: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà répondu (stocké en localStorage pour affichage rapide)
    // Côté serveur, la vraie source de vérité est la DB.
    const hasConsented = localStorage.getItem("qapril_consent_answered");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    setIsVisible(false);
    localStorage.setItem("qapril_consent_answered", "true");
    
    // Server Actions - appel asynchrone non bloquant pour l'UI
    grantConsentAction("ANALYTICS");
    grantConsentAction("MARKETING");
    grantConsentAction("COOKIES");
  };

  const handleRejectAll = () => {
    setIsVisible(false);
    localStorage.setItem("qapril_consent_answered", "true");
    // Par défaut tout est rejeté, rien à envoyer (Privacy by Default)
  };

  const handleSaveSelection = async () => {
    setIsVisible(false);
    localStorage.setItem("qapril_consent_answered", "true");

    if (consents.ANALYTICS) grantConsentAction("ANALYTICS");
    if (consents.MARKETING) grantConsentAction("MARKETING");
    if (consents.COOKIES) grantConsentAction("COOKIES");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-slate-200 shadow-2xl flex flex-col gap-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Vos données, votre choix
            </h3>
            <p className="text-sm text-slate-600">
              Dans le respect de votre vie privée (Privacy by Design), nous n'utilisons aucun traceur non essentiel sans votre accord. 
              Vous pouvez accepter, refuser ou personnaliser vos choix.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Personnaliser
            </button>
            <button 
              onClick={handleRejectAll}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Tout refuser
            </button>
            <button 
              onClick={handleAcceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm"
            >
              Tout accepter
            </button>
          </div>

        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid gap-4 sm:grid-cols-3">
            
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <input 
                type="checkbox" 
                checked={consents.ANALYTICS}
                onChange={(e) => setConsents(c => ({ ...c, ANALYTICS: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Analyses et statistiques</div>
                <div className="text-xs text-slate-500 mt-1">Permet d'améliorer l'application en mesurant anonymement son utilisation.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer">
              <input 
                type="checkbox" 
                checked={consents.MARKETING}
                onChange={(e) => setConsents(c => ({ ...c, MARKETING: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Marketing & Offres</div>
                <div className="text-xs text-slate-500 mt-1">Pour recevoir des offres personnalisées de nos partenaires.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-slate-100 opacity-60">
              <input 
                type="checkbox" 
                checked={true}
                disabled
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">Strictement nécessaires</div>
                <div className="text-xs text-slate-500 mt-1">Requis pour le fonctionnement (sécurité, session). Ne peuvent pas être désactivés.</div>
              </div>
            </label>

            <div className="sm:col-span-3 flex justify-end mt-2">
               <button 
                onClick={handleSaveSelection}
                className="px-6 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
