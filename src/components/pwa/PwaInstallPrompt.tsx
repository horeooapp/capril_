"use client"

import React, { useEffect, useState } from "react"
import { Download, X, Share, PlusSquare } from "lucide-react"

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isIos, setIsIos] = useState(false)
    const [showIosGuide, setShowIosGuide] = useState(false)

    useEffect(() => {
        // Ne pas afficher si déjà en mode PWA standalone (installé)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
        if (isStandalone) return

        // Vérifier si l'utilisateur a déjà refusé récemment
        const dismissedAt = localStorage.getItem('qapril_pwa_dismissed')
        if (dismissedAt) {
            const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24)
            if (daysSince < 7) return // Attendre 7 jours avant de réafficher
        }

        // Détection iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
        
        if (isIosDevice && isSafari) {
            setIsIos(true)
            // Délayer l'affichage pour ne pas agresser au chargement
            const timer = setTimeout(() => setIsVisible(true), 3500)
            return () => clearTimeout(timer)
        }

        // Android / Windows / Chrome standard PWA prompt
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Afficher après un léger délai de découverte
            setTimeout(() => setIsVisible(true), 2500)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstallClick = async () => {
        if (isIos) {
            setShowIosGuide(true)
            return
        }

        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setIsVisible(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('qapril_pwa_dismissed', Date.now().toString())
    }

    if (!isVisible) return null

    return (
        <aside 
            role="region"
            aria-label="Installation de l'application"
            className="fixed bottom-20 lg:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[95] animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
            <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/icon-192.png" 
                            alt="Logo QAPRIL" 
                            className="w-10 h-10 rounded-xl object-contain bg-white p-1 shadow-md shrink-0" 
                        />
                        <div>
                            <h4 className="font-bold text-sm text-white leading-tight">Installer l'application QAPRIL</h4>
                            <p className="text-[11px] text-slate-300 mt-0.5">Accès direct et alertes en temps réel</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                        aria-label="Fermer la suggestion"
                    >
                        <X size={16} />
                    </button>
                </div>

                {showIosGuide ? (
                    <div className="bg-slate-800/90 rounded-xl p-3 text-xs text-slate-200 space-y-2 border border-slate-700">
                        <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                            <PlusSquare size={15} /> Installation sur iPhone & iPad :
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                            <li>Appuyez sur le bouton <strong>Partager</strong> <Share size={12} className="inline mx-1 text-sky-400" /> en bas de Safari.</li>
                            <li>Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.</li>
                            <li>Validez en haut à droite en appuyant sur <strong>« Ajouter »</strong>.</li>
                        </ol>
                        <button 
                            onClick={() => setShowIosGuide(false)}
                            className="w-full mt-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-bold text-center transition-colors"
                        >
                            Compris
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            onClick={handleInstallClick}
                            className="flex-1 bg-gradient-to-r from-[#FF8200] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 uppercase tracking-wider"
                        >
                            <Download size={15} strokeWidth={2.5} />
                            <span>Installer l'app</span>
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition-colors font-medium"
                        >
                            Plus tard
                        </button>
                    </div>
                )}
            </div>
        </aside>
    )
}

