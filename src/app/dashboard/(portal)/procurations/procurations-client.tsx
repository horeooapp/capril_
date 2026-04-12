"use client"

import React, { useState, useTransition } from "react"
import { FileSignature, ShieldCheck, Download, Plus, Key, X, Loader2 } from "lucide-react"
import { toast } from "sonner";
import { createProcuration, generateProcurationPDF } from "@/actions/procuration-actions"

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
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <FileSignature className="text-purple-600" size={32} /> Procurations & Actes
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Délégations de signature notariées et mandats annexes pour les collaborateurs.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md flex items-center gap-2">
                        <Plus size={16} /> Émettre Délégation
                    </button>
                </div>
            </div>

            <div className="bg-[linear-gradient(135deg,#6b21a8_0%,#3b0764_100%)] rounded-[2rem] p-8 md:p-12 text-white relative shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="relative z-10 max-w-xl">
                    <div className="bg-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 mb-6 border border-purple-400/30">
                        <ShieldCheck size={12} className="text-purple-300"/> Validité Juridique
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">La traçabilité absolue des délégations de gestion.</h2>
                    <p className="text-purple-100 text-sm font-medium leading-relaxed mb-6">
                        Ce coffre-fort numérique lie automatiquement une procuration (signée électroniquement) aux droits d'accès de l'utilisateur dans QAPRIL.
                    </p>
                </div>
                <Key size={200} className="absolute right-0 opacity-10 rotate-12 -translate-y-6 pointer-events-none" />
            </div>

            <div className="bg-white rounded-[2rem] border border-qgrey-2 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-qgrey-2">
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Référence Acte</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Délégataire</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Périmètre</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light">Statut</th>
                            <th className="p-5 font-black text-[10px] uppercase tracking-widest text-qtext-light text-right">Document</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialProcurations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-qtext-mid text-sm font-medium">Aucune procuration émise.</td>
                            </tr>
                        ) : (
                            initialProcurations.map(proc => (
                                <tr key={proc.id} className="border-b border-qgrey-2 hover:bg-qgrey-1/30 transition-colors">
                                    <td className="p-5 font-bold text-xs text-qnavy-dark max-w-[120px] truncate" title={proc.id}>PROC-{proc.id.substring(0,6).toUpperCase()}</td>
                                    <td className="p-5 font-bold text-sm text-purple-700">{proc.mandataire?.firstName} {proc.mandataire?.lastName}</td>
                                    <td className="p-5 text-xs text-qtext-mid">{proc.droits?.action || "Global"}</td>
                                    <td className="p-5">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${proc.actif ? 'text-qgreen bg-qgreen-pale' : 'text-qred bg-qred-pale'}`}>
                                            {proc.actif ? 'Active' : 'Expirée'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button onClick={() => handleDownload(proc.id)} className="text-[10px] font-black uppercase tracking-widest text-qnavy hover:text-purple-600 transition-colors border border-qgrey-2 px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto">
                                            <Download size={12}/> Copie PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-qnavy-dark/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-qgrey-2 pb-4">
                            <h2 className="text-lg font-black text-qnavy-dark uppercase tracking-tight flex items-center gap-2">
                                <FileSignature className="text-purple-500"/> Émission d'Acte
                            </h2>
                            <button onClick={()=>setIsModalOpen(false)} className="bg-qgrey-1 p-2 rounded-full hover:bg-qgrey-2"><X size={16}/></button>
                        </div>
                        <p className="text-xs text-qtext-mid mb-4">Cet outil enregistre légalement la délégation et modifie les accès QAPRIL immédiatement.</p>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div><label className="text-[10px] font-black uppercase text-qtext-light">Email / Phone du Délégataire</label><input type="text" name="email" required className="w-full p-3 border border-qgrey-2 rounded-xl mt-1"/></div>
                                <div><label className="text-[10px] font-black uppercase text-qtext-light">Périmètre</label>
                                    <select name="perimetre" className="w-full p-3 border border-qgrey-2 rounded-xl mt-1">
                                        <option value="Signature Baux Commerciaux">Signature Baux Commerciaux</option>
                                        <option value="Recouvrement Amiable">Recouvrement Amiable</option>
                                        <option value="Encaissement d'espèces">Encaissement d'espèces</option>
                                    </select>
                                </div>
                                <div><label className="text-[10px] font-black uppercase text-qtext-light">Fin de validité</label><input type="date" name="dateFin" required className="w-full p-3 border border-qgrey-2 rounded-xl mt-1"/></div>
                            </div>
                            <button disabled={isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl mt-6 font-bold text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2">
                                {isPending ? <Loader2 className="animate-spin" size={16}/> : 'Générer Procuration'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
