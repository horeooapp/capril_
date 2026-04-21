"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Home, Building2, ShieldAlert } from "lucide-react";
import { choisirTypeConnexion, type TypeConnexion } from "@/actions/auth.actions";

export default function RestrictedPortal() {
  const handleLoginClick = async (type: TypeConnexion) => {
    await choisirTypeConnexion(type);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#060D1A] flex flex-col relative overflow-hidden font-sans selection:bg-mango/30 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Glow Emerald */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]"
        />
        {/* Glow Mango */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-[#FF8B00]/20 rounded-full blur-[100px]"
        />
        {/* Glow Blue */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -bottom-40 left-1/4 w-[700px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-4xl flex flex-col items-center text-center space-y-12"
        >
          {/* Logo & Badge */}
          <div className="flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="bg-white/5 p-4 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl"
            >
              <img
                src="/logo.png"
                alt="QAPRIL Logotype"
                className="w-20 h-20 object-contain drop-shadow-xl brightness-110"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Portail Sécurisé
              </span>
            </motion.div>
          </div>

          {/* Typography */}
          <div className="space-y-4 max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              L'excellence<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8B00] to-yellow-400 font-serif italic font-medium pr-2">
                immobilière
              </span>
              ivoirienne
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed"
            >
              Le site public est actuellement en accès restreint. Veuillez utiliser vos identifiants pour accéder à vos portefeuilles de gestion et d'investissement.
            </motion.p>
          </div>

          {/* Actions / Entry Portals */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8"
          >
            {/* Card Propriétaire */}
            <motion.div variants={itemVariants}>
                <button 
                    onClick={() => handleLoginClick('BAILLEUR')}
                    className="group relative h-full bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-500 text-left overflow-hidden w-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <Building2 size={28} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Propriétaire</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                            Accédez à votre patrimoine, gérez vos baux et suivez vos encaissements en temps réel.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                            Accès Espace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </button>
            </motion.div>

            {/* Card Locataire */}
            <motion.div variants={itemVariants}>
                <button 
                    onClick={() => handleLoginClick('LOCATAIRE')}
                    className="group relative h-full bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 text-left overflow-hidden w-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <Home size={28} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Locataire</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                            Payez votre loyer en 1-clic, téléchargez vos quittances et gérez votre dossier locatif.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            Accès Espace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </button>
            </motion.div>

            {/* Card Admin */}
            <motion.div variants={itemVariants}>
                <button 
                    onClick={() => handleLoginClick('ADMIN')}
                    className="group relative h-full bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-500 text-left overflow-hidden w-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Administration</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                            Console de régulation et outils de supervision pour les administrateurs QAPRIL.
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
                            Accès Certifié <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-6 text-center text-slate-500 text-xs sm:text-sm font-medium">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          © {new Date().getFullYear()} QAPRIL Infrastructure. Tous droits réservés.
        </motion.p>
      </div>
    </div>
  );
}
