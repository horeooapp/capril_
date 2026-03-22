"use client"

import { useState } from "react"
import { inviteManager } from "@/actions/roles-actions"
import { Plus, X, UserPlus, Loader2 } from "lucide-react"

export default function InviteManagerForm({ propertyId }: { propertyId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [phone, setPhone] = useState("")
    const [role, setRole] = useState<"MANAGER" | "FIELD_AGENT">("MANAGER")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        const res = await inviteManager(propertyId, phone, role)
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
                Inviter un gestionnaire
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 relative border border-gray-100 animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#C55A11]">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#1F4E79] uppercase italic tracking-tighter">Nouvelle Invitation</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigner un collaborateur au bien</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Rôle assigné</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={() => setRole("MANAGER")}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${role === 'MANAGER' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                            >
                                <span className="font-black text-[12px] uppercase tracking-tighter italic">Gestionnaire</span>
                                <span className="text-[9px] font-medium leading-none">Accès complet</span>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setRole("FIELD_AGENT")}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${role === 'FIELD_AGENT' ? 'border-[#C55A11] bg-orange-50' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                            >
                                <span className="font-black text-[12px] uppercase tracking-tighter italic">Agent Terrain</span>
                                <span className="text-[9px] font-medium leading-none">Visites & Constats</span>
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
                        className="w-full py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#163a5a] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Envoyer l'invitation"}
                    </button>
                </form>
            </div>
        </div>
    )
}
