"use client"

import { useState } from "react"
import { inviteManager } from "@/actions/roles-actions"
import { Plus, X, UserPlus, Loader2 } from "lucide-react"

export default function InviteManagerForm({ propertyId }: { propertyId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [phone, setPhone] = useState("")
    const [selection, setSelection] = useState<string>("PARENT_AMI")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        let finalRole: any = "INTERMEDIAIRE"
        let finalProfil: any = selection

        if (selection === "AGENCE") {
            finalRole = "AGENCE"
            finalProfil = undefined
        } else if (selection === "FIELD_AGENT") {
            finalRole = "FIELD_AGENT"
            finalProfil = undefined
        }

        const res = await inviteManager(propertyId, phone, finalRole, finalProfil)
        setLoading(false)

        if (res.success) {
            setMessage("✅ Invitation envoyée !")
            setTimeout(() => {
                setIsOpen(false)
                setPhone("")
                setMessage("")
            }, 2000)
        } else {
            setMessage(`❌ ${res.error}`)
        }
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#C55A11] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A54A0D] transition-all shadow-lg active:scale-95"
            >
                <Plus size={16} />
                Inviter un collaborateur
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 my-auto relative border border-gray-100 animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors bg-gray-50 rounded-full p-2"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#C55A11]">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#1F4E79] uppercase italic tracking-tighter">Nouvelle Invitation</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mandater un collaborateur</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Téléphone (WhatsApp)</label>
                        <input 
                            required
                            type="tel"
                            placeholder="+225 0700..."
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#C55A11] transition-all outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Statut du collaborateur</label>
                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 pb-2">
                            {/* Personnels */}
                            <button 
                                type="button"
                                onClick={() => setSelection("PARENT_AMI")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'PARENT_AMI' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Parent / Ami</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Max 2 proprios / 10 biens</span>
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setSelection("NOTAIRE")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'NOTAIRE' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Notaire</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Max 5 proprios / 25 biens</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setSelection("HUISSIER")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'HUISSIER' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Huissier</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Sur mandat judiciaire</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setSelection("AVOCAT")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'AVOCAT' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Avocat</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Sur mandat judiciaire</span>
                            </button>

                            {/* Professionnels */}
                            <button 
                                type="button"
                                onClick={() => setSelection("AGENCE")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'AGENCE' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Agence ou Pro</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Agrément CDAIM requis</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setSelection("FIELD_AGENT")}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${selection === 'FIELD_AGENT' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                            >
                                <span className="font-black text-[11px] block uppercase tracking-tighter italic text-[#1F4E79]">Agent Terrain</span>
                                <span className="text-[9px] font-medium leading-tight text-gray-500 mt-1 block">Visites & constats</span>
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <button 
                        disabled={loading}
                        className="w-full py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#163a5a] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Générer le mandat et inviter"}
                    </button>
                </form>
            </div>
        </div>
    )
}
