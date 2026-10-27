'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  Zap, 
  ChevronRight, 
  Check, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface RechargeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAmount?: number;
  onRecharge: (amount: number, operator: string, method: string) => Promise<any>;
}

interface OperatorItem {
  id: string;
  name: string;
  subtitle: string;
  logoUrl: string;
  method: string;
}

const operators: OperatorItem[] = [
  { 
    id: 'WAVE', 
    name: 'Wave Côte d\'Ivoire', 
    subtitle: 'Paiement sans frais (0%)', 
    logoUrl: '/logos/wave.svg', 
    method: 'DEEP_LINK' 
  },
  { 
    id: 'ORANGE', 
    name: 'Orange Money', 
    subtitle: 'Réseau Orange CI', 
    logoUrl: '/logos/orange-money.svg', 
    method: 'DEEP_LINK' 
  },
  { 
    id: 'MTN', 
    name: 'MTN MoMo', 
    subtitle: 'MTN Mobile Money', 
    logoUrl: '/logos/mtn-momo.svg', 
    method: 'DEEP_LINK' 
  },
  { 
    id: 'MOOV', 
    name: 'Moov Money', 
    subtitle: 'Moov Africa CI', 
    logoUrl: '/logos/moov-money.svg', 
    method: 'DEEP_LINK' 
  },
  { 
    id: 'CARD', 
    name: 'Cartes Bancaires', 
    subtitle: 'Visa & MasterCard', 
    logoUrl: '/logos/carte-bancaire.svg', 
    method: 'CINETPAY' 
  },
];

export default function RechargeDrawer({ 
  isOpen, 
  onClose, 
  suggestedAmount = 2000,
  onRecharge 
}: RechargeDrawerProps) {
  const [amount, setAmount] = useState(suggestedAmount);
  const [selectedOp, setSelectedOp] = useState(operators[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecharge = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await onRecharge(amount, selectedOp.id, selectedOp.method);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'initialisation du rechargement.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none">Rechargement.</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Wallet QAPRIL Zéro Friction</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              
              {/* Amount Suggestions */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montant à recharger</label>
                <div className="relative">
                   <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full p-6 bg-gray-50 rounded-[1.5rem] text-3xl font-black text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none transition-all pr-20"
                   />
                   <span className="absolute right-6 top-1/2 -translate-y-1/2 text-base font-black text-gray-400">XOF</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[2000, 5000, 10000].map((val) => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`p-4 rounded-2xl text-[12px] font-black transition-all border ${
                        amount === val 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-blue-900/20' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {val.toLocaleString()} XOF
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator Selection with Real Logos */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Choisir un opérateur</label>
                <div className="grid grid-cols-1 gap-3.5">
                   {operators.map((op) => {
                     const isSelected = selectedOp.id === op.id;
                     return (
                       <button
                          key={op.id}
                          type="button"
                          onClick={() => setSelectedOp(op)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                            isSelected 
                            ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/20' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                       >
                         <div className="flex items-center gap-4 relative z-10">
                            {/* Vrai Logo Officiel */}
                            <div className="w-24 h-12 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                              <img 
                                src={op.logoUrl} 
                                alt={op.name} 
                                className="w-full h-full object-contain" 
                              />
                            </div>
                            <div className="text-left">
                              <span className={`font-black text-[13px] block tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {op.name}
                              </span>
                              <span className="text-[11px] font-medium text-gray-400">
                                {op.subtitle}
                              </span>
                            </div>
                         </div>

                         {isSelected && (
                           <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center relative z-10 scale-110 shadow-md">
                             <Check size={14} strokeWidth={3} />
                           </div>
                         )}

                         {op.method === 'DEEP_LINK' && (
                           <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[32px] opacity-[0.03] font-black select-none group-hover:opacity-[0.06] transition-opacity">
                             RAPIDE
                           </div>
                         )}
                       </button>
                     )
                   })}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
               <button 
                  disabled={loading || amount < 100}
                  onClick={handleRecharge}
                  className="w-full py-5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
               >
                 {loading ? (
                   <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Initialisation du paiement...</span>
                   </>
                 ) : (
                   <>
                    <Zap size={18} className="group-hover:animate-pulse" />
                    <span>Confirmer & Recharger ({amount.toLocaleString()} XOF)</span>
                   </>
                 )}
               </button>
               <p className="text-center text-[10px] font-medium text-gray-400 mt-4 leading-relaxed">
                 * Le rechargement est instantané pour Wave et Orange Money.<br/>
                 Pour MTN, Moov et les cartes bancaires, la validation s'effectue en quelques secondes.
               </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
