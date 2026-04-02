'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Wallet, 
  Zap, 
  CreditCard, 
  Smartphone, 
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

const operators = [
  { id: 'WAVE', name: 'Wave CI', color: 'bg-white', border: 'border-blue-100', method: 'DEEP_LINK', 
    renderLogo: () => <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Wave_logo.svg/512px-Wave_logo.svg.png" alt="Wave" className="w-full h-full object-contain" /> 
  },
  { id: 'ORANGE', name: 'Orange Money', color: 'bg-white', border: 'border-orange-100', method: 'DEEP_LINK',
    renderLogo: () => <img src="https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" alt="Orange" className="w-full h-full object-contain" />
  },
  { id: 'MTN', name: 'MTN MoMo', color: 'bg-white', border: 'border-yellow-200', method: 'DEEP_LINK',
    renderLogo: () => <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg" alt="MTN" className="w-full h-full object-contain" />
  },
  { id: 'MOOV', name: 'Moov Money', color: 'bg-white', border: 'border-blue-200', method: 'DEEP_LINK',
    renderLogo: () => <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Moov_Africa_logo.png" alt="Moov Africa" className="w-full h-full object-contain p-1" />
  },
  { id: 'CARD', name: 'Cartes Bancaires', color: 'bg-white', border: 'border-gray-200', method: 'CINETPAY',
    renderLogo: () => (
      <div className="flex gap-1 items-center justify-center w-full h-full px-1">
        <svg viewBox="0 0 300 100" className="w-1/2 h-full" fill="#1434CB">
          <path d="M127.3 22l-17.5 54h-28l17.5-54h28zm64.4 0c-7.6 0-28 3.5-28 23.3 0 11.6 15.7 18.6 23.3 23.9 8.2 4.6 11.6 8.2 11.6 12.8 0 7-9.3 10.5-17.5 10.5-10 0-16.3-1.2-23.3-4.6l-3.5 16.3c5.8 2.9 17.5 5.8 29.1 5.8 26.2 0 43.1-12.8 43.1-32.6 0-19.2-26.8-21-26.8-29.7 0-3.5 4.6-8.7 14.6-9.9 5.8-.6 14.6 0 21.6 3.5l3.5-16.3c-4.7-1.7-13.4-2.9-24.5-2.9zm75.8 0l-15.1 61.2-1.7-9.3c-3.5-8.7-14.6-19.2-27.4-23.3l7.6 59.4h28.5l43.1-88h-35zM62.9 22h-22.1c-5.8 0-10 1.7-11.6 7L.2 88h29.1l5.8-16.9h35.5L78 88h27.4L62.9 22zm-12.8 40.8l10-27.4 5.8 27.4H50.1z"/>
        </svg>
        <svg viewBox="0 0 300 180" className="w-1/2 h-full">
          <circle cx="100" cy="90" r="70" fill="#EB001B"/>
          <circle cx="200" cy="90" r="70" fill="#F79E1B"/>
          <path d="M150 49.5c18 10 30 29 30 50.5s-12 40.5-30 50.5c-18-10-30-29-30-50.5s12-40.5 30-50.5z" fill="#FF5F00"/>
        </svg>
      </div>
    )
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
      setError(e.message || "Erreur lors de l'initialisation");
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
                <div className="w-12 h-12 bg-orange-50 text-ivoire-orange rounded-2xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1F4E79] tracking-tighter uppercase leading-none">Rechargement.</h2>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montant personnalisé</label>
                <div className="relative">
                   <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full p-6 bg-gray-50 rounded-[1.5rem] text-3xl font-black text-[#1F4E79] focus:ring-2 focus:ring-ivoire-orange outline-none transition-all pr-20"
                   />
                   <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">FCFA</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[2000, 5000, 10000].map((val) => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`p-4 rounded-2xl text-[12px] font-black transition-all border ${
                        amount === val 
                        ? 'bg-[#1F4E79] text-white border-[#1F4E79] shadow-lg shadow-blue-900/20' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      {val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operator Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Choisir un opérateur</label>
                <div className="grid grid-cols-1 gap-4">
                   {operators.map((op) => (
                     <button
                        key={op.id}
                        onClick={() => setSelectedOp(op)}
                        className={`flex items-center justify-between p-6 rounded-[1.5rem] border transition-all relative overflow-hidden group ${
                          selectedOp.id === op.id 
                          ? 'border-ivoire-orange bg-orange-50/30' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                     >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-16 h-12 ${op.color} border border-gray-100 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0`}>
                            {op.renderLogo()}
                          </div>
                          <span className={`font-black text-[14px] uppercase tracking-widest ${selectedOp.id === op.id ? 'text-[#1F4E79]' : 'text-gray-500'}`}>
                            {op.name}
                          </span>
                       </div>
                       {selectedOp.id === op.id && (
                         <div className="w-6 h-6 bg-ivoire-orange text-white rounded-full flex items-center justify-center relative z-10 scale-110 shadow-lg">
                           <Check size={14} strokeWidth={4} />
                         </div>
                       )}
                       {op.method === 'DEEP_LINK' && (
                         <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-[40px] opacity-[0.03] font-black select-none group-hover:opacity-[0.05] transition-opacity">
                           FAST
                         </div>
                       )}
                     </button>
                   ))}
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
                  className="w-full py-6 bg-[#C55A11] hover:bg-[#A54A0D] disabled:opacity-50 disabled:grayscale text-white rounded-[1.5rem] font-black text-[14px] uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
               >
                 {loading ? (
                   <>
                    <Loader2 size={24} className="animate-spin" />
                    Initialisation...
                   </>
                 ) : (
                   <>
                    <Zap size={20} className="group-hover:animate-pulse" />
                    Confirmer & Recharger
                   </>
                 )}
               </button>
               <p className="text-center text-[10px] font-medium text-gray-400 mt-4 leading-relaxed">
                 * Le rechargement est instantané pour Wave et Orange Money.<br/>
                 Pour les cartes bancaires, un délai de 2 à 5 min peut s'appliquer.
               </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
