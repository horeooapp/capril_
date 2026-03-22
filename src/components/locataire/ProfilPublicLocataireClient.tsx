"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    Search, 
    Briefcase, 
    Wallet, 
    MapPin, 
    Eye, 
    EyeOff, 
    Save, 
    CheckCircle2,
    Info
} from "lucide-react"
import { toast } from "sonner"
import { upsertPublicProfile, updateProfilVisibilite } from "@/actions/locataire-profil-public"

interface ProfilPublicLocataireClientProps {
    userId: string
    initialData: any
}

export function ProfilPublicLocataireClient({ userId, initialData }: ProfilPublicLocataireClientProps) {
    const [loading, setLoading] = useState(false)
    const [visibilite, setVisibilite] = useState(initialData?.visibilite || 'INVISIBLE')
    const [formData, setFormData] = useState({
        statutPro: initialData?.statutPro || '',
        revenuFourchette: initialData?.revenuFourchette || '',
        budgetMaxFcfa: initialData?.budgetMaxFcfa || 0,
        communesSouhaitees: initialData?.communesSouhaitees || [],
        typeLogement: initialData?.typeLogement || []
    })

    const handleSave = async () => {
        setLoading(true)
        try {
            await upsertPublicProfile(userId, formData)
            toast.success("Profil mis à jour avec succès")
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setLoading(false)
        }
    }

    const toggleVisibilite = async (newVal: string) => {
        try {
            await updateProfilVisibilite(userId, newVal)
            setVisibilite(newVal)
            toast.success(`Visibilité mise à jour : ${newVal}`)
        } catch (error) {
            toast.error("Erreur")
        }
    }

    const commsStr = formData.communesSouhaitees.join(', ')
    const typesStr = formData.typeLogement.join(', ')

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-xl bg-white space-y-8">
                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter flex items-center gap-2">
                        <Briefcase className="text-primary" />
                        Situation Professionnelle
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Statut Pro</label>
                            <select 
                                value={formData.statutPro}
                                onChange={(e) => setFormData({...formData, statutPro: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                            >
                                <option value="">Choisir...</option>
                                <option value="SALARIE">Salarié</option>
                                <option value="INDEPENDANT">Indépendant</option>
                                <option value="INFORMEL">Informel</option>
                                <option value="SANS_EMPLOI">Sans emploi</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Revenu Mensuel (Fourchette)</label>
                            <select 
                                value={formData.revenuFourchette}
                                onChange={(e) => setFormData({...formData, revenuFourchette: e.target.value})}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                            >
                                <option value="">Choisir...</option>
                                <option value="0-50K">0 - 50k FCFA</option>
                                <option value="50K-150K">50k - 150k FCFA</option>
                                <option value="150K-300K">150k - 300k FCFA</option>
                                <option value="300K-500K">300k - 500k FCFA</option>
                                <option value="500K+">500k+ FCFA</option>
                            </select>
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-[#1F4E79] uppercase tracking-tighter flex items-center gap-2 pt-4">
                        <Search className="text-primary" />
                        Critères de Recherche
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Budget Max Loyer (FCFA)</label>
                            <input 
                                type="number"
                                value={formData.budgetMaxFcfa}
                                onChange={(e) => setFormData({...formData, budgetMaxFcfa: parseInt(e.target.value)})}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-black text-[#1F4E79] text-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Communes Souhaitées (Séparées par des virgules)</label>
                            <input 
                                type="text"
                                placeholder="ex: Yopougon, Cocody, Riviera"
                                value={commsStr}
                                onChange={(e) => setFormData({...formData, communesSouhaitees: e.target.value.split(',').map(s => s.trim())})}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-[#1F4E79]"
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-5 bg-[#1F4E79] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? "Enregistrement..." : "Enregistrer mon profil public"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Visibility & Privacy */}
            <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-xl bg-gradient-to-br from-[#1F4E79] to-[#163a5a] text-white">
                    <h3 className="font-black uppercase tracking-widest text-[12px] mb-6 opacity-80">Contrôle de Visibilité</h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => toggleVisibilite('INVISIBLE')}
                            className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${visibilite === 'INVISIBLE' ? 'bg-white text-[#1F4E79] border-white' : 'bg-white/10 border-white/20'}`}
                        >
                            <EyeOff size={20} />
                            <div className="text-left">
                                <p className="font-black uppercase text-[11px] tracking-widest">Invisible</p>
                                <p className="text-[10px] opacity-70">Personne ne peut vous trouver</p>
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => toggleVisibilite('INVITATION_PROPRIO')}
                            className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${visibilite === 'INVITATION_PROPRIO' ? 'bg-white text-[#1F4E79] border-white' : 'bg-white/10 border-white/20'}`}
                        >
                            <MapPin size={20} />
                            <div className="text-left">
                                <p className="font-black uppercase text-[11px] tracking-widest">Favoris Proprios</p>
                                <p className="text-[10px] opacity-70">Seulement via votre numéro</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => toggleVisibilite('TOUS')}
                            className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${visibilite === 'TOUS' ? 'bg-white text-[#1F4E79] border-white' : 'bg-white/10 border-white/20'}`}
                        >
                            <Eye size={20} />
                            <div className="text-left">
                                <p className="font-black uppercase text-[11px] tracking-widest">Visibilité Totale</p>
                                <p className="text-[10px] opacity-70">Matching agences activé</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2rem] border border-white/40 shadow-xl bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="text-blue-500" />
                        <h4 className="font-black text-[#1F4E79] uppercase text-[12px] tracking-widest">Vie Privée</h4>
                    </div>
                    <ul className="space-y-4">
                        <li className="flex gap-3 items-start">
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[12px] text-gray-500 font-medium">Vos données négatives ne sont jamais visibles.</p>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[12px] text-gray-500 font-medium">Votre nom est anonymisé pour les agences.</p>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                            <p className="text-[12px] text-gray-500 font-medium">Vous pouvez vous masquer en un clic.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
