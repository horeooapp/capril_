import React from 'react';
import { Badge } from './Badge';
import { ChevronRight, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fmt = (v: number) => v.toLocaleString();

export const AgencyPropertyList: React.FC<{ properties: any[], user?: any }> = ({ properties, user }) => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCollaborator = user?.agencyRole === 'collaborateur';

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Portefeuille Actif.</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Index de vos actifs gérés</p>
        </div>
        <Link href="/dashboard/properties" className="btn btn-nuit3 px-4 py-2 text-[10px]">
          Voir tout le parc ({properties.length})
        </Link>
      </div>

      <div className="space-y-4">
        {properties.map((p, i) => {
          const activeLease = (p.leases || []).find((l: any) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
          const isOccupied = !!activeLease;
          const rent = activeLease ? activeLease.rentAmount : p.declaredRentFcfa;
          const isOverdue = activeLease?.status === 'OVERDUE';
          
          // Rule 5.2 - Anonymity Logic
          const displayBailleur = isCollaborator || p.bailleurMasque 
            ? (p.landlord?.walletConfig?.landlordCode || "BAI-XXXX") 
            : ((p.landlord?.firstName ? p.landlord.firstName + " " : "") + (p.landlord?.lastName || "") || "Bailleur");
            
          const displayLocataire = isCollaborator 
            ? "Locataire Masqué" 
            : (activeLease?.tenantName || "Locataire");

          return (
            <Link href={`/dashboard/properties/${p.id}`} key={p.id} className="block">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-[2rem] hover:border-[var(--ci-or)]/30 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer"
                style={{ borderLeft: `6px solid ${isOverdue ? 'var(--ci-orange)' : (isOccupied ? 'var(--ci-vert)' : 'var(--ci-nuit3)')}` }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[var(--ci-nuit3)] flex items-center justify-center rounded-2xl text-[var(--ci-or)] group-hover:bg-[var(--ci-or)]/10 transition-all shadow-inner border border-[var(--ci-nuit3)]">
                    <Home size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[16px] font-black text-white uppercase tracking-tighter leading-none">
                        {p.address?.split(',')[0] || "Adresse inconnue"}
                      </span>
                      <Badge 
                        label={p.propertyCode || "CODE-X"} 
                        color="var(--ci-bleu)" 
                        bg="rgba(100, 150, 200, 0.1)" 
                        size={9} 
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                        {p.propertyType}
                      </span>
                      <div className="h-1 w-1 bg-gray-600 rounded-full"></div>
                      <span className="text-xs font-bold text-gray-500">Proprio: <span className="text-white">{displayBailleur}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                      {isOccupied && activeLease.isPaidThisMonth ? (
                        <Badge label="✓ Encaissé" color="var(--ci-vert)" bg="rgba(10, 255, 100, 0.1)" size={10} />
                      ) : isOverdue ? (
                        <Badge label="⚠ Impayé J+12" color="var(--ci-nuit2)" bg="var(--ci-orange)" size={10} />
                      ) : isOccupied ? (
                        <Badge label="En attente" color="var(--ci-orange)" bg="rgba(255, 120, 0, 0.1)" size={10} />
                      ) : (
                        <Badge label="Vacant" color="gray" bg="rgba(255, 255, 255, 0.1)" size={10} />
                      )}
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {isOccupied ? displayLocataire : "Aucun bail actif"}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--ci-nuit3)] flex items-center justify-center text-gray-400 group-hover:bg-[var(--ci-or)] group-hover:text-[var(--ci-nuit2)] transition-all group-hover:translate-x-1 shadow-sm border border-[var(--ci-nuit3)]">
                     <ChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-[2rem] p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ci-or)] blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black italic tracking-tighter uppercase mb-4 leading-none">Note de<br/>Confidentialité</h3>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed max-w-[280px]">
            Conformément à la règle MM-REG-01, les noms des propriétaires et locataires sont masqués par défaut (Code BAI).
            L'accès aux données nominatives est journalisé dans l'audit QAPRIL.
          </p>
        </div>
      </div>
    </div>
  );
};
