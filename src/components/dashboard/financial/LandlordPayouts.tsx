"use client"

import { useState } from "react";
import { 
  DollarSign, ArrowUpRight, Clock, 
  ChevronRight, Building2, CreditCard,
  FileBarChart, CheckCircle2, Loader2,
  Wallet, Landmark
} from "lucide-react";
import { motion } from "framer-motion";
import { processLandlordPayout, generateCRG } from "@/actions/financial-actions";

export default function LandlordPayouts() {
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const pendingPayouts = [
    { id: "L-101", name: "Marc T.", property: "Villa Horizon", amount: 650000, method: "WAVE" },
    { id: "L-102", name: "Saliou N.", property: "Appart plateau", amount: 420000, method: "ORANGE" },
    { id: "L-103", name: "Fatou K.", property: "Studio Cocody", amount: 180000, method: "WAVE" },
  ];

  const handlePayout = async (payoutId: string, amount: number, method: any) => {
    setLoading(payoutId);
    const res = await processLandlordPayout(payoutId, amount, method);
    if (res.success) {
      setSuccessMsg(`Reversement ${res.transactionId} effectué avec succès !`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
    setLoading(null);
  };

  const handleCRG = async (id: string) => {
    setLoading(`crg-${id}`);
    await generateCRG(id, "Mars 2026");
    setSuccessMsg("Document CRG généré et envoyé par email.");
    setTimeout(() => setSuccessMsg(null), 5000);
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Comptabilité Propriétaire</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Plateforme Payout v3.1</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-3 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Encaissement Agence</p>
              <p className="text-xl font-black text-white italic">1.250.000 <span className="text-[10px] text-gray-700">FCFA</span></p>
           </div>
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-xs font-bold">
           <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </motion.div>
      )}

      <div className="grid gap-4">
        {pendingPayouts.map((p) => (
          <div key={p.id} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 hover:bg-gray-900 transition-all group">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-tight">{p.name}</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase">{p.property}</p>
                </div>
              </div>

              <div className="flex-1 min-w-[150px] text-center md:text-left">
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Montant Net à Reverser</p>
                <p className="text-2xl font-black text-white">{p.amount.toLocaleString()} <span className="text-sm font-bold text-gray-700">FCFA</span></p>
              </div>

              <div className="flex items-center gap-2">
                 <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase flex items-center gap-2 ${p.method === 'WAVE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                    <Wallet className="w-3 h-3" /> {p.method} MONEY
                 </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleCRG(p.id)}
                  className="px-4 py-3 bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500"
                >
                  {loading === `crg-${p.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handlePayout(p.id, p.amount, p.method)}
                  disabled={!!loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  Verser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
               <Landmark className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-white font-black uppercase">Consolidation Mensuelle</h3>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Générez tous les CRG du mois de Mars 2026</p>
            </div>
         </div>
         <button className="px-8 py-4 bg-white text-indigo-600 font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-indigo-50 transition-all shadow-xl">
           Tout Générer (24 lots)
         </button>
      </div>
    </div>
  );
}
