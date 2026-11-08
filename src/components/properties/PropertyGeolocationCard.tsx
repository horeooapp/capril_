"use client"

import { useState } from "react"
import { MapPin, Navigation, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react"
import { enregistrerPositionGpsBien } from "@/actions/property.actions"

interface PropertyGeolocationCardProps {
    propertyId: string
    initialLatitude?: number | null
    initialLongitude?: number | null
    initialPrecisionM?: number | null
    initialStatut?: string | null
    initialCodeLocalisation?: string | null
    initialW3w?: string | null
    commune: string
    isOwnerOrManager: boolean
}

export default function PropertyGeolocationCard({
    propertyId,
    initialLatitude,
    initialLongitude,
    initialPrecisionM,
    initialStatut,
    initialCodeLocalisation,
    initialW3w,
    commune,
    isOwnerOrManager
}: PropertyGeolocationCardProps) {
    const [latitude, setLatitude] = useState<number | null>(initialLatitude ?? null)
    const [longitude, setLongitude] = useState<number | null>(initialLongitude ?? null)
    const [precisionM, setPrecisionM] = useState<number | null>(initialPrecisionM ?? null)
    const [statut, setStatut] = useState<string>(initialStatut || "MANQUANTE")
    const [codeLocalisation, setCodeLocalisation] = useState<string | null>(initialCodeLocalisation ?? null)
    const [w3w, setW3w] = useState<string | null>(initialW3w ?? null)

    const [isLocating, setIsLocating] = useState(false)
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const handleCaptureGps = () => {
        if (!navigator.geolocation) {
            setFeedback({
                type: 'error',
                message: "La géolocalisation n'est pas prise en charge par votre navigateur."
            })
            return
        }

        setIsLocating(true)
        setFeedback(null)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                const accuracy = Math.round(position.coords.accuracy)

                // RG-GEO-04 : précision maximale acceptée 50 m
                if (accuracy > 50) {
                    setIsLocating(false)
                    setFeedback({
                        type: 'error',
                        message: `Précision GPS insuffisante (±${accuracy} m). La norme ivoirienne requiert une précision ≤ 50 m. Veuillez vous rapprocher d'une fenêtre ou sortir à l'extérieur.`
                    })
                    return
                }

                try {
                    const res = await enregistrerPositionGpsBien({
                        propertyId,
                        lat,
                        lng,
                        precisionM: accuracy
                    })

                    if (res.success) {
                        setLatitude(lat)
                        setLongitude(lng)
                        setPrecisionM(accuracy)
                        if (res.statutPosition) setStatut(res.statutPosition)
                        if (res.codeLocalisation) setCodeLocalisation(res.codeLocalisation)
                        if (res.w3w) setW3w(res.w3w)
                        setFeedback({
                            type: 'success',
                            message: res.message || "Position GPS certifiée avec succès !"
                        })
                    } else {
                        setFeedback({
                            type: 'error',
                            message: res.error || "Impossible d'enregistrer la position GPS."
                        })
                    }
                } catch (err: any) {
                    setFeedback({
                        type: 'error',
                        message: err.message || "Erreur de communication avec le serveur."
                    })
                } finally {
                    setIsLocating(false)
                }
            },
            (geoError) => {
                setIsLocating(false)
                let message = "Impossible d'accéder à votre position GPS."
                if (geoError.code === geoError.PERMISSION_DENIED) {
                    message = "Accès à la position refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur."
                } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
                    message = "Signal GPS indisponible. Veuillez vérifier que votre puce GPS est activée."
                } else if (geoError.code === geoError.TIMEOUT) {
                    message = "Le délai d'attente du signal GPS est dépassé. Veuillez réessayer."
                }
                setFeedback({ type: 'error', message })
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        )
    }

    const hasGps = latitude !== null && longitude !== null
    const isConfirmed = statut === "CONFIRMEE"

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">Géolocalisation & Adressage MaPoste</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                ADD-28
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Coordonnées satellitaires et adresse numérique certifiée conformes aux normes La Poste CI.
                        </p>
                    </div>
                </div>

                {/* Badge statut */}
                <div>
                    {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            Position Confirmée (Concordance 100%)
                        </span>
                    ) : hasGps ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <CheckCircle2 size={14} className="text-blue-600" />
                            Position Déclarée (Bailleur)
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle size={14} className="text-amber-600" />
                            Position Manquante
                        </span>
                    )}
                </div>
            </div>

            {/* Détails géographiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Latitude</p>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                        {latitude !== null ? `${latitude.toFixed(6)}° N` : 'Non renseignée'}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Longitude</p>
                    <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                        {longitude !== null ? `${longitude.toFixed(6)}° W` : 'Non renseignée'}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Précision Satellite</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {precisionM !== null ? `± ${precisionM} mètres` : 'Inconnue'}
                    </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Code Localisation</p>
                    <p className="text-sm font-black text-emerald-900 font-mono mt-0.5">
                        {codeLocalisation || 'En attente'}
                    </p>
                </div>
            </div>

            {w3w && (
                <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-200/80 rounded-xl px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-950">Adresse 3 mots simplifiée :</span>
                        <span className="font-mono font-bold text-emerald-700">{w3w}</span>
                    </div>
                    {hasGps && (
                        <a
                            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                            <span>Voir sur la carte</span>
                            <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            )}

            {/* Message de feedback */}
            {feedback && (
                <div className={`p-4 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
                    feedback.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {feedback.type === 'success' ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Bouton d'action pour le propriétaire */}
            {isOwnerOrManager && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                        {hasGps 
                            ? "Vous pouvez actualiser la position si vous êtes physiquement présent à l'adresse du bien."
                            : "Appuyez sur le bouton ci-contre pour capturer automatiquement les coordonnées GPS de ce bien."}
                    </p>
                    <button
                        type="button"
                        onClick={handleCaptureGps}
                        disabled={isLocating}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#1B4D3E] hover:bg-[#153e32] active:bg-[#0f2d24] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    >
                        {isLocating ? (
                            <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Acquisition satellite...</span>
                            </>
                        ) : (
                            <>
                                <Navigation size={14} />
                                <span>{hasGps ? "Actualiser ma position GPS sur place" : "Récupérer ma position GPS actuelle"}</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}

