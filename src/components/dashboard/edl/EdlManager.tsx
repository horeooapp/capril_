"use client"

import { useState, useEffect } from "react";
import { 
  Camera, FileText, Plus, ChevronRight, 
  Send, Clock, CheckCircle2, ShieldCheck, 
  AlertTriangle, Eye
} from "lucide-react";
import EdlForm from "./EdlForm";
import { submitEdlToTenant } from "@/actions/edl-actions";

interface EdlManagerProps {
  leaseId: string;
  initialEdls: any[];
}

export default function EdlManager({ leaseId, initialEdls }: EdlManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [edlType, setEdlType] = useState<"ENTREE" | "SORTIE">("ENTREE");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSendToTenant = async (id: string) => {
    setLoading(id);
    try {
      const res = await submitEdlToTenant(id);
      if (!res.success) alert(res.error);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "EN_COURS": return { color: "text-amber-500 bg-amber-500/10", label: "Brouillon", icon: <FileText className="w-4 h-4" /> };
      case "SOUMIS_LOCATAIRE": return { color: "text-blue-500 bg-blue-500/10", label: "Attente Locataire", icon: <Clock className="w-4 h-4" /> };
      case "CONFIRME": return { color: "text-indigo-500 bg-indigo-500/10", label: "Confirmé", icon: <CheckCircle2 className="w-4 h-4" /> };
      case "CERTIFIE": return { color: "text-green-500 bg-green-500/10", label: "Certifié SHA-256", icon: <ShieldCheck className="w-4 h-4" /> };
      case "CONTESTE": return { color: "text-red-500 bg-red-500/10", label: "Contesté", icon: <AlertTriangle className="w-4 h-4" /> };
      default: return { color: "text-gray-500 bg-gray-500/10", label: status, icon: <FileText className="w-4 h-4" /> };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            États des Lieux
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Garantie d&apos;état et de restitution</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setEdlType("ENTREE"); setShowForm(true); }}
            className="group flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg shadow-gray-200"
          >
            <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Constat Entrée
          </button>
          <button 
            onClick={() => { setEdlType("SORTIE"); setShowForm(true); }}
            className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-900 text-gray-900 text-[10px] font-black rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" /> Constat Sortie
          </button>
        </div>
      </div>

      {initialEdls.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-50">
            <Camera className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-tighter">Aucun constat numérique</p>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">Initiez un constat pour sécuriser la caution et l&apos;état du logement.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {initialEdls.map((edl) => {
            const config = getStatusConfig(edl.statut);
            const isSoumis = edl.statut === "SOUMIS_LOCATAIRE";
            
            return (
              <div key={edl.id} className="relative overflow-hidden group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
                      edl.typeEdl === "ENTREE" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                          EDL {edl.typeEdl === "ENTREE" ? "ENTRÉE" : "SORTIE"}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${config.color} flex items-center gap-1`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        Réf: {edl.refEdl || "N/A"} • {new Date(edl.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {edl.statut === "EN_COURS" && (
                      <button 
                        onClick={() => handleSendToTenant(edl.id)}
                        disabled={loading === edl.id}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50"
                      >
                        {loading === edl.id ? "Envoi..." : <><Send className="w-3 h-3" /> Envoyer Locataire</>}
                      </button>
                    )}
                    
                    {isSoumis && edl.expireConfirmationAt && (
                        <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                            <Clock className="w-3 h-3 text-blue-500 animate-spin-slow" />
                            <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">
                                Auto-validation dans ~48h
                            </span>
                        </div>
                    )}

                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {edl.hashSha256 && (
                   <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <ShieldCheck className="w-3 h-3 text-green-500" />
                         <span className="text-[8px] font-mono text-gray-400 truncate max-w-[200px]">SHA-256: {edl.hashSha256}</span>
                      </div>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Calculé par QAPRIL Digital Vault</span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <EdlForm 
          leaseId={leaseId} 
          typeEdl={edlType} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
