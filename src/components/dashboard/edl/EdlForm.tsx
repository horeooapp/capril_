"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, CheckCircle2, ChevronRight, ChevronLeft, 
  Droplet, Zap, Key, Wrench, PenTool, 
  AlertCircle, Save, X, Info
} from "lucide-react";
import { EDL_ROOMS, EDL_STATES, EdlPiece, EdlMeter } from "@/lib/edl";
import { createEdl } from "@/actions/edl-actions";

interface EdlFormProps {
  leaseId: string;
  typeEdl: "ENTREE" | "SORTIE";
  onClose: () => void;
}

export default function EdlForm({ leaseId, typeEdl, onClose }: EdlFormProps) {
  const [step, setStep] = useState(0);
  const [pieces, setPieces] = useState<EdlPiece[]>(
    EDL_ROOMS.map(room => ({
      room: room.id,
      state: "GOOD",
      comment: "",
      photos: []
    }))
  );
  
  const [meters, setMeters] = useState<EdlMeter[]>([
    { type: "WATER", reading: "" },
    { type: "ELECTRICITY", reading: "" },
  ]);

  const [keys, setKeys] = useState({
    count: 2,
    details: "1 clé porte principale, 1 clé portillon"
  });

  const [loading, setLoading] = useState(false);

  // Steps definition
  const roomsCount = EDL_ROOMS.length;
  const isMetersStep = step === roomsCount;
  const isKeysStep = step === roomsCount + 1;
  const isSummaryStep = step === roomsCount + 2;
  const totalSteps = roomsCount + 3;

  const currentRoom = EDL_ROOMS[step] || null;

  const handleUpdatePiece = (index: number, updates: Partial<EdlPiece>) => {
    setPieces(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mapping index for backend
      const indexEau = parseFloat(meters.find(m => m.type === "WATER")?.reading || "0");
      const indexElec = parseFloat(meters.find(m => m.type === "ELECTRICITY")?.reading || "0");

      const res = await createEdl({
        leaseId,
        typeEdl,
        indexEau,
        indexElec,
        clesRemises: keys.count,
        clesDetail: keys.details,
        sections: pieces, // Current pieces as JSON sections
      });
      
      if (res.success) {
        onClose();
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error("Error submitting EDL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-indigo-500 text-white text-[10px] font-black rounded uppercase tracking-widest">Digital Vault</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                Constat d&apos;État des Lieux
              </h2>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
              {typeEdl === "ENTREE" ? "📥 Entrée du Locataire" : "📤 Sortie du Locataire"} • Réf: GENERATION AUTO
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-all text-gray-500 group">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Progress System */}
        <div className="px-6 py-4 bg-gray-900/80 border-b border-gray-800/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 min-w-[30px] flex-1 rounded-full transition-all duration-500 ${
                i < step ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : 
                i === step ? "bg-indigo-400 animate-pulse" : "bg-gray-800"
              }`}
            />
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-gradient-to-b from-gray-900 to-black">
          <AnimatePresence mode="wait">
            {step < roomsCount ? (
              <motion.div 
                key={currentRoom?.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", damping: 25 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                    <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{currentRoom?.label}</h3>
                    <p className="text-gray-500 text-sm">Évaluez l&apos;état général et documentez avec des photos.</p>
                  </div>
                </div>

                {/* State Selection */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">État de conservation</label>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded font-bold">REQUIS</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {EDL_STATES.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => handleUpdatePiece(step, { state: state.id })}
                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                          pieces[step].state === state.id 
                            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_10px_30px_rgba(99,102,241,0.1)]" 
                            : "border-gray-800 bg-gray-800/30 hover:border-gray-700 hover:bg-gray-800/50"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mx-auto mb-3 transition-transform group-hover:scale-150 ${state.color}`} />
                        <span className={`text-sm font-black uppercase tracking-tighter ${pieces[step].state === state.id ? "text-white" : "text-gray-500"}`}>
                          {state.label}
                        </span>
                        {pieces[step].state === state.id && (
                          <motion.div layoutId="active-state" className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 className="w-3 h-3" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment & Photos Combined */}
                <div className="grid lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Observations Particulières</label>
                    <textarea
                      value={pieces[step].comment}
                      onChange={(e) => handleUpdatePiece(step, { comment: e.target.value })}
                      placeholder="Ex: Micro-rayures sur le parquet, tâche peinture..."
                      className="w-full h-48 bg-gray-800/20 border-2 border-gray-800 rounded-2xl p-5 text-white focus:border-indigo-500 transition-all outline-none resize-none font-medium text-sm shadow-inner"
                    />
                  </div>
                  <div className="space-y-4">
                     <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Preuves Photos (Horodatées)</label>
                     <div className="grid grid-cols-2 gap-4 h-48">
                        <button className="rounded-2xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-500/5 transition-all group overflow-hidden relative">
                           <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <Camera className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Capture Photo</span>
                        </button>
                        <div className="rounded-2xl bg-gray-800/20 border-2 border-gray-800 flex items-center justify-center">
                           <Info className="w-6 h-6 text-gray-600" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : isMetersStep ? (
              <motion.div 
                key="meters"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                    <Droplet className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Relévés Compteurs</h3>
                    <p className="text-gray-500 text-sm">Assurez la transition des charges sans litige futur.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {meters.map((meter, i) => (
                    <div key={meter.type} className="group p-8 bg-gray-800/20 border-2 border-gray-800 rounded-3xl hover:border-indigo-500/50 transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-2xl ${
                          meter.type === "WATER" ? "bg-blue-500/10 text-blue-500" : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {meter.type === "WATER" ? <Droplet /> : <Zap />}
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">
                          {meter.type === "WATER" ? "Index Eau" : "Index Électricité"}
                        </h4>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={meter.reading}
                          onChange={(e) => {
                            const newMeters = [...meters];
                            newMeters[i].reading = e.target.value;
                            setMeters(newMeters);
                          }}
                          placeholder="0000.00"
                          className="w-full bg-black/40 border-2 border-gray-800 rounded-2xl py-6 px-6 text-2xl font-black text-white focus:border-indigo-500 outline-none transition-all placeholder:text-gray-800"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2">
                           <button className="p-3 bg-gray-800 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
                              <Camera className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : isKeysStep ? (
              <motion.div 
                key="keys"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                    <Key className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Remise des Clés</h3>
                    <p className="text-gray-500 text-sm">Inventaire précis des accès remis au locataire.</p>
                  </div>
                </div>

                <div className="p-10 bg-gray-800/20 border-2 border-gray-800 rounded-3xl space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 text-center">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Nombre de clés</label>
                       <div className="flex items-center justify-center gap-6">
                          <button 
                            onClick={() => setKeys(k => ({...k, count: Math.max(0, k.count - 1)}))}
                            className="w-12 h-12 rounded-full border-2 border-gray-700 text-white hover:bg-gray-800 transition-all font-black text-xl"
                          >-</button>
                          <span className="text-6xl font-black text-white">{keys.count}</span>
                          <button 
                            onClick={() => setKeys(k => ({...k, count: k.count + 1}))}
                            className="w-12 h-12 rounded-full border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all font-black text-xl"
                          >+</button>
                       </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Détails de l&apos;organigramme</label>
                      <textarea
                        value={keys.details}
                        onChange={(e) => setKeys(k => ({...k, details: e.target.value}))}
                        placeholder="Ex: 2 clés porte d'entrée, 1 pass parking, 1 télécommande..."
                        className="w-full h-32 bg-black/40 border-2 border-gray-800 rounded-2xl p-5 text-white focus:border-indigo-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                    <PenTool className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">Scellé & Publication</h3>
                    <p className="text-gray-500 text-sm">Récapitulatif final avant certification SHA-256.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                   <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800 text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Sections</p>
                      <p className="text-2xl font-black text-white">{pieces.length}</p>
                   </div>
                   <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800 text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Compteurs</p>
                      <p className="text-2xl font-black text-white">VÉRIFIÉS</p>
                   </div>
                   <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-800 text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Clés</p>
                      <p className="text-2xl font-black text-white">{keys.count}</p>
                   </div>
                </div>

                <div className="p-8 bg-indigo-500/5 border-2 border-indigo-500/20 rounded-3xl">
                   <div className="flex gap-4">
                      <AlertCircle className="w-6 h-6 text-indigo-400 shrink-0" />
                      <div>
                         <p className="text-sm font-bold text-indigo-200">Avis de Protection Bilatérale</p>
                         <p className="text-xs text-indigo-300/70 mt-1 leading-relaxed">
                            En clôturant cet état des lieux, vous l&apos;envoyez au locataire pour confirmation. 
                            Le locataire dispose de 48 heures pour émettre des réserves. Passé ce délai, le document sera auto-validé et certifié.
                         </p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-800 bg-gray-900/80 backdrop-blur-xl flex justify-between items-center">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0 || loading}
            className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 disabled:opacity-20 transition-all hover:bg-gray-700 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-10 py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              Étape Suivante
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-12 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-green-400 transition-all shadow-lg shadow-green-500/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Calcul du Hash..." : "Publier & Certifier"}
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
