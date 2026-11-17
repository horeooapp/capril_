"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import { 
    Play, 
    FileText, 
    Building2, 
    ShieldCheck, 
    Download, 
    ArrowRight, 
    CheckCircle2, 
    Sparkles, 
    ExternalLink,
    Film
} from "lucide-react"

interface VideoData {
    id: "fnui" | "bail"
    tag: string
    title: string
    subtitle: string
    videoSrc: string
    badgeColor: string
    description: string
    duration: string
    highlights: string[]
    actionUrl: string
    actionLabel: string
}

const VIDEOS: Record<"fnui" | "bail", VideoData> = {
    fnui: {
        id: "fnui",
        tag: "PRÉSENTATION INSTITUTIONNELLE",
        title: "Présentation QAPRIL & FNUI",
        subtitle: "L'infrastructure numérique de confiance pour l'immobilier en Côte d'Ivoire",
        videoSrc: "/videos/QAPRIL_Presentation_FNUI.mp4",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        duration: "Vidéo officielle",
        description: "Découvrez comment QAPRIL, en synergie avec la Fédération Nationale des Unions Immobilières (FNUI), standardise et modernise les pratiques locatives en Côte d'Ivoire dans le respect du Code de la Construction et de l'Habitation (CCH).",
        highlights: [
            "Cadre réglementaire officiel conforme aux lois n° 2019-576 et n° 2013-546",
            "Plafonnement légal et sécurisation des dépôts de garantie",
            "Inclusion financière pour bailleurs, locataires et professionnels de l'immobilier",
            "Émission dématérialisée de quittances de loyer avec QR code de vérification"
        ],
        actionUrl: "/a-propos",
        actionLabel: "Découvrir la mission QAPRIL"
    },
    bail: {
        id: "bail",
        tag: "DÉMONSTRATION PRATIQUE",
        title: "Enregistrement du Contrat de Bail",
        subtitle: "Guide pas-à-pas : création, signature OTP et enregistrement numérique du bail",
        videoSrc: "/videos/QAPRIL_Enregistrement_du_Bail.mp4",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        duration: "Tutoriel vidéo",
        description: "Suivez pas à pas la procédure d'enregistrement d'un contrat de bail d'habitation sur QAPRIL : de la saisie des caractéristiques du bien jusqu'à la signature par SMS OTP et la génération de l'acte scellé.",
        highlights: [
            "Rédaction simplifiée en 3 étapes sans déplacement ni intermédiaire obligatoire",
            "Calcul et contrôle automatique du plafond de 2 mois de caution",
            "Signature électronique probatoire certifiée par code SMS sécurisé",
            "Génération immédiate du contrat PDF scellé par empreinte cryptographique"
        ],
        actionUrl: "/login",
        actionLabel: "Créer un contrat de bail"
    }
}

export default function QaprilVideoShowcase() {
    const [activeVideoKey, setActiveVideoKey] = useState<"fnui" | "bail">("fnui")
    const videoRef = useRef<HTMLVideoElement>(null)

    const activeVideo = VIDEOS[activeVideoKey]

    const handleSelectVideo = (key: "fnui" | "bail") => {
        setActiveVideoKey(key)
        if (videoRef.current) {
            videoRef.current.load()
        }
    }

    return (
        <section id="videos-presentation" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-b border-slate-200">
            {/* Titre et introduction */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    <Film size={14} className="text-[#FF8200]" />
                    <span>Démonstrations & Présentations Vidéo</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Découvrez QAPRIL en images
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Visionnez nos vidéos de présentation institutionnelle et nos guides pratiques pour comprendre comment QAPRIL sécurise chaque étape du bail en Côte d&apos;Ivoire.
                </p>

                {/* Sélecteur des 2 Vidéos */}
                <div className="pt-4 flex justify-center">
                    <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 max-w-full overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => handleSelectVideo("fnui")}
                            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeVideoKey === "fnui"
                                    ? "bg-slate-950 text-white shadow-md ring-1 ring-white/10"
                                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60"
                            }`}
                        >
                            <Building2 size={15} className={activeVideoKey === "fnui" ? "text-emerald-400" : "text-slate-500"} />
                            <span>1. Présentation QAPRIL & FNUI</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSelectVideo("bail")}
                            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeVideoKey === "bail"
                                    ? "bg-slate-950 text-white shadow-md ring-1 ring-white/10"
                                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-200/60"
                            }`}
                        >
                            <FileText size={15} className={activeVideoKey === "bail" ? "text-amber-400" : "text-slate-500"} />
                            <span>2. Enregistrement du Bail</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cadre Principal du Lecteur & Descriptif */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm">
                {/* Colonne Vidéo (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl aspect-video flex items-center justify-center group">
                        <video
                            ref={videoRef}
                            key={activeVideo.videoSrc}
                            src={activeVideo.videoSrc}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain"
                        >
                            Votre navigateur ne supporte pas la lecture de vidéos HTML5.
                        </video>
                    </div>

                    {/* Barre d'outils sous le lecteur */}
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Format HD · MP4 Haute Définition
                        </span>
                        <a
                            href={activeVideo.videoSrc}
                            download
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 font-bold transition-colors"
                            title="Télécharger la vidéo pour consultation hors ligne"
                        >
                            <Download size={13} />
                            <span>Télécharger le fichier</span>
                        </a>
                    </div>
                </div>

                {/* Colonne Descriptif & Points Clés (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${activeVideo.badgeColor}`}>
                                {activeVideo.tag}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {activeVideo.duration}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                            {activeVideo.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {activeVideo.subtitle}
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {activeVideo.description}
                        </p>
                    </div>

                    {/* Liste des points forts */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Points clés de la vidéo :
                        </p>
                        {activeVideo.highlights.map((point, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>{point}</span>
                            </div>
                        ))}
                    </div>

                    {/* Call to action */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                        <Link
                            href={activeVideo.actionUrl}
                            className="qp-btn-gold-solid px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-sm"
                        >
                            <span>{activeVideo.actionLabel}</span>
                            <ArrowRight size={14} />
                        </Link>

                        {activeVideoKey === "fnui" ? (
                            <button
                                type="button"
                                onClick={() => handleSelectVideo("bail")}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                Voir le tutoriel bail →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSelectVideo("fnui")}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                                Voir la présentation FNUI →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
