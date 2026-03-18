import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
 
export const metadata: Metadata = {
  title: "Contact & Support",
  description: "Contactez l'assistance institutionnelle de QAPRIL. Équipe dédiée pour propriétaires, locataires et partenaires immobiliers.",
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="QAPRIL Logo" className="h-14 w-auto drop-shadow-sm group-hover:scale-110 transition-transform" />
              <span className="font-black text-3xl tracking-tighter text-gray-900 uppercase">QAPRIL</span>
            </Link>
            <Link href="/" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative py-48 overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
             <div className="fixed inset-0 bg-mesh opacity-30"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-12 border border-primary/20 backdrop-blur-md">
                Assistance Institutionnelle QAPRIL
                </span>
                <h1 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-12 uppercase italic">
                À votre <br />
                <span className="text-primary italic drop-shadow-[0_0_40px_rgba(255,107,0,0.4)]">écoute</span>.
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed opacity-80">
                Propriétaires, locataires ou partenaires, nous sommes là pour vous accompagner dans chaque étape de votre parcours immobilier digital.
                </p>
            </motion.div>
          </div>
        </section>

        {/* CONTACT METHODS */}
        <section className="py-40 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-16 rounded-[3.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group transition-all"
              >
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-primary mb-10 border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Phone size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Par Téléphone</h3>
                <p className="text-gray-500 font-medium mb-10 text-lg">Service disponible du lundi au vendredi de 8h à 18h.</p>
                <span className="text-3xl font-black text-gray-900 tracking-tighter hover:text-primary cursor-pointer transition-colors">+225 00 00 00 00 00</span>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className="p-16 rounded-[3.5rem] bg-gray-900 border border-gray-800 flex flex-col items-center text-center text-white group shadow-2xl shadow-gray-950/20"
              >
                <div className="w-20 h-20 bg-primary rounded-[2rem] shadow-2xl flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform duration-500">
                  <Mail size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-primary italic">Canal Direct</h3>
                <p className="text-gray-400 font-medium mb-10 text-lg">Pour toute demande d&apos;information technique ou commerciale.</p>
                <span className="text-3xl font-black tracking-tighter hover:scale-105 transition-transform cursor-pointer">contact@qapril.ci</span>
              </motion.div>

              <motion.div 
                whileHover={{ y: -10 }}
                className="p-16 rounded-[3.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group transition-all"
              >
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-primary mb-10 border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-all duration-500">
                  <MapPin size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Siège Social</h3>
                <p className="text-gray-500 font-medium mb-10 text-lg">Visitez-nous dans nos locaux pour un accompagnement physique.</p>
                <span className="text-gray-900 font-black uppercase tracking-tighter text-xl">Riviéra Bonoumin, Abidjan</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* MAP PLACEHOLDER / DECORATIVE */}
        <section className="h-[500px] bg-gray-950 relative grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden group">
             <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/20 shadow-2xl backdrop-blur-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-colors">
                            <MapPin size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Localisation Centrale</p>
                            <h4 className="text-2xl font-black uppercase tracking-tight">Abidjan, Côte d&apos;Ivoire</h4>
                        </div>
                    </div>
                </div>
             </div>
             <div className="absolute inset-0 bg-mesh opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 via-transparent to-gray-950"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
