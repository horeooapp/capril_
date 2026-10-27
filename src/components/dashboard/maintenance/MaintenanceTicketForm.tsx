"use client"

import { useState } from "react";
import { 
  Wrench, Droplet, Zap, Snowflake, 
  Home, ShieldAlert, Camera, Send, 
  AlertCircle, CheckCircle2, X,
  Loader2, ArrowLeft, ArrowRight, Upload, Trash2
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
  { id: "PLUMBING", label: "Plomberie & Fuite d'eau", icon: <Droplet className="w-6 h-6" />, desc: "Robinet, canalisation bouchée, chasse d'eau, fuite sous évier", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  { id: "ELECTRICITY", label: "Électricité & Éclairage", icon: <Zap className="w-6 h-6" />, desc: "Disjoncteur, prises, ampoules, tableau électrique", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { id: "CLIMATISATION", label: "Climatisation & Aération", icon: <Snowflake className="w-6 h-6" />, desc: "Ne refroidit plus, fuite de condensat, bruit anormal", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "SECURITY", label: "Serrurerie, Portes & Fenêtres", icon: <ShieldAlert className="w-6 h-6" />, desc: "Serrure bloquée, clé coincée, baie vitrée, poignée cassée", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { id: "STRUCTURE", label: "Murs, Toiture & Peinture", icon: <Home className="w-6 h-6" />, desc: "Infiltration au plafond, fissure, humidité, tuile déplacée", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "OTHER", label: "Autre Réparation", icon: <Wrench className="w-6 h-6" />, desc: "Chauffe-eau, électroménager ou besoin particulier", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
];

const ROOMS = [
  "Salon / Séjour",
  "Cuisine",
  "Chambre principale",
  "Autre chambre",
  "Salle d'eau / WC",
  "Balcon / Terrasse",
  "Entrée / Couloir",
  "Parties communes"
];

const URGENCY_LEVELS = [
  { id: "FAIBLE", label: "Faible", sub: "Peut attendre quelques jours", color: "border-slate-200 bg-white text-slate-700" },
  { id: "NORMALE", label: "Normale", sub: "À traiter dans la semaine", color: "border-blue-300 bg-blue-50 text-blue-900" },
  { id: "URGENTE", label: "Urgente", sub: "Impacte la vie quotidienne", color: "border-orange-300 bg-orange-50 text-orange-900" },
  { id: "CRITIQUE", label: "Danger / Dégât immédiat", sub: "Inondation, court-circuit, sécurité", color: "border-rose-400 bg-rose-50 text-rose-900" },
];

export default function MaintenanceTicketForm({ logementId, leaseId, declarantId, onClose }: MaintenanceTicketFormProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [room, setRoom] = useState<string>("Salon / Séjour");
  const [urgency, setUrgency] = useState<string>("NORMALE");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Échec de l'envoi de la photo.");
      }

      setPhotoUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléversement de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      setError("Veuillez décrire le problème constaté.");
      return;
    }
    setLoading(true);
    setError(null);
    
    const catObj = CATEGORIES.find(c => c.id === category);
    const categoryLabel = catObj?.label || "Incident";
    
    const completeDescription = `[Lieu : ${room}] [Urgence : ${urgency}]\n\n${description}`;

    const result = await createMaintenanceTicket({
      logementId,
      leaseId: leaseId || "",
      declarantId,
      titre: `[${categoryLabel}] ${room}`,
      categorie: category === "PLUMBING" ? "PLOMBERIE" : category === "ELECTRICITY" ? "ELECTRICITE" : "AUTRE",
      description: completeDescription,
      photoUrl: photoUrl || undefined,
      urgence: urgency,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 2500);
    } else {
      setError(result.error || "Impossible d'enregistrer le signalement.");
    }
    setLoading(false);
  };

  const selectedCategory = CATEGORIES.find(c => c.id === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              🛠️
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Déclarer une Réparation ou une Panne
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Étape {step} sur 2 • Simple, rapide et pris en charge
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" exit={{ opacity: 0, x: -10 }}>
                {error && (
                  <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {step === 1 ? (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">
                        Quelle est la nature du problème constaté ?
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sélectionnez la catégorie qui correspond le mieux pour orienter le bon artisan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setCategory(cat.id); setStep(2); }}
                          className="p-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-[#FF8200] hover:shadow-md transition-all text-left group flex items-start gap-3.5"
                        >
                          <div className={`p-3 rounded-xl transition-transform group-hover:scale-105 shrink-0 ${cat.bg} ${cat.color}`}>
                            {cat.icon}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 block group-hover:text-orange-600 transition-colors">
                              {cat.label}
                            </span>
                            <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                              {cat.desc}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Back Button & Category Banner */}
                    <div className="flex items-center justify-between">
                      <button 
                        type="button"
                        onClick={() => setStep(1)} 
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft size={14} /> Changer de catégorie
                      </button>
                      {selectedCategory && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${selectedCategory.bg} ${selectedCategory.color} ${selectedCategory.border}`}>
                          {selectedCategory.label}
                        </span>
                      )}
                    </div>

                    {/* Room selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Dans quelle pièce se situe le problème ?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ROOMS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRoom(r)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                              room === r
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Urgency Level */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Niveau d'urgence
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {URGENCY_LEVELS.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setUrgency(u.id)}
                            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                              urgency === u.id
                                ? 'ring-2 ring-orange-500 ' + u.color
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-xs font-bold">{u.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1 leading-tight">{u.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description textarea */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Description précise de la situation <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Le robinet sous le meuble de cuisine fuit abondamment depuis ce matin et inonde le bas du meuble..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-[#FF8200] focus:bg-white outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Photo upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Photo de l'incident (Recommandé)
                      </label>
                      
                      {photoUrl ? (
                        <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 max-w-sm flex items-center p-3 gap-3">
                          <img 
                            src={photoUrl} 
                            alt="Photo incident" 
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200" 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-emerald-700">Photo ajoutée avec succès</p>
                            <p className="text-[10px] text-slate-400 truncate">{photoUrl}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(null)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className={`border-2 border-dashed border-slate-200 rounded-2xl p-5 flex items-center justify-center gap-3 cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all ${uploadingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileUpload} 
                          />
                          {uploadingPhoto ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                              <Loader2 size={16} className="animate-spin" />
                              Envoi de la photo en cours...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-600">
                              <Camera className="w-5 h-5 text-orange-500" />
                              <span className="text-xs font-bold">Prendre une photo ou choisir une image</span>
                            </div>
                          )}
                        </label>
                      )}
                    </div>

                    {/* Didactic legal box */}
                    <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 text-xs text-orange-950 space-y-1">
                      <p className="font-bold text-orange-900 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-orange-600" /> Qui prend en charge cette réparation ?
                      </p>
                      <p className="leading-relaxed">
                        L'entretien d'usage courant incombe au locataire. Les grosses réparations structurelles, la vétusté des équipements d'origine et les pannes encastrées sont à la charge du propriétaire. Votre déclaration permet une prise en charge claire et équitable.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !description.trim()}
                      className="w-full py-4 bg-[#FF8200] hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Enregistrement...
                        </>
                      ) : (
                        <>
                          Transmettre la demande d'intervention <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Signalement bien enregistré !
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Votre demande a été transmise au gestionnaire. Un artisan qualifié sera notifié pour planifier l'intervention.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[11px] text-slate-400 font-medium">
            Service de maintenance & assistance immobilière • QAPRIL
          </p>
        </div>
      </motion.div>
    </div>
  );
}
