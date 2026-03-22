"use client"

import { useTransition } from "react"
import { revokeManagerRole } from "@/actions/roles-actions"
import { User, ShieldCheck, ShieldAlert, Trash2 } from "lucide-react"

export default function ManagersList({ accesses }: { accesses: any[] }) {
    const [isPending, startTransition] = useTransition()

    const handleRevoke = async (id: string) => {
        if (confirm("Voulez-vous vraiment révoquer cet accès ?")) {
            startTransition(async () => {
                await revokeManagerRole(id)
            })
        }
    }

    if (accesses.length === 0) {
        return (
            <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aucun gestionnaire assigné</p>
                <p className="text-gray-300 text-[12px] mt-1 italic">Votre patrimoine est géré en direct.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {accesses.map((access) => (
                <div key={access.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-orange-200 transition-all shadow-sm group">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${access.acceptedAt ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600 animate-pulse'}`}>
                            {access.acceptedAt ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-[#1F4E79] italic uppercase tracking-tighter">
                                    {access.user.fullName || access.user.phone}
                                </h4>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest">
                                    {access.role}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                {access.acceptedAt 
                                    ? `Accepté le ${new Date(access.acceptedAt).toLocaleDateString()}` 
                                    : "Invitation en attente..."
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        {access.statut === 'ACTIF' ? (
                            <button 
                                onClick={() => handleRevoke(access.id)}
                                disabled={isPending}
                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Révoquer l'accès"
                            >
                                <Trash2 size={20} />
                            </button>
                        ) : (
                            <span className="text-[10px] font-black uppercase text-red-400 bg-red-50 px-3 py-1 rounded-lg">Révoqué</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
