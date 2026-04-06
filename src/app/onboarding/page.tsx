"use client";
// src/app/onboarding/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, SessionProvider } from "next-auth/react";
import { finaliserOnboarding, type Capacite } from "@/actions/onboarding.actions";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Check, 
    Building2, 
    User, 
    Briefcase, 
    ShieldCheck, 
    Globe, 
    ChevronRight, 
    Star,
    ArrowRight,
    Sparkles,
    Shield
} from "lucide-react";

const CAPACITES = [
  { 
    id: "PROPRIETAIRE", 
    label: "Propriétaire direct",
    sub: "Je gère mes propres biens immobiliers",
    icon: <User className="w-5 h-5" />
  },
  { 
    id: "AGENCE_AGREE", 
    label: "Agence Immobilière Agréée",
    sub: "Détenteur d'une carte professionnelle",
    icon: <Building2 className="w-5 h-5" />
  },
  { 
    id: "AGENCE_NON_AGREE",
    label: "Gestionnaire de Biens",
    sub: "Gestion déléguée sans agrément d'État",
    icon: <Briefcase className="w-5 h-5" />
  },
  { 
    id: "INTERMEDIAIRE", 
    label: "Mandataire de Gestion",
    sub: "J'aide un proche ou un client ponctuellement",
    icon: <ShieldCheck className="w-5 h-5" />
  },
] as const;

function OnboardingContent() {
  const router   = useRouter();
  const { data: session, update } = useSession();
  const [sel,    setSel]    = useState<Set<Capacite>>(new Set(["PROPRIETAIRE"]));
  const [actif,  setActif]  = useState<Capacite>("PROPRIETAIRE");
  const [diaspo, setDiaspo] = useState(false);
  const [loading,setLoading]= useState(false);

  const isAlreadyOnboarded = (session?.user as any)?.onboardingComplete;

  useEffect(() => {
     if (session?.user) {
         const user = session.user as any;
         if (user.capacites && user.capacites.length > 0) {
             setSel(new Set(user.capacites));
         }
         if (user.capaciteActive) {
             setActif(user.capaciteActive);
         }
     }
  }, [session]);

  const toggle = (c: Capacite) => {
    const next = new Set(sel);
    if (next.has(c)) { 
      if (next.size > 1) { // Prevent zero selection
        next.delete(c); 
        if (actif === c) {
            const firstRemaining = Array.from(next)[0];
            setActif(firstRemaining as Capacite);
        }
      }
    } else {
      next.add(c);
    }
    setSel(next);
  };

  const handleSubmit = async () => {
    if (sel.size === 0) return;
    setLoading(true);
    try {
      await finaliserOnboarding({
        capacites: Array.from(sel),
        capaciteActive: actif,
        activerDiaspora: diaspo
      });
      
      if (session) {
          await update({
              ...session,
              user: {
                  ...session.user,
                  onboardingComplete: true,
                  capaciteActive: actif
              }
          });
      }
      
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071A45] relative overflow-hidden font-sans selection:bg-qgreen selection:text-white">
      {/* Premium V4 Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-qgreen/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-qorange/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-qgreen-light" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Configuration Excellence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight uppercase">
            Affinez votre <span className="text-qgreen-light">Identité</span>
          </h1>
          <p className="text-white/40 text-sm md:text-md max-w-md mx-auto leading-relaxed">
            Sélectionnez vos capacités opérationnelles. Vous pourrez cumuler plusieurs profils sur un compte unique.
          </p>
        </motion.div>

        {/* glass-panel Main Container */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Progress Bar (Subtle) */}
          <div className="h-1 w-full bg-white/5 overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5 }}
                className="h-full bg-gradient-to-r from-qnavy to-qgreen-light"
             />
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {CAPACITES.map((cap, idx) => (
                <motion.div
                  key={cap.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  onClick={() => toggle(cap.id as Capacite)}
                  className={`
                    group relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-40
                    ${sel.has(cap.id as Capacite)
                        ? "border-white/40 bg-white/10 shadow-[0_10px_40px_-5px_rgba(255,255,255,0.05)]"
                        : "border-white/5 bg-transparent hover:bg-white/5 hover:border-white/20"
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all
                        ${sel.has(cap.id as Capacite) ? "bg-qgreen text-white shadow-lg shadow-qgreen/20" : "bg-white/5 text-white/40"}
                    `}>
                      {cap.icon}
                    </div>
                    {sel.has(cap.id as Capacite) && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-qgreen rounded-full p-1"
                        >
                            <Check className="w-3 h-3 text-white" />
                        </motion.div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide transition-colors ${sel.has(cap.id as Capacite) ? "text-white" : "text-white/60"}`}>
                        {cap.label}
                    </h3>
                    <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider leading-relaxed">
                        {cap.sub}
                    </p>
                  </div>

                  {/* Active selection glow */}
                  {sel.has(cap.id as Capacite) && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-qgreen-light rounded-full blur-sm opacity-50" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Diaspora Package Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`
                relative p-6 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group
                ${diaspo 
                    ? "bg-qgold/10 border-qgold/40 shadow-lg shadow-qgold/5" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }
              `}
              onClick={() => setDiaspo(!diaspo)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${diaspo ? "bg-qgold text-white" : "bg-white/5 text-white/30"}`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                        Forfait Diaspora
                        <span className="bg-qgold/20 text-qgold text-[8px] px-2 py-0.5 rounded-full border border-qgold/30">7€ / mois</span>
                    </div>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-tight mt-1">
                        Je réside hors de Côte d'Ivoire. Rapports de gestion en Euros.
                    </p>
                  </div>
                </div>
                <div className={`
                    w-12 h-6 rounded-full relative transition-all duration-300
                    ${diaspo ? "bg-qgold" : "bg-black/40"}
                `}>
                  <motion.div 
                    animate={{ x: diaspo ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </div>
              </div>
            </motion.div>

            {/* Default Mode Down Selection */}
            <AnimatePresence>
              {sel.size > 1 && (
                <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="mt-8 pt-8 border-t border-white/10"
                >
                  <label className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase mb-4 block">
                    Focus par défaut au lancement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(sel).map((c) => (
                        <button
                            key={c}
                            onClick={() => setActif(c)}
                            className={`
                                py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${actif === c 
                                    ? "bg-white text-qnavy shadow-xl" 
                                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                                }
                            `}
                        >
                            {c.replace(/_/g, ' ')}
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
                onClick={handleSubmit}
                disabled={loading || sel.size === 0}
                className={`
                    w-full py-5 rounded-[2rem] mt-10 relative overflow-hidden group/btn font-black uppercase tracking-[0.3em] text-[13px] transition-all active:scale-95
                    ${loading 
                        ? "bg-white/10 text-white/40" 
                        : "bg-qorange text-white hover:bg-qorange/90 shadow-[0_20px_40px_-10px_rgba(192,91,0,0.4)]"
                    }
                `}
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {isAlreadyOnboarded ? "Mettre à jour" : "Lancer mon expérience"}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </div>
                {!loading && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
            </button>
          </div>
        </motion.div>

        {/* Footer Meta */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col items-center gap-6"
        >
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 opacity-30">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">SÉCURISÉ AES-256</span>
                </div>
                <div className="flex items-center gap-2 opacity-30">
                    <Star className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Mise en conformité</span>
                </div>
            </div>
            <div className="text-white/20 text-[10px] font-medium text-center uppercase tracking-tighter">
                QAPRIL V4 • EXCELLENCE IMMOBILIÈRE • CÉDÉAO READY
            </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <SessionProvider>
      <OnboardingContent />
    </SessionProvider>
  );
}
