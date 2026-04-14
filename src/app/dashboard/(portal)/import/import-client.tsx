"use client"

import React, { useState, useTransition } from "react"
import { HardDriveUpload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner";
import { processCsvImport } from "@/actions/import-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard";

export default function ImportDashboardClient() {
    const [isUploading, setIsUploading] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (!content) {
                toast.error("Impossible de lire le fichier");
                setIsUploading(false);
                return;
            }

            startTransition(async () => {
                 const res = await processCsvImport(content)
                 setIsUploading(false)
                 
                 if (res.error) {
                     toast.error(res.error)
                 } else {
                     toast.success(`${res.count} propriétés et locataires importés avec succès !`)
                 }
            })
        };
        reader.readAsText(file);
    }

    return (
        <div className="space-y-6 relative">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <HardDriveUpload className="text-sky-600" size={32} /> Importation Massive (CSV)
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Transférez votre parc immobilier existant depuis Excel en un seul clic.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Drag and Drop Zone */}
                 <div className={`md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[16px] p-12 text-center relative transition-all flex flex-col items-center justify-center min-h-[300px] ${isPending ? 'opacity-90 cursor-not-allowed' : 'hover:bg-slate-100/50 hover:border-slate-400 cursor-pointer group'}`}>
                     <input type="file" accept=".csv" onChange={handleUpload} disabled={isPending || isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     {isUploading ? (
                         <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in">
                             <Loader2 size={48} className="text-sky-600 animate-spin mb-4" />
                             <h3 className="text-xl font-black text-slate-900 mb-2">Analyse du fichier en cours...</h3>
                             <p className="text-[13px] font-bold text-slate-500">Vérification de la structure et geocoding...</p>
                         </div>
                     ) : (
                         <>
                             <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-6 border border-sky-100 shadow-sm group-hover:scale-110 transition-transform">
                                 <FileSpreadsheet size={32} />
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 mb-2">Glissez votre fichier ici (CSV)</h3>
                             <p className="text-[13px] font-medium text-slate-500 mb-8 max-w-md">
                                 Taille maximale : 10 MB. Le fichier doit respecter le formatage strict de la matrice QAPRIL.
                             </p>
                             <button className="bg-slate-800 text-white px-8 py-3.5 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm pointer-events-none">
                                 Parcourir les fichiers
                             </button>
                         </>
                     )}
                 </div>

                 {/* Instructions and Template */}
                 <div className="space-y-6">
                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[16px] p-8 text-white relative shadow-md overflow-hidden border border-slate-700">
                         <h3 className="text-[15px] font-black mb-4 flex items-center gap-2">
                             Étape 1 : Le Modèle
                         </h3>
                         <p className="text-[13px] text-slate-300 font-medium leading-relaxed mb-6">
                             Pour garantir l'intégrité de la base de données, vous devez utiliser le modèle standard QAPRIL fournissant les colonnes pré-requises (Locataire, Loyer, CNI, Échéance).
                         </p>
                         <button onClick={() => toast.success('Matrice d\'importation téléchargée')} className="w-full bg-white text-slate-900 px-4 py-3 rounded-[8px] font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex justify-center items-center gap-2">
                             <Download size={14} /> Model_QAPRIL.xlsx
                         </button>
                     </div>

                     <SectionCard title="Moteur de Validation IA">
                         <ul className="space-y-4 px-2 py-1">
                             <li className="flex items-start gap-3">
                                 <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16}/>
                                 <p className="text-[12px] font-medium text-slate-600">Détection des doublons de CNI/Téléphone instantanée.</p>
                             </li>
                             <li className="flex items-start gap-3">
                                 <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16}/>
                                 <p className="text-[12px] font-medium text-slate-600">Vérification de l'existence des adresses via Geocoding.</p>
                             </li>
                             <li className="flex items-start gap-3">
                                 <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16}/>
                                 <p className="text-[12px] font-medium text-slate-600">Interruption de la ligne si le format de date (YYYY-MM-DD) est incorrect.</p>
                             </li>
                         </ul>
                     </SectionCard>
                 </div>
            </div>
        </div>
    )
}
