"use client"

import { motion } from "framer-motion"
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  Clock, 
  LayoutDashboard,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  User
} from "lucide-react"
import { DiasporaService, DIASPORA_CURRENCIES } from "@/lib/diaspora-service"
import { useState, useEffect } from "react"
import MandatManagement from "./MandatManagement"

interface DiasporaDashboardProps {
  data: any
  user: any
}

export default function DiasporaDashboard({ data: initialData, user }: DiasporaDashboardProps) {
  const [data, setData] = useState(initialData)
  const [view, setView] = useState<'overview' | 'mandates'>('overview')
  const currency = user.diasporaDevise || "FCFA"
  const currencyConfig = DIASPORA_CURRENCIES[currency]

  const stats = [
    { 
      label: "Patrimoine Global", 
      value: initialData.stats.totalRentFcfa, 
      deviseValue: initialData.stats.totalRentDevise,
      icon: <Building2 className="text-ivoire-orange" />, 
      color: "bg-orange-50" 
    },
    { 
      label: "Taux d'Occupation", 
      value: `${initialData.stats.occupancyRate}%`, 
      icon: <TrendingUp className="text-green-600" />, 
      color: "bg-green-50" 
    },
    { 
      label: "Mandataires Actifs", 
      value: initialData.mandats.length, 
      icon: <Users className="text-blue-600" />, 
      color: "bg-blue-50" 
    },
    { 
      label: "Pays de Résidence", 
      value: user.paysResidence || "Non défini", 
      icon: <Globe className="text-purple-600" />, 
      color: "bg-purple-50" 
    },
  ]

  return (
    <div className="space-y-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tighter text-ivoire-dark"
          >
            Dashboard <span className="text-ivoire-orange">Diaspora</span>
          </motion.h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-xs">
            Gestion internationale de votre patrimoine ivoirien
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-lg">
          <div className="px-4 py-2 bg-ivoire-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest">
            {currency} Mode
          </div>
          <div className="px-4 text-sm font-black text-ivoire-dark">
            1 FCFA ≈ {currencyConfig.rate} {currency}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100 w-fit">
        <button 
          onClick={() => setView('overview')}
          className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
            view === 'overview' ? 'bg-white shadow-lg text-ivoire-dark' : 'text-gray-400 hover:text-ivoire-dark'
          }`}
        >
          Vue d'Ensemble
        </button>
        <button 
          onClick={() => setView('mandates')}
          className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${
            view === 'mandates' ? 'bg-white shadow-lg text-ivoire-dark' : 'text-gray-400 hover:text-ivoire-dark'
          }`}
        >
          Délégation (Mandat)
        </button>
      </div>

      {view === 'overview' ? (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 rounded-3xl border border-white/40 shadow-xl"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-ivoire-dark tracking-tighter">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() + ' FCFA' : stat.value}
                    </h3>
                    {stat.deviseValue && (
                    <p className="text-ivoire-orange font-bold text-sm">
                        ≈ {stat.deviseValue.toLocaleString()} {currencyConfig.symbol}
                    </p>
                    )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Properties Oversight */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tighter text-ivoire-dark flex items-center gap-3">
                  <Building2 size={24} className="text-ivoire-orange" />
                  Vos Biens en Côte d'Ivoire
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {data.properties.map((prop: any, i: number) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white/40 hover:bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-ivoire-dark rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white">
                        {prop.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h4 className="font-black text-ivoire-dark text-lg group-hover:text-ivoire-orange transition-colors">{prop.name}</h4>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{prop.commune}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-right">
                      {prop.activeLease ? (
                        <>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Loyer Mensuel</p>
                            <p className="font-black text-ivoire-dark leading-none">{prop.activeLease.rentFcfa.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                            <p className="text-ivoire-orange font-bold text-[11px] mt-0.5">≈ {prop.activeLease.rentDevise.toLocaleString()} {currencyConfig.symbol}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Dernier Paiement</p>
                            <div className="flex items-center gap-2 justify-end">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="font-bold text-ivoire-dark text-xs uppercase tracking-tighter">Confirmé</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest">Inoccupé</span>
                      )}
                      <div className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-ivoire-dark group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mandataires & SLA */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tighter text-ivoire-dark flex items-center gap-3">
                <ShieldCheck size={24} className="text-blue-600" />
                Mandataires Locaux
              </h2>

              <div className="space-y-4">
                {data.mandats.map((mandat: any) => (
                  <div key={mandat.id} className="glass-panel p-6 rounded-[2.5rem] border border-white/60 shadow-lg space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-ivoire-dark">{mandat.name}</h4>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-none mt-1">{mandat.phone}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100">
                        SLA OK
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Réactivité</p>
                        <p className="font-black text-ivoire-dark text-xs tracking-widest">14h <span className="text-[8px] font-normal tracking-normal text-gray-400">moy.</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Dernière Action</p>
                        <p className="font-black text-ivoire-dark text-xs tracking-widest">HIER</p>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-gray-50 hover:bg-ivoire-dark text-gray-400 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-gray-100 transition-all flex items-center justify-center gap-2">
                      <LayoutDashboard size={14} />
                      Historique Log
                    </button>
                  </div>
                ))}

                {data.mandats.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <Users size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-ivoire-dark uppercase tracking-widest text-sm">Aucun Mandataire</h4>
                      <p className="text-gray-400 text-xs font-medium mt-1">Désignez un proche pour la gestion locale de vos biens.</p>
                    </div>
                    <button 
                      onClick={() => setView('mandates')}
                      className="mt-2 px-6 py-3 bg-ivoire-orange text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-orange-200 hover:scale-105 transition-all text-center"
                    >
                      Désigner un Mandat
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 space-y-4">
                    <Clock size={32} className="text-white/80" />
                    <h3 className="text-xl font-black leading-tight">
                        Alertes <br/>Temps Réel
                    </h3>
                    <p className="text-white/60 text-xs font-medium">
                        Vous dormez à Paris, QAPRIL veille à Abidjan. Recevez des notifications critiques basées sur votre fuseau horaire.
                    </p>
                    <div className="pt-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-white/20 rounded-xl w-fit">
                            <Globe size={12} />
                            {user.fuseauHoraire || "Europe/Paris"}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MandatManagement properties={data.properties} />
        </motion.div>
      )}
    </div>
  )
}
