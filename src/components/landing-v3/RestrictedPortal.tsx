"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Home, KeyRound } from "lucide-react";

export default function RestrictedPortal() {
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8"
          >
            {/* Locataire Card */}
            <Link href="/mon-espace-locataire/login" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/40 to-emerald-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500" />
              <div className="relative h-full flex flex-col p-8 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Espace Locataire</h3>
                <p className="text-sm text-slate-400 flex-1 leading-relaxed">
                  Consultez vos quittances et votre profil locatif sécurisé.
                </p>
                <div className="mt-6 flex items-center text-emerald-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Accéder au portail <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Proprietaire Card */}
            <Link href="/dashboard/login" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#FF8B00]/40 to-orange-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500" />
              <div className="relative h-full flex flex-col p-8 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/5 hover:border-[#FF8B00]/30 hover:bg-white/[0.08] transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#FF8B00]/20 text-[#FF8B00] flex items-center justify-center mb-6">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Espace Propriétaire</h3>
                <p className="text-sm text-slate-400 flex-1 leading-relaxed">
                  Supervisez votre patrimoine et pilotez vos flux financiers.
                </p>
                <div className="mt-6 flex items-center text-[#FF8B00] font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Accéder au superviseur <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>
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
