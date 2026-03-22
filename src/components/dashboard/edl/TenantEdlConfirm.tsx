"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, CheckCircle2, AlertTriangle, 
  ShieldCheck, Info, Save, Droplet, Zap, Key
} from "lucide-react";
import { confirmEdlByTenant } from "@/actions/edl-actions";

interface TenantEdlConfirmProps {
  edl: any;
  onClose: () => void;
}

export default function TenantEdlConfirm({ edl, onClose }: TenantEdlConfirmProps) {
  const [reserves, setReserves] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReservesForm, setShowReservesForm] = useState(false);

  const handleConfirm = async (confirm: boolean) => {
    setLoading(true);
    try {
      const res = await confirmEdlByTenant(edl.id, confirm, reserves);
      if (res.success) {
        onClose();
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              Révision de l&apos;État des Lieux
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Réf: {edl.refEdl} • {edl.typeEdl}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-gradient-to-b from-gray-900 to-black space-y-10">
          
          {/* Summary Banner */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2 text-blue-400">
                <Droplet className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Index Eau</span>
              </div>
              <p className="text-2xl font-black text-white">{edl.indexEau?.toString() || "0.00"}</p>
            </div>
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2 text-yellow-500">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Index Élec</span>
              </div>
              <p className="text-2xl font-black text-white">{edl.indexElec?.toString() || "0.00"}</p>
            </div>
            <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-2 text-emerald-500">
                <Key className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Clés remises</span>
              </div>
              <p className="text-2xl font-black text-white">{edl.clesRemises} CLÉS</p>
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Détails par pièce</h3>
            <div className="grid gap-4">
              {edl.sections && (edl.sections as any[]).map((section, idx) => (
                <div key={idx} className="p-6 bg-gray-800/20 border border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 font-bold">
                       {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{section.room}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{section.state}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 italic">
                       {section.comment || "Aucune observation particulière."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reserves Form */}
          {showReservesForm ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-red-500/5 border-2 border-red-500/20 rounded-3xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="text-sm font-black uppercase tracking-tight">Formuler des réserves</h4>
              </div>
              <textarea 
                value={reserves}
                onChange={(e) => setReserves(e.target.value)}
                placeholder="Détaillez ici les points de désaccord ou les éléments manquants..."
                className="w-full h-32 bg-black/40 border-2 border-red-500/20 rounded-2xl p-5 text-white focus:border-red-500 transition-all outline-none text-sm"
              />
              <div className="flex justify-end gap-3">
                 <button 
                  onClick={() => setShowReservesForm(false)}
                  className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest"
                 >Annuler</button>
                 <button 
                  onClick={() => handleConfirm(false)}
                  disabled={loading || !reserves}
                  className="px-6 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest disabled:opacity-50"
                 >Enregistrer & Contester</button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 bg-indigo-500/5 border-2 border-indigo-500/10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex gap-4">
                  <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div>
                     <p className="text-xs font-bold text-indigo-200">Validation Bilatérale</p>
                     <p className="text-[10px] text-indigo-300/60 mt-1 leading-relaxed max-w-md">
                        En confirmant cet état des lieux, vous attestez de l&apos;exactitude des relevés. 
                        Le document sera alors scellé avec un hash SHA-256 infalsifiable.
                     </p>
                  </div>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                 <button 
                  onClick={() => setShowReservesForm(true)}
                  className="flex-1 md:flex-none px-6 py-3 bg-gray-800 text-gray-400 text-[10px] font-black rounded-xl hover:bg-gray-700 hover:text-white transition-all uppercase tracking-widest"
                 >Contester</button>
                 <button 
                  onClick={() => handleConfirm(true)}
                  disabled={loading}
                  className="flex-1 md:flex-none px-10 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                 >Confirmer & Signer</button>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
