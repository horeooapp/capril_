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
                // @ts-ignore
                const { Capacitor } = await import(/* webpackIgnore: true */ '@capacitor/core' as any)
                
                // Si ce n'est pas une application native iOS/Android, on ne fait rien.
                if (!Capacitor.isNativePlatform()) return

                // Ajout de la classe native au body pour le CSS spécifique (safe areas, overscroll)
                document.body.classList.add('is-native-app')

                // @ts-ignore
                const { App } = await import(/* webpackIgnore: true */ '@capacitor/app' as any)
                
                // Gestion du bouton de retour Android
                App.addListener('backButton', ({ canGoBack }: any) => {
                    if (canGoBack) {
                        router.back()
                    } else {
                        App.exitApp()
                    }
                })
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
