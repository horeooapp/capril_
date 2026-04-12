"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function MobileRuntimeDirector() {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        // Chargement dynamique pour éviter les erreurs SSR (Server-Side Rendering)
        const checkAppId = async () => {
            try {
                const { Capacitor } = await import('@capacitor/core')
                
                // Si ce n'est pas une application native iOS/Android, on ne fait rien.
                if (!Capacitor.isNativePlatform()) return

                const { App } = await import('@capacitor/app')
                const info = await App.getInfo()
                
                // Redirection forcée si l'utilisateur est sur l'écran d'accueil ou de sélection
                if (pathname === '/' || pathname === '/login') {
                    if (info.id === 'ci.qapril.proprietaire') {
                        router.replace('/dashboard/login') // Redirige vers Propriétaire / Agence
                    } else if (info.id === 'ci.qapril.locataire') {
                        router.replace('/mon-espace-locataire/login') // Redirige vers Locataire
                    }
                }
            } catch (err) {
                console.error("[CAPACITOR] Erreur lors de la vérification de l'App ID", err)
            }
        }
        
        checkAppId()
    }, [pathname, router])

    // Ce composant est purement logique et ne rend rien à l'écran
    return null
}
