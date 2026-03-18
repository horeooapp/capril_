'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin Dashboard Error:', error)
  }, [error])

  return (
    <div className="p-12 bg-red-50/30 border-2 border-red-100 rounded-[3rem] flex flex-col items-center text-center backdrop-blur-xl">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl rotate-3">
        <AlertTriangle size={40} />
      </div>
      
      <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">
        Erreur Console <span className="text-red-600">Admin.</span>
      </h2>
      
      <div className="bg-white p-8 rounded-[2.5rem] border border-red-200 mb-10 max-w-2xl w-full shadow-2xl">
        <p className="text-gray-600 font-medium mb-4">
          Une erreur critique s&apos;est produite dans l&apos;interface d&apos;administration.
        </p>
        
        {error.digest && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-mono font-bold text-gray-500 mb-4">
            DIGEST: {error.digest}
          </div>
        )}

        <p className="text-red-900 font-mono text-[11px] text-left whitespace-pre-wrap bg-red-50/50 p-4 rounded-xl border border-red-100">
          {error.message || "Erreur de chargement des composants administratifs."}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Réessayer
        </button>
        
        <Link 
          href="/" 
          className="px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          <LogOut size={16} />
          Sortir
        </Link>
      </div>
    </div>
  )
}
