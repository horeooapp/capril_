"use client"

import { useState } from "react";
import { 
  Users, CheckCircle2, XCircle, Clock, 
  FileText, TrendingUp, MoreVertical, 
  UserCheck, ShieldCheck, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updateCandidatureStatus } from "@/actions/candidature-actions";

interface Candidature {
  id: string;
  profession: string;
  revenuMensuel: number;
  statut: string;
  scoreInternal: number | null;
  createdAt: Date;
  candidat?: { fullName: string | null; email: string | null };
}

interface CandidatManagerProps {
  initialCandidatures: Candidature[];
  loyerLoyer: number;
}

export default function CandidatManager({ initialCandidatures, loyerLoyer }: CandidatManagerProps) {
  const [candidatures, setCandidatures] = useState(initialCandidatures);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleStatus = async (id: string, statut: string) => {
    const res = await updateCandidatureStatus(id, statut);
    if (res.success) {
      setCandidatures(candidatures.map(c => c.id === id ? { ...c, statut } : c));
    }
  };

  const selectedCandidature = candidatures.find(c => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Side List */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Dossiers Reçus
        </h3>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {candidatures.map((cand) => {
            const ratio = cand.revenuMensuel / loyerLoyer;
            const isTop = ratio >= 3;

            return (
              <motion.div
                key={cand.id}
                layout
                onClick={() => setSelectedId(cand.id)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  selectedId === cand.id 
                    ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className={`p-2 rounded-xl ${selectedId === cand.id ? 'bg-white/20' : 'bg-gray-800'}`}>
                      <UserCheck className={`w-4 h-4 ${selectedId === cand.id ? 'text-white' : 'text-indigo-500'}`} />
                   </div>
                   <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                     cand.statut === "VALIDE" ? 'bg-green-500 text-white' : 
                     cand.statut === "REFUSE" ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400'
                   }`}>
                     {cand.statut}
                   </span>
                </div>
                <h4 className="font-bold text-white truncate">{cand.candidat?.fullName || "Candidat Anonyme"}</h4>
                <div className="flex items-center gap-2 mt-2">
                   <TrendingUp className={`w-3 h-3 ${isTop ? 'text-green-500' : 'text-amber-500'}`} />
                   <span className="text-[10px] font-black uppercase text-gray-400">Ratio: {ratio.toFixed(1)}x</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main View Details */}
      <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 flex flex-col shadow-2xl overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedCandidature ? (
            <motion.div 
              key={selectedId} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="h-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl ring-8 ring-gray-900">
                     {selectedCandidature.candidat?.fullName?.[0] || "?"}
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-white tracking-tighter">{selectedCandidature.candidat?.fullName}</h2>
                     <p className="text-gray-500 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                       <Mail className="w-3 h-3" /> {selectedCandidature.candidat?.email}
                     </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleStatus(selectedId!, "VALIDE")} className="p-4 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl transition-all"><CheckCircle2 /></button>
                   <button onClick={() => handleStatus(selectedId!, "REFUSE")} className="p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"><XCircle /></button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                 <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1 block">Profession</span>
                    <p className="text-lg font-black text-white">{selectedCandidature.profession.toUpperCase()}</p>
                 </div>
                 <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1 block">Revenus Déclarés</span>
                    <p className="text-lg font-black text-green-500">{selectedCandidature.revenuMensuel.toLocaleString()} FCFA</p>
                 </div>
              </div>

              <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" /> Dossier Numérique
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {["Pièce d'Identité", "Bulletins de Salaire", "Quittance Loyer"].map((doc, idx) => (
                   <div key={idx} className="p-4 bg-gray-800/40 border border-gray-800 rounded-2xl flex items-center justify-between group hover:bg-gray-800 transition-all">
                      <span className="text-xs font-bold text-gray-300">{doc}</span>
                      <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800 group-hover:bg-indigo-600 group-hover:text-white transition-all">Voir</button>
                   </div>
                 ))}
              </div>

              <div className="mt-auto pt-10 flex justify-between items-center opacity-30 select-none">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                   <ShieldCheck className="w-4 h-4" /> Analyse Prédictive QAPRIL v3
                 </div>
                 <div className="text-[10px] font-mono text-gray-500">ID: CAND-{selectedId?.slice(0, 8)}</div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-gray-800/30 rounded-3xl flex items-center justify-center mb-6">
                 <UserCheck className="w-10 h-10 text-gray-700" />
               </div>
               <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tighter">Sélectionnez un dossier</h3>
               <p className="text-gray-500 max-w-xs mt-2">Cliquez sur une candidature pour analyser les pièces et le scoring associé.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
