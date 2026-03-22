"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    Phone, 
    Filter, 
    User, 
    ShieldCheck, 
    MapPin, 
    Send, 
    Plus,
    X,
    MessageSquare,
    CreditCard
} from "lucide-react"
import { toast } from "sonner"
import { findLocataireByPhone, searchLocataires } from "@/actions/search-locataire"
import { sendInvitation } from "@/actions/invitations"

interface MatchingClientProps {
    userRole: string
    properties: any[]
    userId: string
}

export function MatchingClient({ userRole, properties, userId }: MatchingClientProps) {
    const [activeTab, setActiveTab] = useState<'PHONE' | 'CRITERIA'>(userRole === 'AGENCE' ? 'CRITERIA' : 'PHONE')
    const [phone, setPhone] = useState("")
    const [searchResult, setSearchResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    
    // Invitation Modal State
    const [invitationModal, setInvitationModal] = useState<{ open: boolean, locataire: any }>({ open: false, locataire: null })
    const [invitationData, setInvitationData] = useState({
        propertyId: "",
        loyer: 0,
        date: "",
        message: ""
    })

    const handlePhoneSearch = async () => {
        if (!phone) return
        setLoading(true)
        try {
            const res = await findLocataireByPhone(phone)
            if (res) {
                setSearchResult(res)
            } else {
                setSearchResult(null)
                toast.error("Aucun locataire trouvé ou profil invisible.")
            }
        } catch (error) {
            toast.error("Erreur lors de la recherche")
        } finally {
            setLoading(false)
        }
    }

    const handleSendInvitation = async () => {
        if (!invitationData.propertyId || !invitationData.loyer || !invitationData.date) {
            return toast.error("Veuillez remplir tous les champs obligatoires")
        }

        try {
            await sendInvitation({
                propertyId: invitationData.propertyId,
                invitantId: userId,
                invitantType: userRole as any,
                locataireId: invitationModal.locataire.id,
                methodeDecouverte: activeTab === 'PHONE' ? 'NUMERO_TELEPHONE' : 'MATCHING_CRITERES',
                loyerPropose: invitationData.loyer,
                dateDebutProposee: new Date(invitationData.date),
                messageInvitant: invitationData.message
            })
            toast.success("Invitation envoyée avec succès !")
            setInvitationModal({ open: false, locataire: null })
        } catch (error) {
            toast.error("Erreur lors de l'envoi")
        }
    }

    return (
        <div className="space-y-8 pb-32">
            {/* Tabs Selector */}
            <div className="flex bg-gray-100/50 p-1.5 rounded-[1.5rem] w-fit border border-gray-200">
                <button 
                    onClick={() => setActiveTab('PHONE')}
                    className={`px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'PHONE' ? 'bg-white shadow-xl text-[#1F4E79]' : 'text-gray-400'}`}
                >
                    Recherche par Numéro
                </button>
                {userRole === 'AGENCE' && (
                    <button 
                        onClick={() => setActiveTab('CRITERIA')}
                        className={`px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${activeTab === 'CRITERIA' ? 'bg-white shadow-xl text-[#1F4E79]' : 'text-gray-400'}`}
                    >
                        Matching par Critères
                    </button>
                )}
            </div>

            {/* Phone Search Content */}
            {activeTab === 'PHONE' && (
                <div className="space-y-8">
                    <div className="glass-panel p-8 rounded-[2rem] bg-white border border-white/40 shadow-xl max-w-2xl">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 block">Numéro de téléphone du locataire</label>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="tel" 
                                    placeholder="+225 00 00 00 00" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1F4E79]/20 font-black text-xl text-[#1F4E79]"
                                />
                            </div>
                            <button 
                                onClick={handlePhoneSearch}
                                disabled={loading}
                                className="px-8 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                <Search size={20} />
                                {loading ? "..." : "Trouver"}
                            </button>
                        </div>
                    </div>

                    {searchResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-10 rounded-[3rem] bg-white border border-white/40 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1F4E79]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            
                            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                                <div className="w-24 h-24 bg-[#1F4E79] text-white rounded-[2rem] flex items-center justify-center shadow-xl rotate-3">
                                    <User size={48} />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase">{searchResult.fullName}</h3>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center gap-1.5">
                                            <ShieldCheck size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Identité Vérifiée</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 font-medium">Recherche un logement : <span className="text-[#1F4E79] font-bold">{searchResult.communesSouhaitees?.join(', ')}</span></p>
                                    
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Budget Max</span>
                                            <span className="font-black text-[#1F4E79]">{Number(searchResult.revenuFourchette || 0).toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-0.5">Grade QAPRIL</span>
                                            <span className="font-black text-emerald-600 block">Grade {searchResult.scoreBadge}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setInvitationModal({ open: true, locataire: searchResult })}
                                    className="px-10 py-5 bg-[#C55A11] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-[#a64a0e] transition-all flex items-center gap-3 active:scale-95 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                    <span>Inviter au bail</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Criteria Search Content (Placeholder for Agencies) */}
            {activeTab === 'CRITERIA' && (
                <div className="glass-panel p-24 rounded-[3rem] bg-white border border-white/40 shadow-xl text-center">
                    <Filter size={48} className="mx-auto text-gray-300 mb-6" />
                    <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter italic">Moteur de Matching Agencia</h3>
                    <p className="text-gray-400 max-w-md mx-auto mt-4 font-medium">Bientôt disponible. Les agences PRO STANDARD pourront matcher les locataires par critères géographiques et budgétaires.</p>
                </div>
            )}

            {/* Invitation Modal */}
            {invitationModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setInvitationModal({ open: false, locataire: null })}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter">Proposition de Bail</h3>
                                    <p className="text-gray-400 font-medium">À l'attention de <span className="text-gray-900 font-bold">{invitationModal.locataire?.fullName}</span></p>
                                </div>
                                <button onClick={() => setInvitationModal({ open: false, locataire: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                        <MapPin size={14} /> Logement concerné
                                    </label>
                                    <select 
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-[#1F4E79]"
                                        value={invitationData.propertyId}
                                        onChange={(e) => setInvitationData({...invitationData, propertyId: e.target.value})}
                                    >
                                        <option value="">Sélectionnez un bien disponible...</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.propertyCode} - {p.commune}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                            <CreditCard size={14} /> Loyer (FCFA)
                                        </label>
                                        <input 
                                            type="number" 
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none font-black text-[#C55A11]"
                                            value={invitationData.loyer}
                                            onChange={(e) => setInvitationData({...invitationData, loyer: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                            <Plus size={14} /> Date de Début
                                        </label>
                                        <input 
                                            type="date" 
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold"
                                            value={invitationData.date}
                                            onChange={(e) => setInvitationData({...invitationData, date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                        <MessageSquare size={14} /> Message (Optionnel)
                                    </label>
                                    <textarea 
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-medium h-24"
                                        placeholder="Bonjour, je vous propose ce logement suite à votre profil QAPRIL..."
                                        value={invitationData.message}
                                        onChange={(e) => setInvitationData({...invitationData, message: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSendInvitation}
                                className="w-full py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95"
                            >
                                <Send size={20} />
                                Envoyer l'invitation
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
