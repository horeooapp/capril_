import React from 'react';
import { T, biens } from '@/constants/agency-data';
import { Badge } from './Badge';
import { ChevronRight, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

const fmt = (v: number) => v.toLocaleString();

export const AgencyPropertyList: React.FC<{ properties: any[] }> = ({ properties }) => {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Portefeuille Actif.</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Index de vos actifs gérés</p>
        </div>
        <button className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors">
          Voir tout le parc ({properties.length})
        </button>
      </div>

      <div className="space-y-3">
        {properties.map((p, i) => {
          const activeLease = (p.leases || []).find((l: any) => l.status === 'ACTIVE');
          const isOccupied = !!activeLease;
          const statusLabel = isOccupied ? "occupé" : "vacant";
          const rent = activeLease ? activeLease.rentAmount : p.declaredRentFcfa;
          
          // Check payment status for current month if occupied
          let paymentStatus = "N/A";
          if (isOccupied) {
            const paid = (activeLease.receipts || []).some((r: any) => r.periodMonth === currentMonthYear && r.status === 'paid');
            paymentStatus = paid ? "Encaissé" : "En attente";
          }

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Home size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                        {p.address?.split(',')[0] || "Adresse inconnue"}
                      </span>
                      <Badge 
                        label={p.propertyCode || "CODE-X"} 
                        color={T.navy} 
                        bg={T.navyPale} 
                        size={8} 
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium text-slate-400">
                        {p.propertyType} · {fmt(rent)} FCFA
                      </span>
                      <Badge 
                        label={statusLabel} 
                        color={isOccupied ? T.green : T.orange} 
                        bg={isOccupied ? T.greenPale : T.orangePale} 
                        size={8} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Paiement</span>
                    <Badge 
                      label={paymentStatus} 
                      color={paymentStatus === "Encaissé" ? T.green : paymentStatus === "En attente" ? T.orange : T.textLight} 
                      bg={paymentStatus === "Encaissé" ? T.greenPale : paymentStatus === "En attente" ? T.orangePale : T.grey1} 
                      size={9} 
                    />
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
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
