"use client"

import { useEffect, useState, useCallback } from 'react'
import { PwaRoleId, resolvePwaRole } from './pwa-roles'
import { usePathname } from 'next/navigation'

declare global {
    interface Window {
        __qapril_install_prompt?: any;
    }
}

export function usePwaInstall() {
    const pathname = usePathname()
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isStandalone, setIsStandalone] = useState(false)
    const [isIos, setIsIos] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [userName, setUserName] = useState<string | null>(null)
    const [isSessionLoaded, setIsSessionLoaded] = useState(false)

    useEffect(() => {
        // 1. Détection du mode standalone
        if (typeof window !== 'undefined') {
            const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
            setIsStandalone(standalone)

            // Détection iOS Safari
            const ua = window.navigator.userAgent.toLowerCase()
            const isIosDevice = /iphone|ipad|ipod/.test(ua)
            const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua)
            setIsIos(isIosDevice && isSafari)

            // Prompt existant
            if (window.__qapril_install_prompt) {
                setDeferredPrompt(window.__qapril_install_prompt)
            }

            // Écouteur de l'évènement d'installation natif
            const handleBeforeInstall = (e: any) => {
                e.preventDefault()
                window.__qapril_install_prompt = e
                setDeferredPrompt(e)
            }

            window.addEventListener('beforeinstallprompt', handleBeforeInstall)

            // Récupération de la session utilisateur pour connaître son rôle
            fetch('/api/auth/session')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.user) {
                        const role = data.user.chosenRole || data.user.role || null
                        const name = data.user.name || data.user.firstName || data.user.email || null
                        setUserRole(role)
                        setUserName(name)
                    }
                    setIsSessionLoaded(true)
                })
                .catch(() => setIsSessionLoaded(true))

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            }
        }
    }, [])

    const activeRoleKey = resolvePwaRole(userRole, pathname)

    const triggerInstall = useCallback(async (roleId?: PwaRoleId): Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'> => {
        if (isIos) {
            return 'ios'
        }

        const prompt = deferredPrompt || window.__qapril_install_prompt
        if (!prompt) {
            return 'unavailable'
        }

        try {
            prompt.prompt()
            const { outcome } = await prompt.userChoice
            if (outcome === 'accepted') {
                window.__qapril_install_prompt = null
                setDeferredPrompt(null)
                if (roleId) {
                    localStorage.setItem('qapril_installed_role', roleId)
                }
                return 'accepted'
            }
            return 'dismissed'
        } catch (err) {
            console.error('Erreur lors de l\'installation PWA :', err)
            return 'unavailable'
        }
    }, [deferredPrompt, isIos])

    return {
        isStandalone,
        isIos,
        isInstallable: !!deferredPrompt || isIos,
        hasPrompt: !!deferredPrompt,
        activeRoleKey,
        userRole,
        userName,
        isSessionLoaded,
        triggerInstall,
    }
}
