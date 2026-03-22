"use client"

import { motion } from "framer-motion";
import { 
  TrendingUp, Download, Eye, 
  Calendar, CheckCircle2, ArrowUpRight,
  BarChart3, ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface MonthlyReportCardProps {
  report: any; // RapportMensuel model
}

export default function MonthlyReportCard({ report }: MonthlyReportCardProps) {
  if (!report) return null;

  const data = report.dataRapport;
  const metrics = data.metrics;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-premium overflow-hidden rounded-[3rem] border border-white/50 shadow-2xl shadow-indigo-100 flex flex-col md:flex-row"
    >
      {/* Visual Side */}
      <div className="w-full md:w-1/3 bg-gradient-to-br from-indigo-600 to-blue-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <Calendar className="w-4 h-4 text-indigo-200" />
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Performance {report.periodeMois}/{report.periodeAnnee}</span>
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-6">Excellent<br/>Recouvrement.</h3>
          
          <div className="flex items-end gap-2">
             <span className="text-6xl font-black leading-none">{metrics.tauxRecouvrement}%</span>
             <ArrowUpRight className="w-8 h-8 text-emerald-400 mb-1" />
          </div>
        </div>

        <div className="mt-8 relative z-10">
           <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${metrics.tauxRecouvrement}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-400"
              />
           </div>
           <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mt-2">Objectif QAPRIL: 95% minimum</p>
        </div>
      </div>

      {/* Content Side */}
      <div className="flex-1 p-8 bg-white flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-8">
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Encaissement Total</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-gray-900">{metrics.totalEncaisse.toLocaleString()}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">FCFA</span>
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logements Actifs</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-gray-900">{metrics.nbLeases}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Unités</span>
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impayés Détectés</p>
              <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-black ${metrics.nbImpayes > 0 ? "text-red-500" : "text-emerald-500"}`}>{metrics.nbImpayes}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase">Alertes</span>
              </div>
           </div>
           <div className="flex flex-col justify-end">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 self-start">
                 <ShieldCheck className="w-3 h-3 text-indigo-500" />
                 <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Rapport Certifié</span>
              </div>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
           <div className="flex gap-2">
              <Link 
                href={report.pdfUrl || "#"} 
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest"
              >
                <Download className="w-3 h-3" /> PDF Export
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-900 text-[10px] font-black rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest border border-gray-100">
                <BarChart3 className="w-3 h-3" /> Analystics
              </button>
           </div>
           <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest italic flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Generé le {new Date(report.createdAt).toLocaleDateString('fr-FR')}
           </p>
        </div>
      </div>
    </motion.div>
  );
}
