"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Droplets, 
  Zap, 
  Smartphone, 
  Wifi, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  Filter, 
  ShieldCheck, 
  ArrowUpRight, 
  Search,
  Sparkles,
  Receipt
} from "lucide-react"
import { toast } from "sonner"
import TenantBillsPaymentModal from "@/components/dashboard/tenant/TenantBillsPaymentModal"
import { UtilityCategory } from "@/actions/utility-actions"

interface FacturesClientProps {
  initialFactures: any[]
  lease: any
  user: any
}

export default function FacturesClient({ initialFactures = [], lease, user }: FacturesClientProps) {
  const [factures, setFactures] = useState(initialFactures)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory>("EAU")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const openPaymentFor = (cat: UtilityCategory) => {
    setSelectedCategory(cat)
    setModalOpen(true)
  }

  const copyToken = (id: string, token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedId(id)
    toast.success("Code compteur copié !")
    setTimeout(() => setCopiedId(null), 3000)
  }

  // Filter factures
  const filteredFactures = factures.filter(f => {
    if (filterType === "ALL") return true
    if (filterType === "EAU") return f.typeUtility === "SODECI"
    if (filterType === "ELEC") return f.typeUtility === "CIE"
    if (filterType === "TEL") return ["ORANGE", "MTN", "MOOV"].includes(f.typeUtility) && !f.source?.includes("FIBRE")
    if (filterType === "NET") return f.typeUtility === "CANAL_PLUS" || f.source?.includes("FIBRE")
    return true
  })

  // Calculate totals
  const totalPaid = factures
    .filter(f => f.statut === "PAYEE")
    .reduce((sum, f) => sum + (f.montant || 0), 0)

  const eauPaid = factures
    .filter(f => f.typeUtility === "SODECI" && f.statut === "PAYEE")
    .reduce((sum, f) => sum + (f.montant || 0), 0)

  const elecPaid = factures
    .filter(f => f.typeUtility === "CIE" && f.statut === "PAYEE")
    .reduce((sum, f) => sum + (f.montant || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Actions Rapides */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Gestionnaire des Utilités Locatives · Rule 3.4
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Règlement des Factures & Fluides
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium">
            Réglez instantanément vos consommations d'eau, d'électricité, rechargez vos forfaits de téléphone et vos abonnements Internet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openPaymentFor("EAU")}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Nouveau règlement</span>
          </button>
        </div>
      </div>

      {/* 2. Les 4 Cartes de Services (Eau, Électricité, Téléphone, Internet) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* EAU */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Droplets size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full">
              SODECI & Forages
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Factures d'Eau</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Réglez votre facture bimestrielle SODECI ou créditez votre compteur d'eau divisionnaire.
            </p>
          </div>
          <button
            onClick={() => openPaymentFor("EAU")}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Régler l'eau</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* ÉLECTRICITÉ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Zap size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
              CIE · Postpayé / Prépayé
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Électricité (CIE)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Paiement de facture mensuelle ou recharge compteur à carte avec génération de code Token 20 chiffres.
            </p>
          </div>
          <button
            onClick={() => openPaymentFor("ELECTRICITE")}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Régler l'électricité</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* TÉLÉPHONE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Smartphone size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Orange · MTN · Moov
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Téléphone Mobile</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Rechargez instantanément votre crédit de communication ou achetez des forfaits voix et internet mobile.
            </p>
          </div>
          <button
            onClick={() => openPaymentFor("TELEPHONE")}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Recharger mobile</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* INTERNET & BOX */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Wifi size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Fibre · 4G · Canalbox
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">Internet & Box</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Réglez votre abonnement mensuel Livebox, MTN Fibre, Moov Fibre ou Canalbox sans interruption.
            </p>
          </div>
          <button
            onClick={() => openPaymentFor("INTERNET")}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Régler Box Internet</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

      </div>

      {/* 3. Statistiques & Récapitulatif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Réglé (Utilités)</p>
            <p className="text-3xl font-black font-mono mt-1 text-white">{totalPaid.toLocaleString()} XOF</p>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} /> Certifié conforme
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
            <Receipt size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Règlements Électricité & Eau</p>
            <p className="text-2xl font-black font-mono mt-1 text-slate-800">
              {(elecPaid + eauPaid).toLocaleString()} XOF
            </p>
            <p className="text-[10px] text-slate-400 mt-1">CIE: {elecPaid.toLocaleString()} F · SODECI: {eauPaid.toLocaleString()} F</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Zap size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bonus Score ICL</p>
            <p className="text-2xl font-black font-mono mt-1 text-emerald-600">
              +{Math.min(factures.length * 5, 50)} Pts
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Prime de régularité locative</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* 4. Historique des Règlements */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Historique des Règlements</h2>
            <p className="text-xs text-slate-400 font-medium">Reçus fiscaux, tokens et références de transactions</p>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "Tous" },
              { id: "EAU", label: "Eau" },
              { id: "ELEC", label: "Électricité" },
              { id: "TEL", label: "Téléphone" },
              { id: "NET", label: "Internet" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  filterType === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredFactures.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredFactures.map((facture, idx) => {
              const isElec = facture.typeUtility === "CIE"
              const isEau = facture.typeUtility === "SODECI"
              const isNet = facture.typeUtility === "CANAL_PLUS" || facture.source?.includes("FIBRE")
              const Icon = isEau ? Droplets : isElec ? Zap : isNet ? Wifi : Smartphone
              const iconColor = isEau ? "text-sky-500 bg-sky-50" : isElec ? "text-amber-500 bg-amber-50" : isNet ? "text-indigo-500 bg-indigo-50" : "text-emerald-500 bg-emerald-50"

              return (
                <div key={facture.id || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-3 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {facture.typeUtility} · {isEau ? "Facture d'Eau" : isElec ? "Électricité CIE" : isNet ? "Box Internet" : "Crédit Mobile"}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Payée
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Réf: {facture.identifiant || facture.identifiantCompteur} · {new Date(facture.datePaiement || facture.createdAt).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {/* Si token CIE présent */}
                      {facture.token && (
                        <div className="inline-flex items-center gap-1.5 mt-1 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border border-amber-200">
                          <span>Token: {facture.token}</span>
                          <button 
                            onClick={() => copyToken(facture.id, facture.token)}
                            className="hover:text-amber-600 transition-colors ml-1"
                            title="Copier le code"
                          >
                            {copiedId === facture.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center">
                    <span className="font-black font-mono text-base text-slate-900">
                      {facture.montant?.toLocaleString()} XOF
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {facture.source || "Paiement Mobile"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Receipt size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Aucun règlement enregistré</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Vous n'avez pas encore effectué de règlement pour vos factures d'eau, d'électricité, de téléphone ou d'internet.
            </p>
            <button
              onClick={() => openPaymentFor("EAU")}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              <Plus size={14} />
              <span>Régler ma première facture</span>
            </button>
          </div>
        )}

      </div>

      {/* Modal interactif */}
      <TenantBillsPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCategory={selectedCategory}
        leaseId={lease?.id}
        defaultPhone={user?.phone || ""}
        onPaymentSuccess={() => {
          window.location.reload()
        }}
      />

    </div>
  )
}
