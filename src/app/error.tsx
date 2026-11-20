'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-12 shadow-2xl border border-gray-100 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-10 border border-red-100 shadow-sm rotate-3">
              <ShieldAlert className="text-red-500" size={40} />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-6 uppercase">
              Incident <br /><span className="text-red-500 italic">Serveur.</span>
            </h1>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-10">
              <p className="text-gray-700 font-medium leading-relaxed mb-4">
                Une difficulté temporaire est survenue lors du traitement de votre demande. Nos équipes ont été automatiquement informées pour assurer la continuité de votre service.
              </p>
              
              <div className="flex flex-col gap-2 mt-4 text-left w-full max-w-full">
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm font-medium">
                  {error.message && !error.message.includes('Server Components render') && !error.message.includes('digest')
                    ? error.message
                    : "L'opération n'a pas pu aboutir dans les délais prévus. Veuillez vérifier votre connexion ou réactualiser la page."}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => reset()}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl active:scale-95 group"
              >
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                Réessayer
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <Home size={18} />
                Retour Accueil
              </Link>
            </div>
          </div>
        </motion.div>
        
        <p className="text-center mt-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          © 2024 QAPRIL • Infrastructure de Sécurité Nationale
        </p>
      </div>
    </div>
  )
}
