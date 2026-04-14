'use client';

import React from 'react';
import { useAgencyData } from '@/hooks/qapril-web-hooks';
import { AgencyPortalDashboard } from '@/components/dashboard/agency/AgencyPortalDashboard';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AgencyPortalWrapper({ initialData }: { initialData?: any }) {
  const { data, loading, error } = useAgencyData(initialData);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[var(--ci-vert)] animate-spin" />
        <p className="text-[10px] font-black text-[var(--ci-or)] uppercase tracking-[0.3em] font-mono animate-pulse">
          Synchronisation Portfolio...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel flex flex-col items-center justify-center min-h-[60vh] p-8 rounded-[3rem] border-red-500/20 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 bg-[var(--ci-orange)]/10 text-[var(--ci-orange)] rounded-[2rem] flex items-center justify-center shadow-inner">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Erreur Flux Agence.</h2>
          <p className="text-sm font-medium text-gray-400">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-nuit3"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <AgencyPortalDashboard 
      user={data.user} 
      properties={data.properties} 
      candidatures={data.candidates} 
    />
  );
}
