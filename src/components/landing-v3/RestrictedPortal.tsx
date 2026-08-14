"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { choisirTypeConnexion, type TypeConnexion } from "@/actions/auth.actions";

export default function RestrictedPortal() {
  const handleLoginClick = async (type: TypeConnexion) => {
    await choisirTypeConnexion(type);
  };


  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col relative overflow-hidden font-sans antialiased tracking-tight selection:bg-white/20 selection:text-white">
      {/* Subtle Noise / Grid Element instead of heavy glowing orbs */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none"></div>

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
              className="text-4xl sm:text-5xl md:text-6xl font-[1000] text-white tracking-tighter leading-[1.1]"
            >
              L'excellence
              <span className="text-slate-400 font-medium pl-3">
                immobilière
              </span>
              <br/>ivoirienne
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-400 font-medium leading-relaxed"
            >
              Le site public est actuellement en accès restreint. Veuillez utiliser vos identifiants pour accéder à votre compte.
            </motion.p>
          </div>

          {/* Actions / Entry Portals - Only Admin Access in Restricted Mode */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full max-w-sm mt-8"
          >
            <button 
                onClick={() => handleLoginClick('ADMIN')}
                className="group relative block w-full text-left"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/40 to-blue-900/10 rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500" />
              <div className="relative flex flex-col items-center text-center p-8 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.08] transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Administration</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Connexion réservée au personnel habilité et aux administrateurs du système QAPRIL.
                </p>
                <div className="flex items-center text-blue-400 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  Accéder au terminal <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </button>
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
