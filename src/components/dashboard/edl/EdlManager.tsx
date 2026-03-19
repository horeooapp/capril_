"use client"

import { useState } from "react";
import { Camera, FileText, Plus, ChevronRight } from "lucide-react";
import EdlForm from "./EdlForm";

interface EdlManagerProps {
  leaseId: string;
  initialEdls: any[];
}

export default function EdlManager({ leaseId, initialEdls }: EdlManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [edlType, setEdlType] = useState<"ENTREE" | "SORTIE" | "INVENTAIRE">("ENTREE");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="mr-2">📸</span> États des Lieux
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => { setEdlType("ENTREE"); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-3 h-3" /> Entrée
          </button>
          <button 
            onClick={() => { setEdlType("SORTIE"); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-all"
          >
            <Plus className="w-3 h-3" /> Sortie
          </button>
        </div>
      </div>

      {initialEdls.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
          <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">Aucun état des lieux enregistré pour ce bail.</p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter cursor-pointer hover:text-indigo-500" onClick={() => { setEdlType("ENTREE"); setShowForm(true); }}>Commencer maintenant</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {initialEdls.map((edl) => (
            <div key={edl.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  edl.typeEdl === "ENTREE" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    EDL {edl.typeEdl === "ENTREE" ? "d'Entrée" : "de Sortie"}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Le {new Date(edl.createdAt).toLocaleDateString('fr-FR')} • {edl.statut}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          ))}
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
