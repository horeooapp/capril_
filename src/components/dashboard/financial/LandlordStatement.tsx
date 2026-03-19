"use client"

import { 
  FileText, Download, Share2, 
  Landmark, ShieldCheck, Printer, 
  ArrowDownCircle, ArrowUpCircle, 
  Percent, Settings
} from "lucide-react";
import { motion } from "framer-motion";

interface StatementData {
  period: string;
  grossRent: number;
  commissions: number;
  technicalExpenses: number;
  insurance: number;
  netToPay: number;
  generatedAt: Date;
}

export default function LandlordStatement({ data }: { data: StatementData }) {
  const sections = [
    { label: "Loyer Brut Encaissé", amount: data.grossRent, icon: <ArrowUpCircle className="text-green-500" />, type: "PLUS" },
    { label: "Commission Agence (10%)", amount: -data.commissions, icon: <Percent className="text-gray-500" />, type: "MINUS" },
    { label: "Dépenses Techniques (Maint.)", amount: -data.technicalExpenses, icon: <Settings className="text-gray-500" />, type: "MINUS" },
    { label: "Assurance Loyer Impayé", amount: -data.insurance, icon: <ShieldCheck className="text-gray-500" />, type: "MINUS" },
  ];

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
      {/* Background Watermark */}
      <h1 className="absolute -bottom-10 -right-10 text-[10rem] font-black text-gray-900/40 select-none pointer-events-none tracking-tighter uppercase italic">CRG</h1>

      <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
        <div>
          <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4 inline-block">Document Certifié</span>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Compte-Rendu <br/><span className="text-indigo-500">de Gestion</span></h2>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-4">Période de {data.period}</p>
        </div>
        
        <div className="flex gap-3">
          <button className="p-4 bg-gray-900 border border-gray-800 hover:border-indigo-500 text-white rounded-2xl transition-all"><Printer className="w-5 h-5" /></button>
          <button className="p-4 bg-gray-900 border border-gray-800 hover:border-indigo-500 text-white rounded-2xl transition-all"><Share2 className="w-5 h-5" /></button>
          <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 transition-all">
            Télécharger PDF <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Table */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-900 pb-4 mb-8">Détail des flux financiers</h3>
          
          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <motion.div 
                key={sec.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-between items-center p-6 hover:bg-gray-900/50 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-900 border border-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                    {sec.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{sec.label}</span>
                </div>
                <span className={`font-mono font-black ${sec.type === "PLUS" ? 'text-white' : 'text-gray-600'}`}>
                  {sec.amount.toLocaleString()} <span className="text-[10px] font-medium opacity-50">FCFA</span>
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-900 flex justify-between items-center p-6 bg-white/[0.02] rounded-3xl ring-1 ring-white/5 shadow-inner">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-green-500/10 rounded-2xl">
                   <Landmark className="w-8 h-8 text-green-500" />
                </div>
                <div>
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Net à reverser</span>
                   <h4 className="text-3xl font-black text-white tracking-tight">{data.netToPay.toLocaleString()} <span className="text-sm font-medium opacity-50">FCFA</span></h4>
                </div>
             </div>
             <ArrowDownCircle className="w-10 h-10 text-indigo-500/20" />
          </div>
        </div>

        {/* Right Info / Security */}
        <div className="flex flex-col justify-between">
           <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-10 backdrop-blur-md">
              <h4 className="text-white font-black uppercase text-sm mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> Sécurité & Conformité
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Ce compte-rendu est généré automatiquement par l'Arrears Engine™ de QAPRIL. 
                Il intègre l'ensemble des régularisations et commissions certifiées.
              </p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Calcul des taxes foncières inclus
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Génération PDF signée SHA-256
                 </div>
              </div>
           </div>

           <div className="mt-12 flex justify-end gap-12 opacity-30 select-none">
              <div className="text-right">
                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Généré le</p>
                 <p className="text-[10px] font-black text-white uppercase">{new Date(data.generatedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Signature Digitale</p>
                 <p className="text-[10px] font-black text-white uppercase tracking-tighter">QAPRIL-CORE-V3</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
