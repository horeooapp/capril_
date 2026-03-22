"use client"

import { useState } from "react";
import { 
  FileText, CheckCircle2, AlertTriangle, 
  Hourglass, ShieldCheck, Eye, ChevronRight
} from "lucide-react";
import TenantEdlConfirm from "./TenantEdlConfirm";

interface TenantEdlManagerProps {
  leaseId: string;
  edls: any[];
}

export default function TenantEdlManager({ leaseId, edls }: TenantEdlManagerProps) {
  const [selectedEdl, setSelectedEdl] = useState<any>(null);

  if (edls.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">États des Lieux 📸</h2>
        <span className="text-[10px] bg-indigo-500 text-white px-2 py-1 rounded font-black uppercase tracking-widest">Valeur Probante</span>
      </div>

      <div className="grid gap-3">
        {edls.map((edl) => {
          const isPending = edl.statut === "SOUMIS_LOCATAIRE";
          const isCertified = edl.statut === "CERTIFIE";
          
          return (
            <div 
              key={edl.id} 
              className={`p-4 rounded-2xl border-2 transition-all ${
                isPending ? "border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100 animate-pulse-subtle" : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isPending ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCertified ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                      EDL {edl.typeEdl === "ENTREE" ? "d'Entrée" : "de Sortie"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                       {new Date(edl.createdAt).toLocaleDateString('fr-FR')} • {edl.statut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isPending ? (
                    <button 
                      onClick={() => setSelectedEdl(edl)}
                      className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest"
                    >
                      Répondre & Signer
                    </button>
                  ) : (
                    <button 
                      onClick={() => setSelectedEdl(edl)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {isPending && edl.expireConfirmationAt && (
                <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-white/50 p-2 rounded-lg border border-indigo-100">
                  <Hourglass className="w-3 h-3" />
                  Validation automatique dans ~48h
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedEdl && (
        <TenantEdlConfirm 
          edl={selectedEdl} 
          onClose={() => setSelectedEdl(null)} 
        />
      )}
    </div>
  );
}
