"use client"

import { useEffect, useState } from "react"
import { savePushToken } from "@/actions/notification.actions"
import { BellRing, ShieldCheck, X } from "lucide-react"

export default function PushRegistration() {
    const [showBanner, setShowBanner] = useState(false)
    const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default')

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
            setStatus('unsupported')
            return
        }

        setStatus(Notification.permission)
        if (Notification.permission === 'default') {
            const timer = setTimeout(() => setShowBanner(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const subscribeToPush = async () => {
        try {
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                console.warn("[PUSH] VAPID Public Key non configurée dans l'environnement.")
                setShowBanner(false)
                return
            }

            const permission = await Notification.requestPermission()
            setStatus(permission)
            setShowBanner(false)

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.register('/sw.js')
                let subscription = await registration.pushManager.getSubscription()

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    })
                }

                await savePushToken(JSON.stringify(subscription))
            }
        } catch (error) {
            console.warn("[PUSH] Inscription push ignorée ou non supportée:", error)
        }
    }

    if (!showBanner || status !== 'default') return null

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[400px] bg-slate-900 text-white p-5 rounded-2xl shadow-2xl z-[100] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
                onClick={() => setShowBanner(false)}
                className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors"
            >
                <X size={18} />
            </button>
            <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                    <BellRing size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-base mb-1">Activer les alertes intelligentes ?</h3>
                    <p className="text-sm text-white/60 mb-4 leading-relaxed">
                        Recevez des notifications en temps réel pour les risques d'impayés, les baux expirants et les alertes fiscales.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={subscribeToPush}
                            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors flex items-center gap-2"
                        >
                            <ShieldCheck size={16} />
                            Activer maintenant
                        </button>
                        <button 
                            onClick={() => setShowBanner(false)}
                            className="text-white/60 text-sm font-medium hover:text-white transition-colors"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}
