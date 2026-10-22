"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export default function MobileRuntimeDirector() {
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const checkAppId = async () => {
            try {
                if (typeof window === "undefined") return

                // Vérifier si le pont Capacitor natif est injecté dans window
                const capacitor = (window as any).Capacitor
                if (!capacitor || typeof capacitor.isNativePlatform !== "function" || !capacitor.isNativePlatform()) {
                    return
                }

                // Ajout de la classe native au body pour le CSS spécifique (safe areas, overscroll)
                document.body.classList.add("is-native-app")

                // Plugin App exposé par le runtime Capacitor
                const App = capacitor.Plugins?.App
                if (!App) return

                // Gestion du bouton de retour Android
                App.addListener?.("backButton", ({ canGoBack }: any) => {
                    if (canGoBack) {
                        router.back()
                    } else {
                        App.exitApp?.()
                    }
                })

                const info = await App.getInfo?.()
                if (!info) return

                // Redirection forcée si l'utilisateur est sur l'écran d'accueil ou de sélection
                if (pathname === "/" || pathname === "/login") {
                    if (info.id === "ci.qapril.proprietaire") {
                        router.replace("/dashboard/login") // Redirige vers Propriétaire / Agence
                    } else if (info.id === "ci.qapril.locataire") {
                        router.replace("/mon-espace-locataire/login") // Redirige vers Locataire
                    }
                }
            } catch (err) {
                console.warn("[CAPACITOR] Pont natif non disponible :", err)
            }
        }

        checkAppId()
    }, [pathname, router])

    // Ce composant est purement logique et ne rend rien à l'écran
    return null
}
