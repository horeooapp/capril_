'use client';

import React from 'react';
import { useLandlordData } from '@/hooks/qapril-web-hooks';
import { OwnerPortalDashboard } from '@/components/dashboard/owner/OwnerPortalDashboard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OwnerPortalWrapper({ diasporaData, intermData, activeRole }: { diasporaData?: any, intermData?: any, activeRole?: string }) {
  const { data: fetchedData, loading: dataLoading, error } = useLandlordData();
  const data = fetchedData;
  const loading = dataLoading && !data;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#1F4E79] animate-spin" />
        <p className="text-[10px] font-black text-[#C55A11] uppercase tracking-[0.3em] font-mono animate-pulse">
          Chargement du patrimoine...
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
          <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Erreur Système.</h2>
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
    <OwnerPortalDashboard 
      user={data.user} 
      properties={data.properties} 
      diasporaData={diasporaData}
      intermData={intermData}
      activeRole={activeRole}
    />
  );
}
