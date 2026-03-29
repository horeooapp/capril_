'use client';

import React from 'react';
import { useDiasporaData } from '@/hooks/qapril-web-hooks';
import DiasporaDashboard from '@/components/DiasporaDashboard';
import { Loader2, AlertCircle, Globe } from 'lucide-react';

export default function DiasporaPortalWrapper() {
  const { data, loading, error } = useDiasporaData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-ivoire-orange animate-spin" />
          <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#1F4E79]" />
        </div>
        <p className="text-[10px] font-black text-[#1F4E79] uppercase tracking-[0.4em] font-mono animate-pulse">
          Connexion au réseau international...
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
          <h2 className="text-3xl font-black text-[#1F4E79] tracking-tighter uppercase italic">Erreur Flux Diaspora.</h2>
          <p className="text-sm font-medium text-gray-400">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-ivoire-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 active:scale-95 transition-all"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <DiasporaDashboard 
      user={data.user} 
      data={data.stats} 
    />
  );
}
