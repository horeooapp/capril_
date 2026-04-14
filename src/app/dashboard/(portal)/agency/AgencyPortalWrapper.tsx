'use client';

import React from 'react';
import { useAgencyData } from '@/hooks/qapril-web-hooks';
import { AgencyPortalDashboardV2 } from '@/components/dashboard/agency/AgencyPortalDashboardV2';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AgencyPortalWrapper({ initialData }: { initialData?: any }) {
  const { data, loading, error } = useAgencyData(initialData);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#1F4E79] animate-spin" />
        <p className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.3em] font-mono animate-pulse">
          Synchronisation Portfolio...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 glass-panel rounded-[3rem] border-red-100 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-inner">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Erreur Flux Agence.</h2>
          <p className="text-sm font-medium text-gray-400">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-[#1F4E79] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <AgencyPortalDashboardV2 
      user={data.user} 
      properties={data.properties} 
      candidatures={data.candidates} 
    />
  );
}
