"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Wallet, 
  Smartphone, 
  MessageSquare, 
  Bell, 
  History, 
  TrendingUp, 
  Settings, 
  ShieldCheck,
  Zap,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { getWalletProfile, updateWalletPreferences, processRechargeLink } from "@/actions/wallet.actions"
import { toast } from "sonner"
import RechargeDrawer from "@/components/dashboard/owner/RechargeDrawer"
import Link from "next/link"
import { Landmark, Activity } from "lucide-react"

export default function WalletPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local state for prefs
  const [prefs, setPrefs] = useState({
    operateur: "WAVE",
    canal: "WHATSAPP",
    seuil: 500,
    rappelActif: true,
    rappelJour: 1
  })

  // Drawer state
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [drawerAmount, setDrawerAmount] = useState(2000)

  const handleOpenDrawer = (amount: number) => {
    setDrawerAmount(amount)
    setDrawerOpen(true)
  }

  const handleRechargeSubmit = async (amount: number, operator: string, method: string) => {
    return processRechargeLink(amount, operator)
  }

  const loadProfile = React.useCallback(async () => {
    try {
      const data = await getWalletProfile()
      if (data) {
        setProfile(data)
        setPrefs({
          operateur: data.operateur,
          canal: data.canal,
          seuil: data.seuil,
          rappelActif: data.rappel?.rappelActif ?? true,
          rappelJour: data.rappel?.jourDuMois ?? 1
        })
      }
    } catch (err) {
      console.error("Failed to load wallet profile:", err)
      toast.error("Impossible de charger votre profil wallet")
    } finally {
      setLoading(false)
    }
  }, []);

  const handleSave = React.useCallback(async () => {
    setSaving(true)
    const res = await updateWalletPreferences(prefs)
    if (res.success) {
      toast.success("Préférences enregistrées")
      loadProfile()
    } else {
      toast.error("Erreur lors de la sauvegarde")
    }
    setSaving(false)
  }, [prefs, loadProfile]);

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* 1. Header & Quick View */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            <div className="p-3 bg-slate-800/10 rounded-2xl">
              <Wallet className="text-slate-800" size={32} />
            </div>
            Espace Wallet
          </h1>
          <p className="text-gray-500 font-medium pl-1">
            Gérez vos rechargements automatiques et la continuité de vos services.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-[#2c6aa5] text-white shadow-2xl relative overflow-hidden min-w-[320px]">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
              Solde Actuel
            </span>
            <div className="text-5xl font-black tracking-tighter">
              {profile?.balance?.toLocaleString() || 0} <span className="text-lg opacity-60">FCFA</span>
            </div>
            {profile?.balance < 0 && (
              <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full w-fit border border-red-400/50 shadow-lg">
                <ShieldCheck size={14} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mode Crédit Actif (-1 500 max)</span>
              </div>
            )}
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Wallet size={200} />
          </div>
        </div>
      </div>

      {/* Raccourcis: C.D.C & Réconciliation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-[1.5rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Landmark className="text-slate-800" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Caisse des Dépôts</h3>
              <p className="text-[10px] font-bold text-gray-500">Registre des cautions sécurisées.</p>
            </div>
          </div>
          <Link 
            href="/dashboard/wallet/cdc"
            className="px-6 py-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-md shrink-0 w-full sm:w-auto justify-center"
          >
            Le Registre <ChevronRight size={14} />
          </Link>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-[1.5rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Activity className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Réconciliation</h3>
              <p className="text-[10px] font-bold text-gray-500">Rapprochement bancaire (Wave / OM).</p>
            </div>
          </div>
          <Link 
            href="/dashboard/wallet/reconciliation"
            className="px-6 py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-md shrink-0 w-full sm:w-auto justify-center"
          >
            Audits P.G.W <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Suggestion Form (ADD-07 v3) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 shadow-xl space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 rounded-xl">
                  <Zap className="text-orange-500" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                  Rechargement Intelligent
                </h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                {profile?.nbBails} bails actifs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Minimum */}
              <motion.button 
                onClick={() => handleOpenDrawer(profile?.suggestions?.minimum || 1000)}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-amber-600/30 hover:bg-amber-600/5 transition-all text-left space-y-4 group"
              >
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Indispensable</div>
                <div className="text-2xl font-black text-slate-800">{profile?.suggestions?.minimum.toLocaleString()} <span className="text-xs">FCFA</span></div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Couvre le strict nécessaire pour vos quittances immédiates.
                </p>
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Recharger <ChevronRight size={14} />
                </div>
              </motion.button>

              {/* Option 2: Recommandé (Zéro Friction) */}
              <motion.button 
                onClick={() => handleOpenDrawer(profile?.suggestions?.recommande || 2000)}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl border-2 border-amber-600 bg-amber-600/5 shadow-lg shadow-[#C55A11]/10 text-left space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-amber-600 rounded-bl-xl">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Zéro Friction</div>
                <div className="text-2xl font-black text-slate-800">{profile?.suggestions?.recommande.toLocaleString()} <span className="text-xs">FCFA</span></div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                  Couvre vos {profile?.suggestions?.mois_couverture || 2} prochains mois de gestion.
                </p>
                <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase">
                  Conseillé <ChevronRight size={14} />
                </div>
              </motion.button>

              {/* Option 3: Confort */}
              <motion.button 
                onClick={() => handleOpenDrawer(profile?.suggestions?.confort || 5000)}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl border-2 border-slate-800/20 hover:border-slate-800 hover:bg-slate-800/5 transition-all text-left space-y-4 group"
              >
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tranquillité</div>
                <div className="text-2xl font-black text-slate-800">{profile?.suggestions?.confort.toLocaleString()} <span className="text-xs">FCFA</span></div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Évitez toute notification pendant un cycle complet.
                </p>
                <div className="flex items-center gap-2 text-slate-800 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  Sélectionner <ChevronRight size={14} />
                </div>
              </motion.button>
            </div>
          </div>

          {/* 3. History Tracking (WDL-05) */}
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 shadow-xl space-y-6">
             <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <History className="text-slate-800" size={24} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                  Suivi des Déclencheurs
                </h2>
              </div>

              <div className="space-y-4">
                {profile?.recentLinks?.map((link: any) => (
                  <div key={link.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${link.clique ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {link.declencheur === 'SOLDE_BAS' ? <AlertCircle size={18} className="text-orange-500" /> : <Bell size={18} className="text-blue-500" />}
                      </div>
                      <div>
                        <div className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{link.declencheur.replace('_', ' ')}</div>
                        <div className="text-[10px] text-gray-400">{new Date(link.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-bold text-amber-600">+{link.montantSuggere.toLocaleString()} FCFA</div>
                      <div className={`text-[9px] font-black uppercase tracking-tighter ${link.clique ? 'text-green-600' : 'text-gray-400'}`}>
                        {link.clique ? 'Consulté' : 'En attente'}
                      </div>
                    </div>
                  </div>
                ))}
                {(!profile?.recentLinks || profile.recentLinks.length === 0) && (
                  <div className="text-center py-12 text-gray-400 text-sm italic">
                    Aucun déclencheur activé récemment.
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* 4. Sidebar: Settings & Preferences (WDL-06) */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/40 shadow-xl space-y-10 sticky top-8">
             <div className="space-y-2 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <Settings className="text-purple-600" size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                    Préférences
                  </h2>
                </div>
              </div>

              {/* Opérateur Préféré */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={14} /> Opérateur par défaut
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['WAVE', 'ORANGE', 'MTN', 'MOOV'].map((op) => (
                    <button
                      key={op}
                      onClick={() => setPrefs({...prefs, operateur: op})}
                      className={`relative flex items-center justify-center p-3 rounded-xl transition-all border-2 overflow-hidden ${
                        prefs.operateur === op 
                        ? 'bg-white border-slate-800 shadow-lg shadow-[#1F4E79]/10' 
                        : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      {prefs.operateur === op && (
                         <div className="absolute top-1 right-1 bg-slate-800 rounded-full p-0.5">
                            <CheckCircle2 size={10} className="text-white" />
                         </div>
                      )}
                      {op === 'WAVE' && <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Wave_logo.svg/512px-Wave_logo.svg.png" alt="Wave" className="h-8 object-contain" />}
                      {op === 'ORANGE' && <img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" alt="Orange" className="h-8 object-contain" />}
                      {op === 'MTN' && <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" alt="MTN" className="h-8 w-auto object-contain" />}
                      {op === 'MOOV' && <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Moov_Africa_logo.png" alt="Moov" className="h-8 w-auto object-contain" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canal d'alerte */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} /> Canal de notification
                </label>
                <div className="flex gap-3">
                  {['WHATSAPP', 'SMS'].map((canal) => (
                    <button
                      key={canal}
                      onClick={() => setPrefs({...prefs, canal: canal})}
                      className={`flex-1 px-4 py-3 rounded-xl text-[11px] font-black transition-all border ${
                        prefs.canal === canal 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-[#1F4E79]/20' 
                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      {canal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seuil d'alerte */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-between">
                  <span>Seuil d'alerte bas</span>
                  <span className="text-amber-600">{prefs.seuil} FCFA</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="5000" 
                  step="500"
                  value={prefs.seuil}
                  onChange={(e) => setPrefs({...prefs, seuil: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1F4E79]"
                />
              </div>

              {/* Rappel Automatique */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/5 border border-slate-800/10">
                <div className="space-y-1">
                  <div className="text-[12px] font-black text-slate-800 uppercase tracking-tight">Rappel Mensuel</div>
                  <div className="text-[9px] text-gray-500">Programmé le {prefs.rappelJour} du mois</div>
                </div>
                <button 
                  onClick={() => setPrefs({...prefs, rappelActif: !prefs.rappelActif})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${prefs.rappelActif ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <motion.div 
                    animate={{ x: prefs.rappelActif ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-[#C55A11]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Mettre à jour mes préférences</>
                )}
              </button>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                <TrendingUp size={24} className="text-slate-800 shrink-0" />
                <p className="text-[10px] text-gray-500 leading-normal italic">
                  "L'activation du rechargement contextuel réduit de **85%** le risque de blocage de vos quittances certifiées."
                </p>
              </div>
          </div>
        </div>
      </div>

      <RechargeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        suggestedAmount={drawerAmount} 
        onRecharge={handleRechargeSubmit} 
      />
    </div>
  )
}
