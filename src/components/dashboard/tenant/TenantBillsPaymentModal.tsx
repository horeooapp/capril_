"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Droplets, 
  Zap, 
  Smartphone, 
  Wifi, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  Receipt, 
  Clock, 
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { payTenantUtilityBill, UtilityCategory } from "@/actions/utility-actions"

interface TenantBillsPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: UtilityCategory
  leaseId?: string
  defaultPhone?: string
  onPaymentSuccess?: () => void
}

const CATEGORIES: {
  id: UtilityCategory
  label: string
  sublabel: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
  providers: { id: string; name: string }[]
}[] = [
  {
    id: "EAU",
    label: "Eau",
    sublabel: "Facture SODECI & Forages",
    icon: Droplets,
    color: "text-sky-500",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    providers: [
      { id: "SODECI", name: "SODECI Côte d'Ivoire" },
      { id: "SODECI_PREPAYE", name: "SODECI Smart Meter" }
    ]
  },
  {
    id: "ELECTRICITE",
    label: "Électricité",
    sublabel: "CIE Facture & Compteur à carte",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    providers: [
      { id: "CIE_POSTPAYE", name: "CIE Facture Mensuelle" },
      { id: "CIE_PREPAYE", name: "CIE Compteur Prépayé (Token)" }
    ]
  },
  {
    id: "TELEPHONE",
    label: "Téléphone",
    sublabel: "Crédit & Pass Mobile",
    icon: Smartphone,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    providers: [
      { id: "ORANGE", name: "Orange Côte d'Ivoire" },
      { id: "MTN", name: "MTN CI" },
      { id: "MOOV", name: "Moov Africa CI" },
      { id: "WAVE", name: "Wave Crédit" }
    ]
  },
  {
    id: "INTERNET",
    label: "Internet & Box",
    sublabel: "Fibre, ADSL & 4G Home",
    icon: Wifi,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    providers: [
      { id: "ORANGE_FIBRE", name: "Orange Livebox Fibre" },
      { id: "MTN_FIBRE", name: "MTN Home & Fibre" },
      { id: "MOOV_FIBRE", name: "Moov Fibre" },
      { id: "CANALBOX", name: "Canalbox GVA" }
    ]
  }
]

const PAYMENT_METHODS = [
  { id: "WAVE", label: "Wave", badge: "0% frais", color: "bg-sky-500 text-white", ring: "ring-sky-400" },
  { id: "ORANGE_MONEY", label: "Orange Money", badge: "Instantané", color: "bg-orange-500 text-white", ring: "ring-orange-400" },
  { id: "MTN_MOMO", label: "MTN MoMo", badge: "Instantané", color: "bg-amber-400 text-slate-900 font-bold", ring: "ring-amber-300" },
  { id: "MOOV_MONEY", label: "Moov Money", badge: "Instantané", color: "bg-blue-600 text-white", ring: "ring-blue-400" },
  { id: "CARTE_BANCAIRE", label: "Carte Visa / Mastercard", badge: "Sécurisé 3DS", color: "bg-slate-900 text-white", ring: "ring-slate-400" }
]

export default function TenantBillsPaymentModal({
  isOpen,
  onClose,
  initialCategory = "EAU",
  leaseId,
  defaultPhone = "",
  onPaymentSuccess
}: TenantBillsPaymentModalProps) {
  const [category, setCategory] = useState<UtilityCategory>(initialCategory)
  const currentCategoryConfig = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  
  const [selectedProvider, setSelectedProvider] = useState<string>(currentCategoryConfig.providers[0].id)
  const [identifiant, setIdentifiant] = useState<string>("")
  const [montant, setMontant] = useState<string>("10000")
  const [paymentMethod, setPaymentMethod] = useState<string>("WAVE")
  const [phonePayer, setPhonePayer] = useState<string>(defaultPhone)
  
  const [subType, setSubType] = useState<"POSTPAYE" | "PREPAYE" | "RECHARGE_CREDIT" | "FORFAIT_INTERNET">("POSTPAYE")
  const [loading, setLoading] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  // Reset provider and subtype when category changes
  const handleCategoryChange = (newCat: UtilityCategory) => {
    setCategory(newCat)
    const conf = CATEGORIES.find(c => c.id === newCat) || CATEGORIES[0]
    setSelectedProvider(conf.providers[0].id)
    if (newCat === "ELECTRICITE") {
      setSubType(conf.providers[0].id.includes("PREPAYE") ? "PREPAYE" : "POSTPAYE")
    } else if (newCat === "TELEPHONE") {
      setSubType("RECHARGE_CREDIT")
    } else if (newCat === "INTERNET") {
      setSubType("FORFAIT_INTERNET")
    } else {
      setSubType("POSTPAYE")
    }
  }

  const handleProviderChange = (provId: string) => {
    setSelectedProvider(provId)
    if (category === "ELECTRICITE") {
      setSubType(provId.includes("PREPAYE") ? "PREPAYE" : "POSTPAYE")
    }
  }

  const handleQuickAmount = (val: number) => {
    setMontant(val.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifiant.trim()) {
      toast.error("Veuillez saisir votre numéro de compteur ou de contrat.")
      return
    }
    const numMontant = parseInt(montant, 10)
    if (isNaN(numMontant) || numMontant < 500) {
      toast.error("Le montant minimum est de 500 XOF.")
      return
    }

    setLoading(true)
    try {
      const res = await payTenantUtilityBill({
        leaseId,
        category,
        serviceName: selectedProvider,
        identifiant: identifiant.trim(),
        subType: category === "ELECTRICITE" && selectedProvider.includes("PREPAYE") ? "PREPAYE" : subType,
        montant: numMontant,
        paymentMethod: paymentMethod as any,
        payerPhone: phonePayer
      })

      if (res.error) {
        toast.error(res.error)
      } else if (res.success && res.transaction) {
        setReceiptData(res.transaction)
        toast.success("Règlement validé avec succès !")
        if (onPaymentSuccess) {
          onPaymentSuccess()
        }
      }
    } catch (err: any) {
      toast.error("Erreur de connexion au service de règlement.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(true)
    toast.success("Code copié dans le presse-papier !")
    setTimeout(() => setCopiedToken(false), 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
              <Sparkles size={11} /> Service Partenaire Certifié
            </span>
            <span className="text-slate-400 text-xs font-semibold">QAPRIL Utilities</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Règlement des Factures & Fluides
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Réglez vos factures d'eau, d'électricité, rechargez vos téléphones et Box Internet en toute sécurité.
          </p>

          {/* Onglets des catégories */}
          {!receiptData && (
            <div className="grid grid-cols-4 gap-2 mt-6">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const isActive = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all ${
                      isActive 
                        ? "bg-white text-slate-900 shadow-lg scale-102 font-bold" 
                        : "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? cat.color : "text-slate-300"} />
                    <span className="text-[11px] sm:text-xs font-extrabold mt-1 truncate w-full text-center">
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Corps : Affichage du Reçu ou Formulaire */}
        {receiptData ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Paiement Validé avec Succès !
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Votre transaction a été enregistrée et certifiée sur votre bail. Votre quittance numérique a été émise.
              </p>
            </div>

            {/* Si compteur CIE prépayé : Affichage du Token */}
            {receiptData.token && (
              <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                  <Zap size={14} className="text-amber-600" />
                  <span>Code Token Compteur CIE Prépayé (20 Chiffres)</span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-widest bg-white py-3 px-4 rounded-xl border border-amber-200 shadow-sm flex items-center justify-center gap-2">
                  <span>{receiptData.token}</span>
                  <button 
                    onClick={() => copyToClipboard(receiptData.token)}
                    className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                    title="Copier le code"
                  >
                    {copiedToken ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 font-medium">
                  Composez ce code sur votre clavier de compteur CIE pour créditer votre énergie.
                </p>
              </div>
            )}

            {/* Détails du Reçu */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Référence Transaction</span>
                <span className="font-bold text-slate-900">{receiptData.reference}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Service / Opérateur</span>
                <span className="font-bold text-slate-900">{receiptData.serviceName} ({receiptData.category})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Identifiant Compteur / Ligne</span>
                <span className="font-bold text-slate-900">{receiptData.identifiant}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Moyen de règlement</span>
                <span className="font-bold text-slate-900">{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-sans">Date & Heure</span>
                <span className="font-bold text-slate-900">
                  {new Date(receiptData.datePaiement).toLocaleString('fr-CI')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-sans">
                <span className="font-black text-slate-800">Montant Total Réglé</span>
                <span className="font-black text-emerald-700 font-mono text-base">
                  {receiptData.montant?.toLocaleString()} XOF
                </span>
              </div>
            </div>

            {/* Actions Reçu */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>Imprimer / Télécharger le Reçu</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptData(null)
                  onClose()
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Fermer & Retourner au Dashboard</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* 1. Sélection du Fournisseur / Formule */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                1. Fournisseur / Formule ({currentCategoryConfig.label})
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {currentCategoryConfig.providers.map(prov => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleProviderChange(prov.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedProvider === prov.id
                        ? "border-slate-900 bg-slate-900 text-white shadow-md font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs truncate">{prov.name}</span>
                    {selectedProvider === prov.id && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Numéro de Compteur / Ligne / Contrat */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  2. {category === "EAU" || category === "ELECTRICITE" ? "Numéro de Compteur / Référence Abonné" : category === "TELEPHONE" ? "Numéro de Téléphone" : "Identifiant Contrat / Box Fibre"}
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Requis</span>
              </div>
              <input
                type="text"
                required
                value={identifiant}
                onChange={e => setIdentifiant(e.target.value)}
                placeholder={
                  category === "EAU" 
                    ? "Ex: SOD-0482910" 
                    : category === "ELECTRICITE" 
                    ? "Ex: 1409281729 (N° compteur)" 
                    : category === "TELEPHONE" 
                    ? "Ex: 07 00 00 00 00" 
                    : "Ex: BOX-99201 ou N° ligne"
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* 3. Montant à régler */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  3. Montant à régler (XOF)
                </label>
                <span className="text-[10px] text-emerald-600 font-bold">Sans frais cachés</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={montant}
                  onChange={e => setMontant(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-lg font-bold text-slate-900"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-mono">
                  XOF
                </span>
              </div>
              
              {/* Raccourcis montants */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[2000, 5000, 10000, 20000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      montant === val.toString()
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {val.toLocaleString()} F
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Moyen de paiement */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                4. Choisissez votre moyen de paiement
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === m.id
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.color}`}>
                        {m.label.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">{m.badge}</span>
                    </div>
                    <p className="text-xs font-extrabold text-slate-800 truncate">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Note de sécurité & certification */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3 text-[11px] text-slate-500">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>
                Paiement instantané certifié QAPRIL · Reçu officiel horodaté et code STS généré immédiatement.
              </span>
            </div>

            {/* Bouton de confirmation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Validation du règlement en cours...</span>
                </>
              ) : (
                <>
                  <span>Confirmer & Régler {parseInt(montant || "0", 10).toLocaleString()} XOF</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

