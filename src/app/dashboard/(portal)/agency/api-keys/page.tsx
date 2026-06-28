"use client"

import React, { useEffect, useState } from "react"
import { getAgencyApiKeys, generateApiKeys } from "@/actions/api-keys.actions"
import { Key, Shield, Zap, Loader2, Copy, CheckCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showSecret, setShowSecret] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const res = await getAgencyApiKeys()
            if (res.success) setKeys(res.keys || [])
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!confirm("Attention: Générer de nouvelles clés invalidera les précédentes et vous serez facturé de 50 000 FCFA. Continuer ?")) {
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateApiKeys();
            if (res.success) {
                toast.success("Clés API générées avec succès !");
                await loadData();
            } else {
                toast.error(res.error || "Erreur lors de la génération des clés.");
            }
        } finally {
            setIsGenerating(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copié dans le presse-papier");
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>

    const activeKey = keys.find(k => k.actif);

    return (
        <div className="space-y-6 relative max-w-5xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Key className="text-blue-500" size={32} /> Accès API B2B
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Connectez votre ERP ou CRM directement à QAPRIL pour automatiser la création de mandats et de baux.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[24px] text-white shadow-xl md:col-span-2 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-[16px] font-black uppercase tracking-widest text-slate-200">Abonnement API Premium</h2>
                                <p className="text-emerald-400 font-bold text-[13px] mt-1 flex items-center gap-2">
                                    <CheckCircle size={14} /> 50 000 FCFA / mois
                                </p>
                            </div>
                            <Shield className="text-slate-700" size={48} />
                        </div>
                        
                        <div className="space-y-3">
                            <p className="text-[13px] text-slate-300 font-medium">✨ 1 000 requêtes / jour</p>
                            <p className="text-[13px] text-slate-300 font-medium">✨ Webhooks en temps réel (Paiements, Sinistres)</p>
                            <p className="text-[13px] text-slate-300 font-medium">✨ Support Technique B2B Dédié</p>
                        </div>
                    </div>
                    <Zap size={200} className="absolute -bottom-10 -right-10 text-white opacity-5" />
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tighter">Vos Clés d'Accès</h3>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="bg-blue-600 text-white px-6 py-3 rounded-[12px] font-bold text-[12px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {activeKey ? "Régénérer les clés" : "Souscrire & Générer"}
                    </button>
                </div>

                {activeKey ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">API Key (Publique)</label>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-5 py-3 text-[13px] font-mono text-slate-800">
                                    {activeKey.apiKey}
                                </code>
                                <button onClick={() => copyToClipboard(activeKey.apiKey)} className="p-3 bg-slate-100 text-slate-500 rounded-[12px] hover:bg-slate-200 transition-colors">
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">API Secret (Privée)</label>
                            <div className="flex items-center gap-3">
                                <code className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-5 py-3 text-[13px] font-mono text-slate-800">
                                    {showSecret ? activeKey.apiSecret : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                                </code>
                                <button onClick={() => setShowSecret(!showSecret)} className="p-3 bg-slate-100 text-slate-500 rounded-[12px] hover:bg-slate-200 transition-colors">
                                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button onClick={() => copyToClipboard(activeKey.apiSecret)} className="p-3 bg-slate-100 text-slate-500 rounded-[12px] hover:bg-slate-200 transition-colors">
                                    <Copy size={18} />
                                </button>
                            </div>
                            <p className="text-[11px] text-rose-500 font-bold mt-1">⚠️ Ne partagez jamais votre API Secret. Elle donne un accès complet à vos données.</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-[16px] border border-dashed border-slate-300">
                        <Key size={32} className="mx-auto text-slate-400 mb-3" />
                        <p className="text-[13px] font-medium text-slate-500">Vous n'avez pas encore généré de clés API.</p>
                        <p className="text-[12px] font-bold text-slate-400 mt-1">Cliquez sur le bouton ci-dessus pour activer votre accès Premium.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
