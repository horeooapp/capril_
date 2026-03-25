"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  UserPlus, 
  Shield, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  User,
  MoreVertical
} from "lucide-react"
import { designateMandatLocal } from "@/actions/diaspora-actions"
import { ProfilInterm } from "@prisma/client"

export default function MandatManagement({ properties }: { properties: any[] }) {
  const [phone, setPhone] = useState("")
  const [profil, setProfil] = useState<ProfilInterm>("PARENT_AMI")
  const [selectedBiens, setSelectedBiens] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleDesignate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await designateMandatLocal({
      mandatairePhone: phone,
      profil,
      biensIds: selectedBiens,
      permissions: {
        collect_rent: true,
        maintenance_tickets: true,
        legal_representation: false
      }
    })

    setLoading(false)
    if (result.success) {
      setMessage({ type: 'success', text: "Invitation envoyée avec succès !" })
      setPhone("")
      setSelectedBiens([])
    } else {
      setMessage({ type: 'error', text: result.error || "Une erreur est survenue." })
    }
  }

  return (
    <div className="glass-panel p-10 rounded-[3rem] border border-white/60 shadow-2xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                <UserPlus size={32} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-ivoire-dark tracking-tighter uppercase">Désigner un Mandataire</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Déléguez la gestion locale en toute sécurité</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleDesignate} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-ivoire-dark uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} className="text-ivoire-orange" />
              Numéro de téléphone du Mandataire
            </label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +33 6 12 34 56 78"
              className="w-full h-16 px-6 bg-gray-50 border-2 border-transparent focus:border-ivoire-orange focus:bg-white rounded-2xl font-black text-ivoire-dark transition-all outline-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-ivoire-dark uppercase tracking-widest flex items-center gap-2">
              <User size={14} className="text-ivoire-orange" />
              Profil de l'Intermédiaire
            </label>
            <div className="grid grid-cols-2 gap-3">
                {["PARENT_AMI", "NOTAIRE", "HUISSIER", "AVOCAT"].map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setProfil(p as ProfilInterm)}
                        className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                            profil === p 
                            ? "bg-ivoire-dark text-white border-ivoire-dark shadow-xl" 
                            : "bg-white text-gray-400 border-gray-100 hover:border-ivoire-orange"
                        }`}
                    >
                        {p.replace('_', ' ')}
                    </button>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-ivoire-dark uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-ivoire-orange" />
              Biens Concernés
            </label>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {properties.map((prop) => (
                    <label key={prop.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-2xl border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox"
                                checked={selectedBiens.includes(prop.id)}
                                onChange={(e) => {
                                    if(e.target.checked) setSelectedBiens(prev => [...prev, prop.id]);
                                    else setSelectedBiens(prev => prev.filter(id => id !== prop.id));
                                }}
                                className="w-5 h-5 rounded-lg border-gray-300 text-ivoire-orange focus:ring-ivoire-orange"
                            />
                            <span className="font-bold text-ivoire-dark text-xs uppercase tracking-tighter">{prop.name}</span>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{prop.commune}</span>
                    </label>
                ))}
            </div>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest ${
                message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading || selectedBiens.length === 0}
            className="w-full py-5 bg-ivoire-orange text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-orange-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
          >
            {loading ? "Chargement..." : "Confirmer la Délégation"}
            <Settings size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </form>
    </div>
  )
}
