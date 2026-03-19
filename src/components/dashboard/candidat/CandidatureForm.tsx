"use client"

import { useState } from "react";
import { 
  User, Briefcase, DollarSign, FileUp, 
  CheckCircle2, ArrowRight, AlertCircle, 
  Building2, ShieldCheck, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitCandidature } from "@/actions/candidature-actions";

interface CandidatureFormProps {
  logementId: string;
  loyerLoyer: number; // Pour le calcul du scoring
  onSuccess?: () => void;
}

export default function CandidatureForm({ logementId, loyerLoyer, onSuccess }: CandidatureFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profession: "",
    revenuMensuel: 0,
    employeur: "",
    documents: [] as string[]
  });


  const scoringRatio = formData.revenuMensuel / loyerLoyer;
  const isSolvent = scoringRatio >= 3;

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await submitCandidature({
      logementId,
      profession: formData.profession,
      revenuMensuel: Number(formData.revenuMensuel),
      documentsUrls: formData.documents,
    });

    if (result.success) {
      setStep(5); // Success step
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-800">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${(step / 4) * 100}%` }}
          className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-10 text-center">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 1/4 • Profil</span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Parlez-nous de vous</h2>
              <p className="text-gray-500 mt-2">Votre situation professionnelle est un élément clé du dossier.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Profession</label>
                <div className="relative">
                   <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                   <input 
                    type="text" 
                    placeholder="Ex: Architecte, Fonctionnaire, Commerce..."
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Employeur actuel (Optionnel)</label>
                <div className="relative">
                   <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                   <input 
                    type="text" 
                    placeholder="Nom de l'entreprise ou structure"
                    value={formData.employeur}
                    onChange={(e) => setFormData({...formData, employeur: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                   />
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext} 
              disabled={!formData.profession}
              className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-30"
            >
              Suivant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-10 text-center">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 2/4 • Revenus</span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Capacité Financière</h2>
              <p className="text-gray-500 mt-2">Nous calculons votre éligibilité en temps réel.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Revenu Mensuel Net (FCFA)</label>
                <div className="relative">
                   <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                   <input 
                    type="number" 
                    placeholder="0"
                    value={formData.revenuMensuel || ""}
                    onChange={(e) => setFormData({...formData, revenuMensuel: Number(e.target.value)})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-white text-2xl font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                   />
                </div>
              </div>

              {formData.revenuMensuel > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border ${isSolvent ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-tight ${isSolvent ? 'text-green-500' : 'text-red-500'}`}>
                        {isSolvent ? "Profil Solvable" : "Dossier Fragile"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Ratio de solvabilité: <span className="text-white font-bold">{scoringRatio.toFixed(1)}x</span> le loyer.</p>
                    </div>
                    {isSolvent ? <ShieldCheck className="w-8 h-8 text-green-500" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
                  </div>
                  {!isSolvent && (
                    <p className="text-[10px] text-red-400/70 mt-4 leading-tight">
                      La règle standard exige un revenu 3 fois supérieur au loyer. Vous pourrez avoir besoin d'un garant.
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={handlePrev} className="flex-1 py-5 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">Retour</button>
              <button onClick={handleNext} disabled={!formData.revenuMensuel} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-30">
                Suivant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-10 text-center">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 3/4 • Justificatifs</span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Pièces à fournir</h2>
              <p className="text-gray-500 mt-2">Dossier numérisé • Format PDF ou JPG accepté.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">

               {["Justificatifs de Revenus", "Contrat de Travail"].map((doc, idx) => (
                 <div key={idx} className="p-6 bg-gray-950 border border-gray-800 rounded-3xl flex items-center justify-between hover:border-gray-700 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-800 rounded-xl text-gray-600"><FileUp className="w-5 h-5" /></div>
                      <span className="text-sm font-bold text-gray-300">{doc}</span>
                    </div>
                    <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white">Téléverser</button>
                 </div>
               ))}
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={handlePrev} className="flex-1 py-5 bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all">Retour</button>
              <button onClick={handleNext} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group">
                Suivant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mb-10 text-center">
              <span className="text-[10px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Étape 4/4 • Récapitulatif</span>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Prêt à valider ?</h2>
              <p className="text-gray-500 mt-2">Vérifiez vos informations avant soumission.</p>
            </div>

            <div className="bg-gray-950 rounded-[2rem] p-8 border border-gray-800 space-y-6">
               <div className="flex justify-between items-center pb-6 border-b border-gray-800">
                  <span className="text-xs text-gray-500 font-bold uppercase">Profession</span>
                  <span className="text-sm font-black text-white">{formData.profession}</span>
               </div>
               <div className="flex justify-between items-center pb-6 border-b border-gray-800">
                  <span className="text-xs text-gray-500 font-bold uppercase">Revenus</span>
                  <span className="text-sm font-black text-white">{formData.revenuMensuel.toLocaleString()} FCFA</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold uppercase">Certification</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase">
                    QAPRIL SCORING <CheckCircle2 className="w-4 h-4" />
                  </span>
               </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full mt-10 py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-3 group"
            >
              Dépouser ma Candidature
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
            <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-green-500/20 rounded-3xl" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Dossier Transmis !</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Votre candidature a été envoyée à l'agence. Vous recevrez une notification d'ici 24h à 48h.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 flex justify-center gap-6 opacity-30">
        <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest"><ShieldCheck className="w-3 h-3" /> Chiffrement AES-256</div>
        <div className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest"><HelpCircle className="w-3 h-3" /> Aide en direct</div>
      </div>
    </div>
  );
}
