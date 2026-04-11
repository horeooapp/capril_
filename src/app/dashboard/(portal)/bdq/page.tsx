"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Bot, MessageCircle, CheckCircle2, Search, SmartphoneNfc, FileSignature, Zap, MoreHorizontal, MessageSquareWarning, RefreshCw, BarChart4 } from "lucide-react"
import { toast } from "sonner";

export default function BdqAiCockpitPage() {
    // Mock Data reflecting BdqConversationState
    const [conversations] = useState([
        {
            id: "BDQ-CONV-001",
            phone: "+225 0707070707",
            status: "EN_COURS",
            botExtracted: {
                nom: "KONE Seydou",
                loyer: 150000,
                description: "Studio - Bingerville",
                date: "01/01/2023"
            },
            stats: { echanges: 4, tokens: 450, cost: 25 }, // AI inference mock cost
            lastMessage: "En attente de la confirmation du loyer mensuel..."
        },
        {
            id: "BDQ-CONV-002",
            phone: "+225 0505050505",
            status: "TERMINE_AVEC_SUCCES",
            botExtracted: {
                nom: "TIEHI Marie",
                loyer: 120000,
                description: "2 Pièces - Cocody Angré",
                date: "15/06/2024"
            },
            stats: { echanges: 3, tokens: 320, cost: 18 },
            lastMessage: "Contrat généré et signé numériquement par SMS."
        },
        {
            id: "BDQ-CONV-003",
            phone: "+225 0101010101",
            status: "BLOCAGE_IA",
            botExtracted: {
                nom: "N'GUESSAN Koffi",
                loyer: null,
                description: "Villa - Yopougon Ananeraie",
                date: null
            },
            stats: { echanges: 6, tokens: 820, cost: 45 },
            lastMessage: "Le locataire conteste le montant soumis."
        }
    ])

    const totalConversations = conversations.length
    const successCount = conversations.filter(c => c.status === "TERMINE_AVEC_SUCCES").length
    const costFcfa = conversations.reduce((acc, c) => acc + c.stats.cost, 0)
    
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-violet-600 to-indigo-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <Bot size={12} /> Intelligence Artificielle QAPRIL
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3 mt-2">
                         <SmartphoneNfc className="text-violet-600" size={32} /> Bot Négociateur
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Supervision en temps réel de l'Extraction Sémantique WhatsApp pour les Baux Verbaux.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-white border text-qnavy border-qgrey-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qgrey-1 transition-all shadow-sm flex items-center gap-2">
                        <BarChart4 size={16} /> Rapport API
                    </button>
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-violet-500/25 transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Initier Nouvelle Saisie IA
                    </button>
                </div>
            </div>

            {/* AI Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[linear-gradient(135deg,#4C1D95_0%,#1E1B4B_100%)] p-5 rounded-[2rem] shadow-lg flex flex-col justify-center relative overflow-hidden">
                    <Bot className="absolute -right-4 -bottom-4 text-white opacity-5" size={100} />
                    <span className="text-[9px] font-black text-violet-200 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-1.5"><MessageCircle size={10}/> Conversations Actives</span>
                    <span className="text-3xl font-black text-white relative z-10">{totalConversations}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><CheckCircle2 size={10} className="text-qgreen" /> Cadrages Réussis</span>
                    <span className="text-xl font-black text-qnavy-dark">{successCount} <span className="text-[10px] text-qtext-light">baux formalisés</span></span>
                </div>

                <div className="bg-violet-50/50 p-5 rounded-2xl border border-violet-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Zap size={10}/> Inference Tokens Total</span>
                    <span className="text-xl font-black text-violet-700">1,590 <span className="text-[10px]">tokens</span></span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-qgrey-2 shadow-sm flex flex-col justify-center">
                     <span className="text-[9px] font-black text-qtext-light uppercase tracking-widest mb-1">Coût Estimé LLM</span>
                     <span className="text-xl font-black text-qnavy-dark">{costFcfa} <span className="text-[10px] text-qtext-light">FCFA</span></span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                 {/* Live Monitor Table */}
                <div className="flex-1 bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-qgrey-2 flex justify-between items-center bg-qgrey-1/30">
                        <h2 className="text-sm font-black text-qnavy-dark flex items-center gap-2">
                            Moteur Sémantique WhatsApp
                        </h2>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Numéro locataire..." className="w-full pl-9 pr-4 py-2 bg-white border border-qgrey-2 rounded-lg text-xs font-bold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-qgrey-2">
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light pl-6">Cible (Téléphone)</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Extraction (IA)</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Métriques Modèle</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light">Dernière Transco</th>
                                    <th className="p-4 font-black text-[9px] uppercase tracking-widest text-qtext-light text-right pr-6">Statut Loop</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conversations.map((c) => (
                                    <tr key={c.id} className="border-b border-qgrey-2 hover:bg-violet-50/30 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-sm text-qnavy-dark">{c.phone}</p>
                                            <p className="text-[10px] font-black uppercase text-qtext-light mt-0.5">{c.id}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex gap-2 text-[10px] font-bold">
                                                    <span className="text-qtext-light w-12">Locataire:</span> 
                                                    <span className={c.botExtracted.nom ? "text-violet-700" : "text-qorange"}>{c.botExtracted.nom || "En extraction..."}</span>
                                                </div>
                                                <div className="flex gap-2 text-[10px] font-bold">
                                                    <span className="text-qtext-light w-12">Loyer:</span> 
                                                    <span className={c.botExtracted.loyer ? "text-violet-700" : "text-qorange"}>{c.botExtracted.loyer ? `${c.botExtracted.loyer.toLocaleString()} F` : "Inconnu"}</span>
                                                </div>
                                                <div className="flex gap-2 text-[10px] font-bold">
                                                    <span className="text-qtext-light w-12">Lieu:</span> 
                                                    <span className="text-qtext-mid max-w-[120px] truncate block" title={c.botExtracted.description}>{c.botExtracted.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                             <p className="font-bold text-xs text-qnavy"><span className="text-qtext-light">Cycles:</span> {c.stats.echanges}</p>
                                             <p className="text-[10px] font-black text-qtext-mid mt-0.5"><span className="text-qtext-light">Tokens:</span> {c.stats.tokens}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-[10px] font-medium text-qtext-mid max-w-[150px] italic">"{c.lastMessage}"</p>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            {c.status === 'EN_COURS' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 text-[9px] font-black uppercase tracking-widest rounded-lg animate-pulse shadow-sm">
                                                    <RefreshCw size={10} className="animate-spin duration-[3000ms]" /> Processing
                                                </span>
                                            )}
                                            {c.status === 'TERMINE_AVEC_SUCCES' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-qgreen-pale text-qgreen text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                                    <CheckCircle2 size={10} /> Complété
                                                </span>
                                            )}
                                            {c.status === 'BLOCAGE_IA' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                                    <MessageSquareWarning size={10} /> Human Override
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Console Sidebar */}
                <div className="w-full lg:w-[350px] bg-slate-900 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col text-slate-300 font-mono">
                     <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                             <Bot className="text-violet-400" size={16} />
                             <span className="text-xs font-bold text-slate-100">Terminal IA Logic</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-3 text-[10px] leading-relaxed">
                        <p><span className="text-emerald-400">root@Qapril-Bot:~#</span> Initialize Context</p>
                        <p className="text-slate-400">&gt; Starting new whatsapp session for +225 0707070707...</p>
                        <p><span className="text-violet-300">BOT:</span> Bonjour ! Je suis l'assistant de votre propriétaire. Pouvez-vous confirmer votre nom ?</p>
                        <p><span className="text-blue-300">USER:</span> C'est moi KONE Seydou</p>
                        <p className="text-emerald-400">&gt; Model Extracted [Nom: "KONE Seydou"] (Confidence: 0.99)</p>
                        <p><span className="text-violet-300">BOT:</span> Merci Seydou ! Confirmez-vous que votre loyer actuel est de 150.000 FCFA pour le Studio à Bingerville ?</p>
                        <p><span className="text-blue-300">USER:</span> Oui c'est ça.</p>
                        <p className="text-emerald-400">&gt; Loop success. Awaiting signature token via OTP SMS...</p>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-slate-700/50 flex">
                         <span className="text-emerald-400 pr-2">_</span>
                         <span className="w-full animate-pulse border-b-2 border-emerald-400"></span>
                     </div>
                </div>
            </div>
        </div>
    )
}

function Plus({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
