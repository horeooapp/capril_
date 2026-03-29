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
  { id: 'WAVE', name: 'Wave CI', color: 'bg-blue-500', icon: '🌊', method: 'DEEP_LINK' },
  { id: 'ORANGE', name: 'Orange Money', color: 'bg-orange-500', icon: '🍊', method: 'DEEP_LINK' },
  { id: 'MTN', name: 'MTN MoMo', color: 'bg-yellow-400', icon: '💎', method: 'DEEP_LINK' },
  { id: 'CARD', name: 'Carte Bancaire / Autres', color: 'bg-gray-800', icon: '💳', method: 'CINETPAY' },
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
                          <div className={`w-12 h-12 ${op.color} text-white rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform`}>
                            {op.icon}
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
