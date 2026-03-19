"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, CheckCircle2, ChevronRight, ChevronLeft, 
  Droplet, Zap, Flame, Wrench, PenTool, 
  AlertCircle, Save, X
} from "lucide-react";
import { EDL_ROOMS, EDL_STATES, EdlPiece, EdlMeter } from "@/lib/edl";
import { createInspection, addInspectionRoom, calculateInspectionScore } from "@/actions/edl";

interface EdlFormProps {
  leaseId: string;
  typeEdl: "ENTREE" | "SORTIE" | "INVENTAIRE";
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
    { type: "GAS", reading: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const currentRoom = EDL_ROOMS[step] || null;
  const isMetersStep = step === EDL_ROOMS.length;
  const isSummaryStep = step === EDL_ROOMS.length + 1;

  const handleUpdatePiece = (index: number, updates: Partial<EdlPiece>) => {
    setPieces(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create the Inspection record
      const inspectionRes = await createInspection(leaseId, typeEdl === "SORTIE" ? "EXIT" : "ENTRY", new Date());
      
      if (inspectionRes.success && inspectionRes.inspectionId) {
        const inspectionId = inspectionRes.inspectionId;

        // 2. Add each room
        for (const piece of pieces) {
          const roomLabel = EDL_ROOMS.find(r => r.id === piece.room)?.label || piece.room;
          await addInspectionRoom(inspectionId, roomLabel, piece.state as any, piece.comment);
        }

        // 3. Finalize and calculate score
        await calculateInspectionScore(inspectionId);
        
        onClose();
      }
    } catch (error) {
      console.error("Error submitting EDL:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Camera className="w-6 h-6 text-indigo-500" />
              État des Lieux - {typeEdl === "ENTREE" ? "Entrée" : "Sortie"}
            </h2>
            <p className="text-sm text-gray-400">Suivez les étapes pour documenter l'état du logement.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 w-full">
          <motion.div 
            className="h-full bg-indigo-600"
            animate={{ width: `${(step / (EDL_ROOMS.length + 1)) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
          <AnimatePresence mode="wait">
            {step < EDL_ROOMS.length ? (
              <motion.div 
                key={currentRoom?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{currentRoom?.label}</h3>
                </div>

                {/* State Selection */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">État de la pièce</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {EDL_STATES.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => handleUpdatePiece(step, { state: state.id })}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          pieces[step].state === state.id 
                            ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500" 
                            : "border-gray-800 bg-gray-800/40 hover:border-gray-700 hover:bg-gray-800/60"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${state.color}`} />
                        <span className="text-sm font-semibold text-white">{state.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Observations / Détails</label>
                  <textarea
                    value={pieces[step].comment}
                    onChange={(e) => handleUpdatePiece(step, { comment: e.target.value })}
                    placeholder="Précisez tout dommage ou détail particulier..."
                    className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                  />
                </div>

                {/* Photos Placeholder */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Photos (Optionnel)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="aspect-square rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-all bg-gray-800/20">
                      <Camera className="w-8 h-8 mb-2" />
                      <span className="text-xs font-medium text-center">Ajouter une photo</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : isMetersStep ? (
              <motion.div 
                key="meters"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Droplet className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Relevés des Compteurs</h3>
                </div>

                <div className="grid gap-6">
                  {meters.map((meter, i) => (
                    <div key={meter.type} className="flex items-center gap-6 p-6 bg-gray-800/40 border border-gray-800 rounded-2xl">
                      <div className={`p-3 rounded-lg ${
                        meter.type === "WATER" ? "bg-blue-500/10 text-blue-500" :
                        meter.type === "ELECTRICITY" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      }`}>
                        {meter.type === "WATER" && <Droplet />}
                        {meter.type === "ELECTRICITY" && <Zap />}
                        {meter.type === "GAS" && <Flame />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">
                          {meter.type === "WATER" ? "Compteur d'Eau" :
                           meter.type === "ELECTRICITY" ? "Compteur Électrique" :
                           "Compteur de Gaz"}
                        </h4>
                        <input
                          type="text"
                          value={meter.reading}
                          onChange={(e) => {
                            const newMeters = [...meters];
                            newMeters[i].reading = e.target.value;
                            setMeters(newMeters);
                          }}
                          placeholder="Saisissez l'index..."
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button className="p-4 bg-gray-700/50 rounded-xl text-gray-400 hover:text-indigo-400 flex flex-col items-center">
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[10px]">Photo</span>
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Récapitulatif & Signature</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-400">Toutes les sections ont été complétées. Vous pouvez maintenant finaliser l'état des lieux.</p>
                  
                  {/* Signature Box (Placeholder) */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-800/40 border-2 border-dashed border-gray-700 rounded-2xl text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">LANDLORD / AGENT SIGNATURE</p>
                      <div className="h-40 bg-black/40 rounded-lg flex items-center justify-center text-gray-600">
                        <PenTool className="w-12 h-12" />
                      </div>
                    </div>
                    <div className="p-6 bg-gray-800/40 border-2 border-dashed border-gray-700 rounded-2xl text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">TENANT SIGNATURE</p>
                      <div className="h-40 bg-black/40 rounded-lg flex items-center justify-center text-gray-600">
                        <PenTool className="w-12 h-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between bg-gray-900/50 backdrop-blur-md">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-30 transition-all hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          {step < EDL_ROOMS.length + 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Clôturer l'État des Lieux"}
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
