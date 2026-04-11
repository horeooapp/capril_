"use client"

import React, { useState } from "react"
import { HardDriveUpload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, ArrowRight, Loader2 } from "lucide-react"

export default function ImportDashboardPage() {
    const [isUploading, setIsUploading] = useState(false)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-qnavy-dark uppercase tracking-tighter flex items-center gap-3">
                        <HardDriveUpload className="text-qblue" size={32} /> Importation Massive (CSV)
                    </h1>
                    <p className="text-sm font-medium text-qtext-mid mt-1">
                        Transférez votre parc immobilier existant depuis Excel en un seul clic.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                 {/* Drag and Drop Zone */}
                 <div className="md:col-span-2 bg-white border-2 border-dashed border-qnavy/30 rounded-[2rem] p-12 text-center relative hover:bg-qnavy-pale/10 hover:border-qnavy transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[300px]">
                     {isUploading ? (
                         <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in">
                             <Loader2 size={48} className="text-qnavy animate-spin mb-4" />
                             <h3 className="text-xl font-black text-qnavy-dark mb-2">Analyse du fichier en cours...</h3>
                             <p className="text-sm font-bold text-qtext-mid">Vérification de la structure et des erreurs (Lignes: 342)</p>
                         </div>
                     ) : (
                         <>
                             <div className="w-20 h-20 bg-qblue-pale text-qblue rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                 <FileSpreadsheet size={32} />
                             </div>
                             <h3 className="text-2xl font-black text-qnavy-dark mb-2">Glissez votre fichier ici</h3>
                             <p className="text-sm font-medium text-qtext-mid mb-8 max-w-md">
                                 Uniquement les fichiers <strong>.csv</strong> ou <strong>.xlsx</strong>. Taille maximale : 10 MB. Le fichier doit respecter le formatage strict de la matrice QAPRIL.
                             </p>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setIsUploading(true); setTimeout(() => setIsUploading(false), 3000); }}
                                className="bg-qnavy text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-lg"
                             >
                                 Parcourir les fichiers
                             </button>
                         </>
                     )}
                 </div>

                 {/* Instructions and Template */}
                 <div className="space-y-6">
                     <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#111827_100%)] rounded-[2rem] p-8 text-white relative shadow-lg">
                         <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                             Étape 1 : Le Modèle
                         </h3>
                         <p className="text-sm text-gray-300 font-medium leading-relaxed mb-6">
                             Pour garantir l'intégrité de la base de données, vous devez utiliser le modèle standard QAPRIL fournissant les colonnes pré-requises (Locataire, Loyer, CNI, Échéance).
                         </p>
                         <button className="w-full bg-white text-qnavy px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-sm flex justify-center items-center gap-2">
                             <Download size={14} /> Model_Import_QAPRIL.xlsx
                         </button>
                     </div>

                     <div className="bg-white border border-qgrey-2 rounded-[2rem] p-6 shadow-sm">
                         <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest border-b border-qgrey-2 pb-4 mb-4">Moteur de Validation IA</h3>
                         <ul className="space-y-4">
                             <li className="flex items-start gap-3">
                                 <CheckCircle className="text-qgreen shrink-0 mt-0.5" size={16}/>
                                 <p className="text-xs font-bold text-qtext-mid">Détection des doublons de CNI/Téléphone instantanée.</p>
                             </li>
                             <li className="flex items-start gap-3">
                                 <CheckCircle className="text-qgreen shrink-0 mt-0.5" size={16}/>
                                 <p className="text-xs font-bold text-qtext-mid">Vérification de l'existence des adresses via Geocoding.</p>
                             </li>
                             <li className="flex items-start gap-3">
                                 <AlertTriangle className="text-qorange shrink-0 mt-0.5" size={16}/>
                                 <p className="text-xs font-bold text-qtext-mid">Interruption de la ligne si le format de date (YYYY-MM-DD) est incorrect.</p>
                             </li>
                         </ul>
                     </div>
                 </div>
            </div>
        </div>
    )
}
