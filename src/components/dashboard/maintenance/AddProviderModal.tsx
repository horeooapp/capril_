"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Wrench, ShieldCheck, Phone, MapPin, X, Check, AlertCircle, 
    BookOpen, DollarSign, Clock, Award, Building2, Flame, Droplet, 
    Zap, Home, Paintbrush, Hammer, ChevronRight, HelpCircle, Info
} from "lucide-react"
import { toast } from "sonner"
import { createProvider, CreateProviderInput } from "@/actions/provider-actions"

interface AddProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProviderAdded: () => void;
}

const CORPS_DE_METIER = [
    { id: "PLOMBERIE", label: "Plomberie & Assainissement", icon: <Droplet className="text-blue-500" size={18} />, desc: "Canalisations, sanitaires, surpresseurs, fosses, recherche de fuite" },
    { id: "ELECTRICITE", label: "Électricité CFO / CFA", icon: <Zap className="text-amber-500" size={18} />, desc: "Tableaux électriques, disjoncteurs, terre, éclairage, interphonie" },
    { id: "CLIMATISATION", label: "Climatisation & Froid", icon: <Flame className="text-cyan-500" size={18} />, desc: "Split Inverter, VRV, frigoristes certifiés, entretien & gaz R32/R410A" },
    { id: "MACONNERIE", label: "Maçonnerie & Gros Œuvre", icon: <Building2 className="text-stone-500" size={18} />, desc: "Fissures, dalles, chapes, reprises sous œuvre, cloisons & enduits" },
    { id: "SERRURERIE", label: "Serrurerie & Métallerie", icon: <ShieldCheck className="text-emerald-500" size={18} />, desc: "Serrures multipoints, blindage, grilles de défense, rideaux métalliques" },
    { id: "ETANCHEITE", label: "Étanchéité Toitures & Terrasses", icon: <Home className="text-indigo-500" size={18} />, desc: "Membranes bitumineuses, étanchéité liquide, solins, bacs alu" },
    { id: "PEINTURE", label: "Peinture & Revêtements", icon: <Paintbrush className="text-rose-500" size={18} />, desc: "Peintures tropicales anti-moisissures, revêtements sol, ponçage" },
    { id: "MENUISERIE", label: "Menuiserie Bois & Aluminium", icon: <Hammer className="text-orange-500" size={18} />, desc: "Baies vitrées, portes isoplanes, placards, vitrerie feuilletée" },
]

const COMMUNES_ABIDJAN = [
    "Cocody (Angré, Danga, Riviera, Palmeraie, II Plateaux)",
    "Plateau (Centre des affaires)",
    "Marcory (Zone 4, Biétry, Résidentiel)",
    "Yopougon (Maroc, Selmer, Niangon, Toit Rouge)",
    "Bingerville",
    "Port-Bouët (Vridi, Aéroport)",
    "Koumassi",
    "Treichville",
    "Abobo",
    "Attécoubé",
    "Adjamé",
    "Grand-Bassam",
    "Songon"
]

const SOUS_SPECIALITES_MAP: Record<string, string[]> = {
    PLOMBERIE: ["Recherche de fuite non destructive", "Débouchage hydrocureur haute pression", "Remplacement colonne montante", "Installation surpresseur & réservoir tampon", "Curage & vidange fosse septique"],
    ELECTRICITE: ["Mise en conformité tableau 30mA", "Mesure & installation piquet de terre (<50Ω)", "Protection parafoudre & surtension réseau", "Équilibrage de phases triphasé", "Câblage interphone & gâche électrique"],
    CLIMATISATION: ["Dépannage carte électronique inverter", "Recharge fluide frigorigène R32/R410A", "Nettoyage antibactérien & dégraissage turbines", "Installation split multisplit gainable", "Contrat d'entretien trimestriel préventif"],
    MACONNERIE: ["Reprise de fissures structurelles", "Pose de carrelage grand format", "Chape hydrofuge de salle d'eau", "Ouverture de baie porte/fenêtre", "Crépissage extérieur étanche"],
    SERRURERIE: ["Ouverture de porte claquée sans dégât", "Remplacement serrure 3 ou 5 points", "Pose cornière anti-pince & judas optique", "Fabrication grille de sécurité forgée", "Motorisation de portail battant/coulissant"],
    ETANCHEITE: ["Étanchéité bicouche SBS thermosoudée", "Résine polyuréthane liquide (SEL)", "Recherche d'infiltrations par fumigène", "Réfection couvertines et acrotères", "Garantie décennale étanchéité dalle"],
    PEINTURE: ["Traitement anti-salpêtre et humidité", "Peinture acrylique satinée lavable", "Enduit gros et fin repassé", "Peinture de façade hydrofuge pliolite", "Rénovation de boiseries & vernis"],
    MENUISERIE: ["Réglage baies vitrées coulissantes alu", "Remplacement roulettes & joints brosse", "Pose verres feuilletés sécurité 44.2", "Ajustement portes rabotées", "Agencement placards mélamine hydrofuge"]
}

const HABILITATIONS_LIST = [
    { id: "CIE", label: "Habilitation Électrique CIE (BR/B1V)", desc: "Autorise les interventions sécurisées sur réseaux sous tension ou voisinage CIE" },
    { id: "SODECI", label: "Agrément Plomberie SODECI", desc: "Reconnu pour raccordements compteurs et colonnes de distribution d'eau" },
    { id: "RC_PRO", label: "Assurance RC Professionnelle à jour", desc: "Couvre les dommages corporels et matériels causés au logement ou aux voisins" },
    { id: "DECENNALE", label: "Garantie Décennale Travaux (10 ans)", desc: "Obligatoire sur les gros œuvres, dalles et étanchéités de toiture" },
    { id: "CNMCI", label: "Carte Artisan CNMCI (Chambre des Métiers)", desc: "Immatriculation officielle au Registre National des Artisans de Côte d'Ivoire" },
    { id: "FGAS", label: "Agrément Fluides Frigorigènes F-Gaz", desc: "Attestation de capacité pour la manipulation écologique des gaz de clim" },
]

export default function AddProviderModal({ isOpen, onClose, onProviderAdded }: AddProviderModalProps) {
    const [step, setStep] = useState<number>(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showKnowledgeGuide, setShowKnowledgeGuide] = useState(true)

    // Form State
    const [nom, setNom] = useState("")
    const [statutJuridique, setStatutJuridique] = useState("Artisan Indépendant Certifié")
    const [telephone, setTelephone] = useState("")
    const [telephoneUrgence, setTelephoneUrgence] = useState("")
    const [email, setEmail] = useState("")
    const [rccm, setRccm] = useState("")
    const [experienceAnnees, setExperienceAnnees] = useState<number>(6)

    const [specialite, setSpecialite] = useState("PLOMBERIE")
    const [sousSpecialites, setSousSpecialites] = useState<string[]>([])
    const [certifications, setCertifications] = useState<string[]>([])

    const [commune, setCommune] = useState("Cocody (Angré, Danga, Riviera, Palmeraie, II Plateaux)")
    const [zonesIntervention, setZonesIntervention] = useState<string[]>(["Cocody (Angré, Danga, Riviera, Palmeraie, II Plateaux)", "Marcory (Zone 4, Biétry, Résidentiel)"])
    const [delaiIntervention, setDelaiIntervention] = useState("Moins de 2h (Urgence)")
    const [disponible247, setDisponible247] = useState(true)

    const [tauxHoraire, setTauxHoraire] = useState<number>(15000)
    const [forfaitDeplacement, setForfaitDeplacement] = useState<number>(10000)
    const [garantieMois, setGarantieMois] = useState<number>(3)
    const [moyensPaiement, setMoyensPaiement] = useState<string[]>(["WAVE", "ORANGE_MONEY", "VIREMENT"])
    const [description, setDescription] = useState("")

    if (!isOpen) return null

    const toggleSousSpecialite = (item: string) => {
        setSousSpecialites(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item])
    }

    const toggleZone = (z: string) => {
        setZonesIntervention(prev => prev.includes(z) ? prev.filter(item => item !== z) : [...prev, z])
    }

    const toggleCertification = (c: string) => {
        setCertifications(prev => prev.includes(c) ? prev.filter(item => item !== c) : [...prev, c])
    }

    const togglePaiement = (p: string) => {
        setMoyensPaiement(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nom.trim()) {
            toast.error("Veuillez renseigner le nom ou la raison sociale de l'artisan.")
            setStep(1)
            return
        }
        if (!telephone.trim()) {
            toast.error("Le numéro de téléphone principal est obligatoire.")
            setStep(1)
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading("Enregistrement de l'artisan avec grille de compétences...")

        try {
            const currentTrade = CORPS_DE_METIER.find(m => m.id === specialite)?.label || specialite

            const input: CreateProviderInput = {
                nom,
                specialite: currentTrade,
                telephone,
                telephoneUrgence: telephoneUrgence || undefined,
                email: email || undefined,
                commune,
                zonesIntervention,
                rccm: rccm || undefined,
                statutJuridique,
                certifications,
                sousSpecialites,
                description,
                experienceAnnees,
                tauxHoraire,
                forfaitDeplacement,
                delaiIntervention,
                disponible247,
                garantieMois,
                noteMoyenne: 5.0,
                moyensPaiement
            }

            const res = await createProvider(input)

            if (res.success) {
                toast.success(`Artisan « ${nom} » ajouté avec succès au répertoire d'intervention !`, { id: toastId })
                onProviderAdded()
                onClose()
            } else {
                toast.error(res.error || "Une erreur est survenue lors de l'enregistrement.", { id: toastId })
            }
        } catch (err: any) {
            toast.error(err?.message || "Erreur réseau lors de l'ajout.", { id: toastId })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center relative border-b border-slate-700/60">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                            <Wrench size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black tracking-tight text-white uppercase">
                                    Référencer un Nouvel Artisan & Prestataire
                                </h2>
                                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest">
                                    Conforme CCH
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Constitution d'un carnet d'adresses qualifié pour la maintenance locative et l'assistance d'urgence.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowKnowledgeGuide(!showKnowledgeGuide)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                showKnowledgeGuide 
                                    ? "bg-amber-400 text-slate-950 shadow-md" 
                                    : "bg-slate-800 text-amber-300 border border-amber-400/40 hover:bg-slate-700"
                            }`}
                        >
                            <BookOpen size={14} />
                            {showKnowledgeGuide ? "Masquer Guide Légal" : "Afficher Guide Légal CCH"}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors border border-slate-700"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Stepper Tabs Bar */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold overflow-x-auto gap-2">
                    {[
                        { id: 1, title: "1. Identité & Légal", icon: Building2 },
                        { id: 2, title: "2. Corps d'état & Agréments", icon: Award },
                        { id: 3, title: "3. Zones & Disponibilité", icon: MapPin },
                        { id: 4, title: "4. Grille Tarifaire & Délais", icon: DollarSign },
                    ].map(s => {
                        const Icon = s.icon
                        const isActive = step === s.id
                        const isDone = step > s.id
                        return (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-slate-900 text-white shadow-sm" 
                                        : isDone 
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                }`}
                            >
                                <Icon size={14} />
                                <span>{s.title}</span>
                                {isDone && <Check size={12} className="text-emerald-600 ml-1" />}
                            </button>
                        )
                    })}
                </div>

                {/* Modal Body: Two Columns (Form + Knowledge Guide) */}
                <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
                    {/* Left/Main Column: Form */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
                        {/* STEP 1: Identité */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                        <Building2 className="text-amber-500" size={18} />
                                        Renseignements Généraux & Structure Légale
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Renseignez les coordonnées vérifiables de l'artisan ou de l'entreprise de maintenance.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Raison Sociale ou Nom de l'Artisan *
                                        </label>
                                        <input
                                            type="text"
                                            value={nom}
                                            onChange={e => setNom(e.target.value)}
                                            placeholder="Ex: Kouassi Climatisation SARL / Maître Électricien Amadou"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Statut Juridique & Structure
                                        </label>
                                        <select
                                            value={statutJuridique}
                                            onChange={e => setStatutJuridique(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                                        >
                                            <option value="Artisan Indépendant Certifié">Artisan Indépendant (Chambre des Métiers)</option>
                                            <option value="Entreprise Individuelle (EI)">Entreprise Individuelle (EI)</option>
                                            <option value="SARL / SAS BTP">Société BTP (SARL / SAS)</option>
                                            <option value="Groupement Artisanal (GIE)">Groupement d'Artisans (GIE)</option>
                                            <option value="Compagnon du Devoir">Compagnon / Maître Artisan Recommandé</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Numéro RCCM / DFE ou Carte CNMCI
                                        </label>
                                        <input
                                            type="text"
                                            value={rccm}
                                            onChange={e => setRccm(e.target.value)}
                                            placeholder="Ex: CI-ABJ-2023-B-12345 / CNMCI-7782"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Téléphone Direct d'Intervention *
                                        </label>
                                        <input
                                            type="tel"
                                            value={telephone}
                                            onChange={e => setTelephone(e.target.value)}
                                            placeholder="Ex: +225 07 00 11 22 33"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                            <span>Téléphone d'Astreinte (Nuit / Urgences)</span>
                                            <span className="text-[10px] text-amber-600 font-bold">24h/7j</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={telephoneUrgence}
                                            onChange={e => setTelephoneUrgence(e.target.value)}
                                            placeholder="Ex: +225 01 22 33 44 55"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Adresse Email Professionnelle
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="Ex: contact@artisan-pro.ci"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Années d'Expérience du Métier
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={experienceAnnees}
                                            onChange={e => setExperienceAnnees(Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: Métiers & Compétences */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                        <Award className="text-amber-500" size={18} />
                                        Corps de Métier Principal & Spécialisations Pointues
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Sélectionnez la spécialité dominante et les interventions spécifiques maîtrisées.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Corps d'état principal (Sélectionnez un domaine) :
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {CORPS_DE_METIER.map(c => {
                                            const isSelected = specialite === c.id
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSpecialite(c.id)
                                                        // Pre-select some common sub-skills
                                                        const defaults = SOUS_SPECIALITES_MAP[c.id] || []
                                                        setSousSpecialites(defaults.slice(0, 3))
                                                    }}
                                                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                                                        isSelected 
                                                            ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20 shadow-sm" 
                                                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className="mt-0.5">{c.icon}</div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-900">{c.label}</h4>
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">{c.desc}</p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {SOUS_SPECIALITES_MAP[specialite] && (
                                    <div className="space-y-2 pt-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Sous-spécialités & Interventions Précises :
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {SOUS_SPECIALITES_MAP[specialite].map(item => {
                                                const isChecked = sousSpecialites.includes(item)
                                                return (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() => toggleSousSpecialite(item)}
                                                        className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all border ${
                                                            isChecked 
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {isChecked && <Check size={12} className="text-amber-400" />}
                                                        <span>{item}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                        <span>Agréments, Assurances & Certifications Officielles</span>
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">Sécurité QAPRIL</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {HABILITATIONS_LIST.map(h => {
                                            const isChecked = certifications.includes(h.id)
                                            return (
                                                <button
                                                    key={h.id}
                                                    type="button"
                                                    onClick={() => toggleCertification(h.id)}
                                                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                                        isChecked 
                                                            ? "bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500/20" 
                                                            : "bg-white border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border ${isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"}`}>
                                                        {isChecked && <Check size={12} />}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-[11.5px] font-black text-slate-900">{h.label}</h5>
                                                        <p className="text-[10.5px] text-slate-500 leading-tight">{h.desc}</p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: Couverture Territoriale */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                        <MapPin className="text-amber-500" size={18} />
                                        Secteur d'Intervention & Délais d'Astreinte
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Définissez où l'artisan opère et son délai garanti de prise en charge des sinistres.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Commune de Domiciliation / Atelier Principal
                                    </label>
                                    <select
                                        value={commune}
                                        onChange={e => setCommune(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                                    >
                                        {COMMUNES_ABIDJAN.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Communes Desservies en Priorité (Cochez pour inclure) :
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {COMMUNES_ABIDJAN.map(z => {
                                            const isSelected = zonesIntervention.includes(z)
                                            return (
                                                <button
                                                    key={z}
                                                    type="button"
                                                    onClick={() => toggleZone(z)}
                                                    className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all border ${
                                                        isSelected 
                                                            ? "bg-slate-900 text-white border-slate-900" 
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} className="text-amber-400" />}
                                                    <span>{z.split(" (")[0]}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Délai Moyen d'Intervention en Urgence
                                        </label>
                                        <select
                                            value={delaiIntervention}
                                            onChange={e => setDelaiIntervention(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                                        >
                                            <option value="Moins de 2h (Urgence vitale)">Moins de 2h (Dégât des eaux / Court-circuit)</option>
                                            <option value="Sous 4h (Demi-journée)">Sous 4h (Demi-journée)</option>
                                            <option value="Dans les 24h">Dans les 24h ouvrées</option>
                                            <option value="Sur rendez-vous (48h)">Sur rendez-vous planifié (48h)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Disponibilité Nuit & Week-end (Astreinte 24/7)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setDisponible247(!disponible247)}
                                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                                                disponible247 
                                                    ? "bg-amber-50 text-amber-900 border-amber-300" 
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                            }`}
                                        >
                                            <span>{disponible247 ? "✅ Oui, joignable 24h/7j et jours fériés" : "❌ Non, heures ouvrables uniquement"}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-white shadow-sm">
                                                {disponible247 ? "Astreinte Active" : "Horaires Bureau"}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: Tarifs & Modalités */}
                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                        <DollarSign className="text-amber-500" size={18} />
                                        Cadre Tarifaire, Garanties & Modalités de Paiement
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Assurez la transparence financière des dépannages pour éviter les litiges entre propriétaires et locataires.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Taux Horaire Indicatif (FCFA/h)
                                        </label>
                                        <input
                                            type="number"
                                            step={1000}
                                            value={tauxHoraire}
                                            onChange={e => setTauxHoraire(Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                        <span className="text-[10px] text-slate-400">Tarif standard recommandé : 10 000 à 25 000 FCFA/h</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Forfait Déplacement / Diagnostic (FCFA)
                                        </label>
                                        <input
                                            type="number"
                                            step={1000}
                                            value={forfaitDeplacement}
                                            onChange={e => setForfaitDeplacement(Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
                                        />
                                        <span className="text-[10px] text-slate-400">Déductible du devis si intervention réalisée</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Garantie sur Réparations (Mois)
                                        </label>
                                        <select
                                            value={garantieMois}
                                            onChange={e => setGarantieMois(Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500 bg-white"
                                        >
                                            <option value={1}>1 mois (Dépannages simples / Débouchage)</option>
                                            <option value={3}>3 mois (Norme standard QAPRIL)</option>
                                            <option value={6}>6 mois (Changement de pièces neuves)</option>
                                            <option value={12}>1 an (Rénovation complète d'installation)</option>
                                            <option value={120}>10 ans (Garantie Décennale Étanchéité/Gros Œuvre)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Modes de Règlement Acceptés
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {["WAVE", "ORANGE_MONEY", "MTN_MOMO", "VIREMENT", "SEQUESTRE_QAPRIL"].map(mode => {
                                                const isChecked = moyensPaiement.includes(mode)
                                                return (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => togglePaiement(mode)}
                                                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                                                            isChecked 
                                                                ? "bg-slate-900 text-white border-slate-900" 
                                                                : "bg-white text-slate-600 border-slate-200"
                                                        }`}
                                                    >
                                                        {mode.replace("_", " ")}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Notes & Engagements Particuliers (Optionnel)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Ex: Équipé d'un camion atelier, habilité à travailler sur les chantiers Ivoiris, devis gratuit transmis sous 2h par WhatsApp..."
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Précédent
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <span>Suivant ({step}/4)</span>
                                    <ChevronRight size={14} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? "Enregistrement en cours..." : "Valider & Enregistrer l'Artisan"}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Right Column: Educational Knowledge Base & Legal CCH Reference */}
                    <AnimatePresence>
                        {showKnowledgeGuide && (
                            <motion.div 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "100%", maxWidth: "340px" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="bg-slate-50/80 border-t lg:border-t-0 lg:border-l border-slate-200/90 p-5 space-y-4 overflow-y-auto text-xs"
                            >
                                <div className="flex items-center gap-2 text-amber-700 font-black uppercase tracking-wider border-b border-amber-200/60 pb-2">
                                    <BookOpen size={16} />
                                    <span>Guide Pratique & Règles CCH</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                                            <Info size={14} className="text-amber-500 shrink-0" />
                                            <span>Répartition des Travaux (Art. 422 CCH)</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            <strong>À la charge du Locataire :</strong> entretien courant et menues réparations (remplacement des joints de robinetterie, ampoules, siphons engorgés, filtres de climatiseurs).
                                        </p>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            <strong>À la charge du Bailleur :</strong> vétusté, colonnes montantes d'eau/électricité, infiltrations de toiture, défauts majeurs de tuyauterie encastrée.
                                        </p>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                                            <Zap size={14} className="text-amber-500 shrink-0" />
                                            <span>Normes Électriques en Côte d'Ivoire</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            En zone orageuse et tropicale, un piquet de terre conforme (&lt;50 Ohms) et un interrupteur différentiel 30mA sont cruciaux pour prévenir les risques d'électrocution et d'incendies domestiques.
                                        </p>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-black text-slate-900">
                                            <Droplet size={14} className="text-blue-500 shrink-0" />
                                            <span>Gestion des Fuites & Dégâts des Eaux</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            Une fuite non traitée sous 2h cause en moyenne 450 000 FCFA de sinistres indirects (plafonds, peintures voisines). Privilégiez des artisans équipés de détecteurs acoustiques ou caméras d'inspection.
                                        </p>
                                    </div>

                                    <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <ShieldCheck size={14} className="text-amber-600" />
                                            <span>Paiement Séquestre QAPRIL</span>
                                        </div>
                                        <p className="text-[11px] text-amber-800 leading-relaxed">
                                            Les fonds du bon de maintenance peuvent être bloqués en séquestre et ne sont débloqués à l'artisan qu'après visa et signature du procès-verbal par le locataire ou l'agence.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
