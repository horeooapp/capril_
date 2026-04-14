import { toast } from "sonner";
import React, { useState } from 'react';
import { Badge } from './Badge';
import { ChevronRight, User, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { requestCandidateConsent } from '@/actions/agency-actions';

const fmt = (v: number) => v.toLocaleString();

export const AgencyCandidateList: React.FC<{ candidates?: any[] }> = ({ candidates = [] }) => {
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const handleRequestAccess = async (id: string) => {
    setRequestingId(id);
    await requestCandidateConsent(id);
    setRequestingId(null);
    // In a real app, we would revalidate or update local state
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Candidatures.</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Suivi des dossiers M-CAND</p>
        </div>
        <button className="btn btn-nuit3 px-4 py-2 text-[10px]" onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'}) }}>
          Nouvelle Candidature
        </button>
      </div>

      <div className="space-y-3">
        {candidates.map((c, i) => {
          const scoreValue = c.scoreQapril || 0;
          const scoreColor = scoreValue >= 750 ? "var(--ci-vert)" : scoreValue >= 600 ? "var(--ci-orange)" : "var(--ci-orange)";
          
          const isApproved = c.statut === "CONSENT_APPROVED";
          const isRequested = c.statut === "CONSENT_REQUESTED";
          const isRefused = c.statut === "CONSENT_REFUSED";
          
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-[2rem] hover:border-[var(--ci-or)]/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[var(--ci-nuit3)] flex items-center justify-center rounded-2xl text-[var(--ci-or)] group-hover:bg-[var(--ci-or)]/10 group-hover:text-[var(--ci-or)] transition-colors border border-[var(--ci-nuit3)]">
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-[16px] font-black text-white uppercase tracking-tighter leading-none">
                        {c.nom} {c.prenom}
                      </span>
                      {isApproved && <Badge label="✓ Score Révélé" color="var(--ci-vert)" bg="rgba(10, 255, 100, 0.1)" size={8} />}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[12px] font-black text-gray-400 leading-none">
                        {c.employeur || "Candidat"}
                      </span>
                      <span className="text-[12px] font-black text-[var(--ci-bleu)] uppercase tracking-widest">
                        MAX {fmt(c.revenuMensuel ? Math.round(c.revenuMensuel / 3.3) : 0)} F
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {isApproved ? (
                    <div className="flex flex-col items-end pr-6 border-r border-[var(--ci-nuit3)]">
                      <span className="text-3xl font-black tracking-tighter leading-none font-mono" style={{ color: scoreColor }}>
                        {scoreValue}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">Score ICL Certifié</span>
                    </div>
                  ) : isRequested ? (
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end pr-6 border-r border-[var(--ci-nuit3)] text-[var(--ci-or)]">
                        <span className="text-lg">⏳</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-500">En attente</span>
                      </div>
                      <Badge label="SMS/WA Envoyé" color="var(--ci-or)" bg="rgba(255, 139, 0, 0.1)" size={8} />
                    </div>
                  ) : isRefused ? (
                    <div className="flex flex-col items-end pr-6 border-r border-[var(--ci-nuit3)] text-[var(--ci-orange)]">
                      <span className="text-lg">✕</span>
                      <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-500">Accès Refusé</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-end pr-6 border-r border-[var(--ci-nuit3)] text-gray-600">
                        <span className="text-2xl">🔒</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1">Protégé</span>
                      </div>
                      <button 
                        onClick={() => handleRequestAccess(c.id)}
                        disabled={requestingId === c.id}
                        className="btn btn-nuit3 px-4 py-2 text-[10px]"
                      >
                        {requestingId === c.id ? <Loader2 size={12} className="animate-spin" /> : "Demander accès"}
                      </button>
                    </div>
                  )}
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-[var(--ci-or)] transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 panel bg-[var(--ci-nuit2)] border border-[var(--ci-vert)]/20 rounded-[2rem] p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ci-vert)] blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-[var(--ci-vert)]/10 rounded-2xl shadow-sm border border-[var(--ci-vert)]/20">
            <ShieldCheck className="text-[var(--ci-vert)]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tighter uppercase leading-none mb-2 text-white">Sécurité M-CAND</h3>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed max-w-[280px]">
              La base de candidats est votre actif n°1. Les scores ICL sont recalculés quotidiennement selon l'historique de paiement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
