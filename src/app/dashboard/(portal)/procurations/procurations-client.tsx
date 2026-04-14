"use client"

import React, { useState, useTransition } from "react"
import { FileSignature, ShieldCheck, Download, Plus, Key, X, Loader2 } from "lucide-react"
import { toast } from "sonner";
import { createProcuration, generateProcurationPDF } from "@/actions/procuration-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function ProcurationDashboardClient({ initialProcurations }: { initialProcurations: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const res = await createProcuration(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Délégation émise avec succès !");
                setIsModalOpen(false);
            }
        });
    }

    const handleDownload = async (procId: string) => {
        toast.loading("Génération cryptographique du document...", { id: procId });
        const res = await generateProcurationPDF(procId);
        
        if (res.error || !res.pdfBase64) {
            toast.error(res.error || "Erreur de génération", { id: procId });
            return;
        }

        toast.success("Document prêt ! Téléchargement...", { id: procId });
        
        // Trigger download
        const linkSource = `data:application/pdf;base64,${res.pdfBase64}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = `Procuration_${procId.substring(0,6)}.pdf`;
        downloadLink.click();
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <FileSignature className="text-purple-600" size={32} /> Procurations & Actes
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Délégations de signature notariées et mandats annexes pour les collaborateurs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md flex items-center gap-2 border border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
                        <Plus size={16} /> Émettre Délégation
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-800 to-slate-900 rounded-[20px] p-8 md:p-12 text-white relative shadow-lg overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 border border-purple-700/50">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-purple-500/20 px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-purple-400/30 text-purple-100">
                        <ShieldCheck size={14} className="text-purple-300"/> Validité Juridique
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4 text-white">La traçabilité absolue des délégations de gestion.</h2>
                    <p className="text-slate-300 text-[14px] font-medium leading-relaxed mb-4">
                        Ce coffre-fort numérique lie automatiquement une procuration (signée électroniquement) aux droits d'accès de l'utilisateur dans QAPRIL.
                    </p>
                </div>
                <Key size={220} className="absolute right-0 opacity-5 rotate-12 pointer-events-none" />
            </div>

            <SectionCard title="Délégations Émises" icon={<FileSignature className="text-purple-500" />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-2">Référence Acte</th>
                                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Délégataire</th>
                                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Périmètre</th>
                                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</th>
                                <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right pr-2">Document</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialProcurations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-slate-500 font-bold text-[13px] bg-slate-50 rounded-[12px] border border-dashed border-slate-200">Aucune procuration émise.</td>
                                </tr>
                            ) : (
                                initialProcurations.map(proc => (
                                    <tr key={proc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pl-2 font-bold text-[13px] text-slate-900 font-mono">PROC-{proc.id.substring(0,6).toUpperCase()}</td>
                                        <td className="py-4 font-bold text-[14px] text-purple-700">{proc.mandataire?.firstName} {proc.mandataire?.lastName}</td>
                                        <td className="py-4 text-[13px] font-medium text-slate-600">{proc.droits?.action || "Global"}</td>
                                        <td className="py-4">
                                            {proc.actif ? (
                                                <Badge color="green">Active</Badge>
                                            ) : (
                                                <Badge color="red">Expirée</Badge>
                                            )}
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <button onClick={() => handleDownload(proc.id)} className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-purple-600 transition-colors border border-slate-200 hover:border-purple-200 hover:bg-purple-50 bg-white px-3 py-2 rounded-[8px] flex items-center gap-1.5 ml-auto shadow-sm">
                                                <Download size={14}/> Copie PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>


            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-purple-50/50">
                            <h2 className="text-lg font-black text-purple-950 uppercase tracking-tight flex items-center gap-2">
                                <FileSignature className="text-purple-500" size={20}/> Émission d'Acte
                            </h2>
                            <button onClick={()=>setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex justify-center items-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"><X size={16}/></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6">
                            <p className="text-[13px] text-slate-500 mb-6 bg-slate-50 p-3 rounded-[10px] border border-slate-100 font-medium leading-relaxed">
                                Cet outil enregistre légalement la délégation et modifie les accès QAPRIL immédiatement.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Email / Phone du Délégataire</label>
                                    <input type="text" name="email" required className="w-full p-3 border border-slate-200 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"/>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Périmètre</label>
                                    <select name="perimetre" className="w-full p-3 border border-slate-200 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer">
                                        <option value="Signature Baux Commerciaux">Signature Baux Commerciaux</option>
                                        <option value="Recouvrement Amiable">Recouvrement Amiable</option>
                                        <option value="Encaissement d'espèces">Encaissement d'espèces</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Fin de validité</label>
                                    <input type="date" name="dateFin" required className="w-full p-3 border border-slate-200 rounded-[10px] text-[13px] font-bold focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer text-slate-600"/>
                                </div>
                            </div>
                            <div className="pt-2 mt-6">
                                <button disabled={isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-[10px] font-bold text-[12px] uppercase tracking-widest transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                                    {isPending ? <Loader2 className="animate-spin" size={16}/> : 'Générer Procuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
