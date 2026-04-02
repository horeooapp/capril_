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
  { id: 'WAVE', name: 'Wave Cote d\'Ivoire', color: 'bg-[#18A9DB]', border: 'border-transparent', method: 'DEEP_LINK', 
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center w-full h-full text-white bg-[#18A9DB] rounded-lg">
        <div className="flex items-center gap-0.5 mt-1">
          <span className="text-xl -mt-1">🐧</span>
          <span className="text-xl font-extrabold tracking-tighter leading-none">wave</span>
        </div>
        <span className="text-[5px] font-black opacity-90 tracking-widest mt-1 leading-none uppercase">Ton djê est calé</span>
      </div>
    ) 
  },
  { id: 'ORANGE', name: 'Orange Money', color: 'bg-[#000000]', border: 'border-transparent', method: 'DEEP_LINK',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center w-full h-full text-white bg-[#000000] rounded-lg">
        <div className="bg-[#FF6600] w-10 h-6 flex items-end px-1 pb-0.5 mt-0.5 rounded-sm">
            <span className="text-[10px] font-black tracking-tight leading-none text-white">orange</span>
        </div>
        <span className="text-[5px] font-black text-white mt-1 tracking-[0.2em] uppercase">Money</span>
      </div>
    )
  },
  { id: 'MTN', name: 'MTN MoMo', color: 'bg-[#FFCC00]', border: 'border-[#FFCC00]', method: 'DEEP_LINK',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center w-full h-full text-[#004b73] bg-[#FFCC00] rounded-lg border-2 border-[#FFCC00]">
        <div className="w-4 h-4 bg-[#004b73] rounded shadow-sm relative overflow-hidden flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 100 100" className="w-3 h-3 fill-[#FFCC00]">
             <path d="M20 80 Q 50 20 80 80 Z" />
             <circle cx="50" cy="65" r="12" fill="#004b73" />
          </svg>
        </div>
        <span className="text-[10px] font-black tracking-tighter leading-none mt-0.5">MoMo</span>
        <span className="text-[4px] font-extrabold uppercase mt-[1px] tracking-wide">from MTN</span>
      </div>
    )
  },
  { id: 'MOOV', name: 'Moov Money', color: 'bg-[#005CA8]', border: 'border-transparent', method: 'DEEP_LINK',
    renderLogo: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#005CA8] rounded-lg overflow-hidden relative">
        <div className="absolute w-9 h-9 bg-[#F06222] rounded-sm transform rotate-45"></div>
        <div className="relative z-10 flex flex-col items-center justify-center -mt-0.5">
           <span className="text-[6px] font-black text-[#005CA8] uppercase tracking-tighter leading-none mt-0.5">MOOV</span>
           <span className="text-[7px] font-extrabold text-white italic tracking-tight leading-none drop-shadow-sm -mt-0.5 flex items-center gap-0.5">
             Money
             <svg viewBox="0 0 24 24" className="w-[6px] h-[6px] fill-white" opacity="0.9">
               <path d="M4 6h16v12H4z" />
             </svg>
           </span>
        </div>
      </div>
    )
  },
  { id: 'CARD', name: 'Cartes Bancaires', color: 'bg-white', border: 'border-gray-200', method: 'CINETPAY',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-lg gap-0.5 border border-gray-100">
        {/* VISA */}
        <div className="relative flex items-center">
          <span className="text-[14px] font-black italic tracking-tighter text-[#1A1F71] leading-none drop-shadow-sm">VISA</span>
          <div className="absolute top-0 left-0 w-2 h-1.5 bg-[#F7B600] rounded-tl-sm" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
        </div>
        {/* MASTERCARD */}
        <div className="relative flex items-center justify-center w-12 h-5 -mt-1">
           <div className="w-5 h-5 bg-[#EB001B] rounded-full absolute left-2 opacity-95"></div>
           <div className="w-5 h-5 bg-[#F79E1B] rounded-full absolute right-2 opacity-95 mix-blend-multiply"></div>
           <span className="relative z-10 text-[4px] font-extrabold text-white italic tracking-tighter drop-shadow-md mt-0.5">MasterCard</span>
        </div>
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
