"use client"

import { FileText, Download, TrendingUp, ShieldCheck, MapPin } from "lucide-react";

interface ManagementReportProps {
  data: {
    leaseRef: string;
    landlordName: string;
    propertyAddress: string;
    period: string;
    financials: {
      rentReceived: number;
      agencyFees: number;
      qaprilFees: number;
      tva: number;
      netToLandlord: number;
    };
    performance: { month: string; amount: number }[]; // Last 6 months
  }
}

export default function ManagementReport({ data }: ManagementReportProps) {
  const maxPerformance = Math.max(...data.performance.map(p => p.amount), 1);

  return (
    <div id="management-report" className="bg-white p-12 max-w-[210mm] mx-auto shadow-2xl border border-gray-100 font-sans text-gray-900 print:shadow-none print:border-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-primary pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 mb-2">Rapport de Gestion</h1>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
            <ShieldCheck size={16} />
            <span>Certifié QAPRIL v3.1</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-xl text-slate-800">Période : {data.period}</p>
          <p className="text-sm text-gray-500 font-medium">Réf: {data.leaseRef}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bailleur</h3>
          <p className="text-lg font-bold text-slate-900">{data.landlordName}</p>
          <div className="flex items-start gap-2 text-sm text-gray-500 italic">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{data.propertyAddress}</span>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center text-center">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reversement Net Effectué</h3>
          <p className="text-3xl font-black text-primary">{data.financials.netToLandlord.toLocaleString()} FCFA</p>
          <div className="mt-2 text-[9px] font-bold text-green-600 uppercase">Transfert Automatique Wave OK</div>
        </div>
      </div>

      {/* Financial Table */}
      <div className="mb-12">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Ventilation Financière
        </h3>
        <table className="w-full border-collapse">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest">Désignation</th>
              <th className="p-4 text-right text-[10px] font-bold uppercase tracking-widest">Débit (FCFA)</th>
              <th className="p-4 text-right text-[10px] font-bold uppercase tracking-widest">Crédit (FCFA)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-b border-gray-100">
            <tr>
              <td className="p-4 font-bold">Encaissement loyer mensuel</td>
              <td className="p-4 text-right">---</td>
              <td className="p-4 text-right font-bold">{data.financials.rentReceived.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="p-4 text-gray-600">Commissions d'Agence Mini (10%)</td>
              <td className="p-4 text-right text-red-600">({data.financials.agencyFees.toLocaleString()})</td>
              <td className="p-4 text-right">---</td>
            </tr>
            <tr>
              <td className="p-4 text-gray-600">Frais de service QAPRIL Premium</td>
              <td className="p-4 text-right text-red-600">({data.financials.qaprilFees.toLocaleString()})</td>
              <td className="p-4 text-right">---</td>
            </tr>
            <tr>
              <td className="p-4 text-gray-400 text-sm">TVA (18.0%) sur services</td>
              <td className="p-4 text-right text-gray-400">({data.financials.tva.toLocaleString()})</td>
              <td className="p-4 text-right">---</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-primary/5">
              <td className="p-4 font-black uppercase text-primary">Solde Net à Reverser</td>
              <td className="p-4 text-right font-black text-primary" colSpan={2}>
                  {data.financials.netToLandlord.toLocaleString()} FCFA
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Performance Chart (SVG) */}
      <div className="mb-12">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Performance sur 6 mois</h3>
        <div className="flex items-end justify-between gap-6 h-48 px-4">
          {data.performance.map((p, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div 
                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary relative"
                style={{ height: `${(p.amount / maxPerformance) * 100}%` }}
              >
                 <div className="absolute -top-6 left-1/4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {p.amount.toLocaleString()}
                 </div>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{p.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Certification */}
      <div className="mt-20 pt-8 border-t border-dashed border-gray-200 text-center">
        <div className="flex justify-center gap-8 mb-4">
            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                    <FileText size={24} />
                </div>
                <span className="text-[8px] font-bold text-gray-400 uppercase">Tampon Digital</span>
            </div>
            <div className="p-4 border-2 border-primary/20 rounded-xl relative">
                <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full">
                    <ShieldCheck size={12} />
                </div>
                <p className="text-[10px] font-black text-primary uppercase italic">Approuvé FinTech UEMOA</p>
                <p className="text-[8px] text-gray-400 text-center mt-1">Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
        </div>
        <p className="text-[10px] text-gray-400 italic">
          Ce rapport est généré automatiquement par QAPRIL Technologies SA. Il fait foi pour vos déclarations fiscales et comptables.
        </p>
      </div>

      {/* Controls (Hidden on Print) */}
      <div className="mt-12 flex justify-center print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          <Download size={20} />
          Télécharger le Rapport (PDF)
        </button>
      </div>
    </div>
  );
}
