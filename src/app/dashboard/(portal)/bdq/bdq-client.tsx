"use client"

import React from "react"
import { Bot, MessageCircle, CheckCircle2, Search, SmartphoneNfc, Plus, Zap, MessageSquareWarning, RefreshCw, BarChart4, X, Loader2 } from "lucide-react"
import { toast } from "sonner";
import { createBDQ } from "@/actions/bdq";
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function BdqAiCockpitClient({ initialConversations }: { initialConversations: any[] }) {
    const conversations = initialConversations || [];

    const totalConversations = conversations.length
    const successCount = conversations.filter(c => c.status === "TERMINE_AVEC_SUCCES" || c.status === "COMPLETE").length
    const costFcfa = conversations.reduce((acc, c) => acc + (c.stats?.cost || 0), 0)
    
    // Modal state
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);
    const [formData, setFormData] = React.useState({ telephoneLocataire: "", nomLocataire: "", descriptionLogement: "" });

    const handleCreateBDQ = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await createBDQ(formData as any);
            if(res.success) {
                toast.success("Demande BDQ initiée, attente de confirmation WhatsApp !");
                setIsCreateOpen(false);
                setFormData({ telephoneLocataire: "", nomLocataire: "", descriptionLogement: "" });
            } else {
                toast.error(res.error || "Erreur lors de l'initiation");
            }
        } catch (err) {
            toast.error("Erreur technique");
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className="space-y-6 relative">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-violet-600 to-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[8px] inline-flex items-center gap-2 shadow-sm">
                        <Bot size={12} /> Intelligence Artificielle QAPRIL
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3 mt-2">
                         <SmartphoneNfc className="text-violet-600" size={32} /> Bot Négociateur
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                        Supervision en temps réel de l'Extraction Sémantique WhatsApp pour les Baux Verbaux.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast.success('Ouverture du portail d\'analyse API...')} className="bg-white border text-slate-900 border-slate-200 px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <BarChart4 size={16} /> Rapport API
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setIsCreateOpen(true); }} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:shadow-lg hover:shadow-violet-500/25 transition-all shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Initier Nouvelle Saisie IA
                    </button>
                </div>
            </div>

            {/* AI Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-violet-800 to-indigo-900 p-6 rounded-[16px] shadow-lg flex flex-col justify-center relative overflow-hidden text-white border border-violet-700">
                    <Bot className="absolute -right-4 -bottom-4 opacity-10" size={100} />
                    <span className="text-[9.5px] font-bold text-violet-300 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5 border border-violet-400/30 w-max px-2 py-0.5 rounded-[6px] bg-violet-900/50"><MessageCircle size={10}/> Conversations Actives</span>
                    <span className="text-3xl font-black relative z-10">{totalConversations}</span>
                </div>

                <StatCard 
                    label="Cadrages Réussis"
                    value={`${successCount}`}
                    sub="baux formalisés"
                />

                <div className="bg-violet-50/50 p-6 rounded-[16px] border border-violet-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Zap size={10}/> Inference Tokens Total</span>
                    <span className="text-2xl font-black text-violet-900">{conversations.reduce((acc, c) => acc + (c.stats?.tokens || 0), 0).toLocaleString()} <span className="text-[12px] font-medium text-violet-600">tokens</span></span>
                </div>

                <StatCard 
                    label="Coût Estimé LLM"
                    value={costFcfa.toLocaleString()}
                    sub="FCFA"
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                 {/* Live Monitor Table */}
                <div className="flex-1">
                    <SectionCard title="Moteur Sémantique WhatsApp" icon={<Bot className="text-violet-500" />}>
                        <div className="mb-4">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" placeholder="Numéro locataire..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[10px] text-[13px] font-bold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-slate-800" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Cible (Téléphone)</th>
                                        <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Extraction (IA)</th>
                                        <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Métriques Modèle</th>
                                        <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right pr-2">Statut Loop</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conversations.length === 0 && (
                                         <tr><td colSpan={4} className="py-8 text-center text-slate-500 font-bold text-[13px] bg-slate-50 rounded-[12px] border border-dashed border-slate-200">Aucune requête en cours.</td></tr>
                                    )}
                                    {conversations.map((c) => (
                                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                            <td className="py-4 pl-2">
                                                <p className="font-bold text-[14px] text-slate-900">{c.phone}</p>
                                                <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5 font-mono">{c.id.substring(0,8)}</p>
                                            </td>
                                            <td className="py-4">
                                                <div className="space-y-1">
                                                    <div className="flex gap-2 text-[11px] font-bold">
                                                        <span className="text-slate-500 w-14">Locataire:</span> 
                                                        <span className={c.botExtracted?.nom ? "text-violet-700 font-black" : "text-amber-500 font-medium"}>{c.botExtracted?.nom || "En extraction..."}</span>
                                                    </div>
                                                    <div className="flex gap-2 text-[11px] font-bold">
                                                        <span className="text-slate-500 w-14">Loyer:</span> 
                                                        <span className={c.botExtracted?.loyer ? "text-slate-900 font-black" : "text-amber-500 font-medium"}>{c.botExtracted?.loyer ? `${c.botExtracted.loyer.toLocaleString()} F` : "Inconnu"}</span>
                                                    </div>
                                                    <div className="flex gap-2 text-[11px] font-bold">
                                                        <span className="text-slate-500 w-14">Lieu:</span> 
                                                        <span className="text-slate-600 max-w-[150px] truncate block font-medium" title={c.botExtracted?.description}>{c.botExtracted?.description || "Inconnu"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                 <p className="font-bold text-[12px] text-slate-900"><span className="text-slate-400 font-medium">Cycles:</span> {c.stats?.echanges || 0}</p>
                                                 <p className="text-[11px] font-bold text-slate-600 mt-0.5"><span className="text-slate-400 font-medium">Tokens:</span> {c.stats?.tokens || 0}</p>
                                            </td>
                                            <td className="py-4 pr-2 text-right">
                                                {c.status === 'EN_COURS' && (
                                                    <Badge color="blue" className="animate-pulse bg-violet-100 text-violet-700 border-violet-200">
                                                        <RefreshCw size={10} className="animate-spin duration-[3000ms] mr-1 inline" /> Processing
                                                    </Badge>
                                                )}
                                                {(c.status === 'TERMINE_AVEC_SUCCES' || c.status === 'COMPLETE') && (
                                                    <Badge color="green">
                                                        <CheckCircle2 size={10} className="mr-1 inline" /> Complété
                                                    </Badge>
                                                )}
                                                {c.status === 'BLOCAGE_IA' && (
                                                    <Badge color="red" className="bg-rose-50 text-rose-600 border border-rose-200">
                                                        <MessageSquareWarning size={10} className="mr-1 inline" /> Human Override
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>

                {/* AI Console Sidebar */}
                <div className="w-full lg:w-[350px] bg-slate-900 rounded-[16px] p-6 shadow-xl relative overflow-hidden flex flex-col text-slate-300 font-mono border border-slate-800">
                     <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                             <Bot className="text-violet-400" size={16} />
                             <span className="text-[12px] font-bold text-slate-100 uppercase tracking-widest">Terminal IA</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-3 text-[11px] leading-relaxed">
                        <p><span className="text-emerald-400 font-bold">root@Qapril-Bot:~#</span> Waiting for active sessions...</p>
                        <p className="text-slate-400">&gt; LLM Interface stands by.</p>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-slate-700/50 flex">
                         <span className="text-emerald-400 pr-2">_</span>
                         <span className="w-full animate-pulse border-b-2 border-emerald-400/50"></span>
                     </div>
                </div>
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
                            <h2 className="text-xl font-black text-violet-900 flex items-center gap-2"><SmartphoneNfc size={20} className="text-violet-600"/> Nouvelle Saisie BDQ</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors border border-slate-200"><X size={16}/></button>
                        </div>
                        <form onSubmit={handleCreateBDQ} className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Numéro WhatsApp Locataire</label>
                                <input required type="text" value={formData.telephoneLocataire} onChange={e => setFormData({...formData, telephoneLocataire: e.target.value})} placeholder="ex: 2250102030405" className="w-full border border-slate-200 p-3 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Nom ou Pseudo</label>
                                <input required type="text" value={formData.nomLocataire} onChange={e => setFormData({...formData, nomLocataire: e.target.value})} placeholder="ex: Tantie Affou" className="w-full border border-slate-200 p-3 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Description Brève Logement</label>
                                <input required type="text" value={formData.descriptionLogement} onChange={e => setFormData({...formData, descriptionLogement: e.target.value})} placeholder="ex: Entrer Coucher Yopougon" className="w-full border border-slate-200 p-3 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isCreating} className="w-full py-3.5 rounded-[10px] bg-violet-600 text-white font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer">
                                    {isCreating ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16}/>}
                                    Déployer Agent IA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
