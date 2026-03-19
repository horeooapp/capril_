"use client"

import { useState } from "react";
import { 
  Wrench, Droplet, Zap, Flame, 
  Home, ShieldAlert, Camera, Send, 
  AlertCircle, CheckCircle2, X,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createMaintenanceTicket } from "@/actions/maintenance-actions";

interface MaintenanceTicketFormProps {
  logementId: string;
  leaseId?: string;
  declarantId: string;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "PLUMBING", label: "Plomberie / Fuite", icon: <Droplet />, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "ELECTRICITY", label: "Électricité / Panne", icon: <Zap />, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "GAS", label: "Gaz / Chauffe-eau", icon: <Flame />, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "STRUCTURE", label: "Gros Œuvre / Murs", icon: <Home />, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "SECURITY", label: "Serrurerie / Sécurité", icon: <ShieldAlert />, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "OTHER", label: "Autre Incident", icon: <Wrench />, color: "text-gray-400", bg: "bg-gray-400/10" },
];

export default function MaintenanceTicketForm({ logementId, leaseId, declarantId, onClose }: MaintenanceTicketFormProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);


  const handleSubmit = async () => {
    if (!category || !description) return;
    setLoading(true);
    
    const categoryLabel = CATEGORIES.find(c => c.id === category)?.label || "Incident";
    
    const result = await createMaintenanceTicket({
      logementId,
      leaseId,
      declarantId,
      titre: `[${categoryLabel}] Signalement technique`,
      description,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors bg-gray-800 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                {step === 1 ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-indigo-500" />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Signaler un Incident</h2>
                      <p className="text-gray-500 text-sm mt-2">Quelle est la nature du problème technique ?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setCategory(cat.id); setStep(2); }}
                          className="p-5 bg-gray-800/40 border border-gray-800 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
                        >
                          <div className={`p-3 rounded-xl mb-4 w-fit transition-transform group-hover:scale-110 ${cat.bg} ${cat.color}`}>
                            {cat.icon}
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-tight leading-tight">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button onClick={() => setStep(1)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                      ← Retour aux catégories
                    </button>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`p-4 rounded-2xl ${CATEGORIES.find(c => c.id === category)?.bg} ${CATEGORIES.find(c => c.id === category)?.color}`}>
                        {CATEGORIES.find(c => c.id === category)?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase">{CATEGORIES.find(c => c.id === category)?.label}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Détails de l'intervention</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Observations</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Décrivez précisément le problème (lieu, urgence, symptômes...)"
                        className="w-full h-40 bg-gray-950 border border-gray-800 rounded-3xl p-6 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => setImageUrl("dummy-url")}
                        className={`aspect-square border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${imageUrl ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "bg-gray-800/40 border-gray-700 text-gray-500 hover:text-indigo-500 hover:border-indigo-500"}`}
                      >
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-[10px] font-black uppercase">{imageUrl ? "Photo Prête" : "Photos"}</span>
                      </button>
                      <div className="p-4 bg-gray-950/50 rounded-3xl border border-gray-800 flex flex-col justify-center">
                         <div className="flex items-center gap-2 text-amber-500 mb-2">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase">Urgence</span>
                         </div>
                         <p className="text-[9px] text-gray-600 leading-tight">Si l'incident présente un danger immédiat, contactez les secours avant de remplir ce formulaire.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button 
                        onClick={() => setImageUrl("dummy-url")}
                        className={`aspect-square border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${imageUrl ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : "bg-gray-800/40 border-gray-700 text-gray-500 hover:text-indigo-500 hover:border-indigo-500"}`}
                      >
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-[10px] font-black uppercase">{imageUrl ? "Photo Prête" : "Photos"}</span>
                      </button>
                      <div className="p-4 bg-gray-950/50 rounded-3xl border border-gray-800 flex flex-col justify-center">
                         <div className="flex items-center gap-2 text-amber-500 mb-2">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase">Urgence</span>
                         </div>
                         <p className="text-[9px] text-gray-600 leading-tight">Si l'incident présente un danger immédiat, contactez les secours avant de remplir ce formulaire.</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !description}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-600/20 disabled:opacity-30 transition-all flex items-center justify-center gap-3 mt-4"
                    >
                      {loading ? "Envoi en cours..." : "Soumettre le Signalement"}
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Signalement Reçu</h2>
                <p className="text-gray-500">Un agent de gestion va prendre en charge votre demande dans les plus brefs délais.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-black/50 border-t border-gray-800 text-center">
           <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">Module M-MAINT • Infrastructure QAPRIL</p>
        </div>
      </motion.div>
    </div>
  );
}
