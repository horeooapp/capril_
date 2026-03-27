import React from 'react';
import { T, biens } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

const fmt = (v: number) => v.toLocaleString();

export const AgencyPropertyList: React.FC<{ properties: any[], user?: any }> = ({ properties, user }) => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCollaborator = user?.agencyRole === 'collaborateur';

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Portefeuille Actif.</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Index de vos actifs gérés</p>
        </div>
        <button className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">
          Voir tout le parc ({properties.length})
        </button>
      </div>

      <div className="space-y-4">
        {properties.map((p, i) => {
          const activeLease = (p.leases || []).find((l: any) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
          const isOccupied = !!activeLease;
          const rent = activeLease ? activeLease.rentAmount : p.declaredRentFcfa;
          const isOverdue = activeLease?.status === 'OVERDUE';
          
          // Rule 5.2 - Anonymity Logic
          const displayBailleur = isCollaborator || p.bailleurMasque 
            ? (p.landlord?.landlordCode || "BAI-XXXX") 
            : (p.landlord?.fullName || "Bailleur");
            
          const displayLocataire = isCollaborator 
            ? "Locataire Masqué" 
            : (activeLease?.tenantName || "Locataire");

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              style={{ borderLeft: `6px solid ${isOverdue ? T.red : (isOccupied ? T.green : T.grey2)}` }}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                  <Home size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[16px] font-black text-slate-900 uppercase tracking-tighter leading-none">
                      {p.address?.split(',')[0] || "Adresse inconnue"}
                    </span>
                    <Badge 
                      label={p.propertyCode || "CODE-X"} 
                      color={T.navy} 
                      bg={T.navyPale} 
                      size={9} 
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                      {p.propertyType}
                    </span>
                    <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-400">Proprio: <span className="text-[#1F4E79]">{displayBailleur}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 justify-between sm:justify-end">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-2">
                    {isOccupied && activeLease.isPaidThisMonth ? (
                      <Badge label="✓ Encaissé" color={T.green} bg={T.greenPale} size={10} />
                    ) : isOverdue ? (
                      <Badge label="⚠ Impayé J+12" color={T.white} bg={T.red} size={10} />
                    ) : isOccupied ? (
                      <Badge label="En attente" color={T.orange} bg={T.orangePale} size={10} />
                    ) : (
                      <Badge label="Vacant" color={T.textLight} bg={T.grey1} size={10} />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {isOccupied ? displayLocataire : "Aucun bail actif"}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all group-hover:translate-x-1 shadow-sm">
                   <ChevronRight size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black italic tracking-tighter uppercase mb-4 leading-none">Note de<br/>Confidentialité</h3>
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[280px]">
            Conformément à la règle MM-REG-01, les noms des propriétaires et locataires sont masqués par défaut (Code BAI).
            L'accès aux données nominatives est journalisé dans l'audit QAPRIL.
          </p>
        </div>
      </div>
    </div>
  );
};
